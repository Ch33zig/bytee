import Image from 'next/image'
import { Button } from './Button'

export const Navbar = () => {
    return (
        <nav className='w-full px-8 py-6 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
                <Image
                    src='/Logo.svg'
                    alt='bytee logo'
                    width={25}
                    height={25}
                />
                <span className='text-2xl font-semibold text-[#443104]'>
                    bytee
                </span>
            </div>

            <div className='flex items-center gap-4'>
                <Button variant='white' href='/login'>
                    Log in
                </Button>
                <Button variant='brown' href='/signup'>
                    Join now
                </Button>
            </div>
        </nav>
    )
}
