export const Footer = () => {
  return (
    <div className="flex flex-row gap-1 sm:gap-2 items-center justify-center fixed w-full bottom-0 py-1 sm:py-2 bg-black/60 backdrop-blur-lg">
      <a className="text-[#76BEFB] text-[8px] sm:text-xs min-w-[28px] opacity-30" href="https://x.com/dcwj" target="_blank" rel="noopener noreferrer">by dcj</a>
      <p className="hidden sm:shown text-center text-xs text-gray-800">
        |
      </p>
      <p className="text-center text-[8px] sm:text-xs text-gray-600 opacity-60">
        fly.town is not endorsed by or associated with Blackbird Labs Inc.
      </p>
    </div>
  )
}
