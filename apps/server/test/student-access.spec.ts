import type { ICourseDetailResource, IEnrollmentResource } from "@electrolitos/shared/resources";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { postJson, request, resetDomainTables, signInAsAdmin } from "./helpers";

/** Una sola sesión de staff para todo el archivo: el login tiene rate limit de 10/min. */
let cookie = "";

beforeAll(async () => {
  ({ cookie } = await signInAsAdmin());
});

beforeEach(resetDomainTables);

interface IEnvelope<TData> {
  success: boolean;
  data: TData;
  error: string | null;
}

interface IMePayload {
  role: string;
  username: string | null;
  mustSetPin: boolean;
}

const NEW_COURSE = {
  name: "Taller de electrónica — Cohorte 1",
  startsOn: "2026-09-12",
  endsOn: "2026-11-12",
  capacity: 18,
  priceSoles: 50,
};

/** Crea el taller e inscribe a un alumno; devuelve la inscripción con su código. */
const enrollOneStudent = async (): Promise<IEnrollmentResource> => {
  const courseResponse = await postJson("/api/v1/courses", NEW_COURSE, { cookie });
  const { data: course } = await courseResponse.json<IEnvelope<ICourseDetailResource>>();

  const enrollResponse = await postJson(
    `/api/v1/courses/${course.id}/enrollments`,
    { student: { firstName: "Luz", lastName: "Quispe" }, houseId: null },
    { cookie },
  );
  const { data: enrollment } = await enrollResponse.json<IEnvelope<IEnrollmentResource>>();

  return enrollment;
};

const signInAsStudent = async (code: string, password: string) => {
  const response = await postJson("/api/auth/sign-in/username", {
    username: code.toLowerCase(),
    password,
  });

  return { response, cookie: response.headers.get("set-cookie") ?? "" };
};

const getMe = async (sessionCookie: string) => {
  const response = await request("/api/v1/me", { headers: { cookie: sessionCookie } });
  const body = await response.json<IEnvelope<IMePayload>>();

  return body.data;
};

describe("ingreso del alumno", () => {
  it("entra con el código de la tarjeta y queda obligado a elegir PIN", async () => {
    const enrollment = await enrollOneStudent();

    const { response, cookie: studentCookie } = await signInAsStudent(
      enrollment.accessCode,
      enrollment.accessCode,
    );

    expect(response.status).toBe(200);

    const me = await getMe(studentCookie);
    expect(me.role).toBe("STUDENT");
    expect(me.mustSetPin).toBe(true);
  });

  it("nunca devuelve el código de acceso en /me, porque es su contraseña inicial", async () => {
    const enrollment = await enrollOneStudent();
    const { cookie: studentCookie } = await signInAsStudent(
      enrollment.accessCode,
      enrollment.accessCode,
    );

    const me = await getMe(studentCookie);

    expect(me.username).toBeNull();
  });

  it("rechaza un código que no existe sin decir que no existe", async () => {
    const { response } = await signInAsStudent("ZZZZZZ", "ZZZZZZ");

    expect(response.status).not.toBe(200);
  });
});

describe("elección del PIN", () => {
  it("cambia la contraseña por el PIN y deja de aceptar el código", async () => {
    const enrollment = await enrollOneStudent();
    const { cookie: studentCookie } = await signInAsStudent(
      enrollment.accessCode,
      enrollment.accessCode,
    );

    const setPin = await postJson(
      "/api/v1/me/pin",
      { currentCredential: enrollment.accessCode, pin: "7391" },
      { cookie: studentCookie },
    );

    expect(setPin.status).toBe(200);
    expect((await getMe(studentCookie)).mustSetPin).toBe(false);

    const withOldCode = await signInAsStudent(enrollment.accessCode, enrollment.accessCode);
    expect(withOldCode.response.status).not.toBe(200);

    const withPin = await signInAsStudent(enrollment.accessCode, "7391");
    expect(withPin.response.status).toBe(200);
  });

  it("no acepta un PIN que se adivina al primer intento", async () => {
    const enrollment = await enrollOneStudent();
    const { cookie: studentCookie } = await signInAsStudent(
      enrollment.accessCode,
      enrollment.accessCode,
    );

    const response = await postJson(
      "/api/v1/me/pin",
      { currentCredential: enrollment.accessCode, pin: "1234" },
      { cookie: studentCookie },
    );

    expect(response.status).toBe(400);
  });

  it("exige la credencial actual para que una sesión ajena no deje al chico fuera", async () => {
    const enrollment = await enrollOneStudent();
    const { cookie: studentCookie } = await signInAsStudent(
      enrollment.accessCode,
      enrollment.accessCode,
    );

    const response = await postJson(
      "/api/v1/me/pin",
      { currentCredential: "XXXXXX", pin: "7391" },
      { cookie: studentCookie },
    );
    const body = await response.json<IEnvelope<null>>();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Tu código o PIN actual no es correcto.");
  });

  it("el staff no puede tocar el PIN de un alumno por esta vía", async () => {
    await enrollOneStudent();

    const response = await postJson(
      "/api/v1/me/pin",
      { currentCredential: "lo-que-sea", pin: "7391" },
      { cookie },
    );

    expect(response.status).toBe(403);
  });
});

describe("restablecer el PIN", () => {
  it("devuelve al alumno a entrar con su código y a elegir PIN de nuevo", async () => {
    const enrollment = await enrollOneStudent();
    const { cookie: firstCookie } = await signInAsStudent(
      enrollment.accessCode,
      enrollment.accessCode,
    );
    await postJson(
      "/api/v1/me/pin",
      { currentCredential: enrollment.accessCode, pin: "7391" },
      { cookie: firstCookie },
    );

    const reset = await postJson(`/api/v1/enrollments/${enrollment.id}/reset-pin`, {}, { cookie });
    expect(reset.status).toBe(200);

    const { response, cookie: studentCookie } = await signInAsStudent(
      enrollment.accessCode,
      enrollment.accessCode,
    );

    expect(response.status).toBe(200);
    expect((await getMe(studentCookie)).mustSetPin).toBe(true);
  });

  it("solo el staff puede restablecerlo", async () => {
    const enrollment = await enrollOneStudent();

    const response = await postJson(`/api/v1/enrollments/${enrollment.id}/reset-pin`, {});

    expect(response.status).toBe(401);
  });
});
