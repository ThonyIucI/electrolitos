/// <reference types="@cloudflare/workers-types" />

// Bindings y variables del Worker. Deben coincidir con `apps/server/wrangler.jsonc`
// (vars + d1_databases) y con los secrets cargados vía `wrangler secret put`.
export interface CloudflareEnv {
  /** Base D1 (SQLite) — binding `DB` en wrangler.jsonc */
  DB: D1Database;
  /** Secret de firma de sesiones de better-auth (≥ 32 chars) */
  BETTER_AUTH_SECRET: string;
  /** URL pública de la API, p. ej. https://electrolitos-api.electrolitos.workers.dev */
  BETTER_AUTH_URL: string;
  /** Origen permitido para CORS y cookies, p. ej. https://electrolitos.pages.dev */
  CORS_ORIGIN: string;
  /** Token para el endpoint interno de seed del admin */
  SEED_TOKEN: string;
}

declare global {
  type Env = CloudflareEnv;
}

declare module "cloudflare:workers" {
  namespace Cloudflare {
    export interface Env extends CloudflareEnv {}
  }
}
