import { Button } from "@electrolitos/ui/components/button";
import { Input } from "@electrolitos/ui/components/input";
import { Label } from "@electrolitos/ui/components/label";
import { cn } from "@electrolitos/ui/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, IdCard, Loader2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  ACCESS_CODE_LENGTH,
  isValidAccessCode,
  normalizeAccessCode,
} from "@electrolitos/shared/access-code";
import { STUDENT_PIN_LENGTH } from "@electrolitos/shared/student-pin";

import PinKeypad from "@/common/components/pin-keypad";
import { authClient } from "@/lib/auth-client";
import {
  getAccessStatusRequest,
  type TAccessStatus,
} from "@/modules/student/services/access.service";

/* Se escribe pegado o con guion: "ama-7k3p" y "AMA7K3P" entran igual. */
const TYPED_CODE_MAX = ACCESS_CODE_LENGTH + 2;

type TStep = "code" | "checking" | "pin";

interface IStudentSignInFormProps {
  /** Código que venía en el enlace de WhatsApp, si lo había. */
  initialCode?: string;
}

/**
 * Ingreso del alumno. Nunca le pide un dato que no le toca ni lo hace adivinar:
 * con el código se le pregunta al back qué sigue (`GET /access/status`).
 *
 * - Si todavía no tiene PIN, se entra con el propio código y la app lo lleva a crearlo.
 * - Si ya lo tiene, aparece el teclado del PIN y nada más.
 *
 * Que ya esté logueado lo resuelve antes el `beforeLoad` de `/login`, que lo manda
 * directo a su perfil sin pasar por acá.
 */
export default function StudentSignInForm({ initialCode }: IStudentSignInFormProps) {
  const navigate = useNavigate({ from: "/login" });
  const [step, setStep] = useState<TStep>("code");
  const [code, setCode] = useState(initialCode ? normalizeAccessCode(initialCode) : "");
  const [pin, setPin] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [isSubmittingPin, setIsSubmittingPin] = useState(false);
  const hasAutoChecked = useRef(false);

  const signIn = async (accessCode: string, password: string): Promise<boolean> => {
    const { error } = await authClient.signIn.username({
      username: accessCode.toLowerCase(),
      password,
    });

    if (error) {
      return false;
    }

    toast.success("¡Entraste!");
    navigate({ to: "/pasaporte" });
    return true;
  };

  /** Pregunta al back qué le toca a este código y actúa en consecuencia. */
  const continueWithCode = async (rawCode: string) => {
    const accessCode = normalizeAccessCode(rawCode);

    if (!isValidAccessCode(accessCode)) {
      setCodeError("Ese código no tiene la forma correcta.");
      return;
    }

    setCodeError(null);
    setStep("checking");

    let status: TAccessStatus;

    try {
      ({ status } = await getAccessStatusRequest(accessCode));
    } catch {
      /*
        Si no se pudo preguntar, no se adivina: mandarlo al teclado del PIN lo dejaría
        escribiendo un PIN que quizá no existe. Vuelve al código con el motivo real.
      */
      setCode(accessCode);
      setCodeError("No pudimos verificar tu código. Revisa tu internet e intenta de nuevo.");
      setStep("code");
      return;
    }

    /* Sin PIN todavía: el código es la contraseña y de ahí va a crearlo. */
    if (status === "needs-setup" && (await signIn(accessCode, accessCode))) {
      return;
    }

    setCode(accessCode);
    setPin("");
    setStep("pin");
  };

  useEffect(() => {
    if (hasAutoChecked.current || !initialCode) {
      return;
    }

    hasAutoChecked.current = true;
    void continueWithCode(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  const submitPin = async (value: string) => {
    setIsSubmittingPin(true);

    if (!(await signIn(code, value))) {
      toast.error("Código o PIN incorrecto.");
      setPin("");
    }

    setIsSubmittingPin(false);
  };

  const handlePinChange = (value: string) => {
    setPin(value);

    if (value.length === STUDENT_PIN_LENGTH) {
      void submitPin(value);
    }
  };

  if (step === "checking") {
    return (
      <div className="flex flex-col items-center gap-3 py-10">
        <Loader2 className="size-8 animate-spin text-primary motion-reduce:animate-none" />
        <p className="text-base text-muted-foreground">Entrando…</p>
      </div>
    );
  }

  if (step === "pin") {
    return (
      <div>
        <div className="text-center">
          <h2 className="font-heading text-xl font-extrabold text-foreground">Ingresa tu PIN</h2>
          <p className="mt-1 text-base text-muted-foreground">
            Son los {STUDENT_PIN_LENGTH} números que elegiste.
          </p>
        </div>

        <div className="mt-6">
          {isSubmittingPin ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <Loader2 className="size-8 animate-spin text-primary motion-reduce:animate-none" />
              <p className="text-base text-muted-foreground">Entrando…</p>
            </div>
          ) : (
            <PinKeypad value={pin} length={STUDENT_PIN_LENGTH} onChange={handlePinChange} />
          )}
        </div>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          ¿Se te olvidó? Pídele al profesor que te genere un código nuevo.
        </p>

        <Button
          type="button"
          variant="ghost"
          className="mt-3 w-full"
          onClick={() => {
            setPin("");
            setStep("code");
          }}
        >
          <ArrowLeft />
          Usar otro código
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void continueWithCode(code);
      }}
      className="space-y-5"
    >
      <div className="space-y-2">
        <Label htmlFor="codigo">Tu código</Label>
        <div className="relative">
          <IdCard className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="codigo"
            name="codigo"
            type="text"
            autoComplete="username"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            maxLength={TYPED_CODE_MAX}
            placeholder="Ingresa tu código"
            aria-invalid={Boolean(codeError)}
            className={cn("pl-12 font-heading text-lg", code && "tracking-[0.2em]")}
            value={code}
            onChange={(event) => {
              setCodeError(null);
              setCode(event.target.value.toUpperCase());
            }}
          />
        </div>
        <p className="text-sm text-muted-foreground">El que te envió el profesor.</p>
        {codeError && <p className="text-sm font-bold text-destructive">{codeError}</p>}
      </div>

      <Button type="submit" size="xl">
        <Sparkles />
        Entrar
      </Button>
    </form>
  );
}
