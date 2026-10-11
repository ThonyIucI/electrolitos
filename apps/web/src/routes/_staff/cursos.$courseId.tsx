import type { IEnrollmentResource } from "@electrolitos/shared/resources";
import { Button } from "@electrolitos/ui/components/button";
import { Skeleton } from "@electrolitos/ui/components/skeleton";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Pencil, UserPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { courseStatusLabels } from "@electrolitos/shared/courses";

import { formatShortDate } from "@/common/utils/format-date";
import CourseFormDialog from "@/modules/enrollments/components/course-form-dialog";
import EnrollmentCard from "@/modules/enrollments/components/enrollment-card";
import MoveStudentDialog from "@/modules/enrollments/components/move-student-dialog";
import StudentForm from "@/modules/enrollments/components/student-form";
import StudentFormDialog from "@/modules/enrollments/components/student-form-dialog";
import { useCourses } from "@/modules/enrollments/hooks/use-courses";
import { useEnrollments } from "@/modules/enrollments/hooks/use-enrollments";

export const Route = createFileRoute("/_staff/cursos/$courseId")({
  component: CourseDetailPage,
});

function CourseDetailPage() {
  const { courseId } = Route.useParams();
  const Courses = useCourses();
  const Enrollments = useEnrollments();
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [editing, setEditing] = useState<IEnrollmentResource | undefined>();
  const [moving, setMoving] = useState<IEnrollmentResource | undefined>();

  /*
    Se piden todas las cohortes y no solo esta: el diálogo de «mover a otro taller»
    necesita la lista de destinos, y con dos o tres sedes traerlas cuesta lo mismo.
  */
  useEffect(() => {
    const controller = new AbortController();
    Courses.handler(controller.signal);
    Enrollments.handler(courseId, controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const course = Courses.courses.find((item) => item.id === courseId);
  const isLoadingCourse = Courses.loading && !course;

  if (isLoadingCourse) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-6">
        <Skeleton className="h-40 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-12 text-center">
        <p className="font-heading text-lg font-bold text-foreground">
          No encontramos ese taller
        </p>
        <p className="mt-1 text-base text-muted-foreground">
          Puede que lo hayas borrado o que el enlace esté mal.
        </p>
        <Link to="/cursos" className="mt-4 inline-block">
          <Button variant="outline">Ver todos los talleres</Button>
        </Link>
      </div>
    );
  }

  /* El conteo sale de la lista cargada, no del taller: así sube al inscribir sin recargar. */
  const enrolled = Enrollments.enrollments.length;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <Link
        to="/cursos"
        className="mb-4 inline-flex min-h-11 items-center gap-1.5 font-heading text-base font-bold text-muted-foreground"
      >
        <ArrowLeft className="size-5" />
        Talleres
      </Link>

      <header className="rounded-3xl border-2 border-border bg-card p-5 shadow-sticker">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-heading text-2xl font-extrabold break-words text-foreground">
              {course.name}
            </h1>
            <p className="mt-1 text-sm font-bold text-muted-foreground uppercase">
              {courseStatusLabels[course.status]}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => setIsEditingCourse(true)}
          >
            <Pencil />
            Editar
          </Button>
        </div>

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
              <span className="font-bold text-foreground">{enrolled}</span> de {course.capacity}{" "}
              inscritos · S/ {course.priceSoles.toFixed(2)}
            </dd>
          </div>
        </dl>
      </header>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-heading text-xl font-extrabold text-foreground">Alumnos</h2>
          <Button onClick={enrolling.on}>
            <UserPlus />
            Inscribir
          </Button>
        </div>

        {Enrollments.loading && enrolled === 0 && (
          <div className="mt-4 space-y-3">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
        )}

        {!Enrollments.loading && enrolled === 0 && (
          <div className="mt-4 flex flex-col items-center rounded-3xl border-2 border-dashed border-border px-6 py-12 text-center">
            <Users className="size-10 text-muted-foreground" strokeWidth={1.5} />
            <p className="mt-3 font-heading text-lg font-bold text-foreground">
              Todavía no hay nadie inscrito
            </p>
            <p className="mt-1 text-base text-muted-foreground">
              Registra al primero con el formulario de arriba.
            </p>
          </div>
        )}

        {enrolled > 0 && (
          <ul className="mt-4 space-y-3">
            {Enrollments.enrollments.map((enrollment) => (
              <EnrollmentCard
                key={enrollment.id}
                enrollment={enrollment}
                houses={course.houses}
                onAssignHouse={Enrollments.assignHouse}
                onEdit={setEditing}
                onMove={setMoving}
                onRegenerateCode={Enrollments.regenerateCode}
              />
            ))}
          </ul>
        )}
      </section>

      <CourseFormDialog
        open={isEditingCourse}
        course={course}
        onClose={() => setIsEditingCourse(false)}
        onSubmit={async (payload) => {
          const updated = await Courses.update(course.id, payload);
          if (updated) {
            setIsEditingCourse(false);
          }
        }}
      />

      <StudentFormDialog
        open={Boolean(editing)}
        student={editing?.student}
        onClose={() => setEditing(undefined)}
        onSubmit={async (payload) => {
          if (!editing) {
            return;
          }
          const updated = await Enrollments.updateStudent(editing.id, payload);
          if (updated) {
            setEditing(undefined);
          }
        }}
      />

      <MoveStudentDialog
        enrollment={moving}
        courses={Courses.courses}
        onClose={() => setMoving(undefined)}
        onMove={async (enrollmentId, targetCourseId) => {
          const moved = await Enrollments.moveToCourse(enrollmentId, targetCourseId);
          if (moved) {
            setMoving(undefined);
            /* Los conteos de las dos cohortes cambiaron. */
            Courses.handler();
          }
        }}
      />
    </div>
  );
}
