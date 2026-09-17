import type { TLandingAccent } from "./landing-accents";

export interface ISyllabusTopic {
  title: string;
  theoryHours: number;
  practiceHours: number;
}

export interface ISyllabusUnit {
  key: string;
  label: string;
  title: string;
  span: string;
  accent: TLandingAccent;
  isFree: boolean;
  topics: readonly ISyllabusTopic[];
}

/** Temario tal cual `docs/informativo-v2.md`. Las horas se muestran por tema, no como tabla en móvil. */
export const SYLLABUS_UNITS: readonly ISyllabusUnit[] = [
  {
    key: "cortesia",
    label: "Sesiones de cortesía",
    title: "El Despertar",
    span: "gratuitas, sin compromiso",
    accent: "spark",
    isFree: true,
    topics: [
      {
        title:
          "Uso del multímetro: medir voltaje y continuidad. Prueba de fuego por equipos.",
        theoryHours: 1,
        practiceHours: 2,
      },
      {
        title:
          "¿Qué es la electricidad? Voltaje, corriente y resistencia explicados con analogías cotidianas.",
        theoryHours: 1,
        practiceHours: 0,
      },
      {
        title:
          "La protoboard por dentro. Reto: encender un LED usando solo una fuente de energía, una resistencia y cables.",
        theoryHours: 0,
        practiceHours: 2,
      },
    ],
  },
  {
    key: "unidad-1",
    label: "Unidad 1",
    title: "Primeros pasos con Arduino",
    span: "semanas 1–2",
    accent: "primary",
    isFree: false,
    topics: [
      {
        title:
          "Anatomía de la placa Arduino. Conexión al celular o computadora y carga del primer programa.",
        theoryHours: 1,
        practiceHours: 0.5,
      },
      {
        title: "Cómo piensa una máquina: setup() y loop(). Blink y el reto del latido del corazón.",
        theoryHours: 0.5,
        practiceHours: 1,
      },
      { title: "Salidas digitales: LEDs, buzzer y secuencias de luces.", theoryHours: 0.5, practiceHours: 1 },
      { title: "Reto por equipos: construir un semáforo funcional.", theoryHours: 0, practiceHours: 0.5 },
    ],
  },
  {
    key: "unidad-2",
    label: "Unidad 2",
    title: "El lenguaje de las máquinas",
    span: "semanas 3–4",
    accent: "success",
    isFree: false,
    topics: [
      {
        title: "Variables y tipos de datos. Entradas digitales: el botón como fuente de órdenes.",
        theoryHours: 1,
        practiceHours: 0.5,
      },
      { title: "Condicionales if / else: darle decisiones a la máquina.", theoryHours: 0.5, practiceHours: 1 },
      { title: "Reto de código Morse: enviar una señal de S.O.S. con el buzzer.", theoryHours: 0, practiceHours: 1 },
      {
        title: "Reto «Caza-bugs»: encontrar la falla oculta en el circuito y en el código.",
        theoryHours: 0.5,
        practiceHours: 0.5,
      },
    ],
  },
  {
    key: "unidad-3",
    label: "Unidad 3",
    title: "El arsenal de sensores",
    span: "semanas 5–6",
    accent: "info",
    isFree: false,
    topics: [
      { title: "Señales analógicas y digitales. Lectura de datos por el monitor serie.", theoryHours: 1, practiceHours: 0 },
      { title: "Sensores de luz y distancia: fotorresistor, láser y ultrasónico.", theoryHours: 0.5, practiceHours: 1 },
      { title: "Sensores de movimiento, magnéticos, de sonido y táctiles.", theoryHours: 0.5, practiceHours: 1 },
      {
        title: "Sensores de ambiente: temperatura, humedad, vibración y nivel de agua. Mini-alarma por equipo.",
        theoryHours: 0,
        practiceHours: 1,
      },
    ],
  },
  {
    key: "unidad-4",
    label: "Unidad 4",
    title: "Proyecto integrador «Edén»",
    span: "semanas 7–8",
    accent: "destructive",
    isFree: false,
    topics: [
      {
        title: "Del circuito al producto: definición del problema y diseño de la solución en equipo.",
        theoryHours: 1,
        practiceHours: 0,
      },
      {
        title: "Construcción por divisiones: radar perimetral, control de temperatura y sistema antirrobo.",
        theoryHours: 0,
        practiceHours: 2,
      },
      {
        title: "Administración de recursos y negociación entre equipos en el mercado de componentes.",
        theoryHours: 0.5,
        practiceHours: 0.5,
      },
      {
        title: "Ensamblaje general, prueba en vivo, exposición del proyecto y ceremonia de medallas.",
        theoryHours: 0,
        practiceHours: 1,
      },
    ],
  },
];

const sumUnitHours = (unit: ISyllabusUnit): number =>
  unit.topics.reduce((total, topic) => total + topic.theoryHours + topic.practiceHours, 0);

export const unitTotalHours = sumUnitHours;

export const COURSE_HOURS = SYLLABUS_UNITS.filter((unit) => !unit.isFree).reduce(
  (total, unit) => total + sumUnitHours(unit),
  0,
);

export const FREE_HOURS = SYLLABUS_UNITS.filter((unit) => unit.isFree).reduce(
  (total, unit) => total + sumUnitHours(unit),
  0,
);
