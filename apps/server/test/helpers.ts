import { env } from "cloudflare:workers";

import app from "../src/index";

const BASE_URL = "http://localhost:3001";
const JSON_HEADERS = { "content-type": "application/json" };

/** Ejecuta una request contra la app Hono dentro del runtime de Workers. */
export const request = (path: string, init?: RequestInit) =>
  app.request(new Request(`${BASE_URL}${path}`, init), undefined, env as never);

export const postJson = (path: string, body: unknown, headers: Record<string, string> = {}) =>
  request(path, {
    method: "POST",
    headers: { ...JSON_HEADERS, ...headers },
    body: JSON.stringify(body),
  });

/**
 * Las migraciones se aplican una vez por archivo, así que la D1 se comparte entre tests.
 * Esto borra los datos del taller antes de cada uno, en orden de claves foráneas.
 *
 * No toca las tablas de better-auth a propósito: el login tiene rate limit de 10/min, así
 * que la sesión de staff se crea una sola vez por archivo y debe sobrevivir a la limpieza.
 */
export const resetDomainTables = () =>
  env.DB.batch(
    ["attendances", "enrollments", "students", "houses", "sessions", "courses"].map((table) =>
      env.DB.prepare(`DELETE FROM ${table}`),
    ),
  );

export const seedAdmin = (credentials: { email: string; password: string; name: string }) =>
  postJson("/api/v1/internal/seed-admin", credentials, { "x-seed-token": env.SEED_TOKEN });

/** Crea el admin vía el endpoint interno y devuelve la cookie de sesión tras iniciar sesión. */
export const signInAsAdmin = async () => {
  const credentials = { email: "admin@test.local", password: "password123", name: "Admin Test" };

  await seedAdmin(credentials);

  const response = await postJson("/api/auth/sign-in/email", {
    email: credentials.email,
    password: credentials.password,
  });

  const cookie = response.headers.get("set-cookie") ?? "";
  return { cookie, credentials };
};
