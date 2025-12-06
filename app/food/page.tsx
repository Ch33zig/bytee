'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '../components/Sidebar'
import Image from 'next/image'
import { supabase } from '../lib/supabase'
import {
    getUserFoodItems,
    deleteFoodItem,
    createShare,
    type FoodItem as DBFoodItem,
} from '../lib/database'

type FoodItem = {
    id: string
    name: string
    quantity: number | null
    weight: number | null
    weight_unit: string | null
    category: string
    location: string
    expiry: string
}

export default function YourFoodPage() {
    const [activeTab, setActiveTab] = useState('All Items')
    const [selectedItems, setSelectedItems] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [items, setItems] = useState<FoodItem[]>([])
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)

    const tabs = [
        'All Items',
        'Expiring Soon',
        'Fresh',
        'Fridge',
        'Pantry',
        'Freezer',
    ]

    useEffect(() => {
        loadUserAndItems()
    }, [])

    const loadUserAndItems = async () => {
        try {
            const {
                data: { session },
            } = await supabase.auth.getSession()
            if (!session) return

            setUserId(session.user.id)
            const dbItems = await getUserFoodItems(session.user.id)
            setItems(
                dbItems.map((item) => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    weight: item.weight,
                    weight_unit: item.weight_unit,
                    category: item.category || '',
                    location: item.location || '',
                    expiry: item.expiry_date,
                }))
            )
        } catch (error) {
            console.error('Error loading items:', error)
        } finally {
            setLoading(false)
        }
    }

    const getDaysUntilExpiry = (expiryDate: string) => {
        const today = new Date()
        const expiry = new Date(expiryDate)
        const diffTime = expiry.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    const toggleSelectItem = (id: string) => {
        setSelectedItems((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        )
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteFoodItem(id)
            setItems((prev) => prev.filter((item) => item.id !== id))
            setSelectedItems((prev) => prev.filter((i) => i !== id))
        } catch (error) {
            console.error('Error deleting item:', error)
        }
    }

    const handleBulkDelete = async () => {
        try {
            await Promise.all(selectedItems.map((id) => deleteFoodItem(id)))
            setItems((prev) =>
                prev.filter((item) => !selectedItems.includes(item.id))
            )
            setSelectedItems([])
        } catch (error) {
            console.error('Error deleting items:', error)
        }
    }

    const handleShareToCommunity = async () => {
        if (!userId) return
        try {
            await Promise.all(
                selectedItems.map((id) => createShare(id, userId))
            )
            setSelectedItems([])
            alert('Items shared to community!')
        } catch (error) {
            console.error('Error sharing items:', error)
        }
    }

    const filteredItems = items
        .filter((item) => {
            const daysUntil = getDaysUntilExpiry(item.expiry)

            if (activeTab === 'All Items') return true
            if (activeTab === 'Expiring Soon') return daysUntil <= 7
            if (activeTab === 'Fresh') return daysUntil > 14
            if (activeTab === 'Fridge') return item.location === 'Fridge'
            if (activeTab === 'Pantry') return item.location === 'Pantry'
            if (activeTab === 'Freezer') return item.location === 'Freezer'
            return true
        })
        .filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort(
            (a, b) =>
                new Date(a.expiry).getTime() - new Date(b.expiry).getTime()
        )

    return (
        <div className='min-h-screen bg-[#EBFFE0]'>
            <Sidebar />

            <div className='ml-64'>
                <header className='bg-[#443104] px-8 py-6 flex items-center justify-end gap-4 fixed top-0 left-64 right-0 z-10'>
                    <button className='relative'>
                        <Image
                            src='/Notifications.svg'
                            alt='Notifications'
                            width={28}
                            height={28}
                        />
                        <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold'>
                            2
                        </span>
                    </button>
                    <button>
                        <Image
                            src='/Profile.svg'
                            alt='Profile'
                            width={28}
                            height={28}
                        />
                    </button>
                </header>

                <main className='p-8 space-y-6 mt-[88px]'>
                    <h1 className='text-4xl font-bold text-[#443104]'>
                        Your Food
                    </h1>

                    {loading ? (
                        <div className='text-center py-12 text-[#443104]'>
                            Loading...
                        </div>
                    ) : (
                        <>
                            <div className='bg-white rounded-2xl p-6 space-y-4'>
                                <input
                                    type='text'
                                    placeholder='Search items...'
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className='w-full px-4 py-3 rounded-lg border border-[#443104]/20 bg-white text-[#443104] focus:outline-none focus:border-[#443104]'
                                />

                                <div className='flex gap-2 flex-wrap'>
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-4 py-2 rounded-full font-medium transition-all ${
                                                activeTab === tab
                                                    ? 'bg-[#443104] text-white'
                                                    : 'bg-[#D1E1C4] text-[#443104] hover:bg-[#443104]/10'
                                            }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className='space-y-4'>
                                {filteredItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className='bg-[#D1E1C4] rounded-2xl p-6'
                                    >
                                        <div className='flex items-start justify-between'>
                                            <div className='flex items-start gap-4 flex-1'>
                                                <input
                                                    type='checkbox'
                                                    checked={selectedItems.includes(
                                                        item.id
                                                    )}
                                                    onChange={() =>
                                                        toggleSelectItem(
                                                            item.id
                                                        )
                                                    }
                                                    className='mt-1 w-5 h-5 cursor-pointer'
                                                />
                                                <div className='flex-1 space-y-1'>
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
                                            </div>
                                            <div className='flex gap-2'>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(item.id)
                                                    }
                                                    className='px-4 py-2 bg-[#443104] text-white rounded-full font-medium hover:opacity-90 transition-all'
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {selectedItems.length > 0 && (
                                <div className='fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-[#443104] text-white px-8 py-4 rounded-full shadow-lg flex items-center gap-4'>
                                    <span className='font-medium'>
                                        {selectedItems.length} items selected
                                    </span>
                                    <button
                                        onClick={handleShareToCommunity}
                                        className='bg-white text-[#443104] px-4 py-2 rounded-full font-medium hover:opacity-90'
                                    >
                                        Share to Community
                                    </button>
                                    <button
                                        onClick={handleBulkDelete}
                                        className='bg-red-500 text-white px-4 py-2 rounded-full font-medium hover:opacity-90'
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}

                            <div className='bg-[#443104] rounded-2xl p-6 text-white'>
                                <div className='grid grid-cols-2 gap-6 text-center'>
                                    <div>
                                        <p className='text-3xl font-bold'>
                                            {items.length}
                                        </p>
                                        <p>Total Items</p>
                                    </div>
                                    <div>
                                        <p className='text-3xl font-bold'>
                                            {
                                                items.filter(
                                                    (i) =>
                                                        getDaysUntilExpiry(
                                                            i.expiry
                                                        ) <= 7
                                                ).length
                                            }
                                        </p>
                                        <p>Expiring Soon</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    )
}
