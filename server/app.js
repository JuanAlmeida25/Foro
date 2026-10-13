import express from 'express'
import cors from 'cors'
import crypto from 'node:crypto'
import { getDb, dbEngine } from './database.js'

const app = express()
const ADMIN_KEY = 'CLAVE-VIEJA'

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Conectar con la base de datos antes de atender cualquier ruta de la API
app.use('/api', async (req, res, next) => {
  try {
    req.db = await getDb()
    next()
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error)
    const mensaje = error.code === 'SIN_BASE_DE_DATOS'
      ? error.message
      : 'No se pudo conectar con la base de datos'
    res.status(503).json({ error: mensaje })
  }
})

// Comprobar que la API y la base de datos responden (útil tras desplegar)
app.get('/api/health', async (req, res) => {
  try {
    await req.db.get('SELECT 1 AS ok')
    res.json({ ok: true, baseDeDatos: dbEngine })
  } catch (error) {
    console.error('Error en health check:', error)
    res.status(503).json({ ok: false, error: 'La base de datos no responde' })
  }
})

// Autenticación de Administrador
app.post('/api/auth/admin', (req, res) => {
  const { clave } = req.body
  if (clave === ADMIN_KEY) {
    return res.json({ ok: true, role: 'admin', message: 'Acceso de administrador concedido' })
  }
  return res.status(401).json({ ok: false, error: 'Clave de administrador incorrecta' })
})

// Obtener todos los aportes con conteo de comentarios
app.get('/api/aportes', async (req, res) => {
  try {
    const rows = await req.db.all(`
      SELECT
        a.id, a.autor, a.ficha, a.pregunta, a.respuesta,
        a.calificacion, a.retroalimentacion, a.calificado_at,
        a.created_at, a.updated_at,
        (CASE WHEN a.clave_edicion != '' THEN 1 ELSE 0 END) as tiene_clave,
        (SELECT CAST(COUNT(*) AS INTEGER) FROM comentarios c WHERE c.aporte_id = a.id) as total_comentarios
      FROM aportes a
      ORDER BY a.created_at DESC
    `)
    res.json(rows)
  } catch (error) {
    console.error('Error al obtener aportes:', error)
    res.status(500).json({ error: 'Error al obtener aportes' })
  }
})

// Obtener un aporte específico por ID con sus comentarios
app.get('/api/aportes/:id', async (req, res) => {
  try {
    const aporte = await req.db.get(`
      SELECT id, autor, ficha, pregunta, respuesta, calificacion, retroalimentacion, calificado_at, created_at, updated_at,
      (CASE WHEN clave_edicion != '' THEN 1 ELSE 0 END) as tiene_clave
      FROM aportes WHERE id = ?
    `, [req.params.id])

    if (!aporte) {
      return res.status(404).json({ error: 'Aporte no encontrado' })
    }

    const comentarios = await req.db.all(`
      SELECT * FROM comentarios
      WHERE aporte_id = ?
      ORDER BY created_at ASC
    `, [req.params.id])

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
app.post('/api/aportes', async (req, res) => {
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

    await req.db.run(`
      INSERT INTO aportes (id, autor, ficha, pregunta, respuesta, clave_edicion, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      autor.trim(),
      (ficha || '').trim(),
      pregunta.trim(),
      respuesta.trim(),
      clave,
      now,
      now
    ])

    const nuevoAporte = await req.db.get(`
      SELECT id, autor, ficha, pregunta, respuesta, calificacion, retroalimentacion, calificado_at, created_at, updated_at,
      (CASE WHEN clave_edicion != '' THEN 1 ELSE 0 END) as tiene_clave
      FROM aportes WHERE id = ?
    `, [id])

    res.status(201).json({ ...nuevoAporte, comentarios: [] })
  } catch (error) {
    console.error('Error al guardar aporte:', error)
    res.status(500).json({ error: 'Error al guardar el aporte' })
  }
})

// Verificar si una clave es válida para editar un aporte (autor o admin CLAVE-VIEJA)
app.post('/api/aportes/:id/verificar-clave', async (req, res) => {
  try {
    const { clave } = req.body
    const aporte = await req.db.get('SELECT clave_edicion FROM aportes WHERE id = ?', [req.params.id])
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

// Actualizar un aporte (solo el autor con su clave o el admin con CLAVE-VIEJA)
app.put('/api/aportes/:id', async (req, res) => {
  try {
    const { autor, ficha, pregunta, respuesta, clave } = req.body
    const aporte = await req.db.get('SELECT clave_edicion FROM aportes WHERE id = ?', [req.params.id])
    if (!aporte) {
      return res.status(404).json({ error: 'Aporte no encontrado' })
    }

    const esAdmin = clave === ADMIN_KEY
    const esAutor = (aporte.clave_edicion && aporte.clave_edicion === clave) || !aporte.clave_edicion

    if (!esAdmin && !esAutor) {
      return res.status(403).json({ error: 'No tienes permiso para editar este aporte. Clave incorrecta.' })
    }

    const now = new Date().toISOString()
    await req.db.run(`
      UPDATE aportes
      SET autor = ?, ficha = ?, pregunta = ?, respuesta = ?, updated_at = ?
      WHERE id = ?
    `, [
      (autor || '').trim(),
      (ficha || '').trim(),
      (pregunta || '').trim(),
      (respuesta || '').trim(),
      now,
      req.params.id
    ])

    const actualizado = await req.db.get(`
      SELECT id, autor, ficha, pregunta, respuesta, calificacion, retroalimentacion, calificado_at, created_at, updated_at
      FROM aportes WHERE id = ?
    `, [req.params.id])

    res.json(actualizado)
  } catch (error) {
    console.error('Error al actualizar aporte:', error)
    res.status(500).json({ error: 'Error al actualizar aporte' })
  }
})

// Calificar un aporte (Exclusivo para el Administrador con clave CLAVE-VIEJA)
app.post('/api/aportes/:id/calificar', async (req, res) => {
  try {
    const { claveAdmin, calificacion, retroalimentacion } = req.body
    if (claveAdmin !== ADMIN_KEY) {
      return res.status(403).json({ error: 'Solo el administrador puede calificar aportes' })
    }

    const aporte = await req.db.get('SELECT id FROM aportes WHERE id = ?', [req.params.id])
    if (!aporte) {
      return res.status(404).json({ error: 'Aporte no encontrado' })
    }

    const notaNum = parseInt(calificacion, 10)
    if (isNaN(notaNum) || notaNum < 0 || notaNum > 100) {
      return res.status(400).json({ error: 'La calificación debe ser un valor numérico entre 0 y 100' })
    }

    const now = new Date().toISOString()
    await req.db.run(`
      UPDATE aportes
      SET calificacion = ?, retroalimentacion = ?, calificado_at = ?
      WHERE id = ?
    `, [
      notaNum,
      (retroalimentacion || '').trim(),
      now,
      req.params.id
    ])

    const calificado = await req.db.get(`
      SELECT id, autor, ficha, pregunta, respuesta, calificacion, retroalimentacion, calificado_at, created_at, updated_at
      FROM aportes WHERE id = ?
    `, [req.params.id])

    res.json(calificado)
  } catch (error) {
    console.error('Error al calificar aporte:', error)
    res.status(500).json({ error: 'Error al calificar el aporte' })
  }
})

// Eliminar un aporte (Admin CLAVE-VIEJA o autor con su clave)
app.delete('/api/aportes/:id', async (req, res) => {
  try {
    const clave = req.query.clave || req.body?.clave
    const aporte = await req.db.get('SELECT clave_edicion FROM aportes WHERE id = ?', [req.params.id])
    if (!aporte) {
      return res.status(404).json({ error: 'Aporte no encontrado' })
    }

    const esAdmin = clave === ADMIN_KEY
    const esAutor = (aporte.clave_edicion && aporte.clave_edicion === clave) || !aporte.clave_edicion

    if (!esAdmin && !esAutor) {
      return res.status(403).json({ error: 'Permiso denegado. Clave incorrecta para eliminar este aporte.' })
    }

    await req.db.run('DELETE FROM comentarios WHERE aporte_id = ?', [req.params.id])
    await req.db.run('DELETE FROM aportes WHERE id = ?', [req.params.id])
    res.json({ message: 'Aporte eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar aporte:', error)
    res.status(500).json({ error: 'Error al eliminar aporte' })
  }
})

// Agregar un comentario/réplica a un aporte
app.post('/api/aportes/:id/comentarios', async (req, res) => {
  try {
    const aporteId = req.params.id
    const { autor, comentario_citado, contenido } = req.body

    if (!autor || !autor.trim() || !contenido || !contenido.trim()) {
      return res.status(400).json({ error: 'El autor y el comentario son requeridos' })
    }

    const aporte = await req.db.get('SELECT id FROM aportes WHERE id = ?', [aporteId])
    if (!aporte) {
      return res.status(404).json({ error: 'Aporte no encontrado' })
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    await req.db.run(`
      INSERT INTO comentarios (id, aporte_id, autor, comentario_citado, contenido, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      id,
      aporteId,
      autor.trim(),
      (comentario_citado || '').trim(),
      contenido.trim(),
      now
    ])

    const nuevoComentario = await req.db.get('SELECT * FROM comentarios WHERE id = ?', [id])
    res.status(201).json(nuevoComentario)
  } catch (error) {
    console.error('Error al guardar comentario:', error)
    res.status(500).json({ error: 'Error al agregar comentario' })
  }
})

// Eliminar un comentario (Admin o usuario)
app.delete('/api/comentarios/:id', async (req, res) => {
  try {
    await req.db.run('DELETE FROM comentarios WHERE id = ?', [req.params.id])
    res.json({ message: 'Comentario eliminado' })
  } catch (error) {
    console.error('Error al eliminar comentario:', error)
    res.status(500).json({ error: 'Error al eliminar comentario' })
  }
})

// Cualquier otra ruta /api que no exista
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Ruta de la API no encontrada' })
})

export default app
