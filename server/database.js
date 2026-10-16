// Capa de acceso a datos del foro.
//
// - En Vercel (o en local si defines DATABASE_URL / POSTGRES_URL) usa PostgreSQL,
//   la base que creas desde Vercel → Storage (Neon, Supabase, Prisma Postgres…).
// - Sin esas variables, en local, usa el archivo SQLite server/foro.db como siempre.
//
// Las rutas escriben SQL con marcadores "?" y esta capa los adapta a cada motor.

import { buildSeed, SEED_APORTE_ID } from './seed.js'
import { hashClave } from './seguridad.js'
import { SCHEMA_REACCIONES } from './reacciones.js'

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || ''

export const dbEngine = connectionString ? 'postgres' : 'sqlite'

// Tabla para limitar los intentos de clave incorrectos (igual en SQLite y Postgres)
const SCHEMA_SEGURIDAD = `
  CREATE TABLE IF NOT EXISTS intentos_fallidos (
    ip TEXT NOT NULL,
    objetivo TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS intentos_fallidos_idx ON intentos_fallidos (ip, objetivo, created_at);
`

const SCHEMA_POSTGRES = `
  CREATE TABLE IF NOT EXISTS aportes (
    id TEXT PRIMARY KEY,
    autor TEXT NOT NULL,
    ficha TEXT NOT NULL DEFAULT '',
    pregunta TEXT NOT NULL,
    respuesta TEXT NOT NULL,
    clave_edicion TEXT NOT NULL DEFAULT '',
    calificacion INTEGER DEFAULT NULL,
    retroalimentacion TEXT DEFAULT '',
    calificado_at TEXT DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS comentarios (
    id TEXT PRIMARY KEY,
    aporte_id TEXT NOT NULL REFERENCES aportes(id) ON DELETE CASCADE,
    autor TEXT NOT NULL,
    comentario_citado TEXT DEFAULT '',
    contenido TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS comentarios_aporte_id_idx ON comentarios (aporte_id);
` + SCHEMA_SEGURIDAD + SCHEMA_REACCIONES

// Convierte "SELECT ... WHERE id = ?" en "SELECT ... WHERE id = $1" para Postgres.
// Los valores siempre viajan como parámetros, nunca dentro del texto SQL.
function toPostgresParams(sql) {
  let i = 0
  return sql.replace(/\?/g, () => '$' + ++i)
}

async function createPostgresAdapter() {
  const { default: pg } = await import('pg')

  const pool = new pg.Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000
  })

  // En Vercel, cierra las conexiones inactivas antes de que la función se suspenda.
  if (process.env.VERCEL) {
    const { attachDatabasePool } = await import('@vercel/functions')
    attachDatabasePool(pool)
  }

  const adaptador = {
    async all(sql, params = []) {
      const { rows } = await pool.query(toPostgresParams(sql), params)
      return rows
    },
    async get(sql, params = []) {
      const { rows } = await pool.query(toPostgresParams(sql), params)
      return rows[0]
    },
    async run(sql, params = []) {
      const result = await pool.query(toPostgresParams(sql), params)
      return { changes: result.rowCount }
    }
  }

  try {
    await prepararPostgres(pool)
    await migrarSeguridad(adaptador)
  } catch (error) {
    await pool.end().catch(() => {})
    throw error
  }

  return adaptador
}

// Crea las tablas y carga la guía inicial la primera vez.
// El bloqueo evita que dos funciones que arrancan a la vez lo hagan en paralelo.
async function prepararPostgres(pool) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('SELECT pg_advisory_xact_lock(250120261)')
    await client.query(SCHEMA_POSTGRES)

    const { rows } = await client.query('SELECT COUNT(*)::int AS count FROM aportes')
    if (rows[0].count === 0) {
      const { aporte, comentario } = buildSeed()
      await client.query(
        `INSERT INTO aportes (id, autor, ficha, pregunta, respuesta, clave_edicion, calificacion, retroalimentacion, calificado_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO NOTHING`,
        [
          aporte.id, aporte.autor, aporte.ficha, aporte.pregunta, aporte.respuesta,
          aporte.clave_edicion, aporte.calificacion, aporte.retroalimentacion,
          aporte.calificado_at, aporte.created_at, aporte.updated_at
        ]
      )
      await client.query(
        `INSERT INTO comentarios (id, aporte_id, autor, comentario_citado, contenido, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [
          comentario.id, comentario.aporte_id, comentario.autor,
          comentario.comentario_citado, comentario.contenido, comentario.created_at
        ]
      )
    }
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    throw error
  } finally {
    client.release()
  }
}

async function createSqliteAdapter() {
  if (process.env.VERCEL) {
    // En Vercel el disco no guarda cambios: sin Postgres los datos se perderían.
    const error = new Error(
      'No hay base de datos conectada. En Vercel ve a Storage, crea una base Postgres, conéctala a este proyecto y vuelve a desplegar.'
    )
    error.code = 'SIN_BASE_DE_DATOS'
    throw error
  }

  const { db } = await import('./db.js')
  db.exec(SCHEMA_SEGURIDAD)
  db.exec(SCHEMA_REACCIONES)

  const adaptador = {
    async all(sql, params = []) {
      return db.prepare(sql).all(...params)
    },
    async get(sql, params = []) {
      return db.prepare(sql).get(...params)
    },
    async run(sql, params = []) {
      const result = db.prepare(sql).run(...params)
      return { changes: Number(result.changes) }
    }
  }

  await migrarSeguridad(adaptador)
  return adaptador
}

// Ajustes de seguridad sobre datos que ya existían (se pueden ejecutar muchas veces sin problema):
// 1. La guía oficial tenía como clave de autor "2501", la antigua clave pública de administrador.
//    Ahora no tiene clave de autor, así que solo el administrador puede modificarla.
// 2. Las claves de autor guardadas tal cual se reemplazan por su versión cifrada.
async function migrarSeguridad(db) {
  await db.run(
    "UPDATE aportes SET clave_edicion = '' WHERE id = ? AND clave_edicion = ?",
    [SEED_APORTE_ID, '2501']
  )

  const pendientes = await db.all(
    "SELECT id, clave_edicion FROM aportes WHERE clave_edicion != '' AND clave_edicion NOT LIKE 'scrypt$%'"
  )
  for (const fila of pendientes) {
    await db.run(
      'UPDATE aportes SET clave_edicion = ? WHERE id = ? AND clave_edicion = ?',
      [await hashClave(fila.clave_edicion), fila.id, fila.clave_edicion]
    )
  }
}

let adapterPromise = null

// Devuelve la conexión lista para usar (se crea una sola vez por instancia).
export function getDb() {
  if (!adapterPromise) {
    adapterPromise = (dbEngine === 'postgres' ? createPostgresAdapter() : createSqliteAdapter())
      .catch(error => {
        adapterPromise = null // reintentar en la próxima petición
        throw error
      })
  }
  return adapterPromise
}
