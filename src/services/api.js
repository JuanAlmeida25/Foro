// Cliente de la API del foro.
// Todos los datos se guardan en la base de datos del servidor (Postgres en Vercel,
// SQLite en local), así que todos los aprendices ven los mismos aportes.

const API_BASE = '/api'

async function request(path, { method = 'GET', body } = {}) {
  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined
    })
  } catch (e) {
    throw new Error('No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.')
  }

  const esJson = (res.headers.get('content-type') || '').includes('application/json')
  const data = esJson ? await res.json().catch(() => null) : null

  if (!res.ok) {
    throw new Error((data && data.error) || `Error del servidor (${res.status})`)
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
      body: { ...data, clave }
    })
  }
  return request('/aportes', {
    method: 'POST',
    body: { ...data, clave_edicion: clave }
  })
}

export function deleteAporte(id, clave = '') {
  return request(`/aportes/${encodeURIComponent(id)}?clave=${encodeURIComponent(clave)}`, {
    method: 'DELETE'
  })
}

export function verifyAdmin(clave) {
  return request('/auth/admin', {
    method: 'POST',
    body: { clave }
  })
}

export function verifyClaveAporte(aporteId, clave) {
  return request(`/aportes/${encodeURIComponent(aporteId)}/verificar-clave`, {
    method: 'POST',
    body: { clave }
  })
}

export function calificarAporte(aporteId, { claveAdmin, calificacion, retroalimentacion }) {
  return request(`/aportes/${encodeURIComponent(aporteId)}/calificar`, {
    method: 'POST',
    body: { claveAdmin, calificacion, retroalimentacion }
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
