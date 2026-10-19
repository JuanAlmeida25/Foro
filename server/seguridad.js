// Seguridad del foro: clave de administrador, sesión de administrador,
// claves de autor cifradas y límite de intentos fallidos.

import crypto from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(crypto.scrypt)

/* ------------------------------------------------------------------ */
/* Clave de administrador                                              */
/* ------------------------------------------------------------------ */

// La clave vive SOLO en el servidor: nunca se envía al navegador.
// - Por defecto es CLAVE-VIEJA, en Vercel y en local.
// - Para cambiarla sin tocar el código, define la variable de entorno ADMIN_KEY
//   en Vercel (Settings → Environment Variables) y vuelve a desplegar.
const CLAVE_ADMIN_POR_DEFECTO = 'CLAVE-VIEJA'

const ADMIN_KEY = (process.env.ADMIN_KEY || '').trim() || CLAVE_ADMIN_POR_DEFECTO

// Compara dos textos sin revelar por el tiempo de respuesta cuántos caracteres coinciden.
function igualesSeguro(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest()
  const hb = crypto.createHash('sha256').update(String(b)).digest()
  return crypto.timingSafeEqual(ha, hb)
}

export function esClaveAdmin(clave) {
  return typeof clave === 'string' && clave !== '' && igualesSeguro(clave, ADMIN_KEY)
}

/* ------------------------------------------------------------------ */
/* Sesión de administrador                                             */
/* ------------------------------------------------------------------ */

// Al iniciar sesión, el servidor entrega un token firmado que vence en 8 horas.
// El navegador lo envía en cada petición (cabecera Authorization) en lugar de la clave.
const DURACION_SESION_MS = 8 * 60 * 60 * 1000
const secretoSesion = crypto.createHash('sha256').update('foro-sesion-admin:' + ADMIN_KEY).digest()

function firmar(texto) {
  return crypto.createHmac('sha256', secretoSesion).update(texto).digest('base64url')
}

export function crearSesionAdmin() {
  const expira = Date.now() + DURACION_SESION_MS
  const datos = `admin.${expira}`
  return { token: `${datos}.${firmar(datos)}`, expira }
}

export function sesionAdminValida(token) {
  if (typeof token !== 'string' || !token) return false
  const partes = token.split('.')
  if (partes.length !== 3 || partes[0] !== 'admin') return false
  const expira = Number(partes[1])
  if (!Number.isFinite(expira) || expira < Date.now()) return false
  return igualesSeguro(partes[2], firmar(`admin.${partes[1]}`))
}

export function tokenDeLaPeticion(req) {
  const cabecera = req.headers.authorization || ''
  return cabecera.startsWith('Bearer ') ? cabecera.slice(7).trim() : ''
}

/* ------------------------------------------------------------------ */
/* Claves de autor (se guardan cifradas con scrypt)                    */
/* ------------------------------------------------------------------ */

const PREFIJO_HASH = 'scrypt$'

export const LONGITUD_MINIMA_CLAVE_AUTOR = 4
export const LONGITUD_MAXIMA_CLAVE_AUTOR = 64

export function esHash(valor) {
  return typeof valor === 'string' && valor.startsWith(PREFIJO_HASH)
}

export async function hashClave(clave) {
  const sal = crypto.randomBytes(16)
  const hash = await scrypt(clave, sal, 32)
  return `${PREFIJO_HASH}${sal.toString('hex')}$${hash.toString('hex')}`
}

export async function verificarClave(clave, guardada) {
  if (typeof clave !== 'string' || clave === '' || typeof guardada !== 'string' || guardada === '') {
    return false
  }
  // Clave antigua que todavía no se ha cifrado (la migración las cifra al arrancar)
  if (!esHash(guardada)) return igualesSeguro(clave, guardada)

  const [, salHex, hashHex] = guardada.split('$')
  const esperado = Buffer.from(hashHex || '', 'hex')
  if (!salHex || esperado.length === 0) return false
  const calculado = await scrypt(clave, Buffer.from(salHex, 'hex'), esperado.length)
  return crypto.timingSafeEqual(calculado, esperado)
}

/* ------------------------------------------------------------------ */
/* Límite de intentos fallidos                                         */
/* ------------------------------------------------------------------ */

// Máximo 8 claves incorrectas cada 15 minutos por persona (IP) y por aporte,
// para que nadie pueda probar los 10.000 PIN posibles.
export const MAX_INTENTOS = 8
const VENTANA_MS = 15 * 60 * 1000

export const MENSAJE_DEMASIADOS_INTENTOS =
  'Demasiados intentos fallidos. Espera 15 minutos e inténtalo de nuevo.'

export function ipDeLaPeticion(req) {
  // En Vercel estas cabeceras las escribe la propia plataforma con la IP real del visitante
  const reenviada = req.headers['x-forwarded-for']
  if (typeof reenviada === 'string' && reenviada) return reenviada.split(',')[0].trim()
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'desconocida'
}

// "maximo" permite otros límites con la misma tabla, p. ej. para las reacciones (server/reacciones.js)
export async function demasiadosIntentos(db, ip, objetivo, maximo = MAX_INTENTOS) {
  const desde = new Date(Date.now() - VENTANA_MS).toISOString()
  const fila = await db.get(
    'SELECT CAST(COUNT(*) AS INTEGER) AS n FROM intentos_fallidos WHERE ip = ? AND objetivo = ? AND created_at > ?',
    [ip, objetivo, desde]
  )
  return fila.n >= maximo
}

export async function registrarFallo(db, ip, objetivo) {
  const ahora = Date.now()
  await db.run(
    'INSERT INTO intentos_fallidos (ip, objetivo, created_at) VALUES (?, ?, ?)',
    [ip, objetivo, new Date(ahora).toISOString()]
  )
  // Borrar registros de más de un día para que la tabla no crezca
  await db.run('DELETE FROM intentos_fallidos WHERE created_at < ?', [new Date(ahora - 24 * 60 * 60 * 1000).toISOString()])
}

export async function limpiarFallos(db, ip, objetivo) {
  await db.run('DELETE FROM intentos_fallidos WHERE ip = ? AND objetivo = ?', [ip, objetivo])
}
