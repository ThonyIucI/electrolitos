import { formatAccessCode } from "@electrolitos/shared/access-code";
import type { IEnrollmentResource, IHouseResource } from "@electrolitos/shared/resources";
import { Button } from "@electrolitos/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@electrolitos/ui/components/dropdown-menu";
import { cn } from "@electrolitos/ui/lib/utils";
import { Check, Copy, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import HouseBadge from "@/common/components/house-badge";
import { houseColorClasses } from "@/common/constants/house-colors";

const COPY_FEEDBACK_MS = 1500;

interface IEnrollmentCardProps {
  enrollment: IEnrollmentResource;
  houses: IHouseResource[];
  onAssignHouse: (enrollmentId: string, houseId: string | null) => void;
}

export default function EnrollmentCard({
  enrollment,
  houses,
  onAssignHouse,
}: IEnrollmentCardProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const { student, house } = enrollment;
  const initials = `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();

  const copyAccessCode = async () => {
    try {
      await navigator.clipboard.writeText(enrollment.accessCode);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), COPY_FEEDBACK_MS);
    } catch {
      toast.error("No se pudo copiar. Anótalo a mano.");
    }
  };

  return (
    <li className="flex items-center gap-3 rounded-2xl border-2 border-border bg-card p-3 shadow-sticker">
      <span
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-xl font-heading text-lg font-extrabold",
          house ? houseColorClasses[house.colorKey].solid : "bg-muted text-muted-foreground",
        )}
      >
        {initials}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate font-heading text-lg font-bold text-foreground">
          {student.firstName} {student.lastName}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <HouseBadge house={house} />
          <button
            type="button"
            onClick={copyAccessCode}
            aria-label={`Copiar el código de ${student.firstName}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 font-mono text-sm font-bold tracking-wide text-foreground"
          >
            {formatAccessCode(enrollment.accessCode)}
            {hasCopied ? (
              <Check className="size-3.5 text-success" />
            ) : (
              <Copy className="size-3.5 text-muted-foreground" />
            )}
          </button>
          {student.guardianPhone && (
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Phone className="size-3.5" />
              {student.guardianPhone}
            </span>
          )}
        </div>
      </div>

      {houses.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="outline" size="sm" aria-label="Cambiar de casa" />}
          >
            Casa
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {houses.map((option) => (
              <DropdownMenuItem
                key={option.id}
                onClick={() => onAssignHouse(enrollment.id, option.id)}
              >
                <span
                  className={cn("size-3 rounded-full", houseColorClasses[option.colorKey].dot)}
                />
                {option.name}
              </DropdownMenuItem>
            ))}
            {house && (
              <DropdownMenuItem onClick={() => onAssignHouse(enrollment.id, null)}>
                Quitar casa
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </li>
  );
}
