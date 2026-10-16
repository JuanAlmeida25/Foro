// Reacciones "👍 Útil" sobre aportes y comentarios.
//
// No hay cuentas de usuario: cada navegador envía un identificador anónimo que el servidor
// guarda cifrado (SHA-256), y la clave primaria impide reaccionar dos veces a lo mismo.

import crypto from 'node:crypto'

export const TIPOS_REACCION = ['aporte', 'comentario']
export const LONGITUD_MINIMA_VOTANTE = 16
export const LONGITUD_MAXIMA_VOTANTE = 64

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

// Subconsultas para sumar las reacciones a los listados
export const SQL_TOTAL_REACCIONES_APORTE = (columnaId) =>
  `(SELECT CAST(COUNT(*) AS INTEGER) FROM reacciones r WHERE r.tipo = 'aporte' AND r.objetivo_id = ${columnaId})`
export const SQL_TOTAL_REACCIONES_COMENTARIO = (columnaId) =>
  `(SELECT CAST(COUNT(*) AS INTEGER) FROM reacciones r WHERE r.tipo = 'comentario' AND r.objetivo_id = ${columnaId})`

export function votanteValido(votante) {
  return typeof votante === 'string' &&
    votante.length >= LONGITUD_MINIMA_VOTANTE &&
    votante.length <= LONGITUD_MAXIMA_VOTANTE
}

export function cifrarVotante(votante) {
  return crypto.createHash('sha256').update(votante).digest('hex')
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

// Pone o quita la reacción de este votante. Devuelve { reaccionado, total }.
export async function alternarReaccion(db, tipo, id, votante) {
  const hash = cifrarVotante(votante)
  const borrado = await db.run(
    'DELETE FROM reacciones WHERE tipo = ? AND objetivo_id = ? AND votante = ?',
    [tipo, id, hash]
  )
  const reaccionado = borrado.changes === 0
  if (reaccionado) {
    await db.run(
      `INSERT INTO reacciones (tipo, objetivo_id, votante, created_at) VALUES (?, ?, ?, ?)
       ON CONFLICT DO NOTHING`,
      [tipo, id, hash, new Date().toISOString()]
    )
  }
  return { reaccionado, total: await contarReacciones(db, tipo, id) }
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
