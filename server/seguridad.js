// Seguridad del foro: clave de administrador, sesión de administrador,
// claves de autor cifradas y límite de intentos fallidos.

import crypto from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(crypto.scrypt)

/* ------------------------------------------------------------------ */
/* Clave de administrador                                              */
/* ------------------------------------------------------------------ */

// La clave vive SOLO en el servidor: nunca se envía al navegador ni se escribe en el código.
// - Se define con la variable de entorno ADMIN_KEY: en Vercel (Settings → Environment
//   Variables, y volver a desplegar) y en local dentro de .env.local.
// - Si falta o es muy corta, el ingreso de administrador queda cerrado. El foro sigue
//   funcionando para los aprendices; es mejor un profe sin llave que una puerta sin candado.
export const LONGITUD_MINIMA_CLAVE_ADMIN = 6

const ADMIN_KEY = (process.env.ADMIN_KEY || '').trim()
const adminHabilitado = ADMIN_KEY.length >= LONGITUD_MINIMA_CLAVE_ADMIN

if (!adminHabilitado) {
  console.warn(
    `[seguridad] ADMIN_KEY no está definida o tiene menos de ${LONGITUD_MINIMA_CLAVE_ADMIN} caracteres: ` +
    'el ingreso de administrador queda deshabilitado.'
  )
}

// Compara dos textos sin revelar por el tiempo de respuesta cuántos caracteres coinciden.
function igualesSeguro(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest()
  const hb = crypto.createHash('sha256').update(String(b)).digest()
  return crypto.timingSafeEqual(ha, hb)
}

export function esClaveAdmin(clave) {
  return adminHabilitado && typeof clave === 'string' && clave !== '' && igualesSeguro(clave, ADMIN_KEY)
}

/* ------------------------------------------------------------------ */
/* Sesión de administrador                                             */
/* ------------------------------------------------------------------ */

// Al iniciar sesión, el servidor entrega un token firmado que vence en 8 horas.
// El navegador lo envía en cada petición (cabecera Authorization) en lugar de la clave.
const DURACION_SESION_MS = 8 * 60 * 60 * 1000

// El secreto que firma los tokens sale de SESSION_SECRET (cámbienlo para cerrar todas las
// sesiones abiertas). Si no existe, se deriva de ADMIN_KEY, que ya es larga y privada.
// Sin ninguna de las dos se usa uno al azar: el admin no puede entrar de todas formas, y las
// sesiones de los aprendices solo duran mientras viva el servidor (en Vercel, casi nada).
const SESSION_SECRET = (process.env.SESSION_SECRET || '').trim()
const secretoSesion = SESSION_SECRET
  ? crypto.createHash('sha256').update('foro-sesion-admin:' + SESSION_SECRET).digest()
  : adminHabilitado
    ? crypto.createHash('sha256').update('foro-sesion-admin:' + ADMIN_KEY).digest()
    : crypto.randomBytes(32)

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
/* Sesión de aprendiz                                                  */
/* ------------------------------------------------------------------ */

// Una jornada larga de clase. En el PC del salón igual se cierra al cerrar la pestaña.
// El token lleva la "versión" del PIN: si el profe se lo reinicia, las sesiones viejas se mueren solas.
// Viaja en la cabecera X-Aprendiz-Token, aparte del Authorization del admin, para no confundirlos.
const DURACION_SESION_APRENDIZ_MS = 6 * 60 * 60 * 1000

export function crearSesionAprendiz(documento, version) {
  const expira = Date.now() + DURACION_SESION_APRENDIZ_MS
  const datos = `aprendiz.${documento}.${version}.${expira}`
  return { token: `${datos}.${firmar(datos)}`, expira }
}

// Devuelve { documento, version } si el token es bueno y no ha vencido; si no, null
export function leerSesionAprendiz(token) {
  if (typeof token !== 'string' || !token) return null
  const partes = token.split('.')
  if (partes.length !== 5 || partes[0] !== 'aprendiz') return null
  const [, documento, version, expira, firma] = partes
  if (!/^\d{6,15}$/.test(documento) || !/^\d+$/.test(version)) return null
  if (!Number.isFinite(Number(expira)) || Number(expira) < Date.now()) return null
  if (!igualesSeguro(firma, firmar(partes.slice(0, 4).join('.')))) return null
  return { documento, version: Number(version) }
}

// Identificador de un aprendiz para mostrárselo a sus compañeros sin regar su número de documento.
// Va firmado con el secreto del servidor: no se puede devolver al documento probando cédulas
export function referenciaAprendiz(documento) {
  return firmar(`ref.${documento}`).slice(0, 16)
}

export function tokenAprendizDeLaPeticion(req) {
  const cabecera = req.headers['x-aprendiz-token']
  return typeof cabecera === 'string' ? cabecera.trim() : ''
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
