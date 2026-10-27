// Cuentas de aprendiz: nombre, documento, ficha y un PIN de 4 números (traído del proyecto Razonar).
//
// Con la cuenta el aprendiz publica y replica en el foro (el nombre sale de la cuenta, así nadie
// firma con el nombre de otro), deja su firma una sola vez y el profe le toma asistencia.
// La autoría va en una tabla aparte, como el juicio, para no tocar las columnas de aportes y comentarios.

import crypto from 'node:crypto'
import { hashClave, verificarClave } from './seguridad.js'
import { sacarDeEntrega } from './entregasCaso.js'

// Los que pide el formato de asistencia del SENA
export const TIPOS_DOCUMENTO = ['CC', 'TI', 'CE', 'PPT', 'PEP']

export const PIN_VALIDO = /^\d{4}$/

// Solo PNG en base64 y de tamaño razonable: una firma dibujada pesa unos 10 KB, no 5 MB
export const FIRMA_VALIDA = /^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/
export const MAX_LARGO_FIRMA = 150_000

// 3 PIN malos en 15 minutos y ese documento queda bloqueado, venga de la IP que venga
export const MAX_FALLOS_PIN = 3
export const MINUTOS_BLOQUEO = 15

// Por IP, para que nadie se ponga a registrar cuentas o probar documentos ajenos de a uno.
// Alto, porque todo un salón sale a internet por la misma IP
export const MAX_REGISTROS_POR_IP = 60
export const MAX_ENTRADAS_POR_IP = 150

// Tablas iguales en SQLite y Postgres
export const SCHEMA_APRENDICES = `
  CREATE TABLE IF NOT EXISTS aprendices (
    documento TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    tipo_documento TEXT NOT NULL DEFAULT '',
    ficha TEXT NOT NULL DEFAULT '',
    pin TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS firmas_aprendiz (
    documento TEXT PRIMARY KEY,
    firma TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS autoria_aprendiz (
    tipo TEXT NOT NULL,
    objetivo_id TEXT NOT NULL,
    documento TEXT NOT NULL,
    PRIMARY KEY (tipo, objetivo_id)
  );

  CREATE INDEX IF NOT EXISTS autoria_aprendiz_documento_idx ON autoria_aprendiz (documento);
`

/* ----- Validaciones ----- */

export const limpiarTexto = (valor, largo) =>
  typeof valor === 'string' ? valor.trim().replace(/\s+/g, ' ').slice(0, largo) : ''

export const soloDigitos = valor =>
  typeof valor === 'string' || typeof valor === 'number' ? String(valor).replace(/\D/g, '') : ''

export function errorNombre(nombre) {
  return nombre.length >= 5 && nombre.includes(' ') ? '' : 'Escribe tu nombre completo (nombre y apellido).'
}

export function errorDocumento(documento) {
  return documento.length >= 6 && documento.length <= 15
    ? ''
    : 'Escribe tu número de documento, solo números (entre 6 y 15 dígitos).'
}

/* ----- Lectura y escritura ----- */

// Lo que se puede mostrar: todo menos el PIN cifrado y su versión
export const datosPublicos = fila => ({
  nombre: fila.nombre,
  documento: fila.documento,
  tipoDocumento: fila.tipo_documento || '',
  ficha: fila.ficha || '',
  fecha: fila.created_at
})

export async function leerAprendiz(db, documento) {
  return (await db.get('SELECT * FROM aprendices WHERE documento = ?', [documento])) || null
}

// Devuelve el registro creado, o null si ese documento ya existía (no se pisa: si no, cualquiera
// le cambiaría el PIN a otro registrándose otra vez con su documento)
export async function crearAprendiz(db, { nombre, documento, tipoDocumento, ficha, pin }) {
  const fila = {
    documento,
    nombre,
    tipo_documento: tipoDocumento,
    ficha,
    pin: await hashClave(pin),
    version: 1,
    created_at: new Date().toISOString()
  }
  const { changes } = await db.run(
    `INSERT INTO aprendices (documento, nombre, tipo_documento, ficha, pin, version, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`,
    [fila.documento, fila.nombre, fila.tipo_documento, fila.ficha, fila.pin, fila.version, fila.created_at]
  )
  return changes === 1 ? fila : null
}

export async function pinCorrecto(pin, registro) {
  return Boolean(registro) && await verificarClave(pin, registro.pin)
}

// PIN nuevo al azar que el profe le dicta al aprendiz; subir la versión cierra sus sesiones abiertas
export async function reiniciarPin(db, documento) {
  const pin = String(crypto.randomInt(0, 10000)).padStart(4, '0')
  await db.run(
    'UPDATE aprendices SET pin = ?, version = version + 1 WHERE documento = ?',
    [await hashClave(pin), documento]
  )
  await limpiarFallosPin(db, documento)
  return pin
}

export async function tieneFirma(db, documento) {
  return Boolean(await db.get('SELECT documento FROM firmas_aprendiz WHERE documento = ?', [documento]))
}

// Una sola vez: si ya firmó, solo el profe se la puede borrar para que la repita
export async function guardarFirma(db, documento, firma) {
  const { changes } = await db.run(
    'INSERT INTO firmas_aprendiz (documento, firma, created_at) VALUES (?, ?, ?) ON CONFLICT DO NOTHING',
    [documento, firma, new Date().toISOString()]
  )
  return changes === 1
}

// Lo que ve el aprendiz de sí mismo: sus datos y si ya dejó la firma
export async function comoSeVe(db, registro) {
  return { ...datosPublicos(registro), tieneFirma: await tieneFirma(db, registro.documento) }
}

/* ----- PIN fallados (usa la tabla intentos_fallidos de server/seguridad.js) ----- */

const objetivoPin = documento => `pin:${documento}`
const VENTANA_BLOQUEO_MS = MINUTOS_BLOQUEO * 60 * 1000

// Se anota el intento ANTES de revisar el PIN: así 10 intentos al mismo tiempo no se cuelan todos.
// Si el PIN resulta bueno, se borran los fallos con limpiarFallosPin.
export async function anotarIntentoPin(db, ip, documento) {
  const ahora = Date.now()
  await db.run(
    'INSERT INTO intentos_fallidos (ip, objetivo, created_at) VALUES (?, ?, ?)',
    [ip, objetivoPin(documento), new Date(ahora).toISOString()]
  )
  const filas = await db.all(
    'SELECT created_at FROM intentos_fallidos WHERE objetivo = ? AND created_at > ? ORDER BY created_at DESC',
    [objetivoPin(documento), new Date(ahora - VENTANA_BLOQUEO_MS).toISOString()]
  )
  return filas.map(f => f.created_at)
}

// Hasta cuándo sigue bloqueado: cuando el tercer fallo más reciente se salga de la ventana
export function bloqueadoHasta(fallos) {
  if (fallos.length < MAX_FALLOS_PIN) return 0
  return new Date(fallos[MAX_FALLOS_PIN - 1]).getTime() + VENTANA_BLOQUEO_MS
}

export async function limpiarFallosPin(db, documento) {
  await db.run('DELETE FROM intentos_fallidos WHERE objetivo = ?', [objetivoPin(documento)])
}

/* ----- Lista para el profe ----- */

export async function listarAprendices(db) {
  const desde = new Date(Date.now() - VENTANA_BLOQUEO_MS).toISOString()
  const filas = await db.all(`
    SELECT a.*,
      (CASE WHEN f.documento IS NULL THEN 0 ELSE 1 END) AS tiene_firma,
      (SELECT CAST(COUNT(*) AS INTEGER) FROM intentos_fallidos i
        WHERE i.objetivo = 'pin:' || a.documento AND i.created_at > ?) AS fallos
    FROM aprendices a
    LEFT JOIN firmas_aprendiz f ON f.documento = a.documento
  `, [desde])
  return filas
    .map(f => ({ ...datosPublicos(f), tieneFirma: Boolean(Number(f.tiene_firma)), bloqueado: Number(f.fallos) >= MAX_FALLOS_PIN }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
}

export async function corregirAprendiz(db, documento, { nombre, tipoDocumento, ficha }) {
  await db.run(
    'UPDATE aprendices SET nombre = ?, tipo_documento = ?, ficha = ? WHERE documento = ?',
    [nombre, tipoDocumento, ficha, documento]
  )
  return leerAprendiz(db, documento)
}

// Borra la cuenta, la firma, la asistencia y su puesto en el grupo del Caso MAREA. Sus aportes y réplicas
// se quedan en el foro con el nombre que tenían; si se vuelve a registrar con el mismo documento, vuelven a ser suyos.
export async function borrarAprendiz(db, documento) {
  await db.transaction(async tx => {
    await tx.run('DELETE FROM aprendices WHERE documento = ?', [documento])
    await tx.run('DELETE FROM firmas_aprendiz WHERE documento = ?', [documento])
    await tx.run('DELETE FROM asistencia WHERE documento = ?', [documento])
    await tx.run('DELETE FROM intentos_fallidos WHERE objetivo = ?', [objetivoPin(documento)])
    await sacarDeEntrega(tx, documento)
  })
}

/* ----- Autoría en el foro ----- */

export async function guardarAutoria(db, tipo, objetivoId, documento) {
  await db.run(
    'INSERT INTO autoria_aprendiz (tipo, objetivo_id, documento) VALUES (?, ?, ?) ON CONFLICT DO NOTHING',
    [tipo, objetivoId, documento]
  )
}

export async function documentoDelAutor(db, tipo, objetivoId) {
  const fila = await db.get(
    'SELECT documento FROM autoria_aprendiz WHERE tipo = ? AND objetivo_id = ?',
    [tipo, objetivoId]
  )
  return fila?.documento || ''
}

// Al borrar un aporte se van también las autorías de sus réplicas (llamarla antes de borrar los comentarios)
export async function borrarAutoriaDeAporte(db, aporteId) {
  await db.run(
    `DELETE FROM autoria_aprendiz WHERE tipo = 'comentario'
     AND objetivo_id IN (SELECT id FROM comentarios WHERE aporte_id = ?)`,
    [aporteId]
  )
  await db.run("DELETE FROM autoria_aprendiz WHERE tipo = 'aporte' AND objetivo_id = ?", [aporteId])
}

export async function borrarAutoriaDeComentario(db, comentarioId) {
  await db.run("DELETE FROM autoria_aprendiz WHERE tipo = 'comentario' AND objetivo_id = ?", [comentarioId])
}
