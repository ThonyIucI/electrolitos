import { Button } from "@electrolitos/ui/components/button";
import { Skeleton } from "@electrolitos/ui/components/skeleton";
import { cn } from "@electrolitos/ui/lib/utils";
import { Link, createFileRoute } from "@tanstack/react-router";
import { GraduationCap, Users } from "lucide-react";
import { useEffect, useState } from "react";

import EnrollmentCard from "@/modules/enrollments/components/enrollment-card";
import EnrollmentForm from "@/modules/enrollments/components/enrollment-form";
import { useCourses } from "@/modules/enrollments/hooks/use-courses";
import { useEnrollments } from "@/modules/enrollments/hooks/use-enrollments";

export const Route = createFileRoute("/_staff/alumnos")({
  component: StudentsPage,
});

function StudentsPage() {
  const Courses = useCourses();
  const Enrollments = useEnrollments();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    Courses.handler(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Al cargar la lista se preselecciona la cohorte más reciente. */
  const course = Courses.courses.find((item) => item.id === selectedId) ?? Courses.courses[0];
  const courseId = course?.id;

  useEffect(() => {
    if (!courseId) {
      return;
    }
    const controller = new AbortController();
    Enrollments.handler(courseId, controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const isLoadingCourses = Courses.loading && Courses.courses.length === 0;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <header className="mb-6">
        <h1 className="font-heading text-3xl font-extrabold text-foreground">Alumnos</h1>
        {course && (
          <p className="mt-1 text-base text-muted-foreground">
            <span className="font-bold text-foreground">
              {Enrollments.enrollments.length} de {course.capacity}
            </span>{" "}
            inscritos
          </p>
        )}
      </header>

      {isLoadingCourses && <Skeleton className="h-64 w-full rounded-3xl" />}

      {!isLoadingCourses && !course && (
        <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-border px-6 py-12 text-center">
          <GraduationCap className="size-10 text-muted-foreground" strokeWidth={1.5} />
          <p className="mt-3 font-heading text-lg font-bold text-foreground">
            Todavía no hay ningún taller
          </p>
          <p className="mt-1 text-base text-muted-foreground">
            Los alumnos se inscriben a una cohorte, así que primero hay que crearla.
          </p>
          <Link to="/cursos" className="mt-4">
            <Button>Ir a Talleres</Button>
          </Link>
        </div>
      )}

      {course && (
        <div className="space-y-6">
          {/* Con dos sedes hay varias cohortes a la vez: hay que decir en cuál se inscribe. */}
          {Courses.courses.length > 1 && (
            <div
              role="tablist"
              aria-label="Taller"
              className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
            >
              {Courses.courses.map((option) => {
                const isActive = option.id === course.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedId(option.id)}
                    className={cn(
                      "shrink-0 rounded-full border-2 px-3 py-1.5 font-heading text-sm font-bold transition-colors",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {option.name}
                  </button>
                );
              })}
            </div>
          )}

          <EnrollmentForm
            houses={course.houses}
            onSubmit={(student, houseId) => Enrollments.enroll(course.id, student, houseId)}
          />

          {Enrollments.loading && Enrollments.enrollments.length === 0 && (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
          )}

          {!Enrollments.loading && Enrollments.enrollments.length === 0 && (
            <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-border px-6 py-12 text-center">
              <Users className="size-10 text-muted-foreground" strokeWidth={1.5} />
              <p className="mt-3 font-heading text-lg font-bold text-foreground">
                Todavía no hay nadie inscrito
              </p>
              <p className="mt-1 text-base text-muted-foreground">
                Registra al primero con el formulario de arriba.
              </p>
            </div>
          )}

          {Enrollments.enrollments.length > 0 && (
            <ul className="space-y-3">
              {Enrollments.enrollments.map((enrollment) => (
                <EnrollmentCard
                  key={enrollment.id}
                  enrollment={enrollment}
                  houses={course.houses}
                  onAssignHouse={Enrollments.assignHouse}
                  onRegenerateCode={Enrollments.regenerateCode}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
