import { createDb } from "@electrolitos/db";
import { user } from "@electrolitos/db/schema/auth";
import { env } from "@electrolitos/env/server";
import { EUserRole } from "@electrolitos/shared/roles";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { z } from "zod";

import type { TAppEnv } from "../lib/app-env";
import { forbidden } from "../lib/errors";
import { ok } from "../lib/response";

export const INTERNAL_ROUTES = {
  SEED_ADMIN: "/internal/seed-admin",
} as const;

const SEED_TOKEN_HEADER = "x-seed-token";
const MIN_PASSWORD_LENGTH = 8;

const seedAdminSchema = z.object({
  email: z.email("Correo inválido."),
  password: z.string().min(MIN_PASSWORD_LENGTH, "La contraseña debe tener al menos 8 caracteres."),
  name: z.string().min(2, "Nombre demasiado corto."),
});

/**
 * Crea el primer ADMIN. Protegido por el secret `SEED_TOKEN`. Idempotente: si ya existe
 * un usuario con ese correo, solo asegura que tenga rol ADMIN.
 *
 * Uso local:  curl -X POST localhost:3000/api/v1/internal/seed-admin \
 *               -H "x-seed-token: $SEED_TOKEN" -H "content-type: application/json" \
 *               -d '{"email":"...","password":"...","name":"Thony"}'
 */
const requireSeedToken = createMiddleware(async (context, next) => {
  const providedToken = context.req.header(SEED_TOKEN_HEADER);
  if (!env.SEED_TOKEN || providedToken !== env.SEED_TOKEN) {
    throw forbidden();
  }
  await next();
});

export const internalRoutes = new Hono<TAppEnv>().post(
  INTERNAL_ROUTES.SEED_ADMIN,
  requireSeedToken,
  zValidator("json", seedAdminSchema),
  async (context) => {
    const { email, password, name } = context.req.valid("json");
    const db = createDb();
    const auth = context.var.auth;

    const existing = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).get();

    const userId = existing
      ? existing.id
      : (await auth.api.signUpEmail({ body: { email, password, name } })).user.id;

    await db.update(user).set({ role: EUserRole.ADMIN }).where(eq(user.id, userId));

    return ok(context, { id: userId, email, role: EUserRole.ADMIN, created: !existing }, 201);
  },
);
