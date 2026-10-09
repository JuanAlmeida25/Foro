import express from 'express'
import cors from 'cors'
import { db } from './db.js'
import crypto from 'node:crypto'

const app = express()
const PORT = process.env.PORT || 3000
const ADMIN_KEY = '2501'

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Autenticación de Administrador
app.post('/api/auth/admin', (req, res) => {
  const { clave } = req.body
  if (clave === ADMIN_KEY) {
    return res.json({ ok: true, role: 'admin', message: 'Acceso de administrador concedido' })
  }
  return res.status(401).json({ ok: false, error: 'Clave de administrador incorrecta' })
})

// Obtener todos los aportes con conteo de comentarios
app.get('/api/aportes', (req, res) => {
  try {
    const query = `
      SELECT 
        a.id, a.autor, a.ficha, a.pregunta, a.respuesta, 
        a.calificacion, a.retroalimentacion, a.calificado_at,
        a.created_at, a.updated_at,
        (CASE WHEN a.clave_edicion != '' THEN 1 ELSE 0 END) as tiene_clave,
        (SELECT COUNT(*) FROM comentarios c WHERE c.aporte_id = a.id) as total_comentarios
      FROM aportes a
      ORDER BY a.created_at DESC
    `
    const rows = db.prepare(query).all()
    res.json(rows)
  } catch (error) {
    console.error('Error al obtener aportes:', error)
    res.status(500).json({ error: 'Error al obtener aportes' })
  }
})

// Obtener un aporte específico por ID con sus comentarios
app.get('/api/aportes/:id', (req, res) => {
  try {
    const aporte = db.prepare(`
      SELECT id, autor, ficha, pregunta, respuesta, calificacion, retroalimentacion, calificado_at, created_at, updated_at,
      (CASE WHEN clave_edicion != '' THEN 1 ELSE 0 END) as tiene_clave
      FROM aportes WHERE id = ?
    `).get(req.params.id)

    if (!aporte) {
      return res.status(404).json({ error: 'Aporte no encontrado' })
    }

    const comentarios = db.prepare(`
      SELECT * FROM comentarios 
      WHERE aporte_id = ? 
      ORDER BY created_at ASC
    `).all(req.params.id)

    res.json({
      ...aporte,
      comentarios
    })
  } catch (error) {
    console.error('Error al obtener aporte:', error)
    res.status(500).json({ error: 'Error al obtener aporte' })
  }
})

// Publicar un nuevo aporte (con clave personal de autor)
app.post('/api/aportes', (req, res) => {
  try {
    const { autor, ficha, pregunta, respuesta, clave_edicion } = req.body
    if (!autor || !autor.trim()) {
      return res.status(400).json({ error: 'El nombre del autor es obligatorio' })
    }
    if (!pregunta || !pregunta.trim()) {
      return res.status(400).json({ error: 'La pregunta es obligatoria' })
    }
    if (!respuesta || !respuesta.trim()) {
      return res.status(400).json({ error: 'La respuesta es obligatoria' })
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const clave = (clave_edicion || '').trim()

    db.prepare(`
      INSERT INTO aportes (id, autor, ficha, pregunta, respuesta, clave_edicion, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      autor.trim(),
      (ficha || '').trim(),
      pregunta.trim(),
      respuesta.trim(),
      clave,
      now,
      now
    )

    const nuevoAporte = db.prepare(`
      SELECT id, autor, ficha, pregunta, respuesta, calificacion, retroalimentacion, calificado_at, created_at, updated_at,
      (CASE WHEN clave_edicion != '' THEN 1 ELSE 0 END) as tiene_clave
      FROM aportes WHERE id = ?
    `).get(id)

    res.status(201).json({ ...nuevoAporte, comentarios: [] })
  } catch (error) {
    console.error('Error al guardar aporte:', error)
    res.status(500).json({ error: 'Error al guardar el aporte' })
  }
})

// Verificar si una clave es válida para editar un aporte (autor o admin 2501)
app.post('/api/aportes/:id/verificar-clave', (req, res) => {
  try {
    const { clave } = req.body
    const aporte = db.prepare('SELECT clave_edicion FROM aportes WHERE id = ?').get(req.params.id)
    if (!aporte) {
      return res.status(404).json({ error: 'Aporte no encontrado' })
    }

    const esAdmin = clave === ADMIN_KEY
    const esAutor = (aporte.clave_edicion && aporte.clave_edicion === clave) || !aporte.clave_edicion

    if (esAdmin || esAutor) {
      return res.json({ ok: true, esAdmin })
    }

    return res.status(401).json({ ok: false, error: 'Clave incorrecta. Solo el autor del aporte o el administrador pueden editarlo.' })
  } catch (error) {
    console.error('Error al verificar clave:', error)
    res.status(500).json({ error: 'Error al verificar clave' })
  }
})

// Actualizar un aporte (solo el autor con su clave o el admin con 2501)
app.put('/api/aportes/:id', (req, res) => {
  try {
    const { autor, ficha, pregunta, respuesta, clave } = req.body
    const aporte = db.prepare('SELECT clave_edicion FROM aportes WHERE id = ?').get(req.params.id)
    if (!aporte) {
      return res.status(404).json({ error: 'Aporte no encontrado' })
    }

    const esAdmin = clave === ADMIN_KEY
    const esAutor = (aporte.clave_edicion && aporte.clave_edicion === clave) || !aporte.clave_edicion

    if (!esAdmin && !esAutor) {
      return res.status(403).json({ error: 'No tienes permiso para editar este aporte. Clave incorrecta.' })
    }

    const now = new Date().toISOString()
    db.prepare(`
      UPDATE aportes 
      SET autor = ?, ficha = ?, pregunta = ?, respuesta = ?, updated_at = ?
      WHERE id = ?
    `).run(
      (autor || '').trim(),
      (ficha || '').trim(),
      (pregunta || '').trim(),
      (respuesta || '').trim(),
      now,
      req.params.id
    )

    const actualizado = db.prepare(`
      SELECT id, autor, ficha, pregunta, respuesta, calificacion, retroalimentacion, calificado_at, created_at, updated_at
      FROM aportes WHERE id = ?
    `).get(req.params.id)

    res.json(actualizado)
  } catch (error) {
    console.error('Error al actualizar aporte:', error)
    res.status(500).json({ error: 'Error al actualizar aporte' })
  }
})

// Calificar un aporte (Exclusivo para el Administrador con clave 2501)
app.post('/api/aportes/:id/calificar', (req, res) => {
  try {
    const { claveAdmin, calificacion, retroalimentacion } = req.body
    if (claveAdmin !== ADMIN_KEY) {
      return res.status(403).json({ error: 'Solo el administrador puede calificar aportes' })
    }

    const aporte = db.prepare('SELECT id FROM aportes WHERE id = ?').get(req.params.id)
    if (!aporte) {
      return res.status(404).json({ error: 'Aporte no encontrado' })
    }

    const notaNum = parseInt(calificacion, 10)
    if (isNaN(notaNum) || notaNum < 0 || notaNum > 100) {
      return res.status(400).json({ error: 'La calificación debe ser un valor numérico entre 0 y 100' })
    }

    const now = new Date().toISOString()
    db.prepare(`
      UPDATE aportes 
      SET calificacion = ?, retroalimentacion = ?, calificado_at = ?
      WHERE id = ?
    `).run(
      notaNum,
      (retroalimentacion || '').trim(),
      now,
      req.params.id
    )

    const calificado = db.prepare(`
      SELECT id, autor, ficha, pregunta, respuesta, calificacion, retroalimentacion, calificado_at, created_at, updated_at
      FROM aportes WHERE id = ?
    `).get(req.params.id)

    res.json(calificado)
  } catch (error) {
    console.error('Error al calificar aporte:', error)
    res.status(500).json({ error: 'Error al calificar el aporte' })
  }
})

// Eliminar un aporte (Admin 2501 o autor con su clave)
app.delete('/api/aportes/:id', (req, res) => {
  try {
    const clave = req.query.clave || req.body?.clave
    const aporte = db.prepare('SELECT clave_edicion FROM aportes WHERE id = ?').get(req.params.id)
    if (!aporte) {
      return res.status(404).json({ error: 'Aporte no encontrado' })
    }

    const esAdmin = clave === ADMIN_KEY
    const esAutor = (aporte.clave_edicion && aporte.clave_edicion === clave) || !aporte.clave_edicion

    if (!esAdmin && !esAutor) {
      return res.status(403).json({ error: 'Permiso denegado. Clave incorrecta para eliminar este aporte.' })
    }

    db.prepare('DELETE FROM comentarios WHERE aporte_id = ?').run(req.params.id)
    db.prepare('DELETE FROM aportes WHERE id = ?').run(req.params.id)
    res.json({ message: 'Aporte eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar aporte:', error)
    res.status(500).json({ error: 'Error al eliminar aporte' })
  }
})

// Agregar un comentario/réplica a un aporte
app.post('/api/aportes/:id/comentarios', (req, res) => {
  try {
    const aporteId = req.params.id
    const { autor, comentario_citado, contenido } = req.body

    if (!autor || !autor.trim() || !contenido || !contenido.trim()) {
      return res.status(400).json({ error: 'El autor y el comentario son requeridos' })
    }

    const aporte = db.prepare('SELECT id FROM aportes WHERE id = ?').get(aporteId)
    if (!aporte) {
      return res.status(404).json({ error: 'Aporte no encontrado' })
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    db.prepare(`
      INSERT INTO comentarios (id, aporte_id, autor, comentario_citado, contenido, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      id,
      aporteId,
      autor.trim(),
      (comentario_citado || '').trim(),
      contenido.trim(),
      now
    )

    const nuevoComentario = db.prepare('SELECT * FROM comentarios WHERE id = ?').get(id)
    res.status(201).json(nuevoComentario)
  } catch (error) {
    console.error('Error al guardar comentario:', error)
    res.status(500).json({ error: 'Error al agregar comentario' })
  }
})

// Eliminar un comentario (Admin o usuario)
app.delete('/api/comentarios/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM comentarios WHERE id = ?').run(req.params.id)
    res.json({ message: 'Comentario eliminado' })
  } catch (error) {
    console.error('Error al eliminar comentario:', error)
    res.status(500).json({ error: 'Error al eliminar comentario' })
  }
})

app.listen(PORT, () => {
  console.log(`Servidor API corriendo en http://localhost:${PORT}`)
})
