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
      </div>
    </div>
  )
}
