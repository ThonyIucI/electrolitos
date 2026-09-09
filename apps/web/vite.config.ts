import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const WEB_PORT = 3000;
const LOCAL_API_URL = "http://localhost:3001";
const LOCAL_WEB_ORIGIN = `http://localhost:${WEB_PORT}`;

export default defineConfig({
  server: {
    port: WEB_PORT,
    host: true, // escucha en 0.0.0.0 → accesible desde el celular por la IP de la red
    proxy: {
      // En dev el front habla con la API por el MISMO origen (/api → wrangler dev).
      // Así no hay CORS ni cookies cross-site y funciona igual desde el celular.
      "/api": {
        target: LOCAL_API_URL,
        changeOrigin: true,
        // better-auth valida el header Origin contra trustedOrigins; lo normalizamos
        // para que una visita desde http://192.168.x.x:3001 se vea como localhost.
        headers: { origin: LOCAL_WEB_ORIGIN },
      },
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Electrolitos",
        short_name: "Electrolitos",
        description: "Academia Amautas: misiones, XP y medallas del taller de electrónica",
        theme_color: "#141230",
        background_color: "#141230",
        display: "standalone",
        lang: "es",
      },
      pwaAssets: { disabled: false, config: true },
      devOptions: { enabled: true },
    }),
  ],
});
