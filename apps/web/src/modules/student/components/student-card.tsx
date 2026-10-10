import { formatAccessCode } from "@electrolitos/shared/access-code";
import type { IStudentCardResource } from "@electrolitos/shared/resources";
import { cn } from "@electrolitos/ui/lib/utils";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import HouseBadge from "@/common/components/house-badge";
import { houseColorClasses } from "@/common/constants/house-colors";
import { formatShortDate } from "@/common/utils/format-date";
import BrandMark from "@/components/brand-mark";

const COPY_FEEDBACK_MS = 1500;

interface IStudentCardProps {
  card: IStudentCardResource;
}

const initialsOf = (fullName: string): string =>
  fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

/**
 * Carnet del taller. Es lo primero que ve el chico al entrar y, hasta que existan el XP
 * y las medallas, lo único: por eso se trata como un objeto suyo — nombre, casa y código
 * — y no como una ficha de datos.
 */
export default function StudentCard({ card }: IStudentCardProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const houseClasses = card.house ? houseColorClasses[card.house.colorKey] : null;

  const copyCode = async () => {
    if (!card.accessCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(card.accessCode);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), COPY_FEEDBACK_MS);
    } catch {
      toast.error("No se pudo copiar.");
    }
  };

  return (
    <article className="overflow-hidden rounded-3xl border-2 border-border bg-card shadow-sticker-md">
      <div
        className={cn(
          "flex items-center gap-2 px-5 py-3",
          houseClasses ? houseClasses.solid : "bg-primary text-primary-foreground",
        )}
      >
        <BrandMark size="sm" />
        <span className="font-heading text-sm font-extrabold tracking-[0.14em] uppercase">
          Electrolitos
        </span>
        <span className="ml-auto font-heading text-xs font-bold tracking-widest uppercase opacity-80">
          Carnet de agente
        </span>
      </div>

      <div className="flex items-center gap-4 p-5">
        <span
          className={cn(
            "flex size-16 shrink-0 items-center justify-center rounded-2xl font-heading text-2xl font-extrabold",
            houseClasses ? houseClasses.solid : "bg-muted text-muted-foreground",
          )}
          aria-hidden="true"
        >
          {initialsOf(card.fullName)}
        </span>

        <div className="min-w-0">
          <p className="font-heading text-xl font-extrabold text-foreground">{card.fullName}</p>
          {card.nickname && <p className="text-base text-muted-foreground">«{card.nickname}»</p>}
          <div className="mt-2">
            <HouseBadge house={card.house} />
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-4 border-t-2 border-border px-5 py-4">
        <div className="min-w-0">
          <dt className="font-heading text-xs font-bold tracking-widest text-muted-foreground uppercase">
            Tu código
          </dt>
          <dd className="mt-1">
            {card.accessCode ? (
              <button
                type="button"
                onClick={copyCode}
                aria-label="Copiar mi código"
                className="inline-flex items-center gap-1.5 font-mono text-base font-bold tracking-wide text-foreground"
              >
                {formatAccessCode(card.accessCode)}
                {hasCopied ? (
                  <Check className="size-4 text-success" aria-hidden="true" />
                ) : (
                  <Copy className="size-4 text-muted-foreground" aria-hidden="true" />
                )}
              </button>
            ) : (
              <span className="text-base text-muted-foreground">—</span>
            )}
          </dd>
        </div>

        <div className="min-w-0">
          <dt className="font-heading text-xs font-bold tracking-widest text-muted-foreground uppercase">
            Agente desde
          </dt>
          <dd className="mt-1 text-base text-foreground">{formatShortDate(card.enrolledAt)}</dd>
        </div>
      </dl>

      <p className="border-t border-border px-5 py-3 text-sm text-muted-foreground">
        {card.courseName}
      </p>
    </article>
  );
}
