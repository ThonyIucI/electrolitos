import { createAuth, getTrustedOrigins } from "@electrolitos/auth";
import { API_PREFIX } from "@electrolitos/shared/api";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";

import type { TAppEnv } from "./lib/app-env";
import { AppError } from "./lib/errors";
import { fail } from "./lib/response";
import { courseRoutes } from "./routes/courses";
import { enrollmentRoutes } from "./routes/enrollments";
import { healthRoutes } from "./routes/health";
import { internalRoutes } from "./routes/internal";
import { meRoutes } from "./routes/me";

const AUTH_PATH = "/api/auth";
const PUBLIC_SIGN_UP_PATH = `${AUTH_PATH}/sign-up/*`;

const app = new Hono<TAppEnv>();

app.use(logger());

app.use(
  "/*",
  cors({
    origin: getTrustedOrigins(),
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Una instancia de better-auth por request (env solo existe en ejecución).
app.use("/*", async (context, next) => {
  context.set("auth", createAuth());
  await next();
});

// Nadie se registra solo: el staff se crea por seed/admin y los alumnos al inscribirlos.
app.all(PUBLIC_SIGN_UP_PATH, (context) => fail(context, "El registro público no está habilitado.", 403));

app.on(["POST", "GET"], `${AUTH_PATH}/*`, (context) => context.var.auth.handler(context.req.raw));

app.get("/", (context) => context.text("Electrolitos API"));

app
  .basePath(API_PREFIX)
  .route("/", healthRoutes)
  .route("/", meRoutes)
  .route("/", courseRoutes)
  .route("/", enrollmentRoutes)
  .route("/", internalRoutes);

app.notFound((context) => fail(context, "Recurso no encontrado.", 404));

app.onError((error, context) => {
  if (error instanceof AppError) {
    return fail(context, error.message, error.status);
  }
  if (error instanceof HTTPException) {
    return fail(context, error.message || "Solicitud inválida.", error.status);
  }
  console.error(error);
  return fail(context, "Ocurrió un error inesperado. Intenta de nuevo.", 500);
});

export default app;
