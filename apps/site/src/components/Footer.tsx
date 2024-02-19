export const Footer = () => {
  return (
    <div className="flex flex-row items-center justify-center w-full absolute bottom-0 py-1 bg-black/60 backdrop-blur-lg gap-2">
      <a
        className="text-brandYellow font-light text-[8px] opacity-60"
        href="https://x.com/dcwj"
        target="_blank"
        rel="noopener noreferrer"
      >
        by dcj
      </a>
      <p className="text-center text-[8px] text-gray-700">|</p>
      <p className="text-center text-[8px] text-gray-600 opacity-60">
        fly.town is not endorsed by or associated with Blackbird Labs Inc.
      </p>
    </div>
  )
}
