import { DatabaseSync } from 'node:sqlite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import { buildSeed } from './seed.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, 'foro.db')

// Asegurar permisos de escritura en la carpeta y base de datos
try {
  fs.chmodSync(__dirname, 0o777)
  if (fs.existsSync(dbPath)) {
    fs.chmodSync(dbPath, 0o666)
  }
} catch (e) {
  // Ignorar si el sistema de archivos no lo requiere
}

export const db = new DatabaseSync(dbPath, { readOnly: false })

// Habilitar modo WAL y timeout
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA busy_timeout = 5000;
  PRAGMA synchronous = NORMAL;
`)

// Inicializar tablas base si no existen
db.exec(`
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
    aporte_id TEXT NOT NULL,
    autor TEXT NOT NULL,
    comentario_citado TEXT DEFAULT '',
    contenido TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(aporte_id) REFERENCES aportes(id) ON DELETE CASCADE
  );
`)

// Migración segura: agregar columnas si la tabla ya existía sin ellas
const existingCols = db.prepare('PRAGMA table_info(aportes)').all().map(c => c.name)
if (!existingCols.includes('clave_edicion')) {
  db.exec('ALTER TABLE aportes ADD COLUMN clave_edicion TEXT NOT NULL DEFAULT ""')
}
if (!existingCols.includes('calificacion')) {
  db.exec('ALTER TABLE aportes ADD COLUMN calificacion INTEGER DEFAULT NULL')
}
if (!existingCols.includes('retroalimentacion')) {
  db.exec('ALTER TABLE aportes ADD COLUMN retroalimentacion TEXT DEFAULT ""')
}
if (!existingCols.includes('calificado_at')) {
  db.exec('ALTER TABLE aportes ADD COLUMN calificado_at TEXT DEFAULT ""')
}

// Semilla inicial si está vacía
const countAportes = db.prepare('SELECT COUNT(*) as count FROM aportes').get()
if (countAportes.count === 0) {
  const { aporte, comentario } = buildSeed()

  db.prepare(`
    INSERT INTO aportes (id, autor, ficha, pregunta, respuesta, clave_edicion, calificacion, retroalimentacion, calificado_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    aporte.id,
    aporte.autor,
    aporte.ficha,
    aporte.pregunta,
    aporte.respuesta,
    aporte.clave_edicion,
    aporte.calificacion,
    aporte.retroalimentacion,
    aporte.calificado_at,
    aporte.created_at,
    aporte.updated_at
  )

  db.prepare(`
    INSERT INTO comentarios (id, aporte_id, autor, comentario_citado, contenido, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    comentario.id,
    comentario.aporte_id,
    comentario.autor,
    comentario.comentario_citado,
    comentario.contenido,
    comentario.created_at
  )
}
