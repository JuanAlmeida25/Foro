// Rúbrica de calificación del aporte, amarrada a los 4 puntos de la guía oficial del foro.
// Cada criterio: { id, texto, puntos }. Los puntos suman 100 (lo revisa tests/rubrica.test.js).

export const CRITERIOS_RUBRICA = [
  { id: 'software', texto: 'Explica qué es un software', puntos: 15 },
  { id: 'licencia', texto: 'Define la licencia como contrato de uso que no transfiere la titularidad', puntos: 20 },
  { id: 'normas', texto: 'Cita el marco colombiano (Ley 23/1982, Decisión Andina 351, Decreto 1360/1989)', puntos: 20 },
  { id: 'tipos', texto: 'Clasifica las licencias: propietarias, copyleft y permisivas', puntos: 20 },
  { id: 'proyecto', texto: 'Argumenta qué licencia le conviene al proyecto formativo y por qué', puntos: 20 },
  { id: 'redaccion', texto: 'Redacción clara y ortografía técnica cuidada', puntos: 5 }
]

// Retroalimentaciones que el profe escribe una y otra vez: un clic y quedan en el cuadro
export const PLANTILLAS_RETRO = [
  {
    id: 'excelente',
    titulo: '🌟 Excelente',
    texto: 'Excelente aporte: cubre los cuatro puntos de la guía con argumentos técnicos y normativos sólidos.'
  },
  {
    id: 'falta-norma',
    titulo: '⚖️ Falta la norma',
    texto: 'Te faltó sustentar con la normativa colombiana: revisa la Ley 23 de 1982, la Decisión Andina 351 de 1993 y el Decreto 1360 de 1989.'
  },
  {
    id: 'falta-tipos',
    titulo: '🧭 Falta clasificar',
    texto: 'Distingue mejor los tipos de licencia (propietarias, copyleft fuerte y débil, permisivas) con un ejemplo de cada una.'
  },
  {
    id: 'falta-proyecto',
    titulo: '🧩 Aterriza al proyecto',
    texto: 'Concluye explicando qué licencia le conviene a tu proyecto formativo y por qué (dependencias, patentes, modelo de distribución).'
  },
  {
    id: 'ortografia',
    titulo: '✍️ Ortografía',
    texto: 'Cuida la ortografía y la redacción técnica: revisa tildes, mayúsculas en los nombres de licencias y la puntuación.'
  }
]
