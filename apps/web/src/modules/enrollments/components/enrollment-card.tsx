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
import { ArrowRightLeft, Check, Copy, MoreVertical, Pencil, Phone, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import ConfirmModal from "@/common/components/confirm-modal";
import HouseBadge from "@/common/components/house-badge";
import { houseColorClasses } from "@/common/constants/house-colors";
import { buildInviteMessage } from "@/modules/enrollments/utils/invite-message";

const COPY_FEEDBACK_MS = 1500;

interface IEnrollmentCardProps {
  enrollment: IEnrollmentResource;
  houses: IHouseResource[];
  onAssignHouse: (enrollmentId: string, houseId: string | null) => void;
  onEdit: (enrollment: IEnrollmentResource) => void;
  onMove: (enrollment: IEnrollmentResource) => void;
  onRegenerateCode: (enrollmentId: string) => void;
}

export default function EnrollmentCard({
  enrollment,
  houses,
  onAssignHouse,
  onEdit,
  onMove,
  onRegenerateCode,
}: IEnrollmentCardProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const [isConfirmingCode, setIsConfirmingCode] = useState(false);
  const { student, house } = enrollment;
  const initials = `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();

  /* Se copia el mensaje entero, no solo el código: va directo a WhatsApp sin redactar nada. */
  const copyInviteMessage = async () => {
    try {
      await navigator.clipboard.writeText(buildInviteMessage(student, enrollment.accessCode));
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), COPY_FEEDBACK_MS);
      toast.success(`Mensaje de ${student.firstName} copiado`);
    } catch {
      toast.error("No se pudo copiar. Anota el código a mano.");
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
            onClick={copyInviteMessage}
            aria-label={`Copiar el mensaje de WhatsApp para ${student.firstName}`}
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

      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" aria-label={`Más opciones de ${student.firstName}`} />}
        >
          <MoreVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(enrollment)}>
            <Pencil className="size-4" />
            Editar datos
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onMove(enrollment)}>
            <ArrowRightLeft className="size-4" />
            Mover a otro taller
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsConfirmingCode(true)}>
            <RefreshCw className="size-4" />
            Generar código nuevo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmModal
        open={isConfirmingCode}
        title={`¿Generar un código nuevo para ${student.firstName}?`}
        description="El código actual deja de funcionar y se le borra el PIN. Su progreso no se toca: vuelve a entrar con el código nuevo, crea otro PIN y encuentra todo igual. Acuérdate de enviarle el código nuevo."
        confirmLabel="Generar código"
        variant="destructive"
        onConfirm={() => {
          setIsConfirmingCode(false);
          onRegenerateCode(enrollment.id);
        }}
        onCancel={() => setIsConfirmingCode(false)}
      />
    </li>
  );
}
