'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function OnboardingPage() {
    const [selected, setSelected] = useState<'share' | 'receive' | null>(null)

    const handleContinue = () => {
        if (selected === 'share') {
            window.location.href = '/upload-receipt'
        } else if (selected === 'receive') {
            window.location.href = '/dashboard'
        }
    }

    return (
        <div className='min-h-screen bg-[#EBFFE0] flex items-center justify-center px-8 py-12'>
            <div className='w-full max-w-4xl space-y-12'>
                <div className='text-center space-y-4'>
                    <h1 className='text-5xl font-bold text-[#443104]'>
                        Welcome to bytee!
                    </h1>
                    <p className='text-xl text-[#443104]'>
                        What would you like to do?
                    </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                    <button
                        onClick={() => setSelected('share')}
                        className={`bg-[#D1E1C4] rounded-3xl p-8 space-y-4 text-left transition-all hover:shadow-lg cursor-pointer ${
                            selected === 'share' ? 'ring-4 ring-[#443104]' : ''
                        }`}
                    >
                        <div className='flex items-center gap-5'>
                            <Image
                                src='/Share.svg'
                                alt='Share food'
                                width={30}
                                height={30}
                            />
                            <h2 className='text-3xl font-bold text-[#443104]'>
                                Share food
                            </h2>
                        </div>
                        <p className='text-lg text-[#443104] leading-relaxed'>
                            Share extra food with people in your community so it
                            doesn&apos;t go to waste.
                        </p>
                    </button>

                    <button
                        onClick={() => setSelected('receive')}
                        className={`bg-[#D1E1C4] rounded-3xl p-8 space-y-4 text-left transition-all hover:shadow-lg cursor-pointer ${
                            selected === 'receive'
                                ? 'ring-4 ring-[#443104]'
                                : ''
                        }`}
                    >
                        <div className='flex items-center gap-3'>
                            <Image
                                src='/Receive.svg'
                                alt='Receive food'
                                width={40}
                                height={40}
                            />
                            <h2 className='text-3xl font-bold text-[#443104]'>
                                Receive food
                            </h2>
                        </div>
                        <p className='text-lg text-[#443104] leading-relaxed'>
                            Receive fresh food from neighbors in your community
                            when you need it.
                        </p>
                    </button>
                </div>

                {selected && (
                    <div className='flex justify-center'>
                        <button
                            onClick={handleContinue}
                            className='bg-[#443104] text-white px-12 py-4 rounded-full text-lg font-medium hover:opacity-90 transition-all cursor-pointer'
                        >
                            Continue
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
