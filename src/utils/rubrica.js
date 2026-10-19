// Suma de la rúbrica de calificación. Lógica pura para probarla con node --test.

// Nota que da la rúbrica según los criterios marcados (lista o Set de ids), entre 0 y 100
export function sumarRubrica(criterios, marcados) {
  const elegidos = new Set(marcados)
  const suma = criterios
    .filter(c => elegidos.has(c.id))
    .reduce((total, c) => total + c.puntos, 0)
  return Math.min(100, Math.max(0, suma))
}

// Agrega una plantilla a la retroalimentación sin repetirla si ya está escrita
export function agregarPlantilla(retroalimentacion, plantilla) {
  const actual = String(retroalimentacion ?? '').trim()
  if (actual.includes(plantilla)) return actual
  return actual ? `${actual}\n\n${plantilla}` : plantilla
}
