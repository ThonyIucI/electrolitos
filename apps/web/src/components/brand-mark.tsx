import { cn } from "@electrolitos/ui/lib/utils";

const SIZE_CLASSES = {
  sm: "size-10",
  md: "size-14",
  lg: "size-20",
} as const;

export type TBrandMarkSize = keyof typeof SIZE_CLASSES;

interface IBrandMarkProps {
  size?: TBrandMarkSize;
  className?: string;
}

/** La chakana del taller: cuatro cuadrantes con el 1, el 0, el + y el −. */
export default function BrandMark({ size = "md", className }: IBrandMarkProps) {
  return (
    <img
      src="/logo-chakana.png"
      alt=""
      aria-hidden="true"
      className={cn("shrink-0 object-contain", SIZE_CLASSES[size], className)}
    />
  );
}
