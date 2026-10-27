// Semáforo de riesgo del aprendiz: lo usan el boletín (Mi cuenta) y el Panel del Profe.
// Lógica pura, sin Vue ni base de datos, para poder probarla con node --test.

import { hojasDeAsistencia } from './fichaAsistencia.js'

// Desde aquí el aprendiz se pone en rojo. El profe lo ajusta aquí si su ficha maneja otra regla
export const FALLAS_ROJO = 3

// Días de clase de la ficha que ya pasaron (incluido hoy), según las fechas del encabezado
export function diasDeClaseHasta(inicio, fin, hoy) {
  return hojasDeAsistencia(inicio, fin)
    .flatMap(h => h.dias)
    .filter(d => d.dentroDeLaFicha && d.fecha <= hoy)
    .map(d => d.fecha)
}

// Hoy no cuenta como falla: puede que todavía no haya empezado la clase o no haya marcado
export function contarAsistencia(diasDeClase, fechasQueVino, hoy) {
  const vino = new Set(fechasQueVino)
  const asistencias = diasDeClase.filter(d => vino.has(d)).length
  const fallas = diasDeClase.filter(d => d < hoy && !vino.has(d)).length
  return { asistencias, fallas, diasDeClase: diasDeClase.length }
}

// Devuelve { color: 'verde' | 'amarillo' | 'rojo', motivos: [...] }
export function calcularSemaforo({ fallas = 0, aportes = 0, infracciones = 0 }) {
  const motivos = []
  let color = 'verde'
  const subir = nuevo => {
    if (nuevo === 'rojo' || (nuevo === 'amarillo' && color === 'verde')) color = nuevo
  }

  if (fallas >= FALLAS_ROJO) {
    subir('rojo')
    motivos.push(`${fallas} fallas de asistencia`)
  } else if (fallas > 0) {
    subir('amarillo')
    motivos.push(`${fallas} ${fallas === 1 ? 'falla' : 'fallas'} de asistencia`)
  }
  if (!aportes) {
    subir('amarillo')
    motivos.push('No ha publicado aporte en el foro')
  }
  if (infracciones > 0) {
    subir('amarillo')
    motivos.push('Salió de la ventana durante la evaluación')
  }
  return { color, motivos }
}
