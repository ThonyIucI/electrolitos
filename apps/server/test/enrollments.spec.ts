import type {
  ICourseDetailResource,
  IEnrollmentResource,
} from "@electrolitos/shared/resources";
import { isValidAccessCode } from "@electrolitos/shared/access-code";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { postJson, request, resetDomainTables, signInAsAdmin } from "./helpers";

/** Una sola sesión de staff para todo el archivo: el login tiene rate limit de 10/min. */
let cookie = "";

beforeAll(async () => {
  ({ cookie } = await signInAsAdmin());
});

beforeEach(resetDomainTables);

const JSON_HEADERS = { "content-type": "application/json" };

const NEW_COURSE = {
  name: "Taller de electrónica — Cohorte 1",
  startsOn: "2026-09-12",
  endsOn: "2026-11-12",
  capacity: 18,
  priceSoles: 50,
};

interface IEnvelope<TData> {
  success: boolean;
  data: TData;
  error: string | null;
}

const createCourse = async (cookie: string) => {
  const response = await postJson("/api/v1/courses", NEW_COURSE, { cookie });
  const body = await response.json<IEnvelope<ICourseDetailResource>>();
  return { response, course: body.data };
};

const enrollStudent = (
  cookie: string,
  courseId: string,
  student: Record<string, unknown>,
  houseId: string | null = null,
) => postJson(`/api/v1/courses/${courseId}/enrollments`, { student, houseId }, { cookie });

describe("cursos", () => {
  it("exige sesión de staff", async () => {
    const response = await request("/api/v1/courses/active");

    expect(response.status).toBe(401);
  });

  it("devuelve null cuando todavía no hay taller", async () => {

    const response = await request("/api/v1/courses/active", { headers: { cookie } });
    const body = await response.json<IEnvelope<ICourseDetailResource | null>>();

    expect(response.status).toBe(200);
    expect(body.data).toBeNull();
  });

  it("crea el taller con las cuatro casas de la chakana", async () => {

    const { response, course } = await createCourse(cookie);

    expect(response.status).toBe(201);
    expect(course.houses).toHaveLength(4);
    expect(course.houses.map((house) => house.colorKey)).toEqual([
      "RED",
      "BLUE",
      "GREEN",
      "YELLOW",
    ]);
    expect(course.priceSoles).toBe(50);
    expect(course.enrollmentCount).toBe(0);
  });

  it("no deja crear un segundo taller mientras haya uno en curso", async () => {
    await createCourse(cookie);

    const response = await postJson("/api/v1/courses", NEW_COURSE, { cookie });
    const body = await response.json<IEnvelope<null>>();

    expect(response.status).toBe(409);
    expect(body.error).toBe("Ya hay un taller en curso.");
  });
});

describe("inscripciones", () => {
  it("inscribe con solo nombre y apellido, y genera un código de acceso válido", async () => {
    const { course } = await createCourse(cookie);

    const response = await enrollStudent(cookie, course.id, {
      firstName: "Luz",
      lastName: "Quispe",
    });
    const body = await response.json<IEnvelope<IEnrollmentResource>>();

    expect(response.status).toBe(201);
    expect(body.data.student.firstName).toBe("Luz");
    expect(body.data.student.guardianPhone).toBeNull();
    expect(body.data.house).toBeNull();
    expect(isValidAccessCode(body.data.accessCode)).toBe(true);
  });

  it("guarda la casa y los datos del apoderado cuando vienen", async () => {
    const { course } = await createCourse(cookie);
    const house = course.houses[0]!;

    const response = await enrollStudent(
      cookie,
      course.id,
      {
        firstName: "Mateo",
        lastName: "Ríos",
        guardianName: "Rosa Ríos",
        guardianPhone: "987654321",
        birthDate: "2014-03-02",
      },
      house.id,
    );
    const body = await response.json<IEnvelope<IEnrollmentResource>>();

    expect(body.data.house?.name).toBe(house.name);
    expect(body.data.student.guardianPhone).toBe("987654321");
    expect(body.data.student.birthDate).toBe("2014-03-02");
  });

  it("rechaza un nombre vacío con mensaje en español", async () => {
    const { course } = await createCourse(cookie);

    const response = await enrollStudent(cookie, course.id, { firstName: "L", lastName: "Quispe" });

    expect(response.status).toBe(400);
  });

  it("rechaza un teléfono que no son dígitos", async () => {
    const { course } = await createCourse(cookie);

    const response = await enrollStudent(cookie, course.id, {
      firstName: "Luz",
      lastName: "Quispe",
      guardianPhone: "no-es-un-telefono",
    });

    expect(response.status).toBe(400);
  });

  it("no acepta una casa de otro taller", async () => {
    const { course } = await createCourse(cookie);

    const response = await enrollStudent(
      cookie,
      course.id,
      { firstName: "Luz", lastName: "Quispe" },
      "casa-inventada",
    );
    const body = await response.json<IEnvelope<null>>();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Esa casa no pertenece al taller.");
  });

  it("lista a los inscritos ordenados por apellido", async () => {
    const { course } = await createCourse(cookie);

    await enrollStudent(cookie, course.id, { firstName: "Ana", lastName: "Zeta" });
    await enrollStudent(cookie, course.id, { firstName: "Beto", lastName: "Alva" });

    const response = await request(`/api/v1/courses/${course.id}/enrollments`, {
      headers: { cookie },
    });
    const body = await response.json<IEnvelope<IEnrollmentResource[]>>();

    expect(body.data.map((item) => item.student.lastName)).toEqual(["Alva", "Zeta"]);
  });

  it("genera códigos distintos para cada alumno", async () => {
    const { course } = await createCourse(cookie);

    await enrollStudent(cookie, course.id, { firstName: "Ana", lastName: "Uno" });
    await enrollStudent(cookie, course.id, { firstName: "Beto", lastName: "Dos" });

    const response = await request(`/api/v1/courses/${course.id}/enrollments`, {
      headers: { cookie },
    });
    const body = await response.json<IEnvelope<IEnrollmentResource[]>>();
    const codes = new Set(body.data.map((item) => item.accessCode));

    expect(codes.size).toBe(2);
  });

  it("cambia la casa de una inscripción", async () => {
    const { course } = await createCourse(cookie);
    const house = course.houses[2]!;

    const created = await enrollStudent(cookie, course.id, {
      firstName: "Luz",
      lastName: "Quispe",
    });
    const { data: enrollment } = await created.json<IEnvelope<IEnrollmentResource>>();

    const response = await request(`/api/v1/enrollments/${enrollment.id}`, {
      method: "PATCH",
      headers: { ...JSON_HEADERS, cookie },
      body: JSON.stringify({ houseId: house.id }),
    });
    const body = await response.json<IEnvelope<IEnrollmentResource>>();

    expect(response.status).toBe(200);
    expect(body.data.house?.id).toBe(house.id);
  });
});
