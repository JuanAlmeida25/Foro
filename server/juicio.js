// El Juicio de Macondo ⚖️: el administrador pone un aporte "en juicio", cada réplica escoge
// bando (Fiscalía, Defensa o Neutral) y al final el profe dicta sentencia.
//
// La sentencia va aparte de la calificación de 0 a 100: el juicio es el debate, la nota es la nota.
// Se guarda en tablas propias para no tocar las columnas de aportes y comentarios que ya existen.

export const BANDOS = ['fiscalia', 'defensa', 'neutral']
export const VEREDICTOS = ['fiscalia', 'defensa', 'dividido']
export const MAX_SENTENCIA = 5000

// Tablas iguales en SQLite y Postgres
export const SCHEMA_JUICIO = `
  CREATE TABLE IF NOT EXISTS juicios (
    aporte_id TEXT PRIMARY KEY,
    veredicto TEXT NOT NULL DEFAULT '',
    sentencia TEXT NOT NULL DEFAULT '',
    abierto_at TEXT NOT NULL,
    sentenciado_at TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS bandos_comentario (
    comentario_id TEXT PRIMARY KEY,
    bando TEXT NOT NULL
  );
`

export async function obtenerJuicio(db, aporteId) {
  const fila = await db.get(
    'SELECT veredicto, sentencia, abierto_at, sentenciado_at FROM juicios WHERE aporte_id = ?',
    [aporteId]
  )
  return fila || null
}

// Abrir un juicio que ya existe no borra su sentencia (repetir la petición no cambia nada)
export async function abrirJuicio(db, aporteId) {
  await db.run(
    'INSERT INTO juicios (aporte_id, abierto_at) VALUES (?, ?) ON CONFLICT DO NOTHING',
    [aporteId, new Date().toISOString()]
  )
  return obtenerJuicio(db, aporteId)
}

// Archivar el juicio: el aporte vuelve a ser normal. Los bandos de las réplicas se conservan
// por si el profe lo vuelve a abrir.
export async function archivarJuicio(db, aporteId) {
  await db.run('DELETE FROM juicios WHERE aporte_id = ?', [aporteId])
}

export async function dictarSentencia(db, aporteId, veredicto, sentencia) {
  await db.run(
    'UPDATE juicios SET veredicto = ?, sentencia = ?, sentenciado_at = ? WHERE aporte_id = ?',
    [veredicto, sentencia, new Date().toISOString(), aporteId]
  )
  return obtenerJuicio(db, aporteId)
}

export async function guardarBando(db, comentarioId, bando) {
  await db.run('INSERT INTO bandos_comentario (comentario_id, bando) VALUES (?, ?)', [comentarioId, bando])
}

// Antes de eliminar un aporte: su juicio y los bandos de todas sus réplicas
export async function borrarJuicioDeAporte(db, aporteId) {
  await db.run(
    'DELETE FROM bandos_comentario WHERE comentario_id IN (SELECT id FROM comentarios WHERE aporte_id = ?)',
    [aporteId]
  )
  await db.run('DELETE FROM juicios WHERE aporte_id = ?', [aporteId])
}

export async function borrarBandoDeComentario(db, comentarioId) {
  await db.run('DELETE FROM bandos_comentario WHERE comentario_id = ?', [comentarioId])
}
