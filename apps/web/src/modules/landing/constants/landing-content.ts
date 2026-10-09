/** Textos de la portada. Fuente: `docs/informativo-v2.md`. */

import { formatSoles } from "../utils/format-soles";

export const WHATSAPP_NUMBER = "910130488";

const WHATSAPP_BASE = `https://wa.me/51${WHATSAPP_NUMBER}`;

/**
 * El chat se abre con el mensaje ya escrito: tener que redactarlo es donde más gente
 * abandona. Cada sede manda el suyo para saber de dónde viene la consulta.
 */
export const whatsappLink = (message: string): string =>
  `${WHATSAPP_BASE}?text=${encodeURIComponent(message)}`;

export const WHATSAPP_LINK = whatsappLink(
  "Hola, quiero información sobre el taller Electrolitos.",
);

/* Montos como número: el precio por sesión y por hora se calculan, no se escriben a mano. */
export const COURSE_PRICE_SOLES = 50;
export const RESERVATION_PRICE_SOLES = 10;
export const PAID_SESSIONS = 8;

export const COURSE_PRICE = formatSoles(COURSE_PRICE_SOLES);
export const RESERVATION_PRICE = formatSoles(RESERVATION_PRICE_SOLES);

export const HERO = {
  title: "El mismo multímetro que usa un ingeniero. La misma placa. A los 10 años.",
  subtitle:
    "Taller de electrónica, Arduino y robótica en Samán y Ventarrones. Sin experiencia previa: los materiales los ponemos nosotros.",
} as const;

export const HERO_HIGHLIGHTS = [
  "Arduino",
  "Programación",
  "Armado de circuitos",
  "Creatividad y pensamiento lógico",
  "Sensores",
  "Robótica",
  "Trabajo en equipo",
] as const;

/**
 * El arranque de cada sesión es lo único del taller que un chico repite en la mesa,
 * así que va en la portada y no enterrado en la pestaña de metodología.
 */
export const MISSION_TEASER = {
  label: "Así empieza cada clase",
  quote: "Agentes, su misión de hoy, si deciden aceptarla, es…",
  detail:
    "Se abre un sobre cerrado con el reto del día. A partir de ahí se arma, se programa, se prueba y se rompe hasta que funciona.",
} as const;

export interface IHeroSlide {
  src: string;
  alt: string;
}

/** Originales en `docs/images/carrousel`, reescalados a WebP para que carguen con mala señal. */
export const HERO_SLIDES: readonly IHeroSlide[] = [
  {
    src: "/carrusel/arduino.webp",
    alt: "Placa Arduino conectada a una protoboard, una pantalla LCD y módulos de relé",
  },
  {
    src: "/carrusel/programacion.webp",
    alt: "Manos escribiendo código en una laptop con datos saliendo de la pantalla",
  },
  {
    src: "/carrusel/creatividad.webp",
    alt: "Ilustración de un cerebro: el lado lógico con engranajes y el creativo con colores",
  },
];

export const INTRO_PARAGRAPHS = [
  "El presente taller brinda conocimientos teóricos y prácticos relacionados con ramas de la ingeniería tales como electrónica básica, programación, robótica, etc.",
  "Por medio de este curso los participantes podrán entender el funcionamiento de los componentes que conforman los circuitos electrónicos, aprender a usar instrumentos de medición de magnitudes de circuitos tales como voltaje, corriente, continuidad, etc. Así como nociones de programación de microcontroladores Arduino o ESP32 que les den vida a los circuitos.",
  "El curso se estructura de tal modo que cada integrante aprenda mientras va practicando, otorgándole materiales para que experimente realizar conexiones por su cuenta mientras realiza trabajos en equipo, siempre de una manera supervisada y segura. Todas las clases iniciarán con conceptos teóricos que se reforzarán con dinámicas de equipo, acertijos y retos por cumplir durante el resto de la sesión. Al final del curso el alumno será capaz de construir un circuito electrónico por su cuenta, explicar el funcionamiento y proponer aplicaciones de uso al mundo real.",
] as const;

export interface ILeadingCountry {
  country: string;
  fact: string;
}

/**
 * Datos verificables, con fuente en el README. Reemplazan al dato de PISA como apertura:
 * «esto hacen los primeros» moviliza; «el Perú está en el puesto 64» solo avergüenza.
 */
export const LEADING_COUNTRIES: readonly ILeadingCountry[] = [
  {
    country: "Estonia",
    fact: "Lleva programación a las aulas desde primer grado desde el año 2012.",
  },
  {
    country: "Finlandia",
    fact: "La incorporó a su currículo nacional en 2016, también desde primer grado.",
  },
  {
    country: "Japón",
    fact: "La hizo obligatoria en la primaria pública en 2020, a partir de 5.º grado: la misma edad con la que se empieza acá.",
  },
];

export const MOTIVATION_INTRO =
  "Construir y programar electrónica dejó de ser una actividad extra. En los países que lideran la educación mundial es parte del colegio, desde los primeros grados.";

export const MOTIVATION_POINTS = [
  "La diferencia entre un chico de acá y uno de esos países no es la capacidad. Es el acceso: en zonas rurales estos talleres son escasos o inexistentes, y a lo mucho hay deporte o arte, que también sirven, pero no alcanzan a cubrir todo lo que un chico puede querer aprender.",
  "Según los últimos resultados de la prueba PISA, el Perú se ubica en el puesto 64 de los 71 países evaluados. El problema de fondo es el mismo: mucha teoría y pocas oportunidades de construir algo con las manos.",
  "Despertar el interés por la tecnología y la ingeniería desde temprano, y de paso recuperar horas que hoy se van en juegos virtuales.",
] as const;

export const OBJECTIVES_TITLE = "Al terminar el curso, tu hijo o hija podrá:";

/**
 * Los mismos objetivos del documento, escritos para que los lea un apoderado y no un
 * comité académico: verbos concretos y resultados que se pueden ver en casa.
 */
export const COURSE_OBJECTIVES = [
  "Armar por su cuenta un circuito que funcione sobre una protoboard, eligiendo los componentes correctos y respetando las normas de seguridad.",
  "Explicarte con sus propias palabras qué son el voltaje, la corriente y la resistencia, y cómo se relacionan dentro de un circuito.",
  "Escribir y modificar su propio programa para que una placa Arduino haga exactamente lo que él quiere, usando variables, entradas, salidas y condicionales.",
  "Conectar sensores de luz, distancia, movimiento, temperatura, sonido o magnetismo, y lograr que el circuito reaccione a lo que pasa a su alrededor.",
  "Encontrar la falla: qué cable está mal puesto o qué línea del código no está haciendo lo que debería.",
  "Trabajar en equipo con recursos limitados, repartiendo tareas y negociando con otros equipos.",
  "Proponer, con lo que aprendió, una solución a un problema real de su comunidad.",
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

/**
 * El reclamo es sobre las herramientas y el método, nunca sobre el título: «trabaja con
 * lo que trabaja un ingeniero» es comprobable, «va a ser ingeniero» no.
 */
export const ENGINEER_NOTE = {
  title: "No es electrónica de juguete",
  body: "El multímetro, la protoboard y la placa Arduino que usa cada chico son las mismas herramientas con las que se prototipa en ingeniería: las mismas que uso en los laboratorios de circuitos y electrónica de la Universidad de Piura. Acá no se simula en una pantalla, se mide y se conecta de verdad — y de vez en cuando se quema un componente, como en cualquier laboratorio.",
} as const;

/**
 * Referencia de precio para que el monto tenga con qué compararse. Los datos salen de la
 * ficha pública de Fabricum; la nota aclara que no es el mismo taller, y es justamente esa
 * aclaración la que vuelve creíble la comparación.
 */
export const PRICE_REFERENCE = {
  org: "Fabricum — PUCP",
  courseName: "Taller en Electrónica Digital para Escolares",
  priceSoles: 630,
  hours: 12,
  ages: "12 a 14 años",
  place: "Lima, San Miguel",
  materials: "No especificado",
  disclaimer:
    "No es el mismo taller: el de la PUCP trabaja compuertas lógicas y simulación en computadora; el nuestro trabaja con Arduino, sensores y circuitos reales que el participante arma con las manos. Va acá como referencia de cuánto cuesta esta formación fuera.",
  source:
    "https://fabricum.pucp.edu.pe/capacitate/formacion-continua/taller-en-electronica-digital-para-escolares-12-14-anos/",
} as const;

/** Precios de tienda peruana, para que se vea que el material vale más que el curso. */
export const MATERIALS_REFERENCE = {
  items: [
    { label: "Kit de 37 sensores", priceSoles: 80 },
    { label: "Starter kit de Arduino", priceSoles: 70 },
    { label: "Starter kit completo", priceSoles: 200 },
  ],
  note: "Precios de referencia de Naylamp Mechatronics (Lima). Acá no compras nada de esto: lo pone la academia, y lo que se malogre durante el curso se repone sin costo.",
} as const;

export const WHAT_IS_INCLUDED = [
  "8 sesiones semanales de trabajo en taller.",
  "Placa Arduino, protoboard, cables y componentes para cada equipo.",
  "Multímetro y herramientas de medición.",
  "Sensores de luz, distancia, movimiento, temperatura, sonido y magnetismo.",
  "Reposición sin costo de todo lo que se queme o se malogre durante el curso.",
  "Acceso a la plataforma del taller durante todo el curso.",
  "Proyecto final «Edén» y presentación ante las familias.",
] as const;

/**
 * Un precio muy bajo sin explicación no se lee como oferta, se lee como sospecha. Esto
 * convierte «demasiado barato» en «esto es una causa», que es lo que se transmite de boca
 * en boca en un pueblo.
 */
export const WHY_AFFORDABLE = {
  title: "¿Por qué cuesta tan poco?",
  body: "Porque Electrolitos no es un negocio. El taller lo dicta un ingeniero de la zona que volvió a enseñar acá, y el monto cubre los componentes que se queman, se pierden y hay que reponer. Nada más. Si costara lo que cuesta en la ciudad, ningún chico de Samán o Ventarrones podría llevarlo — y de eso se trata exactamente.",
} as const;

export const INSTALLMENTS_NOTE = {
  title: "No tiene que pagarse de una vez:",
  body: "el curso puede abonarse en partes, según lo que se acuerde con el docente. Que el monto no sea el motivo por el que un chico se quede fuera.",
} as const;

export const RESERVATION_NOTE = `Los ${RESERVATION_PRICE} son parte de los ${COURSE_PRICE}, no un cobro aparte: separan el cupo y se descuentan del total.`;

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
