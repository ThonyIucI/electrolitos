import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-pool-workers";
import path from "node:path";
import { defineConfig } from "vitest/config";

const MIGRATIONS_DIR = path.join(__dirname, "../../packages/db/src/migrations");

/**
 * Los tests corren dentro de workerd (mismo runtime que producción) con una D1 en memoria.
 * `TEST_MIGRATIONS` se aplica en `test/setup.ts` antes de cada archivo de test.
 */
export default defineConfig(async () => {
  const migrations = await readD1Migrations(MIGRATIONS_DIR);

  return {
    plugins: [
      cloudflareTest({
        wrangler: { configPath: "./wrangler.jsonc" },
        miniflare: {
          bindings: {
            TEST_MIGRATIONS: migrations,
            BETTER_AUTH_SECRET: "test-secret-test-secret-test-secret-1234",
            BETTER_AUTH_URL: "http://localhost:3001",
            CORS_ORIGIN: "http://localhost:3000",
            SEED_TOKEN: "test-seed-token",
          },
        },
      }),
    ],
    test: {
      setupFiles: ["./test/setup.ts"],
    },
  };
});
