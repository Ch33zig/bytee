'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export const Sidebar = () => {
    const pathname = usePathname()

    const navItems = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Your food', href: '/food' },
        { name: 'Community', href: '/community' },
        { name: 'Recipes', href: '/recipes' },
    ]

    const bottomItems = [
        { name: 'Settings', href: '/settings' },
        { name: 'Help', href: '/help' },
        { name: 'Logout', href: '/logout' },
    ]

    return (
        <div className='w-64 bg-[#443104] h-screen flex flex-col p-6 fixed left-0 top-0'>
            <Link href='/dashboard' className='flex items-center gap-3 mb-12'>
                <div className='w-[30px] h-[30px] flex items-center justify-center'>
                    <Image 
                        src='/Logo.svg' 
                        alt='bytee logo' 
                        width={30} 
                        height={30}
                        style={{ filter: 'brightness(0) saturate(100%) invert(96%) sepia(12%) saturate(426%) hue-rotate(39deg) brightness(103%) contrast(102%)' }}
                    />
                </div>
                <span className='text-2xl font-bold text-white'>bytee</span>
            </Link>

            <nav className='flex-1 space-y-2'>
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`block px-4 py-3 rounded-xl font-medium transition-colors ${
                            pathname === item.href
                                ? 'bg-white text-[#443104]'
                                : 'text-white hover:bg-white/10'
                        }`}
                    >
                        {item.name}
                    </Link>
                ))}
            </nav>

            <div className='space-y-2 pt-6 border-t border-white/10'>
                {bottomItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className='block px-4 py-3 rounded-xl font-medium text-white hover:bg-white/10 transition-colors'
                    >
                        {item.name}
                    </Link>
                ))}
            </div>
        </div>
    )
}

