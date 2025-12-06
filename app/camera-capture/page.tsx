'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'

export default function CameraCapturePage() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [isCameraActive, setIsCameraActive] = useState(false)
    const [capturedImage, setCapturedImage] = useState<string | null>(null)

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
            })
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream
            }
            setStream(mediaStream)
            setIsCameraActive(true)
        } catch (error) {
            console.error('Error accessing camera:', error)
            alert('Could not access camera. Please check permissions.')
        }
    }

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current
            const canvas = canvasRef.current
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            const ctx = canvas.getContext('2d')
            if (ctx) {
                ctx.drawImage(video, 0, 0)
                const dataUrl = canvas.toDataURL('image/jpeg')
                setCapturedImage(dataUrl)
                stopCamera()
            }
        }
    }

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop())
        }
        setIsCameraActive(false)
    }

    const retake = () => {
        setCapturedImage(null)
        startCamera()
    }

    const usePhoto = () => {
        if (capturedImage) {
            sessionStorage.setItem('uploadedReceipt', capturedImage)
            sessionStorage.setItem('uploadedReceiptFile', capturedImage)
            window.location.href = '/receipt-processing'
        }
    }

    const goBack = () => {
        stopCamera()
        window.location.href = '/upload-receipt'
    }

    if (!isCameraActive && !capturedImage) {
        startCamera()
    }

    return (
        <div className='min-h-screen bg-[#EBFFE0] flex flex-col items-center justify-center px-8 py-12'>
            <div className='w-full max-w-4xl space-y-8'>
                <div className='text-center'>
                    <h1 className='text-4xl font-bold text-[#443104] mb-2'>
                        Capture Receipt
                    </h1>
                    <p className='text-[#443104]'>
                        Position your receipt in the frame and capture
                    </p>
                </div>

                <div className='bg-[#443104] rounded-3xl p-6 aspect-video relative overflow-hidden'>
                    {capturedImage ? (
                        <img
                            src={capturedImage}
                            alt='Captured receipt'
                            className='w-full h-full object-contain'
                        />
                    ) : (
                        <>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className='w-full h-full object-contain'
                            />
                            <canvas ref={canvasRef} className='hidden' />
                        </>
                    )}
                </div>

                <div className='flex gap-4 justify-center'>
                    {capturedImage ? (
                        <>
                            <button
                                onClick={retake}
                                className='bg-white text-[#443104] px-8 py-3 rounded-full text-lg font-medium hover:opacity-90 transition-all cursor-pointer'
                            >
                                Retake
                            </button>
                            <button
                                onClick={usePhoto}
                                className='bg-[#443104] text-white px-8 py-3 rounded-full text-lg font-medium hover:opacity-90 transition-all cursor-pointer'
                            >
                                Use Photo
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={goBack}
                                className='bg-white text-[#443104] px-8 py-3 rounded-full text-lg font-medium hover:opacity-90 transition-all cursor-pointer'
                            >
                                Cancel
                            </button>
                            <button
                                onClick={capturePhoto}
                                className='bg-[#443104] text-white px-8 py-3 rounded-full text-lg font-medium hover:opacity-90 transition-all cursor-pointer'
                            >
                                Capture
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
