import type { IEnrollmentResource } from "@electrolitos/shared/resources";
import { Button } from "@electrolitos/ui/components/button";
import { Skeleton } from "@electrolitos/ui/components/skeleton";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, UserPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { useBoolean } from "@/common/hooks/use-boolean";
import CourseFormModal from "@/modules/enrollments/components/course-form-modal";
import CourseSummary from "@/modules/enrollments/components/course-summary";
import EnrollmentCard from "@/modules/enrollments/components/enrollment-card";
import MoveStudentModal from "@/modules/enrollments/components/move-student-modal";
import StudentFormModal from "@/modules/enrollments/components/student-form-modal";
import { useCourses } from "@/modules/enrollments/hooks/use-courses";
import { useEnrollments } from "@/modules/enrollments/hooks/use-enrollments";

export const Route = createFileRoute("/_staff/cursos/$courseId")({
  component: CourseDetailPage,
});

function CourseDetailPage() {
  const { courseId } = Route.useParams();
  const Courses = useCourses();
  const Enrollments = useEnrollments();
  const editingCourse = useBoolean();
  const enrolling = useBoolean();
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

      <CourseSummary course={course} enrolled={enrolled} onEdit={editingCourse.on} />

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-heading text-xl font-extrabold text-foreground">Alumnos</h2>
          {/* En celular solo el ícono; el texto aparece cuando sobra espacio. */}
          <Button
            aria-label="Inscribir alumno"
            className="max-sm:size-11 max-sm:px-0"
            onClick={enrolling.on}
          >
            <UserPlus />
            <span className="max-sm:sr-only">Inscribir</span>
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
              Registra al primero con el botón «Inscribir».
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

      <CourseFormModal
        open={editingCourse.active}
        course={course}
        onClose={editingCourse.off}
        onSubmit={async (payload) => {
          const updated = await Courses.update(course.id, payload);
          if (updated) {
            editingCourse.off();
          }
        }}
      />

      {/* Alta: la modal se queda abierta y se limpia, para encadenar a los 18 de corrido. */}
      <StudentFormModal
        open={enrolling.active}
        houses={course.houses}
        onClose={enrolling.off}
        onSubmit={(student, houseId) => Enrollments.enroll(course.id, student, houseId)}
      />

      <StudentFormModal
        /* La `key` reinicia los campos al abrir la ficha de otro chico. */
        key={editing?.id ?? "sin-alumno"}
        open={Boolean(editing)}
        student={editing?.student}
        onClose={() => setEditing(undefined)}
        onSubmit={async (payload) => {
          if (!editing) {
            return null;
          }
          return Enrollments.updateStudent(editing.id, payload);
        }}
      />

      <MoveStudentModal
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
