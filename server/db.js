import { DatabaseSync } from 'node:sqlite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

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
  const seedId = 'guia-como-hacer-la-entrada-al-foro'
  const now = new Date().toISOString()

  const instructivoPregunta = 'Guía Oficial: ¿Cómo hacer y estructurar tu entrada (aporte) en el foro temático?'

  const instructivoRespuesta = `Estimados aprendices:

Esta guía detalla los pasos, criterios técnicos y recomendaciones para elaborar y publicar con éxito su entrada (aporte principal) en el foro temático de Licenciamiento de Software.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 PASO 1: IDENTIFICACIÓN DEL APRENDIZ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Dirígete a la pestaña "Redactar Mi Aporte".
2. Ingresa tu Nombre Completo en el campo correspondiente.
3. Ingresa tu Número de Ficha de formación (por ejemplo, 2977456).
4. Asigna una Clave o PIN de Autor (ej. 1234) para que en el futuro solo tú puedas modificar o editar tu entrada.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 PASO 2: PREGUNTAS ORIENTADORAS DEL FORO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
El campo "Pregunta o tema a debatir" contiene las 4 preguntas orientadoras oficiales del foro:
1. ¿Qué es un software?
2. ¿Qué es una licencia de software?
3. Tipos de licencias de software
4. ¿Cuáles son las más adecuadas y por qué?
Asegúrate de responder a cada uno de estos puntos en tu argumentación.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✍️ PASO 3: REDACTAR EL CONTENIDO DE TU ENTRADA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En el campo "Respuesta y argumentación", redacta tu aporte reflexivo asegurándote de cubrir:
1. Concepto técnico y legal: Explica qué es una licencia de software.
2. Marco normativo en Colombia: Cita las normas aplicables (Ley 23 de 1982, Decisión Andina 351 de 1993 y Decreto 1360 de 1989).
3. Clasificación de licencias: Distingue entre privativas, libres (GPL/copyleft) y permisivas (MIT, Apache-2.0).
4. Análisis aplicado al proyecto formativo: Concluye argumentando qué licencia conviene a tu proyecto de software y por qué.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 PASO 4: PUBLICACIÓN Y CALIFICACIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Haz clic en el botón "Publicar en el Foro" ubicado en la barra superior.
2. Tu entrada quedará publicada para toda la ficha.
3. El instructor / administrador revisará tu evidencia y asignará una calificación y retroalimentación oficial.`

  db.prepare(`
    INSERT INTO aportes (id, autor, ficha, pregunta, respuesta, clave_edicion, calificacion, retroalimentacion, calificado_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    seedId,
    'Instructor / Vocero ADSO',
    'Ficha ADSO - SENA',
    instructivoPregunta,
    instructivoRespuesta,
    '2501',
    100,
    'Excelente estructura metodológica. La guía cumple plenamente con los lineamientos de la competencia formativa.',
    now,
    now,
    now
  )

  db.prepare(`
    INSERT INTO comentarios (id, aporte_id, autor, comentario_citado, contenido, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    'comentario-demo-entrada',
    seedId,
    'Aprendiz ADSO',
    'Asigna una Clave o PIN de Autor para que solo tú puedas modificar tu entrada',
    'Excelente guía, instructor. Ya tengo clara la clave de autor y los requisitos para publicar mi evidencia.',
    now
  )
}
