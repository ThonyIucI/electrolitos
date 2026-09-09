import { Hono } from "hono";

import type { TAppEnv } from "../lib/app-env";
import { ok } from "../lib/response";
import { requireAuth } from "../middleware/require-role";

export const ME_ROUTES = {
  ME: "/me",
} as const;

/**
 * Identidad del usuario autenticado. En Etapa 3 devolverá el pasaporte completo
 * cuando el rol sea STUDENT.
 */
export const meRoutes = new Hono<TAppEnv>().get(ME_ROUTES.ME, requireAuth, (context) => {
  const user = context.var.user;

  return ok(context, {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.role === "STUDENT" ? null : user.email,
    username: user.displayUsername ?? null,
  });
});
