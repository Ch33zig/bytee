'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '../components/Button'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })

        if (error) console.error('Error:', error.message)
    }
    return (
        <div className='min-h-screen bg-[#EBFFE0] flex'>
            <div className='hidden lg:block lg:w-[40%] relative'>
                <Image
                    src='/Pizza.jpg'
                    alt='Pizza'
                    fill
                    className='object-cover'
                />
                <div className='absolute inset-0 bg-black opacity-50'></div>
            </div>

            <div className='w-full lg:w-[60%] flex items-center justify-center px-8 py-12'>
                <div className='w-full max-w-md space-y-8'>
                    <div className='space-y-2'>
                        <h1 className='text-4xl font-bold text-[#443104] whitespace-nowrap'>
                            Welcome back to bytee
                        </h1>
                        <p className='text-lg text-[#443104]'>
                            Log in or sign up to start saving your food with{' '}
                            <span className='font-bold'>bytee</span>
                        </p>
                    </div>

                    <form className='space-y-4'>
                        <div className='space-y-2'>
                            <label className='text-[#443104] text-sm font-medium'>
                                Email
                            </label>
                            <input
                                type='email'
                                className='w-full px-4 py-3 rounded-lg border border-[#443104]/20 bg-white text-[#443104] focus:outline-none focus:border-[#443104] transition-colors'
                                placeholder='Enter your email'
                            />
                        </div>

                        <div className='space-y-2'>
                            <label className='text-[#443104] text-sm font-medium'>
                                Password
                            </label>
                            <input
                                type='password'
                                className='w-full px-4 py-3 rounded-lg border border-[#443104]/20 bg-white text-[#443104] focus:outline-none focus:border-[#443104] transition-colors'
                                placeholder='Enter your password'
                            />
                        </div>

                        <div className='flex items-center justify-between'>
                            <label className='flex items-center gap-2 text-[#443104] text-sm cursor-pointer'>
                                <input
                                    type='checkbox'
                                    className='w-4 h-4 rounded border-[#443104]/20 cursor-pointer'
                                />
                                Remember sign in details
                            </label>
                            <Link
                                href='/forgot-password'
                                className='text-[#443104] text-sm font-bold hover:underline'
                            >
                                Forgot password
                            </Link>
                        </div>

                        <button
                            type='submit'
                            className='w-full bg-[#443104] text-white py-3 rounded-full font-medium hover:opacity-90 transition-all cursor-pointer'
                        >
                            Login
                        </button>
                    </form>

                    <div className='flex items-center gap-4'>
                        <div className='flex-1 h-px bg-[#443104]/20'></div>
                        <span className='text-[#443104] text-sm'>Or</span>
                        <div className='flex-1 h-px bg-[#443104]/20'></div>
                    </div>

                    <button
                        type='button'
                        onClick={handleGoogleLogin}
                        className='w-full bg-white text-[#443104] py-3 rounded-full font-medium hover:opacity-90 transition-all cursor-pointer border border-[#443104]/20 flex items-center justify-center gap-3'
                    >
                        <Image
                            src='/Google.svg'
                            alt='Google'
                            width={20}
                            height={20}
                        />
                        Continue with Google
                    </button>

                    <p className='text-center text-[#443104]'>
                        Don&apos;t have an account?{' '}
                        <Link
                            href='/signup'
                            className='font-bold hover:underline'
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
