import type { IStudentResource } from "@electrolitos/shared/resources";

import { buildStudentLoginUrl } from "@/common/utils/login-link";

/**
 * Mensaje listo para pegar en WhatsApp. Los asteriscos alrededor del código son el
 * marcado de negrita de WhatsApp, no decoración: ahí es donde el chico tiene que mirar.
 *
 * Lleva el código **y** el enlace: el enlace es el camino normal (un toque y está dentro),
 * y el código queda visible por si abre la app por su cuenta o el enlace se rompe al
 * reenviarse. Se saluda con el apodo cuando lo hay.
 */
export const buildInviteMessage = (student: IStudentResource, accessCode: string): string => {
  const name = student.nickname?.trim() || student.firstName;

  return [
    `¡Hola ${name}! 👋`,
    "",
    `Tu código de ingreso a la plataforma es: *${accessCode}* 🔑`,
    "",
    `Entra directo desde aquí 👉 ${buildStudentLoginUrl(accessCode)}`,
    "",
    "Si tienes algún problema no dudes en contactar al profesor. 👨‍🏫",
  ].join("\n");
};
