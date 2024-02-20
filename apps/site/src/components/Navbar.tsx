import Image from 'next/image'
import Link from 'next/link'

export const Navbar = () => {
  return (
    <div className="flex w-full flex-col px-8 sm:px-10">
      <div className="z-10 flex w-full items-center justify-between pt-4 text-sm sm:pt-10">
        <Link href="/" className="flex items-center justify-center gap-2">
          <Image src="/logo2.png" className="w-8" height={23} width={19} alt="flytown logo" />
          <p className="text-white text-3xl">
            fly
            <span className="text-gray-600">.town</span>
          </p>
        </Link>
        <div className='flex flex-row gap-2 items-center justify-center'>
          <Link href="/l" className="items-center justify-center gap-2 grayscale opacity-0 hover:opacity-100 duration-1000 p-2">😮</Link>
          <Link href="/all" className="items-center justify-center gap-2 grayscale opacity-0 hover:opacity-100 duration-1000 p-2">🤫</Link>
        </div>
      </div>
    </div>
  )
}
