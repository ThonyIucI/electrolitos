import { cn } from "@electrolitos/ui/lib/utils";
import { Delete } from "lucide-react";

interface IPinKeypadProps {
  value: string;
  length: number;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

/**
 * Teclado numérico con los puntos del progreso. Reemplaza al campo de texto porque el
 * teclado del sistema tapa media pantalla en un celular de gama baja y los chicos lo
 * usan parados en clase: acá los botones son grandes, fijos y no mueven el diseño.
 */
export default function PinKeypad({ value, length, onChange, disabled = false }: IPinKeypadProps) {
  const press = (digit: string) => {
    if (value.length >= length) {
      return;
    }
    onChange(value + digit);
  };

  const keyClasses =
    "flex h-14 items-center justify-center rounded-2xl border-2 border-border bg-card font-heading text-2xl font-bold text-foreground transition-transform active:translate-y-0.5 disabled:opacity-40 focus-visible:ring-4 focus-visible:ring-ring/40 focus-visible:outline-none";

  return (
    <div>
      <div className="flex justify-center gap-3" aria-hidden="true">
        {Array.from({ length }, (_, index) => (
          <span
            key={index}
            className={cn(
              "size-3.5 rounded-full border-2 transition-colors",
              index < value.length ? "border-primary bg-primary" : "border-border bg-transparent",
            )}
          />
        ))}
      </div>

      {/* El valor real para lectores de pantalla: los puntos son decorativos. */}
      <p className="sr-only" aria-live="polite">
        {value.length} de {length} números
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {DIGITS.map((digit) => (
          <button
            key={digit}
            type="button"
            disabled={disabled}
            onClick={() => press(digit)}
            className={keyClasses}
          >
            {digit}
          </button>
        ))}

        <button
          type="button"
          disabled={disabled || value.length === 0}
          onClick={() => onChange("")}
          className={cn(keyClasses, "text-base font-bold text-muted-foreground")}
        >
          Borrar
        </button>

        <button type="button" disabled={disabled} onClick={() => press("0")} className={keyClasses}>
          0
        </button>

        <button
          type="button"
          aria-label="Borrar el último número"
          disabled={disabled || value.length === 0}
          onClick={() => onChange(value.slice(0, -1))}
          className={cn(keyClasses, "text-muted-foreground")}
        >
          <Delete className="size-6" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
