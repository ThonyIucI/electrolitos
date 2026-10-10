import { isValidAccessCode } from "@electrolitos/shared/access-code";
import type {
  ICourseDetailResource,
  IEnrollmentResource,
  IStudentCardResource,
} from "@electrolitos/shared/resources";
import { env } from "cloudflare:workers";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { postJson, request, resetDomainTables, signInAsAdmin } from "./helpers";

/** Una sola sesión de staff para todo el archivo. El rate limit va apagado en pruebas. */
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

const getCard = async (sessionCookie: string) => {
  const response = await request("/api/v1/me/card", { headers: { cookie: sessionCookie } });
  const body = await response.json<IEnvelope<IStudentCardResource>>();

  return { response, card: body.data };
};

const getAccessStatus = async (codigo: string) => {
  const response = await request(`/api/v1/access/status?codigo=${encodeURIComponent(codigo)}`);
  const body = await response.json<IEnvelope<{ status: string }>>();

  return body.data.status;
};

/*
  Este endpoint es lo que decide si al chico se le pide el PIN o se le deja crear uno, y
  es público: lo importante es que `needs-pin` sea el cajón de sastre, para que de la
  respuesta no se pueda deducir qué códigos existen.
*/
describe("qué le toca a un código", () => {
  it("manda a crear el PIN cuando el alumno todavía no tiene uno", async () => {
    const enrollment = await enrollOneStudent();

    expect(await getAccessStatus(enrollment.accessCode)).toBe("needs-setup");
  });

  it("lo acepta en minúsculas y con guion, como llega pegado de WhatsApp", async () => {
    const enrollment = await enrollOneStudent();
    const sucio = `${enrollment.accessCode.slice(0, 3)}-${enrollment.accessCode.slice(3)}`;

    expect(await getAccessStatus(sucio.toLowerCase())).toBe("needs-setup");
  });

  it("pide el PIN una vez que el alumno lo creó", async () => {
    const enrollment = await enrollOneStudent();
    const { cookie: studentCookie } = await signInAsStudent(
      enrollment.accessCode,
      enrollment.accessCode,
    );
    await postJson("/api/v1/me/pin", { pin: "7391" }, { cookie: studentCookie });

    expect(await getAccessStatus(enrollment.accessCode)).toBe("needs-pin");
  });

  it("responde igual para un código que no existe o está mal escrito", async () => {
    expect(await getAccessStatus("ZZZZZZ")).toBe("needs-pin");
    expect(await getAccessStatus("no-es-un-codigo")).toBe("needs-pin");
  });

  /*
    Devolver `needs-pin` a una inscripción sin cuenta la dejaba pidiendo un PIN que no
    existe, sin salida. Hay dos formas de llegar a ese estado y las dos se completan en
    el primer intento de entrar.
  */
  it("le crea la cuenta a la inscripción vieja, que no tiene usuario ninguno", async () => {
    const enrollment = await enrollOneStudent();
    /* `students.user_id` es ON DELETE SET NULL, así que borrar el usuario lo desenlaza. */
    await env.DB.prepare("DELETE FROM user WHERE role = 'STUDENT'").run();

    expect(await getAccessStatus(enrollment.accessCode)).toBe("needs-setup");

    const { response } = await signInAsStudent(enrollment.accessCode, enrollment.accessCode);
    expect(response.status).toBe(200);
  });

  it("reutiliza la cuenta que quedó creada pero sin enlazar", async () => {
    const enrollment = await enrollOneStudent();
    await env.DB.prepare("UPDATE students SET user_id = NULL").run();

    expect(await getAccessStatus(enrollment.accessCode)).toBe("needs-setup");

    const { response } = await signInAsStudent(enrollment.accessCode, enrollment.accessCode);
    expect(response.status).toBe(200);
  });

  it("no vuelve a crear la cuenta si ya la tiene", async () => {
    const enrollment = await enrollOneStudent();

    expect(await getAccessStatus(enrollment.accessCode)).toBe("needs-setup");
    expect(await getAccessStatus(enrollment.accessCode)).toBe("needs-setup");

    const { response } = await signInAsStudent(enrollment.accessCode, enrollment.accessCode);
    expect(response.status).toBe(200);
  });
});

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

  /* Las dos comprobaciones van juntas para no abrir una sesión más de la necesaria. */
  it("no expone el código mientras siga siendo la contraseña, ni en /me ni en el carnet", async () => {
    const enrollment = await enrollOneStudent();
    const { cookie: studentCookie } = await signInAsStudent(
      enrollment.accessCode,
      enrollment.accessCode,
    );

    expect((await getMe(studentCookie)).username).toBeNull();

    const { response, card } = await getCard(studentCookie);
    expect(response.status).toBe(200);
    expect(card.accessCode).toBeNull();
    expect(card.fullName).toBe("Luz Quispe");
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
      { pin: "7391" },
      { cookie: studentCookie },
    );

    expect(setPin.status).toBe(200);
    expect((await getMe(studentCookie)).mustSetPin).toBe(false);

    /* Con la cuenta ya protegida por el PIN, el carnet sí puede mostrar el código. */
    const { card } = await getCard(studentCookie);
    expect(card.accessCode).toBe(enrollment.accessCode);
    expect(card.courseName).toBe(NEW_COURSE.name);

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
      { pin: "1234" },
      { cookie: studentCookie },
    );

    expect(response.status).toBe(400);
  });

  /*
    Crear el primer PIN no pide nada más, pero cambiarlo sí: es lo que impide que alguien
    agarre el celular desbloqueado y deje al chico fuera de su propia cuenta.
  */
  it("para cambiar un PIN ya creado exige el actual", async () => {
    const enrollment = await enrollOneStudent();
    const { cookie: studentCookie } = await signInAsStudent(
      enrollment.accessCode,
      enrollment.accessCode,
    );

    await postJson("/api/v1/me/pin", { pin: "7391" }, { cookie: studentCookie });

    const sinActual = await postJson("/api/v1/me/pin", { pin: "8264" }, { cookie: studentCookie });
    expect(sinActual.status).toBe(400);

    const conActualMalo = await postJson(
      "/api/v1/me/pin",
      { currentPin: "0000", pin: "8264" },
      { cookie: studentCookie },
    );
    const body = await conActualMalo.json<IEnvelope<null>>();
    expect(conActualMalo.status).toBe(401);
    expect(body.error).toBe("Tu PIN actual no es correcto.");

    const conActualBueno = await postJson(
      "/api/v1/me/pin",
      { currentPin: "7391", pin: "8264" },
      { cookie: studentCookie },
    );
    expect(conActualBueno.status).toBe(200);
  });

  it("el carnet es solo del alumno: el staff no entra por ahí", async () => {
    await enrollOneStudent();

    const response = await request("/api/v1/me/card", { headers: { cookie } });

    expect(response.status).toBe(403);
  });

  it("el staff no puede tocar el PIN de un alumno por esta vía", async () => {
    await enrollOneStudent();

    const response = await postJson("/api/v1/me/pin", { pin: "7391" }, { cookie });

    expect(response.status).toBe(403);
  });
});

describe("código nuevo", () => {
  it("mata el código viejo, borra el PIN y deja intacto al alumno", async () => {
    const enrollment = await enrollOneStudent();
    const { cookie: firstCookie } = await signInAsStudent(
      enrollment.accessCode,
      enrollment.accessCode,
    );
    await postJson("/api/v1/me/pin", { pin: "7391" }, { cookie: firstCookie });

    const response = await postJson(
      `/api/v1/enrollments/${enrollment.id}/regenerate-code`,
      {},
      { cookie },
    );
    const { data: updated } = await response.json<IEnvelope<IEnrollmentResource>>();

    expect(response.status).toBe(200);
    expect(updated.accessCode).not.toBe(enrollment.accessCode);
    expect(isValidAccessCode(updated.accessCode)).toBe(true);

    /* Lo que importa del cambio: solo son credenciales nuevas, no un alumno nuevo. */
    expect(updated.id).toBe(enrollment.id);
    expect(updated.student.id).toBe(enrollment.student.id);
    expect(updated.student.firstName).toBe(enrollment.student.firstName);

    const conCodigoViejo = await signInAsStudent(enrollment.accessCode, enrollment.accessCode);
    expect(conCodigoViejo.response.status).not.toBe(200);

    const conCodigoNuevo = await signInAsStudent(updated.accessCode, updated.accessCode);
    expect(conCodigoNuevo.response.status).toBe(200);
    expect((await getMe(conCodigoNuevo.cookie)).mustSetPin).toBe(true);
  });

  it("solo el staff puede generarlo", async () => {
    const enrollment = await enrollOneStudent();

    const response = await postJson(`/api/v1/enrollments/${enrollment.id}/regenerate-code`, {});

    expect(response.status).toBe(401);
  });
});
