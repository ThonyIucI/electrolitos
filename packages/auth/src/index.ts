import { createDb } from "@electrolitos/db";
import * as schema from "@electrolitos/db/schema/auth";
import { env } from "@electrolitos/env/server";
import { ACCESS_CODE_LENGTH } from "@electrolitos/shared/access-code";
import { EUserRole } from "@electrolitos/shared/roles";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";

const DAY_IN_SECONDS = 60 * 60 * 24;
const SESSION_DAYS = 30;
const LOGIN_MAX_ATTEMPTS_PER_MINUTE = 10;

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

    emailAndPassword: { enabled: true },

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

    rateLimit: {
      enabled: true,
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
