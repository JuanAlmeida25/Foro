import express from 'express'
import crypto from 'node:crypto'
import { getDb, dbEngine } from './database.js'
import {
  esClaveAdmin,
  crearSesionAdmin,
  sesionAdminValida,
  tokenDeLaPeticion,
  hashClave,
  verificarClave,
  LONGITUD_MINIMA_CLAVE_AUTOR,
  LONGITUD_MAXIMA_CLAVE_AUTOR,
  ipDeLaPeticion,
  demasiadosIntentos,
  registrarFallo,
  limpiarFallos,
  MENSAJE_DEMASIADOS_INTENTOS
} from './seguridad.js'
import {
  TIPOS_REACCION,
  MAX_REACCIONES_POR_IP,
  OBJETIVO_LIMITE_REACCIONES,
  sqlTotalReacciones,
  votanteValido,
  objetivoExiste,
  fijarReaccion,
  borrarReaccionesDeAporte,
  borrarReaccionesDeComentario
} from './reacciones.js'
import {
  BANDOS,
  VEREDICTOS,
  MAX_SENTENCIA,
  obtenerJuicio,
  abrirJuicio,
  archivarJuicio,
  dictarSentencia,
  guardarBando,
  borrarJuicioDeAporte,
  borrarBandoDeComentario
} from './juicio.js'

const app = express()

// El frontend y la API están en el mismo dominio, así que no se habilita CORS:
// otras páginas web no pueden usar esta API desde el navegador de un visitante.
app.disable('x-powered-by')
app.use(express.json({ limit: '200kb' }))

// Conectar con la base de datos antes de atender cualquier ruta de la API.
// Las pruebas pueden usar otra base con app.set('obtenerDb', () => adaptador).
app.use('/api', async (req, res, next) => {
  try {
    req.db = await (req.app.get('obtenerDb') || getDb)()
    next()
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error)
    const mensaje = error.code === 'SIN_BASE_DE_DATOS'
      ? error.message
      : 'No se pudo conectar con la base de datos'
    res.status(503).json({ error: mensaje })
  }
})

// Identificar si la petición viene de un administrador con sesión válida
app.use('/api', (req, res, next) => {
  const token = tokenDeLaPeticion(req)
  req.esAdmin = sesionAdminValida(token)
  req.sesionVencida = Boolean(token) && !req.esAdmin
  next()
})

/* ----- Utilidades ----- */

// Toma un texto del cuerpo de la petición; cualquier otro tipo de dato cuenta como vacío
const texto = valor => (typeof valor === 'string' ? valor.trim() : '')

const LIMITES = {
  autor: ['nombre', 120],
  ficha: ['ficha', 60],
  pregunta: ['pregunta', 2000],
  respuesta: ['respuesta', 30000],
  comentario_citado: ['cita', 2000],
  contenido: ['comentario', 10000]
}

// Devuelve un mensaje de error si algún campo supera su tamaño máximo
function campoDemasiadoLargo(campos) {
  for (const [clave, valor] of Object.entries(campos)) {
    const [nombre, maximo] = LIMITES[clave]
    if (valor.length > maximo) {
      return `El campo "${nombre}" es demasiado largo (máximo ${maximo.toLocaleString('es-CO')} caracteres).`
    }
  }
  return null
}

// Solo deja pasar a un administrador con sesión válida
function exigirAdmin(req, res, mensaje) {
  if (req.esAdmin) return true
  if (req.sesionVencida) {
    res.status(401).json({ error: 'Tu sesión de administrador venció. Vuelve a ingresar.', sesionVencida: true })
  } else {
    res.status(403).json({ error: mensaje })
  }
  return false
}

// Comprueba que quien edita o elimina un aporte sea su autor (con su clave) o el administrador.
// Devuelve el aporte si está autorizado; si no, responde con el error y devuelve null.
async function autorizarSobreAporte(req, res, id, clave, mensajeDenegado) {
  const ip = ipDeLaPeticion(req)
  const objetivo = `aporte:${id}`

  if (!req.esAdmin && await demasiadosIntentos(req.db, ip, objetivo)) {
    res.status(429).json({ error: MENSAJE_DEMASIADOS_INTENTOS })
    return null
  }

  const aporte = await req.db.get('SELECT id, clave_edicion FROM aportes WHERE id = ?', [id])
  if (!aporte) {
    res.status(404).json({ error: 'Aporte no encontrado' })
    return null
  }

  if (req.esAdmin) return aporte

  if (await verificarClave(texto(clave), aporte.clave_edicion)) {
    await limpiarFallos(req.db, ip, objetivo)
    return aporte
  }

  if (!aporte.clave_edicion) {
    res.status(403).json({ error: 'Este aporte no tiene clave de autor: solo el administrador puede modificarlo.' })
    return null
  }

  await registrarFallo(req.db, ip, objetivo)
  res.status(401).json({ error: mensajeDenegado })
  return null
}

const COLUMNAS_APORTE = `
  id, autor, ficha, pregunta, respuesta, calificacion, retroalimentacion, calificado_at, created_at, updated_at,
  (CASE WHEN clave_edicion != '' THEN 1 ELSE 0 END) as tiene_clave,
  ${sqlTotalReacciones('aporte', 'aportes.id')} as total_reacciones
`

/* ----- Rutas ----- */

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

// Iniciar sesión de administrador: devuelve un token que vence en 8 horas
app.post('/api/auth/admin', async (req, res) => {
  try {
    const ip = ipDeLaPeticion(req)
    if (await demasiadosIntentos(req.db, ip, 'admin')) {
      return res.status(429).json({ ok: false, error: MENSAJE_DEMASIADOS_INTENTOS })
    }

    if (!esClaveAdmin(texto(req.body?.clave))) {
      await registrarFallo(req.db, ip, 'admin')
      return res.status(401).json({ ok: false, error: 'Clave de administrador incorrecta' })
    }

    await limpiarFallos(req.db, ip, 'admin')
    const { token, expira } = crearSesionAdmin()
    res.json({ ok: true, role: 'admin', token, expira, message: 'Acceso de administrador concedido' })
  } catch (error) {
    console.error('Error al iniciar sesión de administrador:', error)
    res.status(500).json({ ok: false, error: 'Error al iniciar sesión' })
  }
})

// Saber si la sesión de administrador guardada en el navegador sigue siendo válida
app.get('/api/auth/sesion', (req, res) => {
  res.json({ admin: req.esAdmin })
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
        (SELECT CAST(COUNT(*) AS INTEGER) FROM comentarios c WHERE c.aporte_id = a.id) as total_comentarios,
        ${sqlTotalReacciones('aporte', 'a.id')} as total_reacciones,
        (CASE WHEN j.aporte_id IS NULL THEN 0 ELSE 1 END) as en_juicio,
        COALESCE(j.veredicto, '') as juicio_veredicto
      FROM aportes a
      LEFT JOIN juicios j ON j.aporte_id = a.id
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
    const aporte = await req.db.get(`SELECT ${COLUMNAS_APORTE} FROM aportes WHERE id = ?`, [req.params.id])

    if (!aporte) {
      return res.status(404).json({ error: 'Aporte no encontrado' })
    }

    const comentarios = await req.db.all(`
      SELECT comentarios.*, ${sqlTotalReacciones('comentario', 'comentarios.id')} as total_reacciones,
        COALESCE(b.bando, '') as bando
      FROM comentarios
      LEFT JOIN bandos_comentario b ON b.comentario_id = comentarios.id
      WHERE aporte_id = ?
      ORDER BY created_at ASC
    `, [req.params.id])

    res.json({
      ...aporte,
      juicio: await obtenerJuicio(req.db, req.params.id),
      comentarios
    })
  } catch (error) {
    console.error('Error al obtener aporte:', error)
    res.status(500).json({ error: 'Error al obtener aporte' })
  }
})

// Publicar un nuevo aporte (con clave personal de autor obligatoria)
app.post('/api/aportes', async (req, res) => {
  try {
    const autor = texto(req.body?.autor)
    const ficha = texto(req.body?.ficha)
    const pregunta = texto(req.body?.pregunta)
    const respuesta = texto(req.body?.respuesta)
    const clave = texto(req.body?.clave_edicion)

    if (!autor) {
      return res.status(400).json({ error: 'El nombre del autor es obligatorio' })
    }
    if (!pregunta) {
      return res.status(400).json({ error: 'La pregunta es obligatoria' })
    }
    if (!respuesta) {
      return res.status(400).json({ error: 'La respuesta es obligatoria' })
    }
    const demasiadoLargo = campoDemasiadoLargo({ autor, ficha, pregunta, respuesta })
    if (demasiadoLargo) {
      return res.status(400).json({ error: demasiadoLargo })
    }

    // El administrador puede publicar sin clave (solo él podrá editarlo); los aprendices necesitan una
    if (!req.esAdmin && clave.length < LONGITUD_MINIMA_CLAVE_AUTOR) {
      return res.status(400).json({
        error: `Define una clave de autor de al menos ${LONGITUD_MINIMA_CLAVE_AUTOR} caracteres para poder editar tu aporte después.`
      })
    }
    if (clave.length > LONGITUD_MAXIMA_CLAVE_AUTOR) {
      return res.status(400).json({ error: `La clave de autor puede tener máximo ${LONGITUD_MAXIMA_CLAVE_AUTOR} caracteres.` })
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    await req.db.run(`
      INSERT INTO aportes (id, autor, ficha, pregunta, respuesta, clave_edicion, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      autor,
      ficha,
      pregunta,
      respuesta,
      clave ? await hashClave(clave) : '',
      now,
      now
    ])

    const nuevoAporte = await req.db.get(`SELECT ${COLUMNAS_APORTE} FROM aportes WHERE id = ?`, [id])

    res.status(201).json({ ...nuevoAporte, comentarios: [] })
  } catch (error) {
    console.error('Error al guardar aporte:', error)
    res.status(500).json({ error: 'Error al guardar el aporte' })
  }
})

// Verificar si una clave permite editar un aporte (autor con su clave, o administrador con sesión)
app.post('/api/aportes/:id/verificar-clave', async (req, res) => {
  try {
    const aporte = await autorizarSobreAporte(
      req, res, req.params.id, req.body?.clave,
      'Clave incorrecta. Solo el autor del aporte o el administrador pueden editarlo.'
    )
    if (!aporte) return
    res.json({ ok: true, esAdmin: req.esAdmin })
  } catch (error) {
    console.error('Error al verificar clave:', error)
    res.status(500).json({ error: 'Error al verificar clave' })
  }
})

// Actualizar un aporte (solo el autor con su clave o el administrador)
app.put('/api/aportes/:id', async (req, res) => {
  try {
    const aporte = await autorizarSobreAporte(
      req, res, req.params.id, req.body?.clave,
      'No tienes permiso para editar este aporte. Clave incorrecta.'
    )
    if (!aporte) return

    const autor = texto(req.body?.autor)
    const ficha = texto(req.body?.ficha)
    const pregunta = texto(req.body?.pregunta)
    const respuesta = texto(req.body?.respuesta)

    if (!autor || !pregunta || !respuesta) {
      return res.status(400).json({ error: 'El nombre, la pregunta y la respuesta son obligatorios' })
    }
    const demasiadoLargo = campoDemasiadoLargo({ autor, ficha, pregunta, respuesta })
    if (demasiadoLargo) {
      return res.status(400).json({ error: demasiadoLargo })
    }

    const now = new Date().toISOString()
    await req.db.run(`
      UPDATE aportes
      SET autor = ?, ficha = ?, pregunta = ?, respuesta = ?, updated_at = ?
      WHERE id = ?
    `, [autor, ficha, pregunta, respuesta, now, req.params.id])

    const actualizado = await req.db.get(`SELECT ${COLUMNAS_APORTE} FROM aportes WHERE id = ?`, [req.params.id])

    res.json(actualizado)
  } catch (error) {
    console.error('Error al actualizar aporte:', error)
    res.status(500).json({ error: 'Error al actualizar aporte' })
  }
})

// Calificar un aporte (exclusivo del administrador)
app.post('/api/aportes/:id/calificar', async (req, res) => {
  try {
    if (!exigirAdmin(req, res, 'Solo el administrador puede calificar aportes')) return

    const aporte = await req.db.get('SELECT id FROM aportes WHERE id = ?', [req.params.id])
    if (!aporte) {
      return res.status(404).json({ error: 'Aporte no encontrado' })
    }

    const notaNum = parseInt(req.body?.calificacion, 10)
    if (isNaN(notaNum) || notaNum < 0 || notaNum > 100) {
      return res.status(400).json({ error: 'La calificación debe ser un valor numérico entre 0 y 100' })
    }

    const retroalimentacion = texto(req.body?.retroalimentacion)
    if (retroalimentacion.length > 5000) {
      return res.status(400).json({ error: 'La retroalimentación es demasiado larga (máximo 5.000 caracteres).' })
    }

    const now = new Date().toISOString()
    await req.db.run(`
      UPDATE aportes
      SET calificacion = ?, retroalimentacion = ?, calificado_at = ?
      WHERE id = ?
    `, [notaNum, retroalimentacion, now, req.params.id])

    const calificado = await req.db.get(`SELECT ${COLUMNAS_APORTE} FROM aportes WHERE id = ?`, [req.params.id])

    res.json(calificado)
  } catch (error) {
    console.error('Error al calificar aporte:', error)
    res.status(500).json({ error: 'Error al calificar el aporte' })
  }
})

// Eliminar un aporte (autor con su clave o administrador)
app.delete('/api/aportes/:id', async (req, res) => {
  try {
    const aporte = await autorizarSobreAporte(
      req, res, req.params.id, req.query.clave ?? req.body?.clave,
      'Permiso denegado. Clave incorrecta para eliminar este aporte.'
    )
    if (!aporte) return

    // Todo o nada: si algo falla no quedan comentarios o reacciones huérfanos
    await req.db.transaction(async tx => {
      await borrarReaccionesDeAporte(tx, req.params.id)
      await borrarJuicioDeAporte(tx, req.params.id)
      await tx.run('DELETE FROM comentarios WHERE aporte_id = ?', [req.params.id])
      await tx.run('DELETE FROM aportes WHERE id = ?', [req.params.id])
    })
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
    const autor = texto(req.body?.autor)
    const comentarioCitado = texto(req.body?.comentario_citado)
    const contenido = texto(req.body?.contenido)

    if (!autor || !contenido) {
      return res.status(400).json({ error: 'El autor y el comentario son requeridos' })
    }
    const demasiadoLargo = campoDemasiadoLargo({ autor, comentario_citado: comentarioCitado, contenido })
    if (demasiadoLargo) {
      return res.status(400).json({ error: demasiadoLargo })
    }

    const aporte = await req.db.get('SELECT id FROM aportes WHERE id = ?', [aporteId])
    if (!aporte) {
      return res.status(404).json({ error: 'Aporte no encontrado' })
    }

    // En un aporte en juicio cada réplica escoge bando; si no dice nada, queda neutral
    const enJuicio = Boolean(await obtenerJuicio(req.db, aporteId))
    const bando = enJuicio ? (texto(req.body?.bando) || 'neutral') : ''
    if (enJuicio && !BANDOS.includes(bando)) {
      return res.status(400).json({ error: 'Bando no válido: escoge Fiscalía, Defensa o Neutral' })
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    await req.db.transaction(async tx => {
      await tx.run(`
        INSERT INTO comentarios (id, aporte_id, autor, comentario_citado, contenido, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [id, aporteId, autor, comentarioCitado, contenido, now])
      if (bando) await guardarBando(tx, id, bando)
    })

    const nuevoComentario = await req.db.get('SELECT * FROM comentarios WHERE id = ?', [id])
    res.status(201).json({ ...nuevoComentario, bando })
  } catch (error) {
    console.error('Error al guardar comentario:', error)
    res.status(500).json({ error: 'Error al agregar comentario' })
  }
})

// Eliminar un comentario (exclusivo del administrador)
app.delete('/api/comentarios/:id', async (req, res) => {
  try {
    if (!exigirAdmin(req, res, 'Solo el administrador puede eliminar comentarios')) return

    await req.db.transaction(async tx => {
      await borrarReaccionesDeComentario(tx, req.params.id)
      await borrarBandoDeComentario(tx, req.params.id)
      await tx.run('DELETE FROM comentarios WHERE id = ?', [req.params.id])
    })
    res.json({ message: 'Comentario eliminado' })
  } catch (error) {
    console.error('Error al eliminar comentario:', error)
    res.status(500).json({ error: 'Error al eliminar comentario' })
  }
})

/* ----- El Juicio de Macondo (exclusivo del administrador) ----- */

// Poner un aporte en juicio (abierto: true) o archivar su juicio (abierto: false)
app.post('/api/aportes/:id/juicio', async (req, res) => {
  try {
    if (!exigirAdmin(req, res, 'Solo el administrador puede abrir o archivar un juicio')) return

    const abierto = req.body?.abierto
    if (typeof abierto !== 'boolean') {
      return res.status(400).json({ error: 'Indica si el juicio queda abierto (abierto: true o false)' })
    }
    const aporte = await req.db.get('SELECT id FROM aportes WHERE id = ?', [req.params.id])
    if (!aporte) {
      return res.status(404).json({ error: 'Aporte no encontrado' })
    }

    if (abierto) {
      res.json({ juicio: await abrirJuicio(req.db, req.params.id) })
    } else {
      await archivarJuicio(req.db, req.params.id)
      res.json({ juicio: null })
    }
  } catch (error) {
    console.error('Error al cambiar el juicio:', error)
    res.status(500).json({ error: 'Error al cambiar el estado del juicio' })
  }
})

// Dictar (o corregir) la sentencia de un aporte en juicio. No toca la calificación.
app.post('/api/aportes/:id/sentencia', async (req, res) => {
  try {
    if (!exigirAdmin(req, res, 'Solo el administrador puede dictar sentencia')) return

    const veredicto = texto(req.body?.veredicto)
    const sentencia = texto(req.body?.sentencia)
    if (!VEREDICTOS.includes(veredicto)) {
      return res.status(400).json({ error: 'Veredicto no válido' })
    }
    if (!sentencia) {
      return res.status(400).json({ error: 'Escribe los argumentos de la sentencia' })
    }
    if (sentencia.length > MAX_SENTENCIA) {
      return res.status(400).json({ error: `La sentencia es demasiado larga (máximo ${MAX_SENTENCIA.toLocaleString('es-CO')} caracteres).` })
    }
    if (!(await obtenerJuicio(req.db, req.params.id))) {
      return res.status(404).json({ error: 'Este aporte no está en juicio' })
    }

    res.json({ juicio: await dictarSentencia(req.db, req.params.id, veredicto, sentencia) })
  } catch (error) {
    console.error('Error al dictar sentencia:', error)
    res.status(500).json({ error: 'Error al dictar la sentencia' })
  }
})

/* ----- Panel del Profe (exclusivo del administrador) ----- */

// Todo lo que el panel necesita en una sola petición: los aportes con su nota y
// cuántas réplicas escribió cada autor (por el nombre que puso al comentar)
app.get('/api/admin/resumen', async (req, res) => {
  try {
    if (!exigirAdmin(req, res, 'Solo el administrador puede ver el panel del profe')) return

    const aportes = await req.db.all(`
      SELECT
        a.id, a.autor, a.ficha, a.calificacion, a.retroalimentacion, a.calificado_at, a.created_at,
        (SELECT CAST(COUNT(*) AS INTEGER) FROM comentarios c WHERE c.aporte_id = a.id) as total_comentarios,
        ${sqlTotalReacciones('aporte', 'a.id')} as total_reacciones
      FROM aportes a
      ORDER BY a.created_at ASC
    `)
    const replicas = await req.db.all(`
      SELECT autor, aporte_id, created_at FROM comentarios ORDER BY created_at ASC
    `)
    res.json({ aportes, replicas })
  } catch (error) {
    console.error('Error al armar el resumen del profe:', error)
    res.status(500).json({ error: 'Error al cargar el panel del profe' })
  }
})

// Poner (reaccionar: true) o quitar (reaccionar: false) la reacción "Útil" de este navegador
// sobre un aporte o comentario. Repetir la misma petición deja el mismo resultado.
app.post('/api/reacciones', async (req, res) => {
  try {
    // Límite por persona (IP) para que nadie infle los contadores con peticiones automáticas.
    // Cuenta todas las peticiones, válidas o no, en la misma tabla que los intentos de clave.
    const ip = ipDeLaPeticion(req)
    if (await demasiadosIntentos(req.db, ip, OBJETIVO_LIMITE_REACCIONES, MAX_REACCIONES_POR_IP)) {
      return res.status(429).json({ error: MENSAJE_DEMASIADOS_INTENTOS })
    }
    await registrarFallo(req.db, ip, OBJETIVO_LIMITE_REACCIONES)

    const tipo = texto(req.body?.tipo)
    const id = texto(req.body?.id)
    const votante = req.body?.votante
    const reaccionar = req.body?.reaccionar

    if (!TIPOS_REACCION.includes(tipo) || !id) {
      return res.status(400).json({ error: 'Reacción no válida' })
    }
    if (!votanteValido(votante)) {
      return res.status(400).json({ error: 'Identificador de navegador no válido' })
    }
    if (typeof reaccionar !== 'boolean') {
      return res.status(400).json({ error: 'Indica si quieres poner o quitar la reacción (reaccionar: true o false)' })
    }
    if (!(await objetivoExiste(req.db, tipo, id))) {
      return res.status(404).json({ error: tipo === 'aporte' ? 'Aporte no encontrado' : 'Comentario no encontrado' })
    }

    res.json(await fijarReaccion(req.db, tipo, id, votante, reaccionar))
  } catch (error) {
    console.error('Error al registrar reacción:', error)
    res.status(500).json({ error: 'Error al registrar la reacción' })
  }
})

// Cualquier otra ruta /api que no exista
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Ruta de la API no encontrada' })
})

// JSON mal formado o demasiado grande
app.use((error, req, res, next) => {
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'El contenido enviado es demasiado grande.' })
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El contenido enviado no es válido.' })
  }
  console.error('Error inesperado:', error)
  res.status(500).json({ error: 'Error inesperado del servidor' })
})

export default app
