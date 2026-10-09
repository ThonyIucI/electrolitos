import { cn } from "@electrolitos/ui/lib/utils";

import { COURSE_PRICE_SOLES, PRICE_REFERENCE } from "../constants/landing-content";
import { COURSE_HOURS, FREE_HOURS } from "../constants/landing-syllabus";
import { formatSoles } from "../utils/format-soles";
import Reveal from "./reveal";

interface IComparisonRow {
  label: string;
  ours: string;
  theirs: string;
  /** La fila del costo por hora es el argumento; el resto es contexto. */
  isKey?: boolean;
}

const ourPricePerHour = COURSE_PRICE_SOLES / COURSE_HOURS;
const theirPricePerHour = PRICE_REFERENCE.priceSoles / PRICE_REFERENCE.hours;

const timesCheaperPerHour = Math.round(theirPricePerHour / ourPricePerHour);
const timesCheaperTotal = Math.floor(PRICE_REFERENCE.priceSoles / COURSE_PRICE_SOLES);

const ROWS: readonly IComparisonRow[] = [
  {
    label: "Precio",
    ours: formatSoles(COURSE_PRICE_SOLES),
    theirs: formatSoles(PRICE_REFERENCE.priceSoles),
  },
  {
    label: "Horas de clase",
    ours: `${COURSE_HOURS} h + ${FREE_HOURS} h gratis`,
    theirs: `${PRICE_REFERENCE.hours} h`,
  },
  {
    label: "Costo por hora",
    ours: formatSoles(ourPricePerHour),
    theirs: formatSoles(theirPricePerHour),
    isKey: true,
  },
  { label: "Materiales", ours: "Incluidos", theirs: PRICE_REFERENCE.materials },
  { label: "Edad", ours: "Desde 10 años", theirs: PRICE_REFERENCE.ages },
  { label: "Dónde", ours: "Samán y Ventarrones", theirs: PRICE_REFERENCE.place },
];

/**
 * Ancla de precio. Sin una referencia externa, S/ 50 no es barato: es solo un número que
 * el apoderado no sabe con qué comparar — y en zona rural un precio bajo sin explicación
 * se lee como sospecha, no como oferta.
 */
export default function PriceComparison() {
  return (
    <>
      <Reveal>
        <h3 className="text-landing-display font-heading font-bold text-foreground">
          Este mismo taller, en la ciudad, cuesta {timesCheaperTotal} veces más.
        </h3>
      </Reveal>

      <Reveal delay={70}>
        <div className="mt-4 overflow-hidden rounded-2xl bg-card shadow-sticker">
          <table className="w-full table-fixed border-collapse text-landing-body">
            <thead>
              <tr className="border-b border-border">
                <th className="w-[34%] px-3 py-2.5 text-left font-heading text-xs font-bold tracking-[0.1em] text-muted-foreground uppercase">
                  <span className="sr-only">Concepto</span>
                </th>
                <th className="px-3 py-2.5 text-left font-heading text-xs font-bold text-primary">
                  Electrolitos
                </th>
                <th className="px-3 py-2.5 text-left font-heading text-xs font-bold text-muted-foreground">
                  {PRICE_REFERENCE.org}
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr
                  key={row.label}
                  className={cn(
                    "border-b border-border last:border-b-0",
                    row.isKey && "bg-primary/8",
                  )}
                >
                  <th
                    scope="row"
                    className="px-3 py-2.5 text-left align-top font-normal text-muted-foreground"
                  >
                    {row.label}
                  </th>
                  <td
                    className={cn(
                      "px-3 py-2.5 align-top text-foreground",
                      row.isKey && "font-heading font-bold tabular-nums",
                    )}
                  >
                    {row.ours}
                  </td>
                  <td
                    className={cn(
                      "px-3 py-2.5 align-top text-muted-foreground",
                      row.isKey && "font-heading font-bold tabular-nums",
                    )}
                  >
                    {row.theirs}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>

      <Reveal delay={110}>
        <p className="mt-4 rounded-2xl border-l-4 border-l-primary bg-primary/8 p-4 text-landing-title font-heading font-bold text-foreground">
          Una sola hora de ese taller cuesta {formatSoles(theirPricePerHour)}. Las {COURSE_HOURS}{" "}
          horas del nuestro cuestan {formatSoles(COURSE_PRICE_SOLES)}:{" "}
          {timesCheaperPerHour} veces más barato por hora.
        </p>
      </Reveal>

      <Reveal delay={150}>
        {/*
          Admitir que no son idénticos parece debilitar el argumento y hace lo contrario:
          sin esta nota, el primer apoderado que abra la ficha descarta la comparación entera.
        */}
        <p className="mt-3 text-landing-body text-muted-foreground italic">
          {PRICE_REFERENCE.disclaimer}{" "}
          <a
            href={PRICE_REFERENCE.source}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-primary underline underline-offset-2"
          >
            Ver la ficha del taller de la PUCP
          </a>
          .
        </p>
      </Reveal>
    </>
  );
}
