'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { addFoodItem } from '../lib/database'

type FoodItem = {
    id: string
    name: string
    quantity?: number
    weight?: number
    weight_unit?: string
    expiry: string
}

export default function ReceiptProcessingPage() {
    const router = useRouter()
    const [progress, setProgress] = useState(0)
    const [isProcessing, setIsProcessing] = useState(true)
    const [items, setItems] = useState<FoodItem[]>([])
    const [receiptImage, setReceiptImage] = useState<string>('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [transformOrigin, setTransformOrigin] = useState('center center')
    const [isHovering, setIsHovering] = useState(false)
    const [purchaseDate, setPurchaseDate] = useState(
        new Date().toISOString().split('T')[0]
    )
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        const uploadedImage = sessionStorage.getItem('uploadedReceipt')
        const uploadedFile = sessionStorage.getItem('uploadedReceiptFile')

        if (uploadedImage) setReceiptImage(uploadedImage)

        if (uploadedFile) {
            processReceiptWithGemini(uploadedFile)
        } else {
            setIsProcessing(false)
            setItems([
                {
                    id: '1',
                    name: '',
                    quantity: 1,
                    expiry: calculateExpiry(purchaseDate, 'Default'),
                },
            ])
        }
    }, [])

    const processReceiptWithGemini = async (base64Image: string) => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev < 85) return prev + Math.random() * 15
                if (prev < 95) return prev + 0.5
                if (prev < 100) return prev + 2
                return 100
            })
        }, 200)

        try {
            const blob = await fetch(base64Image).then((r) => r.blob())
            const formData = new FormData()
            formData.append('image', blob, 'receipt.jpg')

            const response = await fetch('/api/process-receipt', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Failed to process receipt')
            }

            const { items: extractedItems } = await response.json()

            clearInterval(interval)
            setProgress(100)

            setTimeout(() => {
                setIsProcessing(false)
                const processedItems = extractedItems.map(
                    (item: any, index: number) => ({
                        id: (index + 1).toString(),
                        name: item.name,
                        quantity: item.quantity,
                        weight: item.weight,
                        weight_unit: item.weight_unit,
                        expiry: calculateExpiry(purchaseDate, item.name),
                    })
                )
                setItems(processedItems)
            }, 500)
        } catch (error) {
            console.error('Error processing receipt:', error)
            clearInterval(interval)
            setIsProcessing(false)
            alert('Failed to process receipt. Please try again.')
        }
    }

    const handleDelete = (id: string) => {
        setItems(items.filter((item) => item.id !== id))
    }

    const handleEdit = (id: string) => {
        setEditingId(id)
    }

    const handleSave = () => {
        setEditingId(null)
    }

    const handleAddItem = () => {
        const newItem: FoodItem = {
            id: Date.now().toString(),
            name: '',
            quantity: 1,
            expiry: calculateExpiry(purchaseDate, 'Default'),
        }
        setItems([...items, newItem])
        setEditingId(newItem.id)
    }

    const updateItem = (
        id: string,
        field: keyof FoodItem,
        value: string | number
    ) => {
        setItems(
            items.map((item) =>
                item.id === id ? { ...item, [field]: value } : item
            )
        )
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        setTransformOrigin(`${x}% ${y}%`)
    }

    const handleConfirmAndShare = async () => {
        setIsSaving(true)
        try {
            // first check session
            const {
                data: { session },
            } = await supabase.auth.getSession()

            if (!session) {
                alert('Please sign in to save items')
                router.push('/login')
                return
            }

            const user = session.user

            // check if profile exists, if not create it
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', user.id)
                .maybeSingle()

            if (!profile) {
                await supabase.from('profiles').insert([
                    {
                        id: user.id,
                        username:
                            user.email?.split('@')[0] ||
                            'user_' + user.id.slice(0, 8),
                        full_name: user.user_metadata?.full_name || null,
                    },
                ])
            }

            // save all items to database
            await Promise.all(
                items.map((item) => {
                    const category = getCategoryForItem(item.name)
                    const location = getLocationForItem(item.name)

                    return addFoodItem({
                        user_id: user.id,
                        name: item.name,
                        quantity: item.quantity || null,
                        weight: item.weight || null,
                        weight_unit: item.weight_unit || null,
                        category,
                        location,
                        expiry_date: item.expiry,
                        purchase_date: purchaseDate,
                        is_shared: false,
                    })
                })
            )

            sessionStorage.removeItem('uploadedReceipt')
            router.push('/dashboard')
        } catch (error) {
            console.error('Error saving items:', error)
            alert('Failed to save items. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    const getCategoryForItem = (name: string): string => {
        if (name.includes('Chicken') || name.includes('Steak')) return 'Meat'
        if (name.includes('Egg')) return 'Dairy'
        if (
            name.includes('Banana') ||
            name.includes('Broccoli') ||
            name.includes('Onion') ||
            name.includes('Potato') ||
            name.includes('Garlic')
        )
            return 'Produce'
        if (name.includes('Rice') || name.includes('Sweetarts')) return 'Grains'
        if (
            name.includes('Sauce') ||
            name.includes('Soy') ||
            name.includes('Oyster') ||
            name.includes('Hoisin')
        )
            return 'Condiments'
        if (name.includes('Oil')) return 'Oils'
        if (
            name.includes('Salt') ||
            name.includes('Pepper') ||
            name.includes('Sesame Seed')
        )
            return 'Spices'
        return 'Other'
    }

    const getLocationForItem = (name: string): string => {
        if (name.includes('Chicken') || name.includes('Steak')) return 'Fridge'
        if (name.includes('Egg')) return 'Fridge'
        if (name.includes('Broccoli') || name.includes('Green Onion'))
            return 'Fridge'
        return 'Pantry'
    }

    const calculateExpiry = (purchaseDate: string, itemName: string) => {
        const purchase = new Date(purchaseDate)
        let daysToAdd = 0

        // fresh meat/poultry
        if (itemName.includes('Chicken') || itemName.includes('Steak')) {
            daysToAdd = 3
        }
        // fresh produce
        else if (itemName.includes('Bananas')) {
            daysToAdd = 3
        } else if (itemName.includes('Broccoli')) {
            daysToAdd = 4
        } else if (itemName.includes('Green Onions')) {
            daysToAdd = 7
        } else if (itemName.includes('Onions') && !itemName.includes('Green')) {
            daysToAdd = 14
        } else if (itemName.includes('Potatoes')) {
            daysToAdd = 21
        } else if (itemName.includes('Garlic')) {
            daysToAdd = 30
        }
        // eggs
        else if (itemName.includes('Eggs')) {
            daysToAdd = 30
        }
        // rice and dry grains
        else if (itemName.includes('Rice')) {
            daysToAdd = 90
        }
        // candy
        else if (itemName.includes('Sweetarts')) {
            daysToAdd = 60
        }
        // oils
        else if (itemName.includes('Oil')) {
            daysToAdd = 180
        }
        // sauces and condiments
        else if (
            itemName.includes('Sauce') ||
            itemName.includes('Soy') ||
            itemName.includes('Oyster') ||
            itemName.includes('Hoisin') ||
            itemName.includes('Sriracha')
        ) {
            daysToAdd = 90
        }
        // spices and seasonings
        else if (
            itemName.includes('Salt') ||
            itemName.includes('Pepper') ||
            itemName.includes('Sesame')
        ) {
            daysToAdd = 180
        }
        // default for other items
        else {
            daysToAdd = 30
        }

        purchase.setDate(purchase.getDate() + daysToAdd)
        return purchase.toISOString().split('T')[0]
    }

    const updateExpiryDates = (newPurchaseDate: string) => {
        setItems(
            items.map((item) => ({
                ...item,
                expiry: calculateExpiry(newPurchaseDate, item.name),
            }))
        )
    }

    if (isProcessing) {
        return (
            <div className='min-h-screen bg-[#EBFFE0] flex items-center justify-center px-8'>
                <div className='w-full max-w-2xl space-y-8'>
                    <div className='text-center space-y-4'>
                        <h1 className='text-4xl font-bold text-[#443104]'>
                            Processing your receipt...
                        </h1>
                        <p className='text-xl text-[#443104]'>
                            This will only take a moment
                        </p>
                    </div>
                    <div className='w-full bg-white rounded-full h-4 overflow-hidden'>
                        <div
                            className='h-full bg-[#443104] transition-all duration-300 ease-out'
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className='text-center text-lg text-[#443104]'>
                        {Math.round(progress)}%
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-[#EBFFE0] py-12 px-8'>
            <div className='max-w-7xl mx-auto'>
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                    {receiptImage && (
                        <div className='lg:col-span-1'>
                            <div className='bg-[#443104] rounded-2xl p-6 sticky top-8 h-[80vh] overflow-hidden flex flex-col'>
                                <h2 className='text-xl font-bold text-white mb-4'>
                                    Your receipt
                                </h2>
                                <div className='flex-1 relative overflow-hidden rounded-2xl mb-4'>
                                    <img
                                        src={receiptImage}
                                        alt='Receipt'
                                        className='w-full h-full object-contain rounded-2xl transition-transform duration-200 ease-out cursor-zoom-in'
                                        style={{
                                            transform: isHovering
                                                ? 'scale(2)'
                                                : 'scale(1)',
                                            transformOrigin: transformOrigin,
                                        }}
                                        onMouseMove={handleMouseMove}
                                        onMouseEnter={() => setIsHovering(true)}
                                        onMouseLeave={() =>
                                            setIsHovering(false)
                                        }
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <label className='text-white text-sm font-medium block'>
                                        When were these items purchased?
                                    </label>
                                    <input
                                        type='date'
                                        value={purchaseDate}
                                        onChange={(e) => {
                                            setPurchaseDate(e.target.value)
                                            updateExpiryDates(e.target.value)
                                        }}
                                        className='w-full px-3 py-2 rounded-lg bg-white text-[#443104] focus:outline-none'
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div
                        className={
                            receiptImage
                                ? 'lg:col-span-2 space-y-6'
                                : 'lg:col-span-3 space-y-6'
                        }
                    >
                        <div className='flex items-center justify-between'>
                            <h1 className='text-4xl font-bold text-[#443104]'>
                                Your list
                            </h1>
                            <button
                                onClick={handleAddItem}
                                className='bg-[#443104] text-white px-6 py-2 rounded-full font-medium hover:opacity-90 transition-all cursor-pointer'
                            >
                                Add item
                            </button>
                        </div>

                        <div className='space-y-4'>
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className='bg-[#D1E1C4] rounded-2xl p-6 space-y-3'
                                >
                                    {editingId === item.id ? (
                                        <div className='space-y-3'>
                                            <div className='flex gap-3'>
                                                <input
                                                    type='number'
                                                    value={item.quantity}
                                                    onChange={(e) =>
                                                        updateItem(
                                                            item.id,
                                                            'quantity',
                                                            parseInt(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                    className='w-20 px-3 py-2 rounded-lg border border-[#443104]/20 bg-white text-[#443104]'
                                                />
                                                <input
                                                    type='text'
                                                    value={item.name}
                                                    onChange={(e) =>
                                                        updateItem(
                                                            item.id,
                                                            'name',
                                                            e.target.value
                                                        )
                                                    }
                                                    className='flex-1 px-3 py-2 rounded-lg border border-[#443104]/20 bg-white text-[#443104]'
                                                />
                                            </div>
                                            <input
                                                type='date'
                                                value={item.expiry}
                                                onChange={(e) =>
                                                    updateItem(
                                                        item.id,
                                                        'expiry',
                                                        e.target.value
                                                    )
                                                }
                                                className='w-full px-3 py-2 rounded-lg border border-[#443104]/20 bg-white text-[#443104]'
                                            />
                                            <button
                                                onClick={handleSave}
                                                className='w-full bg-[#443104] text-white py-2 rounded-full font-medium hover:opacity-90 transition-all'
                                            >
                                                Save
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className='flex items-start justify-between'>
                                                <div className='space-y-1'>
                                                    <h3 className='text-2xl font-bold text-[#443104]'>
                                                        {item.name}
                                                        {item.quantity &&
                                                            ` (${item.quantity}x)`}
                                                        {item.weight &&
                                                            ` (${item.weight} ${item.weight_unit})`}
                                                    </h3>
                                                    <p className='text-[#443104]'>
                                                        Expiry: {item.expiry}
                                                    </p>
                                                </div>
                                                <div className='flex gap-2'>
                                                    <button
                                                        onClick={() =>
                                                            handleEdit(item.id)
                                                        }
                                                        className='px-4 py-2 bg-white text-[#443104] rounded-full font-medium hover:opacity-90 transition-all'
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                item.id
                                                            )
                                                        }
                                                        className='px-4 py-2 bg-[#443104] text-white rounded-full font-medium hover:opacity-90 transition-all'
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleConfirmAndShare}
                            disabled={isSaving}
                            className='w-full bg-[#443104] text-white py-4 rounded-full text-lg font-medium hover:opacity-90 transition-all cursor-pointer disabled:opacity-50'
                        >
                            {isSaving ? 'Saving...' : 'Confirm and share'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
