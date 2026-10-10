import { Button } from "@electrolitos/ui/components/button";
import { Skeleton } from "@electrolitos/ui/components/skeleton";
import { createFileRoute } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { useEffect, useState } from "react";

import PinDialog from "@/modules/student/components/pin-dialog";
import StudentCard from "@/modules/student/components/student-card";
import { useStudentCard } from "@/modules/student/hooks/use-student-card";

export const Route = createFileRoute("/_student/pasaporte")({
  component: PassportPage,
});

function PassportPage() {
  const { user } = Route.useRouteContext();
  const StudentCardData = useStudentCard();
  const [isChangingPin, setIsChangingPin] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    StudentCardData.handler(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const firstName = user.name.split(" ")[0] ?? user.name;

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6 pb-24">
      <h1 className="font-heading text-2xl font-extrabold text-foreground">
        ¡Hola, {firstName}! 👋
      </h1>

      <div className="mt-5">
        {StudentCardData.loading && !StudentCardData.card && (
          <Skeleton className="h-72 w-full rounded-3xl" />
        )}

        {StudentCardData.card && <StudentCard card={StudentCardData.card} />}
      </div>

      <Button
        variant="outline"
        size="lg"
        className="mt-4 w-full"
        onClick={() => setIsChangingPin(true)}
      >
        <KeyRound />
        Cambiar mi PIN
      </Button>

      <div className="mt-4 rounded-3xl border-2 border-dashed border-border p-6 text-center text-base text-muted-foreground">
        Tu XP, tu nivel y tus medallas aparecerán acá en cuanto empiecen las misiones.
      </div>

      <PinDialog
        open={isChangingPin}
        mode="change"
        onDone={() => setIsChangingPin(false)}
        onClose={() => setIsChangingPin(false)}
      />
    </div>
  );
}
