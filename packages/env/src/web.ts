import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

/** URL absoluta de la API en prod, o `/` en dev para usar el proxy de Vite (mismo origen). */
const serverUrlSchema = z.union([z.url(), z.string().regex(/^\/.*$/, "Debe ser una URL o una ruta que empiece con /")]);

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_SERVER_URL: serverUrlSchema,
  },
  runtimeEnv: (import.meta as any).env,
  emptyStringAsUndefined: true,
});
