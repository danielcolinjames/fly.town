import { ReactNode } from "react";

export const StatCard = ({
  title,
  statText,
  children,
}: {
  title: string;
  statText: string;
  children: ReactNode;
}) => {
  return (
    <div
      className="w-full flex flex-row gap-2 items-center justify-start px-2 py-2 sm:px-4 sm:py-4 duration-200 transition-all rounded-full
      bg-[#0a0a0a] border-[#202020] border"
    >
      <div className="p-4 bg-[#181818] rounded-full">
        <div className="text-[#B5B5B5]">{children}</div>
      </div>
      <div className="flex flex-col items-start justify-center">
        <p className="text-[#B5B5B5] text-sm sm:text-base font-light">
          {title}
        </p>
        <p className="text-white text-sm sm:text-base font-semibold">
          {statText}
        </p>
      </div>
    </div>
  );
};
