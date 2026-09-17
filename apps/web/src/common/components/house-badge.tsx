import type { IHouseResource } from "@electrolitos/shared/resources";
import { cn } from "@electrolitos/ui/lib/utils";

import { houseColorClasses } from "@/common/constants/house-colors";

interface IHouseBadgeProps {
  house: IHouseResource | null;
  className?: string;
}

/** Punto de color + nombre de la casa. Nunca solo el color: también el nombre. */
export default function HouseBadge({ house, className }: IHouseBadgeProps) {
  if (!house) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 font-heading text-sm font-bold text-muted-foreground",
          className,
        )}
      >
        <span className="size-2.5 rounded-full bg-muted-foreground/40" />
        Sin casa
      </span>
    );
  }

  const classes = houseColorClasses[house.colorKey];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 font-heading text-sm font-bold",
        classes.soft,
        className,
      )}
    >
      <span className={cn("size-2.5 rounded-full", classes.dot)} />
      {house.name}
    </span>
  );
}
