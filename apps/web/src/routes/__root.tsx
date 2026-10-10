import { Toaster } from "@electrolitos/ui/components/sonner";
import { HeadContent, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";

import "../index.css";

export interface RouterAppContext {}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: "Electrolitos",
      },
      {
        name: "description",
        content:
          "Taller de electrónica digital, Arduino y programación para niñas, niños y jóvenes desde los 10 años. Sedes en Samán y Ventarrones. Las 2 primeras clases son gratis.",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        disableTransitionOnChange
        enableSystem
        storageKey="vite-ui-theme"
      >
        {/*
          `Header` renderiza también la barra inferior de móvil, que va `fixed` y por eso
          no cuenta como fila de la grilla. El `pb-20` del contenido es para que la última
          línea de cada página no quede debajo de esa barra.
        */}
        <div className="grid min-h-svh grid-rows-[auto_1fr]">
          <Header />
          <div className="min-w-0 pb-20 sm:pb-0">
            <Outlet />
          </div>
        </div>
        <Toaster richColors />
      </ThemeProvider>
      {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-left" />}
    </>
  );
}
