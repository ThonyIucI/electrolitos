import { Skeleton } from "@electrolitos/ui/components/skeleton";
import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { useEffect } from "react";

import CreateCourseCard from "@/modules/enrollments/components/create-course-card";
import EnrollmentCard from "@/modules/enrollments/components/enrollment-card";
import EnrollmentForm from "@/modules/enrollments/components/enrollment-form";
import { useActiveCourse } from "@/modules/enrollments/hooks/use-active-course";
import { useEnrollments } from "@/modules/enrollments/hooks/use-enrollments";

export const Route = createFileRoute("/_staff/alumnos")({
  component: StudentsPage,
});

function StudentsPage() {
  const ActiveCourse = useActiveCourse();
  const Enrollments = useEnrollments();
  const course = ActiveCourse.course;
  const courseId = course?.id;

  useEffect(() => {
    const controller = new AbortController();
    ActiveCourse.handler(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!courseId) {
      return;
    }
    const controller = new AbortController();
    Enrollments.handler(courseId, controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const isLoadingCourse = ActiveCourse.loading && !course;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 pb-24">
      <header className="mb-6">
        <h1 className="font-heading text-3xl font-extrabold text-foreground">Alumnos</h1>
        {course && (
          <p className="mt-1 text-base text-muted-foreground">
            {course.name} ·{" "}
            <span className="font-bold text-foreground">
              {Enrollments.enrollments.length} de {course.capacity}
            </span>{" "}
            inscritos
          </p>
        )}
      </header>

      {isLoadingCourse && <Skeleton className="h-64 w-full rounded-3xl" />}

      {!isLoadingCourse && !course && <CreateCourseCard onCreate={ActiveCourse.create} />}

      {course && (
        <div className="space-y-6">
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
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
