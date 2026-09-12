import { cn } from "@electrolitos/ui/lib/utils";
import { Zap } from "lucide-react";

const SIZE_CLASSES = {
  sm: { box: "size-10 rounded-xl", icon: "size-5" },
  md: { box: "size-14 rounded-2xl", icon: "size-7" },
  lg: { box: "size-20 rounded-3xl", icon: "size-10" },
} as const;

export type TBrandMarkSize = keyof typeof SIZE_CLASSES;

interface IBrandMarkProps {
  size?: TBrandMarkSize;
  className?: string;
}

/** Sello de Electrolitos: rayo dorado sobre índigo eléctrico. */
export default function BrandMark({ size = "md", className }: IBrandMarkProps) {
  const { box, icon } = SIZE_CLASSES[size];

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex items-center justify-center bg-primary shadow-sticker-md ring-4 ring-spark/30",
        box,
        className,
      )}
    >
      <Zap className={cn("fill-spark text-spark", icon)} strokeWidth={1.5} />
    </span>
  );
}
