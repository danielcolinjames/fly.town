import Image from 'next/image'
import Link from 'next/link'

export const Navbar = () => {
  return (
    <div className="flex w-full flex-col px-8 sm:px-10 min-h-[68px] fixed bg-[#040404] bg-opacity-70 backdrop-blur-3xl border-b border-[#202020] shadow-xl z-50">
      <div className="z-10 flex w-full items-center justify-between text-sm py-4">
        <Link href="/" className="flex items-center justify-center gap-2">
          <Image src="/logo2.png" className="w-6" height={23} width={19} alt="flytown logo" />
          <p className="text-white text-xl sm:text-2xl">
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
