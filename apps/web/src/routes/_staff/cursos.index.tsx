import { Button } from "@electrolitos/ui/components/button";
import { Skeleton } from "@electrolitos/ui/components/skeleton";
import { Link, createFileRoute } from "@tanstack/react-router";
import { CalendarDays, ChevronRight, GraduationCap, Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { courseStatusLabels } from "@electrolitos/shared/courses";

import { formatShortDate } from "@/common/utils/format-date";
import CourseFormModal from "@/modules/enrollments/components/course-form-modal";
import { useCourses } from "@/modules/enrollments/hooks/use-courses";

export const Route = createFileRoute("/_staff/cursos/")({
  component: CoursesPage,
});

function CoursesPage() {
  const Courses = useCourses();
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    Courses.handler(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isEmpty = !Courses.loading && Courses.courses.length === 0;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <header className="mb-6">
        <h1 className="font-heading text-3xl font-extrabold text-foreground">Talleres</h1>
        <p className="mt-1 text-base text-muted-foreground">
          Cada sede o promoción es una cohorte distinta. Entra a una para ver e inscribir a
          sus alumnos.
        </p>
      </header>

      <Button className="w-full" onClick={() => setIsCreating(true)}>
        <Plus />
        Nuevo taller
      </Button>

      {Courses.loading && Courses.courses.length === 0 && (
        <div className="mt-6 space-y-3">
          <Skeleton className="h-36 w-full rounded-3xl" />
          <Skeleton className="h-36 w-full rounded-3xl" />
        </div>
      )}

      {isEmpty && (
        <div className="mt-6 flex flex-col items-center rounded-3xl border-2 border-dashed border-border px-6 py-12 text-center">
          <GraduationCap className="size-10 text-muted-foreground" strokeWidth={1.5} />
          <p className="mt-3 font-heading text-lg font-bold text-foreground">
            Todavía no hay ningún taller
          </p>
          <p className="mt-1 text-base text-muted-foreground">
            Crea el primero y aparecerán sus cuatro casas.
          </p>
        </div>
      )}

      <ul className="mt-6 space-y-3">
        {Courses.courses.map((course) => (
          <li key={course.id}>
            {/*
              La tarjeta entera es el enlace: en un celular es el blanco más fácil de dar.
              Editar vive adentro, para no meter un botón dentro de un enlace.
            */}
            <Link
              to="/cursos/$courseId"
              params={{ courseId: course.id }}
              className="flex items-center gap-3 rounded-3xl border-2 border-border bg-card p-5 shadow-sticker transition-transform active:translate-y-0.5"
            >
              <div className="min-w-0 flex-1">
                <h2 className="font-heading text-xl font-bold break-words text-foreground">
                  {course.name}
                </h2>
                <p className="mt-1 text-sm font-bold text-muted-foreground uppercase">
                  {courseStatusLabels[course.status]}
                </p>

                <dl className="mt-4 space-y-2 text-base text-muted-foreground">
                  <div className="flex gap-2">
                    <CalendarDays className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <dd>
                      {formatShortDate(course.startsOn)} — {formatShortDate(course.endsOn)}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <Users className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <dd>
                      <span className="font-bold text-foreground">{course.enrollmentCount}</span> de{" "}
                      {course.capacity} inscritos · S/ {course.priceSoles.toFixed(2)}
                    </dd>
                  </div>
                </dl>
              </div>

              <ChevronRight className="size-6 shrink-0 text-muted-foreground" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>

      <CourseFormModal
        open={isCreating}
        onClose={() => setIsCreating(false)}
        onSubmit={async (payload) => {
          const created = await Courses.create(payload);
          if (created) {
            setIsCreating(false);
          }
        }}
      />
    </div>
  );
}
