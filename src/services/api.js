// Cliente de la API del foro.
// Todos los datos se guardan en la base de datos del servidor (Postgres en Vercel,
// SQLite en local), así que todos los aprendices ven los mismos aportes.
//
// La clave de administrador nunca se guarda en el navegador: al iniciar sesión,
// el servidor entrega un token temporal que se envía en cada petición.

import { idVotante } from './reacciones.js'

const API_BASE = '/api'
const ADMIN_TOKEN_KEY = 'foro-admin-token'

export const EVENTO_SESION_VENCIDA = 'foro:sesion-admin-vencida'

// La sesión del aprendiz va en sessionStorage: en el PC del salón, al cerrar la pestaña nadie queda adentro
const APRENDIZ_SESION_KEY = 'foro-aprendiz-sesion'
export const EVENTO_SESION_APRENDIZ_VENCIDA = 'foro:sesion-aprendiz-vencida'

export function sesionAprendizGuardada() {
  try {
    const sesion = JSON.parse(sessionStorage.getItem(APRENDIZ_SESION_KEY) || 'null')
    return sesion && sesion.expira > Date.now() ? sesion : null
  } catch (e) {
    return null
  }
}

export function guardarSesionAprendiz(sesion) {
  try {
    if (sesion) sessionStorage.setItem(APRENDIZ_SESION_KEY, JSON.stringify(sesion))
    else sessionStorage.removeItem(APRENDIZ_SESION_KEY)
  } catch (e) {
    // Sin almacenamiento la sesión dura hasta recargar la página
  }
}

function getAdminToken() {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY) || ''
  } catch (e) {
    return ''
  }
}

function setAdminToken(token) {
  try {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token)
  } catch (e) {
    // Sin almacenamiento la sesión dura hasta recargar la página
  }
}

export function clearAdminToken() {
  try {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY)
  } catch (e) {
    // Nada que limpiar
  }
}

export function hasAdminToken() {
  return getAdminToken() !== ''
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getAdminToken()
  if (token) headers.Authorization = `Bearer ${token}`
  const aprendiz = sesionAprendizGuardada()
  if (aprendiz) headers['X-Aprendiz-Token'] = aprendiz.token

  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    })
  } catch (e) {
    throw new Error('No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.')
  }

  const esJson = (res.headers.get('content-type') || '').includes('application/json')
  const data = esJson ? await res.json().catch(() => null) : null

  if (!res.ok) {
    if (data && data.sesionVencida) {
      clearAdminToken()
      window.dispatchEvent(new Event(EVENTO_SESION_VENCIDA))
    }
    if (data && data.sesionAprendizVencida) {
      guardarSesionAprendiz(null)
      window.dispatchEvent(new Event(EVENTO_SESION_APRENDIZ_VENCIDA))
    }
    const error = new Error((data && data.error) || `Error del servidor (${res.status})`)
    error.status = res.status
    error.datos = data
    throw error
  }
  if (!esJson) {
    throw new Error('La API no respondió correctamente. Verifica que el backend esté desplegado.')
  }
  return data
}

export function fetchAportes() {
  return request('/aportes')
}

export function fetchAporteById(id) {
  return request(`/aportes/${encodeURIComponent(id)}`)
}

export function saveAporte(data, id = null, clave = '') {
  if (id) {
    return request(`/aportes/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: { autor: data.autor, ficha: data.ficha, pregunta: data.pregunta, respuesta: data.respuesta, clave }
    })
  }
  return request('/aportes', {
    method: 'POST',
    body: { autor: data.autor, ficha: data.ficha, pregunta: data.pregunta, respuesta: data.respuesta, clave_edicion: clave }
  })
}

export function deleteAporte(id, clave = '') {
  return request(`/aportes/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    body: { clave }
  })
}

// Inicia sesión de administrador y guarda el token temporal (no la clave)
export async function loginAdmin(clave) {
  const data = await request('/auth/admin', {
    method: 'POST',
    body: { clave }
  })
  setAdminToken(data.token)
  return data
}

// Comprueba si el token guardado sigue siendo válido
export async function verifyAdminSession() {
  if (!hasAdminToken()) return false
  try {
    const data = await request('/auth/sesion')
    if (!data.admin) clearAdminToken()
    return Boolean(data.admin)
  } catch (e) {
    return false
  }
}

export function verifyClaveAporte(aporteId, clave) {
  return request(`/aportes/${encodeURIComponent(aporteId)}/verificar-clave`, {
    method: 'POST',
    body: { clave }
  })
}

export function calificarAporte(aporteId, { calificacion, retroalimentacion }) {
  return request(`/aportes/${encodeURIComponent(aporteId)}/calificar`, {
    method: 'POST',
    body: { calificacion, retroalimentacion }
  })
}

export function addComentario(aporteId, comentarioData) {
  return request(`/aportes/${encodeURIComponent(aporteId)}/comentarios`, {
    method: 'POST',
    body: comentarioData
  })
}

export function deleteComentario(id) {
  return request(`/comentarios/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  })
}

// Pone (reaccionar = true) o quita (false) la reacción "Útil" de este navegador.
// Responde { reaccionado, total }.
export function fijarReaccion(tipo, id, reaccionar) {
  return request('/reacciones', {
    method: 'POST',
    body: { tipo, id, votante: idVotante(), reaccionar }
  })
}

/* ----- El Juicio de Macondo y Panel del Profe (exclusivos del administrador) ----- */

// Abre (true) o archiva (false) el juicio de un aporte. Responde { juicio }.
export function fijarJuicio(aporteId, abierto) {
  return request(`/aportes/${encodeURIComponent(aporteId)}/juicio`, {
    method: 'POST',
    body: { abierto }
  })
}

export function dictarSentencia(aporteId, { veredicto, sentencia }) {
  return request(`/aportes/${encodeURIComponent(aporteId)}/sentencia`, {
    method: 'POST',
    body: { veredicto, sentencia }
  })
}

// { aportes, replicas } para armar la tabla de notas
export function fetchResumenProfe() {
  return request('/admin/resumen')
}

/* ----- Evaluaciones de Conocimientos (Examen Autónomo) ----- */

// Envía la evaluación completada al servidor
export function enviarEvaluacionAlServidor(datos) {
  return request('/evaluaciones', {
    method: 'POST',
    body: datos
  })
}

// Lista todas las evaluaciones recibidas (solo instructor)
export function fetchEvaluacionesAdmin() {
  return request('/admin/evaluaciones')
}

/* ----- Cuentas de aprendiz ----- */

export function quienSoy() {
  return request('/aprendices/yo')
}

export function registrarAprendiz(datos) {
  return request('/aprendices/registro', { method: 'POST', body: datos })
}

export function entrarAprendiz(documento, pin) {
  return request('/aprendices/entrar', { method: 'POST', body: { documento, pin } })
}

// Tipo de documento o firma (la firma, una sola vez)
export function completarPerfil(datos) {
  return request('/aprendices/perfil', { method: 'POST', body: datos })
}

export function fetchAprendicesAdmin() {
  return request('/admin/aprendices')
}

export function corregirAprendiz(documento, datos) {
  return request(`/admin/aprendices/${encodeURIComponent(documento)}`, { method: 'PUT', body: datos })
}

export function reiniciarPinAprendiz(documento) {
  return request(`/admin/aprendices/${encodeURIComponent(documento)}/reiniciar-pin`, { method: 'POST' })
}

export function borrarFirmaAprendiz(documento) {
  return request(`/admin/aprendices/${encodeURIComponent(documento)}?solo=firma`, { method: 'DELETE' })
}

export function borrarAprendiz(documento) {
  return request(`/admin/aprendices/${encodeURIComponent(documento)}`, { method: 'DELETE' })
}

/* ----- Asistencia (solo instructor) ----- */

export function fetchAsistencia() {
  return request('/admin/asistencia')
}

// Lo mismo más los aprendices y sus firmas, para imprimir
export function fetchPlanillaAsistencia() {
  return request('/admin/asistencia/planilla')
}

export function marcarAsistencia(fecha, documentos, presente) {
  return request('/admin/asistencia', { method: 'PUT', body: { fecha, documentos, presente } })
}

export function guardarEncabezadoAsistencia(encabezado) {
  return request('/admin/asistencia/encabezado', { method: 'PUT', body: encabezado })
}

/* ----- Asistencia con código del día ----- */

export function abrirAsistenciaHoy() {
  return request('/admin/asistencia/abrir', { method: 'POST' })
}

// { abierta, codigo, cambiaEn, abiertaHasta, presentes }
export function fetchCodigoAsistencia() {
  return request('/admin/asistencia/codigo')
}

export function cerrarAsistenciaHoy() {
  return request('/admin/asistencia/cerrar', { method: 'POST' })
}

export function marcarmeConCodigo(codigo) {
  return request('/aprendices/asistencia', { method: 'POST', body: { codigo } })
}

/* ----- Mi boletín ----- */

export function fetchMiBoletin() {
  return request('/aprendices/yo/boletin')
}

/* ----- Entrega del Caso MAREA ----- */

export function fetchCompaneros() {
  return request('/aprendices/companeros')
}

export function fetchMiEntregaCaso() {
  return request('/caso/entrega')
}

export function entregarCaso(respuestas, companeros) {
  return request('/caso/entrega', { method: 'POST', body: { respuestas, companeros } })
}

export function fetchEntregasCaso() {
  return request('/admin/caso/entregas')
}

export function fetchEntregaCaso(id) {
  return request(`/admin/caso/entregas/${encodeURIComponent(id)}`)
}

export function calificarEntregaCaso(id, criterios, retroGeneral) {
  return request(`/admin/caso/entregas/${encodeURIComponent(id)}/calificar`, { method: 'POST', body: { criterios, retroGeneral } })
}

// Solucionario del Caso MAREA (solo instructor)
export function fetchSolucionarioCaso() {
  return request('/admin/caso-ficha/solucionario')
}

// Elimina una evaluación (solo instructor)
export function deleteEvaluacionAdmin(id) {
  return request(`/admin/evaluaciones/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  })
}
