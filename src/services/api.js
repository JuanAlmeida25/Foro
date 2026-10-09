const API_BASE = '/api'

export async function fetchAportes() {
  const res = await fetch(`${API_BASE}/aportes`)
  if (!res.ok) throw new Error('Error al obtener aportes')
  return res.json()
}

export async function fetchAporteById(id) {
  const res = await fetch(`${API_BASE}/aportes/${id}`)
  if (!res.ok) throw new Error('Error al obtener el aporte')
  return res.json()
}

export async function saveAporte(data, id = null, clave = '') {
  const url = id ? `${API_BASE}/aportes/${id}` : `${API_BASE}/aportes`
  const method = id ? 'PUT' : 'POST'
  const payload = id ? { ...data, clave } : data
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Error al guardar el aporte')
  }
  return res.json()
}

export async function deleteAporte(id, clave = '') {
  const res = await fetch(`${API_BASE}/aportes/${id}?clave=${encodeURIComponent(clave)}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clave })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Error al eliminar el aporte')
  }
  return res.json()
}

export async function verifyAdmin(clave) {
  const res = await fetch(`${API_BASE}/auth/admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clave })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Clave de administrador incorrecta')
  }
  return res.json()
}

export async function verifyClaveAporte(aporteId, clave) {
  const res = await fetch(`${API_BASE}/aportes/${aporteId}/verificar-clave`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clave })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Clave de edición incorrecta')
  }
  return res.json()
}

export async function calificarAporte(aporteId, { claveAdmin, calificacion, retroalimentacion }) {
  const res = await fetch(`${API_BASE}/aportes/${aporteId}/calificar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ claveAdmin, calificacion, retroalimentacion })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Error al calificar el aporte')
  }
  return res.json()
}

export async function addComentario(aporteId, comentarioData) {
  const res = await fetch(`${API_BASE}/aportes/${aporteId}/comentarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(comentarioData)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Error al guardar el comentario')
  }
  return res.json()
}

export async function deleteComentario(id) {
  const res = await fetch(`${API_BASE}/comentarios/${id}`, {
    method: 'DELETE'
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Error al eliminar el comentario')
  }
  return res.json()
}
