import { createDb } from "@electrolitos/db";
import * as schema from "@electrolitos/db/schema/auth";
import { env } from "@electrolitos/env/server";
import { ACCESS_CODE_LENGTH } from "@electrolitos/shared/access-code";
import { EUserRole } from "@electrolitos/shared/roles";
import { STUDENT_PIN_LENGTH } from "@electrolitos/shared/student-pin";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";

const DAY_IN_SECONDS = 60 * 60 * 24;

/**
 * La sesión caduca a los 7 días **sin usarla**, no a los 7 días a secas: `updateAge` la
 * renueva como mucho una vez al día mientras el chico entre. O sea que entra directo
 * siempre, y solo se le vuelve a pedir el PIN si pasó una semana entera sin aparecer
 * — o si cerró sesión a propósito.
 */
const SESSION_DAYS = 7;
/**
 * El cupo se cuenta por IP, y un salón entero sale por la misma: con 18 chicos entrando
 * a la vez, y dos intentos cada uno (primero el código, después el PIN), un tope de 10
 * dejaría fuera a medio taller. Con 60/min y 32^6 combinaciones posibles, adivinar un
 * código al azar seguiría tomando miles de años.
 */
const LOGIN_MAX_ATTEMPTS_PER_MINUTE = 60;

/** `CORS_ORIGIN` admite varios orígenes separados por coma. */
export const getTrustedOrigins = (): string[] =>
  env.CORS_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

/**
 * En producción el front (pages.dev) y la API (workers.dev) son sitios distintos → la cookie
 * debe ser SameSite=None + Secure. En dev (http://) el navegador rechaza `Secure`, y como Vite
 * hace proxy al mismo origen basta con Lax. Se decide por el esquema de BETTER_AUTH_URL.
 */
const isSecureDeployment = (): boolean => env.BETTER_AUTH_URL.startsWith("https://");

/**
 * Instancia de better-auth. Se crea por request porque `env` (D1, secrets) solo existe
 * dentro del Worker en ejecución.
 *
 * - Staff (ADMIN/TEACHER): email + password.
 * - Alumno (STUDENT): plugin `username`; username y password = su código de acceso.
 */
export function createAuth() {
  const db = createDb();
  const secure = isSecureDeployment();

  return betterAuth({
    database: drizzleAdapter(db, { provider: "sqlite", schema }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: getTrustedOrigins(),

    /**
     * El mínimo baja a 4 porque la contraseña del alumno es su PIN. Es un mínimo global
     * de better-auth, no una política: el staff sigue obligado a 8 caracteres por los
     * esquemas zod de `internal.ts` y del formulario de ingreso.
     */
    emailAndPassword: { enabled: true, minPasswordLength: STUDENT_PIN_LENGTH },

    user: {
      additionalFields: {
        role: {
          type: "string",
          required: false,
          defaultValue: EUserRole.STUDENT,
          input: false, // el cliente nunca puede enviar/alterar su rol
        },
      },
    },

    session: {
      expiresIn: SESSION_DAYS * DAY_IN_SECONDS,
      updateAge: DAY_IN_SECONDS,
    },

    /*
      El contador vive en un `Map` de módulo, así que sobrevive a que `createAuth()` se
      llame por request — pero es por isolate, no global: en Workers el límite efectivo es
      10/min por cada isolate vivo. Frena el tanteo de códigos, no un ataque repartido.
      Para eso haría falta una regla WAF en Cloudflare.
    */
    rateLimit: {
      enabled: env.DISABLE_RATE_LIMIT !== "true",
      customRules: {
        "/sign-in/username": { window: 60, max: LOGIN_MAX_ATTEMPTS_PER_MINUTE },
        "/sign-in/email": { window: 60, max: LOGIN_MAX_ATTEMPTS_PER_MINUTE },
      },
    },

    plugins: [
      username({
        minUsernameLength: ACCESS_CODE_LENGTH,
        maxUsernameLength: ACCESS_CODE_LENGTH,
      }),
    ],

    advanced: {
      useSecureCookies: secure,
      defaultCookieAttributes: {
        sameSite: secure ? "none" : "lax",
        secure,
        httpOnly: true,
      },
    },
  });
}

export type TAuth = ReturnType<typeof createAuth>;
export type TSession = TAuth["$Infer"]["Session"];
export type TSessionUser = TSession["user"];
