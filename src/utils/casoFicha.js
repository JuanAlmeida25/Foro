// Cuentas pequeñas de la actividad del Caso MAREA (sin Vue, para poder probarlas con node --test)

export function idsDeCampos(apartados) {
  return apartados.flatMap(a => a.campos.map(c => c.id))
}

// Un campo con puros espacios no cuenta como lleno, que el aprendiz no nos meta el gol
export function progresoFicha(apartados, respuestas) {
  const ids = idsDeCampos(apartados)
  const llenos = ids.filter(id => (respuestas[id] || '').trim().length > 0).length
  const total = ids.length
  return { llenos, total, porcentaje: total ? Math.round((llenos / total) * 100) : 0 }
}

export function puntajeRubrica(rubrica) {
  return rubrica.reduce((suma, c) => suma + c.puntos, 0)
}
