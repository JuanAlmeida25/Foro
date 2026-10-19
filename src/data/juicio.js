// Textos del Juicio de Macondo ⚖️. Los ids coinciden con BANDOS y VEREDICTOS de server/juicio.js.

export const BANDOS_JUICIO = [
  { id: 'fiscalia', icono: '🔴', nombre: 'Fiscalía', ayuda: 'Acusas: el aporte se equivocó de licencia o pasó por encima de la norma.' },
  { id: 'defensa', icono: '🔵', nombre: 'Defensa', ayuda: 'Defiendes: la licencia elegida y sus argumentos se sostienen.' },
  { id: 'neutral', icono: '⚪', nombre: 'Neutral', ayuda: 'Aportas datos o preguntas sin tomar partido.' }
]

export const VEREDICTOS_JUICIO = [
  { id: 'fiscalia', icono: '🔴', nombre: 'Gana la Fiscalía', detalle: 'La acusación demostró que la licencia o el argumento no se sostienen.' },
  { id: 'defensa', icono: '🔵', nombre: 'Gana la Defensa', detalle: 'El aporte queda absuelto: la licencia y sus argumentos se sostienen.' },
  { id: 'dividido', icono: '⚖️', nombre: 'Fallo dividido', detalle: 'Las dos partes tienen razón en algo; el tribunal reparte méritos.' }
]

export const bandoPorId = id => BANDOS_JUICIO.find(b => b.id === id) || null
export const veredictoPorId = id => VEREDICTOS_JUICIO.find(v => v.id === id) || null

// Cuántas réplicas tiene cada bando, para la barrita de la sala de audiencias
export function contarBandos(comentarios) {
  const conteo = Object.fromEntries(BANDOS_JUICIO.map(b => [b.id, 0]))
  for (const c of comentarios || []) {
    if (c.bando in conteo) conteo[c.bando]++
  }
  return conteo
}
