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
    const error = new Error((data && data.error) || `Error del servidor (${res.status})`)
    error.status = res.status
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
