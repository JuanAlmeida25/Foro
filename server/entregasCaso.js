// Entrega del Caso MAREA dentro de la plataforma: un integrante entrega el SRS y la ficha por todo
// el grupo, y el profe califica criterio por criterio con la rúbrica del caso.
// Las respuestas se guardan como JSON, igual que las tiene el navegador en el localStorage.

import crypto from 'node:crypto'
import { APARTADOS_PLANTILLA, APARTADOS_SRS, PREGUNTAS_CASO, RUBRICA_CASO } from '../src/data/casoFicha.js'
import { idsDeCampos } from '../src/utils/casoFicha.js'

// Grupos de 2 a 3 aprendices, como dice la actividad (también se puede entregar solo)
export const MAX_INTEGRANTES = 3
export const MAX_LARGO_CAMPO = 20_000
export const MAX_LARGO_RETRO = 2_000

// Lo único que se acepta en una entrega: los campos del SRS, de la ficha, las preguntas y los participantes
export const CAMPOS_ENTREGA = new Set([
  ...idsDeCampos(APARTADOS_SRS),
  ...idsDeCampos(APARTADOS_PLANTILLA),
  ...PREGUNTAS_CASO.map(p => p.id),
  'participantes'
])

// Tablas iguales en SQLite y Postgres. Los integrantes van en una tabla aparte para poder
// preguntar rápido "¿este aprendiz ya está en algún grupo?" (y que no esté en dos)
export const SCHEMA_ENTREGAS_CASO = `
  CREATE TABLE IF NOT EXISTS entregas_caso (
    id TEXT PRIMARY KEY,
    entregado_por TEXT NOT NULL,
    respuestas TEXT NOT NULL,
    calificacion TEXT NOT NULL DEFAULT '',
    nota INTEGER DEFAULT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    calificado_at TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS integrantes_entrega (
    documento TEXT PRIMARY KEY,
    entrega_id TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS integrantes_entrega_id_idx ON integrantes_entrega (entrega_id);
`

// Deja solo los campos conocidos, como texto y con tope de largo. Lo demás se bota sin decir nada
export function limpiarRespuestas(respuestas) {
  if (!respuestas || typeof respuestas !== 'object' || Array.isArray(respuestas)) return {}
  const limpias = {}
  for (const [id, valor] of Object.entries(respuestas)) {
    if (CAMPOS_ENTREGA.has(id) && typeof valor === 'string' && valor.trim()) {
      limpias[id] = valor.slice(0, MAX_LARGO_CAMPO)
    }
  }
  return limpias
}

// Revisa la calificación del profe contra la rúbrica. Devuelve { calificacion, nota } o { error }
export function validarCalificacion(criterios, retroGeneral) {
  if (!Array.isArray(criterios) || criterios.length !== RUBRICA_CASO.length) {
    return { error: `Califica los ${RUBRICA_CASO.length} criterios de la rúbrica.` }
  }
  const limpios = []
  for (let i = 0; i < RUBRICA_CASO.length; i++) {
    const { criterio, puntos: maximo } = RUBRICA_CASO[i]
    const puntos = Number(criterios[i]?.puntos)
    if (!Number.isInteger(puntos) || puntos < 0 || puntos > maximo) {
      return { error: `«${criterio}» va de 0 a ${maximo} puntos.` }
    }
    const retro = typeof criterios[i]?.retro === 'string' ? criterios[i].retro.trim().slice(0, MAX_LARGO_RETRO) : ''
    limpios.push({ criterio, maximo, puntos, retro })
  }
  const general = typeof retroGeneral === 'string' ? retroGeneral.trim().slice(0, MAX_LARGO_RETRO * 2) : ''
  return {
    calificacion: { criterios: limpios, retroGeneral: general },
    nota: limpios.reduce((suma, c) => suma + c.puntos, 0)
  }
}

export async function entregaDe(db, documento) {
  const fila = await db.get('SELECT entrega_id FROM integrantes_entrega WHERE documento = ?', [documento])
  return fila ? leerEntrega(db, fila.entrega_id) : null
}

export async function leerEntrega(db, id) {
  const fila = await db.get('SELECT * FROM entregas_caso WHERE id = ?', [id])
  if (!fila) return null
  const integrantes = await db.all(`
    SELECT a.documento, a.nombre FROM integrantes_entrega i
    JOIN aprendices a ON a.documento = i.documento
    WHERE i.entrega_id = ?
  `, [id])
  return {
    id: fila.id,
    entregadoPor: fila.entregado_por,
    respuestas: JSON.parse(fila.respuestas || '{}'),
    calificacion: fila.calificacion ? JSON.parse(fila.calificacion) : null,
    nota: fila.nota === null || fila.nota === undefined ? null : Number(fila.nota),
    createdAt: fila.created_at,
    updatedAt: fila.updated_at,
    calificadoAt: fila.calificado_at,
    integrantes: integrantes.sort((x, y) => x.nombre.localeCompare(y.nombre, 'es'))
  }
}

// Crea la entrega del grupo o actualiza la que ya tiene. Devuelve { entrega } o { error, status }.
// documentos = quien entrega + sus compañeros (ya validados: existen y son distintos)
export async function guardarEntrega(db, quien, documentos, respuestas) {
  const ahora = new Date().toISOString()
  return db.transaction(async tx => {
    const actual = await tx.get('SELECT entrega_id FROM integrantes_entrega WHERE documento = ?', [quien])
    const entregaId = actual?.entrega_id || crypto.randomUUID()

    if (actual) {
      const fila = await tx.get('SELECT calificado_at FROM entregas_caso WHERE id = ?', [entregaId])
      if (fila?.calificado_at) {
        return { status: 409, error: 'El profe ya calificó esta entrega; ya no se puede cambiar.' }
      }
    }

    // Nadie puede quedar en dos grupos a la vez
    for (const documento of documentos) {
      const otro = await tx.get('SELECT entrega_id FROM integrantes_entrega WHERE documento = ?', [documento])
      if (otro && otro.entrega_id !== entregaId) {
        const { nombre } = await tx.get('SELECT nombre FROM aprendices WHERE documento = ?', [documento])
        return { status: 409, error: `${nombre} ya está en la entrega de otro grupo.` }
      }
    }

    if (actual) {
      await tx.run(
        'UPDATE entregas_caso SET respuestas = ?, entregado_por = ?, updated_at = ? WHERE id = ?',
        [JSON.stringify(respuestas), quien, ahora, entregaId]
      )
      await tx.run('DELETE FROM integrantes_entrega WHERE entrega_id = ?', [entregaId])
    } else {
      await tx.run(
        'INSERT INTO entregas_caso (id, entregado_por, respuestas, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [entregaId, quien, JSON.stringify(respuestas), ahora, ahora]
      )
    }
    for (const documento of documentos) {
      await tx.run('INSERT INTO integrantes_entrega (documento, entrega_id) VALUES (?, ?)', [documento, entregaId])
    }
    return { entregaId }
  })
}

export async function calificarEntrega(db, id, calificacion, nota) {
  const { changes } = await db.run(
    'UPDATE entregas_caso SET calificacion = ?, nota = ?, calificado_at = ? WHERE id = ?',
    [JSON.stringify(calificacion), nota, new Date().toISOString(), id]
  )
  return changes === 1
}

// Resumen para la lista del profe (sin las respuestas completas, que pesan)
export async function listarEntregas(db) {
  const filas = await db.all('SELECT id, nota, created_at, updated_at, calificado_at FROM entregas_caso ORDER BY updated_at DESC')
  const integrantes = await db.all(`
    SELECT i.entrega_id, a.nombre FROM integrantes_entrega i
    JOIN aprendices a ON a.documento = i.documento
  `)
  return filas.map(f => ({
    id: f.id,
    nota: f.nota === null || f.nota === undefined ? null : Number(f.nota),
    createdAt: f.created_at,
    updatedAt: f.updated_at,
    calificadoAt: f.calificado_at,
    integrantes: integrantes.filter(i => i.entrega_id === f.id).map(i => i.nombre).sort((x, y) => x.localeCompare(y, 'es'))
  }))
}

// Si se borra la cuenta, sale del grupo; si el grupo queda vacío, la entrega se va con él
export async function sacarDeEntrega(db, documento) {
  const fila = await db.get('SELECT entrega_id FROM integrantes_entrega WHERE documento = ?', [documento])
  if (!fila) return
  await db.run('DELETE FROM integrantes_entrega WHERE documento = ?', [documento])
  const quedan = await db.get('SELECT documento FROM integrantes_entrega WHERE entrega_id = ?', [fila.entrega_id])
  if (!quedan) await db.run('DELETE FROM entregas_caso WHERE id = ?', [fila.entrega_id])
}
