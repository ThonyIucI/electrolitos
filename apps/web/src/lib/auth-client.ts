import { env } from "@electrolitos/env/web";
import { usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const AUTH_PATH = "/api/auth";

/**
 * Origen de la API.
 * - Dev: `VITE_SERVER_URL=/` → mismo origen que el front (Vite hace proxy de /api a wrangler).
 *   Funciona en localhost y desde el celular por la IP de la red.
 * - Prod: `VITE_SERVER_URL=https://electrolitos-api.electrolitos.workers.dev`.
 */
export const getServerOrigin = (): string => {
  const configured = env.VITE_SERVER_URL.replace(/\/+$/, "");
  if (configured.startsWith("http")) {
    return configured;
  }
  return `${window.location.origin}${configured}`;
};

export const authClient = createAuthClient({
  // better-auth toma la base de rutas del path de esta URL: debe ser /api/auth como en el server
  baseURL: `${getServerOrigin()}${AUTH_PATH}`,
  plugins: [usernameClient()],
});
