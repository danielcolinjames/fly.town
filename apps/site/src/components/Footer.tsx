export const Footer = () => {
  return (
    <div className="flex flex-row items-center justify-center fixed w-full bottom-0 py-1 bg-black/60 backdrop-blur-lg gap-2">
      <a
        className="text-[#76BEFB] text-[8px] sm:text-xs opacity-30"
        href="https://x.com/dcwj"
        target="_blank"
        rel="noopener noreferrer"
      >
        by dcj
      </a>
      <p className="text-center text-xs text-gray-600">|</p>
      <p className="text-center text-[8px] sm:text-xs text-gray-600 opacity-60">
        fly.town is not endorsed by or associated with Blackbird Labs Inc.
      </p>
    </div>
  )
}
