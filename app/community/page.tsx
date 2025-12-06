'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '../components/Sidebar'
import Image from 'next/image'
import { supabase } from '../lib/supabase'
import {
    getAvailableShares,
    claimShare,
    getUserShares,
    getClaimedItems,
    completeShare,
    type ShareWithDetails,
} from '../lib/database'

export default function CommunityPage() {
    const [activeTab, setActiveTab] = useState('Available Near You')
    const [distanceRadius, setDistanceRadius] = useState(2.5)
    const [availableShares, setAvailableShares] = useState<ShareWithDetails[]>(
        []
    )
    const [userShares, setUserShares] = useState<any[]>([])
    const [claimedItems, setClaimedItems] = useState<ShareWithDetails[]>([])
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)

    const tabs = [
        'Available Near You',
        'Your Shares',
        'Claimed Items',
        'Active Exchanges',
    ]

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            setUserId(user?.id || null)

            const [available, userSharesData, claimedData] = await Promise.all([
                getAvailableShares(user?.id),
                user ? getUserShares(user.id) : Promise.resolve([]),
                user ? getClaimedItems(user.id) : Promise.resolve([]),
            ])

            console.log('Available shares:', available)
            console.log('User shares:', userSharesData)
            console.log('Claimed items:', claimedData)

            setAvailableShares(available)
            setUserShares(userSharesData)
            setClaimedItems(claimedData)
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleClaim = async (shareId: string) => {
        if (!userId) return
        try {
            await claimShare(shareId, userId)
            await loadData()
            alert('Item claimed! Check your Claimed Items tab.')
        } catch (error) {
            console.error('Error claiming item:', error)
        }
    }

    const handleComplete = async (shareId: string) => {
        try {
            await completeShare(shareId)
            await loadData()
            alert('Exchange completed!')
        } catch (error) {
            console.error('Error completing exchange:', error)
        }
    }

    const getDaysUntilExpiry = (expiryDate: string) => {
        const today = new Date()
        const expiry = new Date(expiryDate)
        const diffTime = expiry.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

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
                        Community
                    </h1>

                    {loading ? (
                        <div className='text-center py-12 text-[#443104]'>
                            Loading...
                        </div>
                    ) : (
                        <>
                            <div className='bg-white rounded-2xl p-6 space-y-4'>
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

                                {activeTab === 'Available Near You' && (
                                    <div className='space-y-3'>
                                        <label className='text-[#443104] font-medium'>
                                            Distance: {distanceRadius} km
                                        </label>
                                        <input
                                            type='range'
                                            min='0.5'
                                            max='5'
                                            step='0.5'
                                            value={distanceRadius}
                                            onChange={(e) =>
                                                setDistanceRadius(
                                                    parseFloat(e.target.value)
                                                )
                                            }
                                            className='w-full'
                                        />
                                    </div>
                                )}
                            </div>

                            {activeTab === 'Available Near You' && (
                                <div className='space-y-4'>
                                    {availableShares.length === 0 ? (
                                        <div className='bg-white rounded-2xl p-8 text-center'>
                                            <p className='text-[#443104] text-lg'>
                                                No items available near you.
                                            </p>
                                        </div>
                                    ) : (
                                        availableShares.map((share) => {
                                            if (!share.food_item) return null
                                            const daysUntil =
                                                getDaysUntilExpiry(
                                                    share.food_item.expiry_date
                                                )
                                            return (
                                                <div
                                                    key={share.id}
                                                    className='bg-[#443104] rounded-2xl p-6 space-y-4'
                                                >
                                                    <div className='flex items-start justify-between'>
                                                        <div className='flex items-center gap-4'>
                                                            <Image
                                                                src='/Profile.svg'
                                                                alt='Profile'
                                                                width={48}
                                                                height={48}
                                                            />
                                                            <div>
                                                                <h3 className='text-xl font-bold text-white'>
                                                                    {share.owner
                                                                        ?.full_name ||
                                                                        share
                                                                            .owner
                                                                            ?.username}
                                                                </h3>
                                                                <p className='text-sm text-white/80'>
                                                                    {
                                                                        share
                                                                            .owner
                                                                            ?.rating
                                                                    }{' '}
                                                                    •{' '}
                                                                    {
                                                                        share
                                                                            .owner
                                                                            ?.exchange_count
                                                                    }{' '}
                                                                    exchanges •{' '}
                                                                    {share.distance ||
                                                                        0.8}{' '}
                                                                    km away
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className='flex flex-wrap gap-3'>
                                                        <div className='bg-white/20 px-4 py-2 rounded-full'>
                                                            <span className='font-medium text-white'>
                                                                {
                                                                    share
                                                                        .food_item
                                                                        .quantity
                                                                }
                                                                x{' '}
                                                                {
                                                                    share
                                                                        .food_item
                                                                        .name
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className='space-y-1 text-sm text-white/90'>
                                                        <p className='font-medium'>
                                                            Expires in{' '}
                                                            {daysUntil} days
                                                        </p>
                                                        {share.pickup_time && (
                                                            <p>
                                                                {
                                                                    share.pickup_time
                                                                }
                                                            </p>
                                                        )}
                                                        {share.pickup_notes && (
                                                            <p>
                                                                {
                                                                    share.pickup_notes
                                                                }
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className='flex gap-3'>
                                                        <button
                                                            onClick={() =>
                                                                handleClaim(
                                                                    share.id
                                                                )
                                                            }
                                                            className='bg-white text-[#443104] px-6 py-2 rounded-full font-medium hover:opacity-90'
                                                        >
                                                            Claim
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            )}

                            {activeTab === 'Your Shares' && (
                                <div className='space-y-4'>
                                    {userShares.length === 0 ? (
                                        <div className='bg-white rounded-2xl p-8 text-center'>
                                            <p className='text-[#443104] text-lg'>
                                                No active shares yet. Share
                                                items from Your Food!
                                            </p>
                                        </div>
                                    ) : (
                                        userShares.map((share) => (
                                            <div
                                                key={share.id}
                                                className='bg-[#D1E1C4] rounded-2xl p-6 space-y-3'
                                            >
                                                <div className='flex items-center justify-between'>
                                                    <h3 className='text-xl font-bold text-[#443104]'>
                                                        {share.food_item.name}
                                                    </h3>
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                            share.status ===
                                                            'available'
                                                                ? 'bg-green-500 text-white'
                                                                : share.status ===
                                                                  'claimed'
                                                                ? 'bg-yellow-500 text-white'
                                                                : 'bg-gray-500 text-white'
                                                        }`}
                                                    >
                                                        {share.status}
                                                    </span>
                                                </div>
                                                <p className='text-[#443104]'>
                                                    Quantity:{' '}
                                                    {share.food_item.quantity}
                                                </p>
                                                <p className='text-[#443104]'>
                                                    Expires:{' '}
                                                    {
                                                        share.food_item
                                                            .expiry_date
                                                    }
                                                </p>
                                                {share.status === 'claimed' && (
                                                    <p className='text-[#443104] font-medium'>
                                                        Claimed by someone!
                                                    </p>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === 'Claimed Items' && (
                                <div className='space-y-4'>
                                    {claimedItems.length === 0 ? (
                                        <div className='bg-white rounded-2xl p-8 text-center'>
                                            <p className='text-[#443104] text-lg'>
                                                No claimed items yet.
                                            </p>
                                        </div>
                                    ) : (
                                        claimedItems.map((share) => (
                                            <div
                                                key={share.id}
                                                className='bg-[#D1E1C4] rounded-2xl p-6 space-y-3'
                                            >
                                                <div className='flex items-center justify-between'>
                                                    <div>
                                                        <h3 className='text-xl font-bold text-[#443104]'>
                                                            {
                                                                share.food_item
                                                                    .name
                                                            }
                                                        </h3>
                                                        <p className='text-[#443104]'>
                                                            From:{' '}
                                                            {share.owner
                                                                .full_name ||
                                                                share.owner
                                                                    .username}
                                                        </p>
                                                    </div>
                                                    {share.status ===
                                                        'claimed' && (
                                                        <button
                                                            onClick={() =>
                                                                handleComplete(
                                                                    share.id
                                                                )
                                                            }
                                                            className='bg-[#443104] text-white px-4 py-2 rounded-full font-medium hover:opacity-90'
                                                        >
                                                            Confirm Pickup
                                                        </button>
                                                    )}
                                                </div>
                                                <p className='text-[#443104]'>
                                                    Quantity:{' '}
                                                    {share.food_item.quantity}
                                                </p>
                                                {share.pickup_time && (
                                                    <p className='text-[#443104]'>
                                                        {share.pickup_time}
                                                    </p>
                                                )}
                                                {share.pickup_notes && (
                                                    <p className='text-[#443104]'>
                                                        {share.pickup_notes}
                                                    </p>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === 'Active Exchanges' && (
                                <div className='bg-white rounded-2xl p-8 text-center'>
                                    <p className='text-[#443104] text-lg'>
                                        No active exchanges.
                                    </p>
                                </div>
                            )}

                            <div className='bg-[#443104] rounded-2xl p-6 text-white'>
                                <h2 className='text-2xl font-bold mb-4'>
                                    Community Impact
                                </h2>
                                <div className='grid grid-cols-3 gap-6 text-center'>
                                    <div>
                                        <p className='text-3xl font-bold'>
                                            {availableShares.length +
                                                userShares.length}
                                        </p>
                                        <p>Items Shared</p>
                                    </div>
                                    <div>
                                        <p className='text-3xl font-bold'>$0</p>
                                        <p>Value Saved</p>
                                    </div>
                                    <div>
                                        <p className='text-3xl font-bold'>3</p>
                                        <p>Active Users</p>
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
