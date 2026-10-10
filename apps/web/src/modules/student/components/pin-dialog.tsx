import { Button } from "@electrolitos/ui/components/button";
import { Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  STUDENT_PIN_LENGTH,
  STUDENT_PIN_MESSAGES,
  isWeakStudentPin,
} from "@electrolitos/shared/student-pin";

import PinKeypad from "@/common/components/pin-keypad";
import { useSetStudentPin } from "@/modules/student/hooks/use-set-student-pin";

/** `create` es obligatorio y no se puede cerrar; `change` sale del perfil y sí se cierra. */
type TPinDialogMode = "create" | "change";

/** Al cambiarlo se pide primero el actual; al crearlo se arranca en `new`. */
type TPinStage = "current" | "new" | "confirm";

interface IPinDialogProps {
  open: boolean;
  mode: TPinDialogMode;
  onDone: () => void;
  onClose?: () => void;
}

const STAGE_COPY: Record<TPinStage, { title: string; hint: string }> = {
  current: { title: "Escribe tu PIN actual", hint: "El que usas hoy para entrar." },
  new: { title: "Elige tu PIN", hint: `Son ${STUDENT_PIN_LENGTH} números que solo tú vas a saber.` },
  confirm: { title: "Escríbelo otra vez", hint: "Para estar seguros de que no se te olvide." },
};

/**
 * Ventana para crear o cambiar el PIN, de a un número por pantalla y con teclado propio.
 *
 * Avanza sola al completar los cuatro dígitos, como el desbloqueo de un celular: el chico
 * no tiene que buscar ningún botón. Usa el `<dialog>` nativo en vez de una librería, que
 * trae atrapado de foco y fondo inerte sin sumar dependencias; en modo `create` se cancela
 * el `Escape`, porque no puede seguir sin PIN.
 */
export default function PinDialog({ open, mode, onDone, onClose }: IPinDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const setPin = useSetStudentPin();

  const isBlocking = mode === "create";
  const firstStage: TPinStage = isBlocking ? "new" : "current";

  const [stage, setStage] = useState<TPinStage>(firstStage);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);

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

  const reset = () => {
    setStage(firstStage);
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
    setError(null);
  };

  const submit = async () => {
    const result = await setPin.handler({
      pin: newPin,
      ...(mode === "change" && { currentPin }),
    });

    if (result) {
      reset();
      onDone();
      return;
    }

    /* El server ya avisó del fallo en un toast; acá solo se vuelve al principio. */
    setConfirmPin("");
    setNewPin("");
    setStage(firstStage);
  };

  /* Cada etapa avanza sola al cuarto dígito; la validación va antes de pasar. */
  const handleStageValue = (stageValue: string) => {
    setError(null);

    if (stage === "current") {
      setCurrentPin(stageValue);
      if (stageValue.length === STUDENT_PIN_LENGTH) {
        setStage("new");
      }
      return;
    }

    if (stage === "new") {
      setNewPin(stageValue);
      if (stageValue.length < STUDENT_PIN_LENGTH) {
        return;
      }

      if (isWeakStudentPin(stageValue)) {
        setError(STUDENT_PIN_MESSAGES.weak);
        setNewPin("");
        return;
      }

      setStage("confirm");
      return;
    }

    setConfirmPin(stageValue);
    if (stageValue.length < STUDENT_PIN_LENGTH) {
      return;
    }

    if (stageValue !== newPin) {
      setError(STUDENT_PIN_MESSAGES.mismatch);
      setConfirmPin("");
      setNewPin("");
      setStage("new");
      return;
    }

    void submit();
  };

  const stageValue = stage === "current" ? currentPin : stage === "new" ? newPin : confirmPin;
  const copy = STAGE_COPY[stage];

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        if (isBlocking) {
          event.preventDefault();
          return;
        }
        reset();
        onClose?.();
      }}
      aria-labelledby="pin-dialog-title"
      className="m-auto w-[min(22rem,calc(100vw-2rem))] rounded-3xl border-2 border-border bg-card p-6 text-foreground shadow-sticker-md backdrop:bg-foreground/50 backdrop:backdrop-blur-sm"
    >
      <div className="text-center">
        {isBlocking && (
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-secondary px-3.5 py-1.5 font-heading text-sm font-bold text-secondary-foreground">
            <ShieldCheck className="size-4" aria-hidden="true" />
            Para poder continuar
          </p>
        )}

        <h2 id="pin-dialog-title" className="font-heading text-xl font-extrabold text-foreground">
          {copy.title}
        </h2>
        <p className="mt-1 text-base text-muted-foreground">{copy.hint}</p>
      </div>

      <div className="mt-6">
        {setPin.loading ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <Loader2 className="size-8 animate-spin text-primary motion-reduce:animate-none" />
            <p className="text-base text-muted-foreground">Guardando…</p>
          </div>
        ) : (
          <PinKeypad
            value={stageValue}
            length={STUDENT_PIN_LENGTH}
            onChange={handleStageValue}
          />
        )}
      </div>

      {error && <p className="mt-4 text-center text-sm font-bold text-destructive">{error}</p>}

      {isBlocking ? (
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Si algún día se te olvida, pídele al profesor que te genere un código nuevo.
        </p>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="mt-5 w-full"
          onClick={() => {
            reset();
            onClose?.();
          }}
        >
          Cancelar
        </Button>
      )}
    </dialog>
  );
}
