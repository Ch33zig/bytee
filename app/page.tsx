'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Navbar } from './components/Navbar'
import { Button } from './components/Button'

export default function Home() {
    return (
        <div className='min-h-screen bg-[#EBFFE0]'>
            <Navbar />

            <main className='max-w-7xl mx-auto px-8 py-20'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
                    <div className='space-y-8'>
                        <div className='space-y-4'>
                            <h1 className='text-6xl font-bold text-[#443104] leading-tight'>
                                <b>bytee</b> back at food waste
                            </h1>
                            <div className='text-lg text-[#443104] space-y-1'>
                                <div className='flex items-center gap-2'>
                                    <div className='ml-2 w-16 h-px bg-[#443104]'></div>
                                    <p>Get food when you need it.</p>
                                </div>
                                <p className='pl-2'>
                                    Share food before it expires.
                                </p>
                            </div>
                        </div>

                        <Button variant='brown' href='/signup'>
                            Join now
                        </Button>
                    </div>

                    <div className='flex justify-center lg:justify-end'>
                        <motion.div
                            animate={{
                                y: [0, -20, 0],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        >
                            <Image
                                src='/Sushi.png'
                                alt='Sushi'
                                width={500}
                                height={500}
                                priority
                            />
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    )
}
