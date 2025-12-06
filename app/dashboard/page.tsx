'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Sidebar } from '../components/Sidebar'
import { supabase } from '../lib/supabase'
import {
    getUserFoodItems,
    getAvailableShares,
    getUserStats,
} from '../lib/database'

export default function DashboardPage() {
    const [items, setItems] = useState<any[]>([])
    const [availableShares, setAvailableShares] = useState<any[]>([])
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        try {
            const {
                data: { session },
            } = await supabase.auth.getSession()
            if (!session) return

            const [foodItems, shares, userStats] = await Promise.all([
                getUserFoodItems(session.user.id),
                getAvailableShares(session.user.id),
                getUserStats(session.user.id),
            ])

            setItems(foodItems)
            setAvailableShares(shares.slice(0, 2))
            setStats(userStats)
        } catch (error) {
            console.error('Error loading dashboard:', error)
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

    const getTotalValue = () => {
        return items.reduce((sum, item) => sum + 4.13, 0).toFixed(2)
    }

    const getRecentItems = () => {
        return items.slice(0, 3)
    }

    const mockRecipes = [
        {
            name: 'Teriyaki Chicken',
            ingredients: 'Chicken Breast, Soy Sauce, Garlic, Sesame Oil',
            time: '30 min',
            image: '/recipes/Teriyaki.png',
        },
        {
            name: 'Garlic Butter Steak',
            ingredients: 'NY Strip Steak, Garlic, Avocado Oil',
            time: '25 min',
            image: '/recipes/Steak.jpg',
        },
        {
            name: 'Stir Fry Rice',
            ingredients: 'Jasmine Rice, Soy Sauce, Eggs, Green Onions',
            time: '20 min',
            image: '/recipes/Rice.jpg',
        },
    ]

    const freshCount = items.filter(
        (i) => getDaysUntilExpiry(i.expiry_date) > 14
    ).length
    const soonCount = items.filter((i) => {
        const days = getDaysUntilExpiry(i.expiry_date)
        return days > 3 && days <= 14
    }).length
    const urgentCount = items.filter(
        (i) => getDaysUntilExpiry(i.expiry_date) <= 3
    ).length

    const mockNetwork = [
        {
            name: 'Shaurya B.',
            distance: 0.8,
            food: '2x Milk, 6x Eggs',
            expiry: '2025-12-07',
        },
        {
            name: 'Vedh S.',
            distance: 1.2,
            food: '1x Bread',
            expiry: '2025-12-10',
        },
    ]

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

                <main className='p-8 space-y-8 max-w-7xl mx-auto mt-[88px]'>
                    {loading ? (
                        <div className='text-center py-12 text-[#443104]'>
                            Loading...
                        </div>
                    ) : (
                        <>
                            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                                <section className='bg-[#D1E1C4] rounded-3xl p-8'>
                                    <h2 className='text-3xl font-bold text-[#443104] mb-4'>
                                        Your <b>bytee</b>
                                    </h2>
                                    <div className='space-y-4'>
                                        <p className='text-2xl text-[#443104]'>
                                            <span className='font-bold'>
                                                {items.length} items
                                            </span>{' '}
                                            -{' '}
                                            <span className='font-bold'>
                                                ${getTotalValue()}
                                            </span>{' '}
                                            value
                                        </p>

                                        <div className='space-y-3'>
                                            <div className='flex gap-2 h-8 rounded-full overflow-hidden max-w-md'>
                                                {freshCount > 0 && (
                                                    <div
                                                        className='bg-green-500 flex items-center justify-center text-white text-sm font-medium'
                                                        style={{
                                                            width: `${
                                                                (freshCount /
                                                                    items.length) *
                                                                100
                                                            }%`,
                                                        }}
                                                    >
                                                        {freshCount} Fresh
                                                    </div>
                                                )}
                                                {soonCount > 0 && (
                                                    <div
                                                        className='bg-yellow-400 flex items-center justify-center text-white text-sm font-medium'
                                                        style={{
                                                            width: `${
                                                                (soonCount /
                                                                    items.length) *
                                                                100
                                                            }%`,
                                                        }}
                                                    >
                                                        {soonCount} Soon
                                                    </div>
                                                )}
                                                {urgentCount > 0 && (
                                                    <div
                                                        className='bg-orange-500 flex items-center justify-center text-white text-sm font-medium'
                                                        style={{
                                                            width: `${
                                                                (urgentCount /
                                                                    items.length) *
                                                                100
                                                            }%`,
                                                        }}
                                                    >
                                                        {urgentCount} Urgent
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <Link
                                            href='/food'
                                            className='inline-block bg-[#443104] text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition-all cursor-pointer'
                                        >
                                            View full inventory
                                        </Link>
                                    </div>
                                </section>

                                <section className='bg-[#D1E1C4] rounded-3xl p-8'>
                                    <h2 className='text-3xl font-bold text-[#443104] mb-6'>
                                        Recent purchases
                                    </h2>
                                    <div className='space-y-4'>
                                        <div className='flex flex-wrap gap-3 mb-6'>
                                            {getRecentItems().map((item) => (
                                                <span
                                                    key={item.id}
                                                    className='bg-white px-4 py-2 rounded-full text-[#443104] font-medium'
                                                >
                                                    {item.name}
                                                </span>
                                            ))}
                                        </div>
                                        <p className='text-[#443104]'>
                                            Recently added items from your
                                            inventory
                                        </p>
                                    </div>
                                </section>
                            </div>

                            <section className='bg-white rounded-3xl p-8'>
                                <h2 className='text-2xl font-bold text-[#443104] mb-4'>
                                    Scan new receipt or add items manually
                                </h2>
                                <Link
                                    href='/upload-receipt'
                                    className='inline-block bg-[#443104] text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition-all cursor-pointer'
                                >
                                    Add items
                                </Link>
                            </section>

                            <section className='bg-[#443104] rounded-3xl p-8'>
                                <div className='flex items-center justify-between mb-6'>
                                    <h2 className='text-3xl font-bold text-white'>
                                        Suggested for you
                                    </h2>
                                    <Link
                                        href='/recipes'
                                        className='text-white font-medium hover:underline'
                                    >
                                        View full meal plan →
                                    </Link>
                                </div>
                                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                                    {mockRecipes.map((recipe) => (
                                        <div
                                            key={recipe.name}
                                            className='bg-[#D1E1C4] rounded-2xl overflow-hidden'
                                        >
                                            <Image
                                                src={recipe.image}
                                                alt={recipe.name}
                                                width={400}
                                                height={300}
                                                className='w-full h-48 object-cover'
                                            />
                                            <div className='p-6 space-y-4'>
                                                <h3 className='text-xl font-bold text-[#443104]'>
                                                    {recipe.name}
                                                </h3>
                                                <p className='text-[#443104] text-sm'>
                                                    {recipe.ingredients}
                                                </p>
                                                <p className='text-[#443104] font-medium'>
                                                    {recipe.time}
                                                </p>
                                                <button className='w-full bg-[#443104] text-white py-2 rounded-full font-medium hover:opacity-90 transition-all cursor-pointer'>
                                                    Cook this
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className='bg-white rounded-3xl p-8'>
                                <div className='flex items-center justify-between mb-6'>
                                    <h2 className='text-3xl font-bold text-[#443104]'>
                                        <b>bytee</b> Community{' '}
                                        <span className='text-xl font-normal'>
                                            {availableShares.length} nearby
                                        </span>
                                    </h2>
                                    <Link
                                        href='/community'
                                        className='text-[#443104] font-medium hover:underline'
                                    >
                                        See all community shares →
                                    </Link>
                                </div>
                                <div className='space-y-4'>
                                    {availableShares.map((share) => (
                                        <div
                                            key={share.id}
                                            className='bg-[#D1E1C4] rounded-2xl p-6 flex items-center justify-between'
                                        >
                                            <div className='space-y-2'>
                                                <h3 className='text-xl font-bold text-[#443104]'>
                                                    {share.owner.full_name ||
                                                        share.owner.username}
                                                </h3>
                                                <p className='text-[#443104]'>
                                                    {share.distance || 0.8} km
                                                    away
                                                </p>
                                                <p className='text-[#443104] font-medium'>
                                                    {share.food_item.name}
                                                </p>
                                                <p className='text-[#443104] text-sm'>
                                                    Expires:{' '}
                                                    {
                                                        share.food_item
                                                            .expiry_date
                                                    }
                                                </p>
                                            </div>
                                            <Link
                                                href='/community'
                                                className='bg-[#443104] text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition-all cursor-pointer'
                                            >
                                                Claim
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className='bg-[#443104] rounded-3xl p-8'>
                                <h2 className='text-3xl font-bold text-white mb-6'>
                                    Your impact this month
                                </h2>
                                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
                                    <div className='text-center'>
                                        <p className='text-3xl font-bold text-white'>
                                            ${stats?.money_saved || 0}
                                        </p>
                                        <p className='text-white'>Saved</p>
                                    </div>
                                    <div className='text-center'>
                                        <p className='text-3xl font-bold text-white'>
                                            {stats?.streak_days || 1} day
                                        </p>
                                        <p className='text-white'>Streak</p>
                                    </div>
                                    <div className='text-center'>
                                        <p className='text-3xl font-bold text-white'>
                                            {stats?.total_shares || 0}
                                        </p>
                                        <p className='text-white'>Shares</p>
                                    </div>
                                </div>
                                <div className='space-y-3'>
                                    <div className='flex items-center justify-between'>
                                        <p className='text-xl font-bold text-white'>
                                            {stats?.level || 'Level 1 Bronze'}
                                        </p>
                                        <p className='text-white font-medium'>
                                            {stats?.points || 0}/100 pts to
                                            Level 2 Bronze
                                        </p>
                                    </div>
                                    <div className='w-full bg-white/20 rounded-full h-4 overflow-hidden'>
                                        <div
                                            className='h-full bg-white transition-all'
                                            style={{
                                                width: `${stats?.points || 0}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </section>
                        </>
                    )}
                </main>

                <Link
                    href='/upload-receipt'
                    className='fixed bottom-8 right-8 bg-[#443104] text-white p-5 rounded-full shadow-lg hover:opacity-90 transition-all cursor-pointer'
                >
                    <Image
                        src='/Upload.svg'
                        alt='Scan receipt'
                        width={32}
                        height={32}
                        className='invert'
                    />
                </Link>
            </div>
        </div>
    )
}
