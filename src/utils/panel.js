// Panel del Profe: arma la tabla por aprendiz y el CSV de notas.
// Lógica pura (sin Vue ni navegador) para poder probarla con node --test.

import { normalizar } from './glosario.js'

// La guía oficial del instructor no es un aporte de aprendiz (mismo id que server/seed.js)
export const ID_GUIA_OFICIAL = 'guia-como-hacer-la-entrada-al-foro'

// Misma regla que la tarjeta de calificación de AporteDetalle.vue
export const NOTA_APROBATORIA = 70

export const ESTADOS = [
  { id: 'sin-calificar', nombre: 'Sin calificar' },
  { id: 'aprobado', nombre: 'Aprobado' },
  { id: 'no-aprobado', nombre: 'No aprobado' },
  { id: 'sin-aporte', nombre: 'Solo réplicas' }
]

export function estadoNota(calificacion) {
  if (calificacion === null || calificacion === undefined) return 'sin-calificar'
  return Number(calificacion) >= NOTA_APROBATORIA ? 'aprobado' : 'no-aprobado'
}

// "Ana  María" y "ana maría" son la misma persona; los espacios dobles no cuentan
const claveNombre = nombre => normalizar(nombre).replace(/\s+/g, ' ')

// Una fila por aprendiz. Si alguien publicó varios aportes, cuenta la mejor nota.
// Las réplicas que cuentan son las que hizo en aportes ajenos (no en el suyo ni en la guía).
export function resumenPorAprendiz(aportes, replicas) {
  const deAprendices = (aportes || []).filter(a => a.id !== ID_GUIA_OFICIAL)
  const autorDeAporte = new Map(deAprendices.map(a => [a.id, claveNombre(a.autor)]))
  const filas = new Map()

  const filaDe = (nombre, ficha = '') => {
    const clave = claveNombre(nombre)
    if (!filas.has(clave)) {
      filas.set(clave, {
        autor: String(nombre).trim(),
        ficha,
        aportes: [],
        nota: null,
        estado: 'sin-aporte',
        replicas: 0,
        primerAporte: ''
      })
    }
    return filas.get(clave)
  }

  for (const a of deAprendices) {
    const fila = filaDe(a.autor, a.ficha || '')
    if (!fila.ficha && a.ficha) fila.ficha = a.ficha
    fila.aportes.push(a.id)
    if (!fila.primerAporte || a.created_at < fila.primerAporte) fila.primerAporte = a.created_at
    if (a.calificacion !== null && a.calificacion !== undefined) {
      fila.nota = Math.max(fila.nota ?? 0, Number(a.calificacion))
    }
  }

  for (const r of replicas || []) {
    if (!autorDeAporte.has(r.aporte_id)) continue
    if (autorDeAporte.get(r.aporte_id) === claveNombre(r.autor)) continue
    filaDe(r.autor).replicas++
  }

  for (const fila of filas.values()) {
    if (fila.aportes.length) fila.estado = estadoNota(fila.nota)
  }

  return [...filas.values()].sort((x, y) => x.autor.localeCompare(y.autor, 'es'))
}

// Excel en español (Colombia) separa columnas con punto y coma
const SEPARADOR = ';'

// Comillas cuando hacen falta, y un apóstrofo delante de lo que Excel tomaría por fórmula
// (=, +, -, @): así un nombre como "=HYPERLINK(...)" no se ejecuta al abrir el archivo
function celda(valor) {
  let texto = valor === null || valor === undefined ? '' : String(valor)
  if (/^[=+\-@\t\r]/.test(texto)) texto = `'${texto}`
  if (/[";\n\r]/.test(texto)) texto = `"${texto.replace(/"/g, '""')}"`
  return texto
}

// columnas: [{ titulo, valor: fila => ... }]. Empieza con BOM para que Excel lea bien las tildes.
export function generarCsv(filas, columnas) {
  const lineas = [
    columnas.map(c => celda(c.titulo)).join(SEPARADOR),
    ...filas.map(f => columnas.map(c => celda(c.valor(f))).join(SEPARADOR))
  ]
  return '﻿' + lineas.join('\r\n') + '\r\n'
}
