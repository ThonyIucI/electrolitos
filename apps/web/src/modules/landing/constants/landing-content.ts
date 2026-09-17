/** Textos de la portada. Fuente: `docs/informativo-v2.md`. */

export const WHATSAPP_NUMBER = "910130488";
export const WHATSAPP_LINK = `https://wa.me/51${WHATSAPP_NUMBER}`;
export const COURSE_PRICE = "S/ 50.00";

export const HERO_HIGHLIGHTS = [
  "Arduino",
  "Programación",
  "Armado de circuitos",
  "Creatividad y pensamiento lógico",
] as const;

export const INTRO_PARAGRAPHS = [
  "El presente taller brinda conocimientos teóricos y prácticos relacionados con ramas de la ingeniería tales como electrónica básica, programación, robótica, etc.",
  "Por medio de este curso los participantes podrán entender el funcionamiento de los componentes que conforman los circuitos electrónicos, aprender a usar instrumentos de medición de magnitudes de circuitos tales como voltaje, corriente, continuidad, etc. Así como nociones de programación de microcontroladores Arduino o ESP32 que les den vida a los circuitos.",
  "El curso se estructura de tal modo que cada integrante aprenda mientras va practicando, otorgándole materiales para que experimente realizar conexiones por su cuenta mientras realiza trabajos en equipo, siempre de una manera supervisada y segura. Todas las clases iniciarán con conceptos teóricos que se reforzarán con dinámicas de equipo, acertijos y retos por cumplir durante el resto de la sesión. Al final del curso el alumno será capaz de construir un circuito electrónico por su cuenta, explicar el funcionamiento y proponer aplicaciones de uso al mundo real.",
] as const;

export const MOTIVATION_POINTS = [
  "Según los últimos resultados de la prueba PISA, el Perú se ubica en el puesto 64 de los 71 países evaluados a nivel mundial: nuestro sistema educativo carece de acceso a educación aplicada.",
  "Los talleres de este tipo son muy escasos o nulos en zonas rurales; a lo mucho solo hay talleres de deporte o arte, que son también útiles, pero debería haber mayor diversidad.",
  "Fomentar el interés por la tecnología y la ingeniería desde edades tempranas, para reducir el tiempo que se invierte en juegos virtuales.",
] as const;

export const COURSE_OBJECTIVES = [
  "Demostrar conocimientos en conceptos tales como el voltaje, la corriente, la resistencia, etc., y cómo se relacionan dentro de un circuito.",
  "Armar un circuito electrónico funcional por su cuenta sobre una protoboard, eligiendo los componentes adecuados y respetando las normas de seguridad.",
  "Escribir y modificar programas sencillos para microcontroladores Arduino/ESP, empleando variables, entradas, salidas y condicionales.",
  "Conectar e interpretar sensores (luz, distancia, movimiento, temperatura, sonido, magnetismo, entre otros) y usarlos para que un circuito reaccione al entorno.",
  "Diagnosticar fallas: encontrar el error en un circuito mal conectado o en un código que no hace lo esperado.",
  "Trabajar en equipo bajo un objetivo común, administrando recursos limitados y negociando con otros equipos.",
  "Proponer aplicaciones reales de lo aprendido para resolver problemas de su comunidad.",
] as const;

export const AUDIENCE_POINTS = [
  "Niñas, niños y adolescentes desde los 10 años, con o sin experiencia previa.",
  "Estudiantes curiosos a quienes les gusta desarmar cosas, preguntar cómo funcionan y construir.",
  "Familias que buscan una actividad extracurricular distinta al deporte o al arte, con contenido técnico real y acompañamiento cercano.",
  "No se requiere ningún conocimiento previo de electrónica ni de programación. Se empieza desde cero.",
] as const;

export const SAFETY_NOTE =
  "El taller trabaja con voltajes bajos y seguros (pilas y alimentación USB de 5 V), siempre bajo supervisión. No hay riesgo eléctrico para los participantes.";

export const PARTICIPANT_REQUIREMENTS = [
  "Edad mínima: 10 años.",
  "Saber leer y escribir con fluidez, y operaciones básicas de aritmética.",
  "Ganas de equivocarse, preguntar y volver a intentar.",
  "Opcional, no excluyente: un celular o laptop para programar desde la sesión. Quien no lo tenga trabajará en equipo con los equipos de la academia; nadie queda fuera.",
] as const;

export const MATERIALS_NOTE = "No se pide comprar materiales: los componentes los provee la academia.";

export interface ISessionMoment {
  name: string;
  duration: string;
  detail: string;
}

export const SESSION_FLOW: readonly ISessionMoment[] = [
  {
    name: "La carta de la misión",
    duration: "10 min",
    detail:
      "Se abre un sobre cerrado con el reto del día: «Agentes, su misión de hoy, si deciden aceptarla, es…»",
  },
  {
    name: "Concepto del día",
    duration: "20–30 min",
    detail: "La teoría mínima necesaria, con analogías y ejemplos cotidianos.",
  },
  {
    name: "Exploración de la herramienta",
    duration: "20 min",
    detail: "Reciben el componente sin que se les diga qué hace; ellos descubren su funcionamiento.",
  },
  {
    name: "Fase de hackeo y código",
    duration: "60 min",
    detail: "Modifican el circuito y el programa hasta resolver el problema planteado.",
  },
  {
    name: "La prueba de fuego",
    duration: "30 min",
    detail: "Cada equipo demuestra su invento ante los demás y gana puntos.",
  },
];

export interface IParticipantBenefit {
  title: string;
  detail: string;
}

export const PARTICIPANT_BENEFITS: readonly IParticipantBenefit[] = [
  {
    title: "Materiales incluidos",
    detail:
      "Placas Arduino, protoboards, sensores, componentes y herramientas de medición son provistos por la academia. El participante no compra nada.",
  },
  {
    title: "Acceso a la plataforma del taller",
    detail:
      "Solo para inscritos oficialmente: una aplicación web que repotencia el aprendizaje y facilita el seguimiento del participante.",
  },
  {
    title: "Grupo reducido",
    detail: "Atención personalizada para cada participante.",
  },
  {
    title: "Presentación final",
    detail: "El proyecto integrador se expone ante las familias al cerrar el taller.",
  },
];

export const TEACHER = {
  name: "Anthony Urbina Calderón",
  role: "Docente del taller · Fundador de Electrolitos",
  photo: "/docente-anthony.jpg",
  bio: "Ingeniero mecánico eléctrico por la Universidad de Piura, docente y encargado de laboratorios de circuitos eléctricos, electromagnetismo y electrónica. También se ha desempeñado como docente de ajedrez en el CP de Samán y director general de la Agrupación Folklórica Fervor Juvenil. Más de 3 años de experiencia como desarrollador de aplicaciones web. Fundador del taller Electrolitos, un proyecto independiente que busca acercar la educación aplicada en ingeniería a zonas donde este tipo de talleres no existe.",
} as const;

export const PAYMENT_STEPS = [
  "Enviar la ficha de inscripción al WhatsApp del profesor.",
  `Realizar el pago por Yape al ${WHATSAPP_NUMBER} (ANTHONY URBINA), o en efectivo el día de la clase.`,
  `Enviar la constancia de pago al ${WHATSAPP_NUMBER}, indicando el nombre completo del participante.`,
] as const;

export const ENROLLMENT_NOTES = [
  "Cierre de inscripciones: al finalizar la segunda sesión gratuita.",
  "Vacantes limitadas. Las inscripciones se atienden por orden de llegada.",
  "Si la cantidad de inscritos supera el límite, se evaluará una ampliación de turnos.",
] as const;

export const POSTPONEMENT_NOTE =
  "La academia se reserva el derecho de postergar el inicio del curso en caso no se complete el mínimo número de inscritos.";
