export const Footer = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full absolute bottom-0 py-2 sm:py-4 bg-black/60 backdrop-blur-lg">
      <div className="flex flex-row items-center justify-center w-full gap-2">
        <a
          className="text-gray-300 font-light text-[8px] sm:text-xs opacity-60"
          href="https://x.com/dcwj"
          target="_blank"
          rel="noopener noreferrer"
        >
          by dcj
        </a>
        <p className="text-center text-[8px] sm:text-xs text-gray-700">|</p>
        <p className="text-center text-[8px] sm:text-xs text-[#727272] opacity-60">
          fly.town is not endorsed by or associated with Blackbird Labs Inc.
        </p>
      </div>
    </div>
  );
};
