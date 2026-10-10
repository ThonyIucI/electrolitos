import { Button } from "@electrolitos/ui/components/button";
import { useEffect, useRef } from "react";

interface IConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  /** `destructive` para lo que no se puede deshacer de un clic. */
  variant?: "default" | "destructive";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmación para acciones que no se deshacen. Usa el `<dialog>` nativo: atrapa el foco
 * y apila por encima de todo sin sumar dependencias, que es lo mismo que hace `PinDialog`.
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  variant = "default",
  loading = false,
  onConfirm,
  onCancel,
}: IConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      aria-labelledby="confirm-dialog-title"
      className="m-auto w-[min(24rem,calc(100vw-2rem))] rounded-3xl border-2 border-border bg-card p-6 text-foreground shadow-sticker-md backdrop:bg-foreground/50 backdrop:backdrop-blur-sm"
    >
      <h2 id="confirm-dialog-title" className="font-heading text-lg font-extrabold text-foreground">
        {title}
      </h2>
      <p className="mt-2 text-base text-muted-foreground">{description}</p>

      <div className="mt-5 flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="button"
          variant={variant === "destructive" ? "destructive" : "default"}
          className="flex-1"
          disabled={loading}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
