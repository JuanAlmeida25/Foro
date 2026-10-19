// Reacciones "👍 Útil" sobre aportes y comentarios.
//
// No hay cuentas de usuario: cada navegador envía un identificador anónimo (un UUID) del que el
// servidor solo guarda el hash SHA-256, y la clave primaria impide reaccionar dos veces a lo mismo.

import crypto from 'node:crypto'

export const TIPOS_REACCION = ['aporte', 'comentario']

// Formato de crypto.randomUUID(), que es lo que genera el navegador (src/services/reacciones.js)
const PATRON_VOTANTE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Máximo de reacciones por persona (IP) en la ventana de 15 minutos de server/seguridad.js
export const MAX_REACCIONES_POR_IP = 120
export const OBJETIVO_LIMITE_REACCIONES = 'reacciones'

// Tabla igual en SQLite y Postgres
export const SCHEMA_REACCIONES = `
  CREATE TABLE IF NOT EXISTS reacciones (
    tipo TEXT NOT NULL,
    objetivo_id TEXT NOT NULL,
    votante TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (tipo, objetivo_id, votante)
  );
`

// Subconsulta para sumar las reacciones a los listados, p. ej. sqlTotalReacciones('aporte', 'a.id').
// Ambos valores se escriben dentro del SQL, así que solo se aceptan valores conocidos.
export function sqlTotalReacciones(tipo, columnaId) {
  if (!TIPOS_REACCION.includes(tipo)) throw new Error(`Tipo de reacción no válido: ${tipo}`)
  if (typeof columnaId !== 'string' || !/^[a-z_.]+$/.test(columnaId)) {
    throw new Error(`Columna no válida: ${columnaId}`)
  }
  return `(SELECT CAST(COUNT(*) AS INTEGER) FROM reacciones r WHERE r.tipo = '${tipo}' AND r.objetivo_id = ${columnaId})`
}

export function votanteValido(votante) {
  return typeof votante === 'string' && PATRON_VOTANTE.test(votante)
}

export function hashVotante(votante) {
  // Se normaliza a minúsculas para que el mismo UUID cuente siempre igual
  return crypto.createHash('sha256').update(votante.toLowerCase()).digest('hex')
}

// ¿Existe el aporte o comentario al que se quiere reaccionar?
export async function objetivoExiste(db, tipo, id) {
  const tabla = tipo === 'aporte' ? 'aportes' : 'comentarios'
  return Boolean(await db.get(`SELECT id FROM ${tabla} WHERE id = ?`, [id]))
}

export async function contarReacciones(db, tipo, id) {
  const fila = await db.get(
    'SELECT CAST(COUNT(*) AS INTEGER) AS total FROM reacciones WHERE tipo = ? AND objetivo_id = ?',
    [tipo, id]
  )
  return Number(fila?.total) || 0
}

// Deja la reacción de este votante en el estado pedido (true = puesta, false = quitada).
// Repetir la misma petición no cambia nada. Devuelve { reaccionado, total }.
export async function fijarReaccion(db, tipo, id, votante, reaccionar) {
  const hash = hashVotante(votante)
  if (reaccionar) {
    await db.run(
      `INSERT INTO reacciones (tipo, objetivo_id, votante, created_at) VALUES (?, ?, ?, ?)
       ON CONFLICT DO NOTHING`,
      [tipo, id, hash, new Date().toISOString()]
    )
  } else {
    await db.run(
      'DELETE FROM reacciones WHERE tipo = ? AND objetivo_id = ? AND votante = ?',
      [tipo, id, hash]
    )
  }
  return { reaccionado: reaccionar, total: await contarReacciones(db, tipo, id) }
}

// Borra las reacciones de un aporte y de todos sus comentarios (antes de eliminarlos)
export async function borrarReaccionesDeAporte(db, aporteId) {
  await db.run(
    "DELETE FROM reacciones WHERE tipo = 'comentario' AND objetivo_id IN (SELECT id FROM comentarios WHERE aporte_id = ?)",
    [aporteId]
  )
  await db.run("DELETE FROM reacciones WHERE tipo = 'aporte' AND objetivo_id = ?", [aporteId])
}

export async function borrarReaccionesDeComentario(db, comentarioId) {
  await db.run("DELETE FROM reacciones WHERE tipo = 'comentario' AND objetivo_id = ?", [comentarioId])
}
