'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'

export default function UploadReceiptPage() {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isCapturing, setIsCapturing] = useState(false)

    const handleUploadClick = () => {
        fileInputRef.current?.click()
    }

    const handleCaptureClick = () => {
        window.location.href = '/camera-capture'
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                const dataUrl = reader.result as string
                sessionStorage.setItem('uploadedReceipt', dataUrl)
                sessionStorage.setItem('uploadedReceiptFile', dataUrl)
                window.location.href = '/receipt-processing'
            }
            reader.readAsDataURL(file)
        }
    }

    const handleManual = () => {
        sessionStorage.removeItem('uploadedReceipt')
        sessionStorage.removeItem('uploadedReceiptFile')
        window.location.href = '/receipt-processing'
    }

    return (
        <div className='min-h-screen bg-[#EBFFE0] flex items-center justify-center px-8 py-12'>
            <div className='w-full max-w-4xl space-y-12'>
                <div className='text-center space-y-4'>
                    <h1 className='text-5xl font-bold text-[#443104]'>
                        Share your food with the community!
                    </h1>
                    <p className='text-xl text-[#443104]'>
                        You can choose to upload a receipt, take a photo of it,
                        or manually type in your food items.
                    </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    <button
                        onClick={handleUploadClick}
                        className='bg-[#D1E1C4] rounded-3xl p-8 space-y-4 text-center transition-all hover:shadow-lg cursor-pointer'
                    >
                        <div className='flex justify-center'>
                            <Image
                                src='/Upload.svg'
                                alt='Upload'
                                width={60}
                                height={60}
                            />
                        </div>
                        <div className='space-y-2'>
                            <h2 className='text-2xl font-bold text-[#443104]'>
                                Upload receipt
                            </h2>
                            <p className='text-sm text-[#443104]'>
                                Supported file types: JPG, PNG, WEBP, PDF
                            </p>
                        </div>
                    </button>

                    <button
                        onClick={handleCaptureClick}
                        className='bg-[#D1E1C4] rounded-3xl p-8 space-y-4 text-center transition-all hover:shadow-lg cursor-pointer'
                    >
                        <div className='flex justify-center'>
                            <Image
                                src='/Camera.svg'
                                alt='Camera'
                                width={60}
                                height={60}
                            />
                        </div>
                        <div className='space-y-2'>
                            <h2 className='text-2xl font-bold text-[#443104]'>
                                Capture receipt
                            </h2>
                            <p className='text-sm text-[#443104]'>
                                Take a photo of your receipt
                            </p>
                        </div>
                    </button>

                    <button
                        onClick={handleManual}
                        className='bg-[#D1E1C4] rounded-3xl p-8 space-y-4 text-center transition-all hover:shadow-lg cursor-pointer'
                    >
                        <div className='flex justify-center'>
                            <Image
                                src='/Scroll.svg'
                                alt='Manual'
                                width={60}
                                height={60}
                            />
                        </div>
                        <div className='space-y-2'>
                            <h2 className='text-2xl font-bold text-[#443104]'>
                                Manual
                            </h2>
                            <p className='text-sm text-[#443104]'>
                                Type in your foods manually
                            </p>
                        </div>
                    </button>
                </div>

                <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/jpeg,image/png,image/webp,application/pdf'
                    onChange={handleFileChange}
                    className='hidden'
                />
            </div>
        </div>
    )
}
