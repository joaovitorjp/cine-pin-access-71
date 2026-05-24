import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  count?: number;
  className?: string;
}

const CardGridSkeleton: React.FC<Props> = ({ count = 14, className }) => {
  return (
    <div
      className={
        className ??
        "grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2 sm:gap-3"
      }
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="w-full aspect-[2/3] rounded-md" />
      ))}
    </div>
  );
};

export default CardGridSkeleton;
