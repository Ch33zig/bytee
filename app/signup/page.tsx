'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '../components/Button'
import { supabase } from '../lib/supabase'

export default function SignupPage() {
    const handleGoogleSignup = async () => {
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
                        <h1 className='text-4xl font-bold text-[#443104]'>
                            Sign up to bytee
                        </h1>
                        <p className='text-lg text-[#443104]'>
                            Create an account to start using{' '}
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
                                Username
                            </label>
                            <input
                                type='text'
                                className='w-full px-4 py-3 rounded-lg border border-[#443104]/20 bg-white text-[#443104] focus:outline-none focus:border-[#443104] transition-colors'
                                placeholder='Choose a username'
                            />
                        </div>

                        <div className='space-y-2'>
                            <label className='text-[#443104] text-sm font-medium'>
                                Password
                            </label>
                            <input
                                type='password'
                                className='w-full px-4 py-3 rounded-lg border border-[#443104]/20 bg-white text-[#443104] focus:outline-none focus:border-[#443104] transition-colors'
                                placeholder='Create a password'
                            />
                        </div>

                        <button
                            type='submit'
                            className='w-full bg-[#443104] text-white py-3 rounded-full font-medium hover:opacity-90 transition-all cursor-pointer'
                        >
                            Create account
                        </button>
                    </form>

                    <div className='flex items-center gap-4'>
                        <div className='flex-1 h-px bg-[#443104]/20'></div>
                        <span className='text-[#443104] text-sm'>Or</span>
                        <div className='flex-1 h-px bg-[#443104]/20'></div>
                    </div>

                    <button
                        type='button'
                        onClick={handleGoogleSignup}
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
                        Already have an account?{' '}
                        <Link
                            href='/login'
                            className='font-bold hover:underline'
                        >
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
