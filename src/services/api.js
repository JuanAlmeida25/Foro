import { INITIAL_FORUM_POSTS, LS_FORUM_POSTS_KEY } from '../data/constants.js'

const API_BASE = '/api'
const ADMIN_KEY = '2501'

// Obtener almacenamiento local de respaldo para cuando se despliega en Vercel sin servidor Express
function getLocalForumData() {
  try {
    const raw = localStorage.getItem(LS_FORUM_POSTS_KEY)
    if (!raw) {
      localStorage.setItem(LS_FORUM_POSTS_KEY, JSON.stringify(INITIAL_FORUM_POSTS))
      return JSON.parse(JSON.stringify(INITIAL_FORUM_POSTS))
    }
    const data = JSON.parse(raw)
    if (!Array.isArray(data) || data.length === 0) {
      localStorage.setItem(LS_FORUM_POSTS_KEY, JSON.stringify(INITIAL_FORUM_POSTS))
      return JSON.parse(JSON.stringify(INITIAL_FORUM_POSTS))
    }
    return data
  } catch (e) {
    return JSON.parse(JSON.stringify(INITIAL_FORUM_POSTS))
  }
}

function saveLocalForumData(posts) {
  try {
    localStorage.setItem(LS_FORUM_POSTS_KEY, JSON.stringify(posts))
  } catch (e) {
    console.error('Error guardando en almacenamiento:', e)
  }
}

export async function fetchAportes() {
  try {
    const res = await fetch(`${API_BASE}/aportes`)
    if (res.ok) {
      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        return await res.json()
      }
    }
  } catch (e) {
    // Modo Vercel / Despliegue estático
  }

  // Fallback garantizado: siempre devuelve los aportes con la entrada oficial
  return getLocalForumData()
}

export async function fetchAporteById(id) {
  try {
    const res = await fetch(`${API_BASE}/aportes/${id}`)
    if (res.ok) {
      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        return await res.json()
      }
    }
  } catch (e) {
    // Modo Vercel
  }

  const posts = getLocalForumData()
  const found = posts.find(p => p.id === id)
  if (!found) throw new Error('Aporte no encontrado')
  return found
}

export async function saveAporte(data, id = null, clave = '') {
  try {
    const url = id ? `${API_BASE}/aportes/${id}` : `${API_BASE}/aportes`
    const method = id ? 'PUT' : 'POST'
    const payload = id ? { ...data, clave } : { ...data, clave_edicion: clave }
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (res.ok) {
      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        return await res.json()
      }
    }
  } catch (e) {
    // Continuar con fallback en Vercel
  }

  const posts = getLocalForumData()
  const now = new Date().toISOString()

  if (id) {
    // Actualizar aporte existente
    const index = posts.findIndex(p => p.id === id)
    if (index === -1) throw new Error('Aporte no encontrado')
    const existing = posts[index]
    const esAdmin = clave === ADMIN_KEY
    const esAutor = (existing.clave_edicion && existing.clave_edicion === clave) || !existing.clave_edicion
    if (!esAdmin && !esAutor) {
      throw new Error('Clave incorrecta. Solo el autor o el administrador pueden editar este aporte.')
    }
    const updated = {
      ...existing,
      autor: data.autor,
      ficha: data.ficha,
      pregunta: data.pregunta,
      respuesta: data.respuesta,
      updated_at: now
    }
    posts[index] = updated
    saveLocalForumData(posts)
    return updated
  } else {
    // Crear nuevo aporte
    const newId = 'aporte-' + Date.now()
    const nuevo = {
      id: newId,
      autor: data.autor,
      ficha: data.ficha || '',
      pregunta: data.pregunta,
      respuesta: data.respuesta,
      clave_edicion: clave,
      calificacion: null,
      retroalimentacion: '',
      calificado_at: '',
      created_at: now,
      updated_at: now,
      total_comentarios: 0,
      comentarios: []
    }
    posts.unshift(nuevo)
    saveLocalForumData(posts)
    return nuevo
  }
}

export async function deleteAporte(id, clave = '') {
  try {
    const res = await fetch(`${API_BASE}/aportes/${id}?clave=${encodeURIComponent(clave)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clave })
    })
    if (res.ok) {
      return await res.json()
    }
  } catch (e) {
    // Continuar en Vercel
  }

  const posts = getLocalForumData()
  const found = posts.find(p => p.id === id)
  if (!found) throw new Error('Aporte no encontrado')

  const esAdmin = clave === ADMIN_KEY
  const esAutor = (found.clave_edicion && found.clave_edicion === clave) || !found.clave_edicion
  if (!esAdmin && !esAutor) {
    throw new Error('Clave incorrecta. No tienes permiso para eliminar este aporte.')
  }

  const filtered = posts.filter(p => p.id !== id)
  saveLocalForumData(filtered)
  return { message: 'Aporte eliminado' }
}

export async function verifyAdmin(clave) {
  try {
    const res = await fetch(`${API_BASE}/auth/admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clave })
    })
    if (res.ok) {
      return await res.json()
    }
  } catch (e) {
    // Modo Vercel
  }

  if (clave === ADMIN_KEY) {
    return { ok: true, role: 'admin' }
  }
  throw new Error('Clave de administrador incorrecta')
}

export async function verifyClaveAporte(aporteId, clave) {
  try {
    const res = await fetch(`${API_BASE}/aportes/${aporteId}/verificar-clave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clave })
    })
    if (res.ok) {
      return await res.json()
    }
  } catch (e) {
    // Modo Vercel
  }

  const posts = getLocalForumData()
  const found = posts.find(p => p.id === aporteId)
  if (!found) throw new Error('Aporte no encontrado')

  const esAdmin = clave === ADMIN_KEY
  const esAutor = (found.clave_edicion && found.clave_edicion === clave) || !found.clave_edicion
  if (esAdmin || esAutor) {
    return { ok: true }
  }
  throw new Error('Clave incorrecta. Solo el autor del aporte o el administrador pueden editarlo.')
}

export async function calificarAporte(aporteId, { claveAdmin, calificacion, retroalimentacion }) {
  try {
    const res = await fetch(`${API_BASE}/aportes/${aporteId}/calificar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claveAdmin, calificacion, retroalimentacion })
    })
    if (res.ok) {
      return await res.json()
    }
  } catch (e) {
    // Modo Vercel
  }

  if (claveAdmin !== ADMIN_KEY) {
    throw new Error('Solo el administrador puede calificar')
  }

  const posts = getLocalForumData()
  const found = posts.find(p => p.id === aporteId)
  if (!found) throw new Error('Aporte no encontrado')

  found.calificacion = parseInt(calificacion, 10)
  found.retroalimentacion = retroalimentacion || ''
  found.calificado_at = new Date().toISOString()

  saveLocalForumData(posts)
  return found
}

export async function addComentario(aporteId, comentarioData) {
  try {
    const res = await fetch(`${API_BASE}/aportes/${aporteId}/comentarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comentarioData)
    })
    if (res.ok) {
      return await res.json()
    }
  } catch (e) {
    // Modo Vercel
  }

  const posts = getLocalForumData()
  const found = posts.find(p => p.id === aporteId)
  if (!found) throw new Error('Aporte no encontrado')

  const nuevo = {
    id: 'c-' + Date.now(),
    aporte_id: aporteId,
    autor: comentarioData.autor,
    comentario_citado: comentarioData.comentario_citado || '',
    contenido: comentarioData.contenido,
    created_at: new Date().toISOString()
  }

  if (!Array.isArray(found.comentarios)) {
    found.comentarios = []
  }
  found.comentarios.push(nuevo)
  found.total_comentarios = found.comentarios.length
  saveLocalForumData(posts)
  return nuevo
}

export async function deleteComentario(id) {
  try {
    const res = await fetch(`${API_BASE}/comentarios/${id}`, {
      method: 'DELETE'
    })
    if (res.ok) {
      return await res.json()
    }
  } catch (e) {
    // Modo Vercel
  }

  const posts = getLocalForumData()
  posts.forEach(p => {
    if (Array.isArray(p.comentarios)) {
      p.comentarios = p.comentarios.filter(c => c.id !== id)
      p.total_comentarios = p.comentarios.length
    }
  })
  saveLocalForumData(posts)
  return { message: 'Comentario eliminado' }
}
