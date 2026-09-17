import { defineConfig, minimal2023Preset as preset } from "@vite-pwa/assets-generator/config";

export default defineConfig({
  headLinkOptions: {
    preset: "2023",
  },
  preset,
  // La chakana del taller: cuadrada y simétrica, se reconoce hasta a 16 px.
  images: ["public/logo-chakana.png"],
});
