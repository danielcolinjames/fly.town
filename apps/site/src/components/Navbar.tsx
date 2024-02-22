import Image from 'next/image'
import Link from 'next/link'

export const Navbar = () => {
  return (
    <div className="flex w-full flex-col px-8 sm:px-10 min-h-[45px] sm:min-h-[50px] fixed bg-[#040404] bg-opacity-70 backdrop-blur-3xl border-b border-[#202020] shadow-xl z-50">
      <div className="z-10 flex w-full items-center justify-between text-sm py-1 sm:py-2">
        <Link href="/" className="flex items-center justify-center gap-2">
          <Image src="/logo2.png" className="w-4 sm:w-5" height={23} width={19} alt="fly.town logo" />
          <p className="text-white text-lg sm:text-xl">
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
