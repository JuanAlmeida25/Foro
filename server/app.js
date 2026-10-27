import express from 'express'
import crypto from 'node:crypto'
import { getDb, dbEngine } from './database.js'
import {
  esClaveAdmin,
  crearSesionAdmin,
  sesionAdminValida,
  tokenDeLaPeticion,
  crearSesionAprendiz,
  leerSesionAprendiz,
  tokenAprendizDeLaPeticion,
  referenciaAprendiz,
  hashClave,
  verificarClave,
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
import * as solucionarioCaso from './casoFichaSolucionario.js'
import {
  TIPOS_DOCUMENTO,
  PIN_VALIDO,
  FIRMA_VALIDA,
  MAX_LARGO_FIRMA,
  MAX_FALLOS_PIN,
  MINUTOS_BLOQUEO,
  MAX_REGISTROS_POR_IP,
  MAX_ENTRADAS_POR_IP,
  limpiarTexto,
  soloDigitos,
  errorNombre,
  errorDocumento,
  datosPublicos,
  leerAprendiz,
  crearAprendiz,
  pinCorrecto,
  reiniciarPin,
  guardarFirma,
  comoSeVe,
  anotarIntentoPin,
  bloqueadoHasta,
  limpiarFallosPin,
  listarAprendices,
  corregirAprendiz,
  borrarAprendiz,
  guardarAutoria,
  documentoDelAutor,
  borrarAutoriaDeAporte,
  borrarAutoriaDeComentario
} from './aprendices.js'
import {
  MAX_MARCAR_A_LA_VEZ,
  leerEncabezado,
  guardarEncabezado,
  leerAsistencia,
  marcarAsistencia,
  datosPlanilla,
  normalizarCodigo,
  leerAsistenciaAbierta,
  abrirAsistencia,
  cerrarAsistencia,
  sigueAbierta,
  estadoCodigo,
  codigoValido,
  marcarConCodigo,
  presentesDelDia
} from './asistencia.js'
import {
  MAX_INTEGRANTES,
  limpiarRespuestas,
  validarCalificacion,
  entregaDe,
  leerEntrega,
  guardarEntrega,
  calificarEntrega,
  listarEntregas
} from './entregasCaso.js'
import { boletinDe, cifrasDeTodos } from './boletin.js'
import { esDiaDeClase, fechaValida, hoyEnColombia } from '../src/utils/fichaAsistencia.js'

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

// Identificar al aprendiz con sesión. Se revisa contra la base porque si el profe le reinició
// el PIN (o le borró la cuenta), el token viejo ya no debe servir aunque no haya vencido
app.use('/api', async (req, res, next) => {
  try {
    const token = tokenAprendizDeLaPeticion(req)
    const sesion = leerSesionAprendiz(token)
    const registro = sesion && await leerAprendiz(req.db, sesion.documento)
    req.aprendiz = registro && Number(registro.version) === sesion.version ? registro : null
    req.sesionAprendizVencida = Boolean(token) && !req.aprendiz
    next()
  } catch (error) {
    next(error)
  }
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

  // El aprendiz dueño del aporte entra con su sesión, sin clave
  const documentoAutor = await documentoDelAutor(req.db, 'aporte', id)
  if (documentoAutor && req.aprendiz?.documento === documentoAutor) {
    return { ...aporte, esDelAprendiz: true }
  }

  if (await verificarClave(texto(clave), aporte.clave_edicion)) {
    await limpiarFallos(req.db, ip, objetivo)
    return aporte
  }

  if (documentoAutor) {
    res.status(403).json({ error: 'Este aporte es de otra cuenta: solo su autor (con su sesión) o el administrador pueden modificarlo.' })
    return null
  }

  if (!aporte.clave_edicion) {
    res.status(403).json({ error: 'Este aporte no tiene clave de autor: solo el administrador puede modificarlo.' })
    return null
  }

  await registrarFallo(req.db, ip, objetivo)
  res.status(401).json({ error: mensajeDenegado })
  return null
}

// Para publicar y replicar hay que entrar con la cuenta de aprendiz (el admin no la necesita)
function exigirAprendiz(req, res) {
  if (req.esAdmin || req.aprendiz) return true
  res.status(401).json({
    error: req.sesionAprendizVencida
      ? 'Tu sesión venció. Entra otra vez con tu documento y PIN.'
      : 'Para publicar en el foro entra con tu cuenta de aprendiz (👤 Mi cuenta).',
    sesionAprendizVencida: req.sesionAprendizVencida,
    necesitaCuenta: true
  })
  return false
}

// ¿Este aporte es del aprendiz que pregunta? El documento nunca sale al navegador, solo el sí o el no
async function conDueno(req, aporte) {
  if (!aporte) return aporte
  const documento = req.aprendiz ? await documentoDelAutor(req.db, 'aporte', aporte.id) : ''
  return { ...aporte, es_mio: Boolean(documento) && documento === req.aprendiz.documento ? 1 : 0 }
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
        COALESCE(j.veredicto, '') as juicio_veredicto,
        (CASE WHEN au.documento IS NOT NULL AND au.documento = ? THEN 1 ELSE 0 END) as es_mio
      FROM aportes a
      LEFT JOIN juicios j ON j.aporte_id = a.id
      LEFT JOIN autoria_aprendiz au ON au.tipo = 'aporte' AND au.objetivo_id = a.id
      ORDER BY a.created_at DESC
    `, [req.aprendiz?.documento || ''])
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
      ...(await conDueno(req, aporte)),
      juicio: await obtenerJuicio(req.db, req.params.id),
      comentarios
    })
  } catch (error) {
    console.error('Error al obtener aporte:', error)
    res.status(500).json({ error: 'Error al obtener aporte' })
  }
})

// Publicar un nuevo aporte. El aprendiz publica con su cuenta: el nombre y la ficha salen de ella
// y edita después con su sesión, sin clave de autor. El administrador escribe el nombre que quiera.
app.post('/api/aportes', async (req, res) => {
  try {
    if (!exigirAprendiz(req, res)) return
    const conCuenta = !req.esAdmin
    const autor = conCuenta ? req.aprendiz.nombre : texto(req.body?.autor)
    const ficha = conCuenta ? req.aprendiz.ficha : texto(req.body?.ficha)
    const pregunta = texto(req.body?.pregunta)
    const respuesta = texto(req.body?.respuesta)
    const clave = conCuenta ? '' : texto(req.body?.clave_edicion)

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

    if (clave.length > LONGITUD_MAXIMA_CLAVE_AUTOR) {
      return res.status(400).json({ error: `La clave de autor puede tener máximo ${LONGITUD_MAXIMA_CLAVE_AUTOR} caracteres.` })
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    const claveCifrada = clave ? await hashClave(clave) : ''
    await req.db.transaction(async tx => {
      await tx.run(`
        INSERT INTO aportes (id, autor, ficha, pregunta, respuesta, clave_edicion, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [id, autor, ficha, pregunta, respuesta, claveCifrada, now, now])
      if (conCuenta) await guardarAutoria(tx, 'aporte', id, req.aprendiz.documento)
    })

    const nuevoAporte = await req.db.get(`SELECT ${COLUMNAS_APORTE} FROM aportes WHERE id = ?`, [id])

    res.status(201).json({ ...(await conDueno(req, nuevoAporte)), comentarios: [] })
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

    // Si el aporte es de una cuenta, el nombre y la ficha siguen saliendo de la cuenta
    const documentoAutor = await documentoDelAutor(req.db, 'aporte', req.params.id)
    const cuentaAutor = documentoAutor && !req.esAdmin ? req.aprendiz : null
    const autor = cuentaAutor ? cuentaAutor.nombre : texto(req.body?.autor)
    const ficha = cuentaAutor ? cuentaAutor.ficha : texto(req.body?.ficha)
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

    res.json(await conDueno(req, actualizado))
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
      await borrarAutoriaDeAporte(tx, req.params.id)
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
    if (!exigirAprendiz(req, res)) return
    const aporteId = req.params.id
    // El aprendiz replica con el nombre de su cuenta; el admin escribe el que quiera
    const autor = req.esAdmin ? texto(req.body?.autor) : req.aprendiz.nombre
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
      if (!req.esAdmin) await guardarAutoria(tx, 'comentario', id, req.aprendiz.documento)
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
      await borrarAutoriaDeComentario(tx, req.params.id)
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
        ${sqlTotalReacciones('aporte', 'a.id')} as total_reacciones,
        COALESCE(au.documento, '') as documento
      FROM aportes a
      LEFT JOIN autoria_aprendiz au ON au.tipo = 'aporte' AND au.objetivo_id = a.id
      ORDER BY a.created_at ASC
    `)
    // Con cuenta, cada aprendiz se cuenta por su documento y no por cómo escribió el nombre
    const replicas = await req.db.all(`
      SELECT c.autor, c.aporte_id, c.created_at, COALESCE(au.documento, '') as documento
      FROM comentarios c
      LEFT JOIN autoria_aprendiz au ON au.tipo = 'comentario' AND au.objetivo_id = c.id
      ORDER BY c.created_at ASC
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

/* ----- Evaluaciones de Conocimientos (Examen Autónomo) ----- */

// Registrar entrega de evaluación (aprendiz)
app.post('/api/evaluaciones', async (req, res) => {
  try {
    // La evaluación queda amarrada a la cuenta: el nombre y la ficha salen de ella, no de lo que se escriba
    if (!req.aprendiz) {
      return res.status(401).json({
        error: req.sesionAprendizVencida
          ? 'Tu sesión venció. Entra otra vez con tu documento y PIN para entregar.'
          : 'Para presentar la evaluación entra con tu cuenta de aprendiz.',
        sesionAprendizVencida: req.sesionAprendizVencida,
        necesitaCuenta: true
      })
    }
    const aprendiz = req.aprendiz.nombre
    const ficha = req.aprendiz.ficha
    const aciertos = Number(req.body?.aciertos) || 0
    const total = Number(req.body?.total) || 20
    const porcentaje = Number(req.body?.porcentaje) || 0
    const aprobado = req.body?.aprobado ? 1 : 0
    const tiempo_empleado = Number(req.body?.tiempo_empleado) || 0
    const infracciones = Number(req.body?.infracciones) || 0
    const motivo_finalizacion = texto(req.body?.motivo_finalizacion) || 'entrega_normal'
    const detalle_json = typeof req.body?.detalle_json === 'string'
      ? req.body.detalle_json
      : JSON.stringify(req.body?.detalle_json || [])

    const id = `eval-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`
    const createdAt = new Date().toISOString()

    await req.db.transaction(async tx => {
      await tx.run(`
        INSERT INTO evaluaciones (
          id, aprendiz, ficha, aciertos, total, porcentaje, aprobado,
          tiempo_empleado, infracciones, motivo_finalizacion, detalle_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id, aprendiz, ficha, aciertos, total, porcentaje, aprobado,
        tiempo_empleado, infracciones, motivo_finalizacion, detalle_json, createdAt
      ])
      await guardarAutoria(tx, 'evaluacion', id, req.aprendiz.documento)
    })

    // Se confirma la recepción segura sin exponer notas directamente en la respuesta si se busca confidencialidad
    res.status(201).json({
      ok: true,
      id,
      mensaje: 'Evaluación recibida y registrada de forma confidencial para el instructor'
    })
  } catch (error) {
    console.error('Error al registrar evaluación:', error)
    res.status(500).json({ error: 'Error al registrar la evaluación en el servidor' })
  }
})

// Listar evaluaciones recibidas (exclusivo del instructor/admin)
app.get('/api/admin/evaluaciones', async (req, res) => {
  try {
    if (!exigirAdmin(req, res, 'Solo el instructor puede consultar las evaluaciones')) return

    const lista = await req.db.all('SELECT * FROM evaluaciones ORDER BY created_at DESC')
    res.json(lista)
  } catch (error) {
    console.error('Error al listar evaluaciones:', error)
    res.status(500).json({ error: 'Error al obtener la lista de evaluaciones' })
  }
})

// Solucionario del Caso MAREA (exclusivo del instructor/admin)
app.get('/api/admin/caso-ficha/solucionario', (req, res) => {
  if (!exigirAdmin(req, res, 'Solo el instructor puede ver el solucionario')) return
  res.set('Cache-Control', 'no-store')
  res.json(solucionarioCaso)
})

// Eliminar una evaluación (exclusivo del instructor/admin)
app.delete('/api/admin/evaluaciones/:id', async (req, res) => {
  try {
    if (!exigirAdmin(req, res, 'Solo el instructor puede eliminar evaluaciones')) return

    await req.db.run('DELETE FROM evaluaciones WHERE id = ?', [req.params.id])
    res.json({ message: 'Evaluación eliminada correctamente' })
  } catch (error) {
    console.error('Error al eliminar evaluación:', error)
    res.status(500).json({ error: 'Error al eliminar la evaluación' })
  }
})

/* ----- Cuentas de aprendiz (documento + PIN) ----- */

async function abrirSesionAprendiz(db, registro) {
  const { token, expira } = crearSesionAprendiz(registro.documento, Number(registro.version))
  return { token, expira, aprendiz: await comoSeVe(db, registro) }
}

// Cuenta todas las peticiones de una IP a esa acción, buenas o malas, como las reacciones
async function frenarSpamAprendices(req, res, accion, maximo) {
  const ip = ipDeLaPeticion(req)
  const objetivo = `aprendices:${accion}`
  if (await demasiadosIntentos(req.db, ip, objetivo, maximo)) {
    res.status(429).json({ error: MENSAJE_DEMASIADOS_INTENTOS })
    return true
  }
  await registrarFallo(req.db, ip, objetivo)
  return false
}

function responderBloqueo(res, hasta, primeraVez) {
  const minutos = Math.max(1, Math.ceil((hasta - Date.now()) / 60_000))
  res.status(429).json({
    error: primeraVez
      ? `🔒 Fallaste el PIN ${MAX_FALLOS_PIN} veces. Por seguridad, tu cuenta queda bloqueada ${MINUTOS_BLOQUEO} minutos. Si se te olvidó, pídele a tu instructor que te lo reinicie.`
      : `🔒 Tu cuenta sigue bloqueada por fallar el PIN. Inténtalo otra vez en ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}, o pídele a tu instructor que te lo reinicie.`,
    bloqueado: true,
    bloqueadoHasta: hasta
  })
}

// Quién tiene la sesión abierta (o null). El navegador lo pregunta al cargar la página
app.get('/api/aprendices/yo', async (req, res) => {
  try {
    res.json({ aprendiz: req.aprendiz ? await comoSeVe(req.db, req.aprendiz) : null })
  } catch (error) {
    console.error('Error al leer la sesión del aprendiz:', error)
    res.status(500).json({ error: 'Error al leer tu sesión' })
  }
})

// Registrarse una sola vez: nombre, tipo y número de documento, ficha y PIN
app.post('/api/aprendices/registro', async (req, res) => {
  try {
    if (await frenarSpamAprendices(req, res, 'registro', MAX_REGISTROS_POR_IP)) return
    const nombre = limpiarTexto(req.body?.nombre, 80)
    const documento = soloDigitos(req.body?.documento)
    const ficha = soloDigitos(req.body?.ficha).slice(0, 12)
    const tipoDocumento = req.body?.tipoDocumento
    const pin = typeof req.body?.pin === 'string' ? req.body.pin.trim() : ''

    const error = errorNombre(nombre) || errorDocumento(documento)
    if (error) return res.status(400).json({ error })
    if (!TIPOS_DOCUMENTO.includes(tipoDocumento)) return res.status(400).json({ error: 'Escoge tu tipo de documento.' })
    if (!PIN_VALIDO.test(pin)) return res.status(400).json({ error: 'El PIN debe tener exactamente 4 números.' })

    const registro = await crearAprendiz(req.db, { nombre, documento, tipoDocumento, ficha, pin })
    if (!registro) {
      return res.status(409).json({
        error: 'Ese documento ya está registrado. Entra con tu PIN; si se te olvidó, pídele a tu instructor que te lo reinicie.'
      })
    }
    res.status(201).json(await abrirSesionAprendiz(req.db, registro))
  } catch (error) {
    console.error('Error al registrar aprendiz:', error)
    res.status(500).json({ error: 'Error al registrarte' })
  }
})

// Entrar con documento + PIN (3 fallos = 15 minutos bloqueado)
app.post('/api/aprendices/entrar', async (req, res) => {
  try {
    if (await frenarSpamAprendices(req, res, 'entrar', MAX_ENTRADAS_POR_IP)) return
    const documento = soloDigitos(req.body?.documento)
    const pin = typeof req.body?.pin === 'string' ? req.body.pin.trim() : ''
    const error = errorDocumento(documento)
    if (error) return res.status(400).json({ error })

    const fallos = await anotarIntentoPin(req.db, ipDeLaPeticion(req), documento)
    if (fallos.length > MAX_FALLOS_PIN) return responderBloqueo(res, bloqueadoHasta(fallos), false)

    const registro = await leerAprendiz(req.db, documento)
    if (await pinCorrecto(pin, registro)) {
      await limpiarFallosPin(req.db, documento)
      return res.json(await abrirSesionAprendiz(req.db, registro))
    }

    if (fallos.length === MAX_FALLOS_PIN) return responderBloqueo(res, bloqueadoHasta(fallos), true)
    const quedan = MAX_FALLOS_PIN - fallos.length
    // Mismo mensaje si el documento no existe: así nadie averigua quién está registrado
    res.status(401).json({
      error: `Documento o PIN incorrecto. Te ${quedan === 1 ? 'queda 1 intento' : `quedan ${quedan} intentos`}; al ${MAX_FALLOS_PIN}.º fallo la cuenta se bloquea ${MINUTOS_BLOQUEO} minutos.`,
      intentosRestantes: quedan
    })
  } catch (error) {
    console.error('Error al entrar como aprendiz:', error)
    res.status(500).json({ error: 'Error al entrar' })
  }
})

// El aprendiz completa lo que le falta: el tipo de documento y la firma (esta, una sola vez)
app.post('/api/aprendices/perfil', async (req, res) => {
  try {
    if (!req.aprendiz) {
      return res.status(401).json({ error: 'Tu sesión venció. Entra otra vez con tu documento y PIN.', sesionAprendizVencida: true })
    }
    const { tipoDocumento, firma } = req.body || {}

    if (tipoDocumento !== undefined) {
      if (!TIPOS_DOCUMENTO.includes(tipoDocumento)) return res.status(400).json({ error: 'Escoge tu tipo de documento.' })
      await req.db.run('UPDATE aprendices SET tipo_documento = ? WHERE documento = ?', [tipoDocumento, req.aprendiz.documento])
    }

    if (firma !== undefined) {
      if (typeof firma !== 'string' || firma.length > MAX_LARGO_FIRMA || !FIRMA_VALIDA.test(firma)) {
        return res.status(400).json({ error: 'La firma no llegó bien. Bórrala y hazla otra vez.' })
      }
      if (!(await guardarFirma(req.db, req.aprendiz.documento, firma))) {
        return res.status(409).json({ error: 'Ya tienes tu firma guardada. Si quedó mal, pídele a tu instructor que te la borre.' })
      }
    }

    res.json({ aprendiz: await comoSeVe(req.db, await leerAprendiz(req.db, req.aprendiz.documento)) })
  } catch (error) {
    console.error('Error al completar el perfil:', error)
    res.status(500).json({ error: 'Error al guardar tus datos' })
  }
})

// Todos los registrados, con si firmaron y si están bloqueados (solo profe)
app.get('/api/admin/aprendices', async (req, res) => {
  try {
    if (!exigirAdmin(req, res, 'Solo el instructor puede ver los aprendices')) return
    const cifras = await cifrasDeTodos(req.db)
    const aprendices = (await listarAprendices(req.db)).map(a => {
      const c = cifras[a.documento] || cifras.porDefecto
      return { ...a, fallas: c.fallas, asistencias: c.asistencias, aportes: c.aportes, semaforo: c.semaforo }
    })
    res.json({ aprendices })
  } catch (error) {
    console.error('Error al listar aprendices:', error)
    res.status(500).json({ error: 'Error al cargar los aprendices' })
  }
})

// Corregir nombre, tipo de documento o ficha (solo profe). El documento no se cambia: es la llave
app.put('/api/admin/aprendices/:documento', async (req, res) => {
  try {
    if (!exigirAdmin(req, res, 'Solo el instructor puede corregir datos')) return
    const registro = await leerAprendiz(req.db, soloDigitos(req.params.documento))
    if (!registro) return res.status(404).json({ error: 'Ese aprendiz no está registrado.' })
    const nombre = limpiarTexto(req.body?.nombre, 80)
    const error = errorNombre(nombre)
    if (error) return res.status(400).json({ error })
    const tipoDocumento = TIPOS_DOCUMENTO.includes(req.body?.tipoDocumento) ? req.body.tipoDocumento : registro.tipo_documento
    const ficha = soloDigitos(req.body?.ficha).slice(0, 12)
    const actualizado = await corregirAprendiz(req.db, registro.documento, { nombre, tipoDocumento, ficha })
    res.json({ aprendiz: datosPublicos(actualizado) })
  } catch (error) {
    console.error('Error al corregir aprendiz:', error)
    res.status(500).json({ error: 'Error al corregir los datos' })
  }
})

// PIN nuevo al azar para dictárselo al aprendiz (solo profe). Se muestra una sola vez
app.post('/api/admin/aprendices/:documento/reiniciar-pin', async (req, res) => {
  try {
    if (!exigirAdmin(req, res, 'Solo el instructor puede reiniciar el PIN')) return
    const registro = await leerAprendiz(req.db, soloDigitos(req.params.documento))
    if (!registro) return res.status(404).json({ error: 'Ese aprendiz no está registrado.' })
    const pin = await reiniciarPin(req.db, registro.documento)
    res.set('Cache-Control', 'no-store')
    res.json({ pin, aprendiz: datosPublicos(registro) })
  } catch (error) {
    console.error('Error al reiniciar PIN:', error)
    res.status(500).json({ error: 'Error al reiniciar el PIN' })
  }
})

// Borrar solo la firma (para que la repita) o la cuenta completa (solo profe)
app.delete('/api/admin/aprendices/:documento', async (req, res) => {
  try {
    if (!exigirAdmin(req, res, 'Solo el instructor puede borrar aprendices')) return
    const documento = soloDigitos(req.params.documento)
    if (!documento) return res.status(400).json({ error: 'Falta el documento.' })
    if (req.query.solo === 'firma') {
      await req.db.run('DELETE FROM firmas_aprendiz WHERE documento = ?', [documento])
    } else {
      await borrarAprendiz(req.db, documento)
    }
    res.json({ ok: true })
  } catch (error) {
    console.error('Error al borrar aprendiz:', error)
    res.status(500).json({ error: 'Error al borrar' })
  }
})

/* ----- Asistencia (solo profe) ----- */

app.get('/api/admin/asistencia', async (req, res) => {
  try {
    if (!exigirAdmin(req, res, 'Solo el instructor puede ver la asistencia')) return
    res.json({ encabezado: await leerEncabezado(req.db), asistencia: await leerAsistencia(req.db) })
  } catch (error) {
    console.error('Error al leer la asistencia:', error)
    res.status(500).json({ error: 'Error al cargar la asistencia' })
  }
})

// Lo mismo más los aprendices y sus firmas, para imprimir el formato del SENA
app.get('/api/admin/asistencia/planilla', async (req, res) => {
  try {
    if (!exigirAdmin(req, res, 'Solo el instructor puede imprimir la planilla')) return
    res.set('Cache-Control', 'no-store')
    res.json(await datosPlanilla(req.db))
  } catch (error) {
    console.error('Error al armar la planilla:', error)
    res.status(500).json({ error: 'Error al armar la planilla' })
  }
})

// Datos de arriba del formato: ficha, programa, código del centro y fechas de la ficha
app.put('/api/admin/asistencia/encabezado', async (req, res) => {
  try {
    if (!exigirAdmin(req, res, 'Solo el instructor puede cambiar el encabezado')) return
    const encabezado = {
      ficha: soloDigitos(req.body?.ficha).slice(0, 12),
      programa: limpiarTexto(req.body?.programa, 120),
      codigoCentro: soloDigitos(req.body?.codigoCentro).slice(0, 10),
      inicio: fechaValida(req.body?.inicio) ? req.body.inicio : '',
      fin: fechaValida(req.body?.fin) ? req.body.fin : ''
    }
    const resultado = await guardarEncabezado(req.db, encabezado)
    if (resultado.error) return res.status(400).json({ error: resultado.error })
    res.json(resultado)
  } catch (error) {
    console.error('Error al guardar el encabezado:', error)
    res.status(500).json({ error: 'Error al guardar el encabezado' })
  }
})

// Marcar o desmarcar a uno o a varios en un día de clase: { fecha, documentos: [...], presente }
app.put('/api/admin/asistencia', async (req, res) => {
  try {
    if (!exigirAdmin(req, res, 'Solo el instructor puede tomar asistencia')) return
    const { fecha, presente } = req.body || {}
    const { inicio, fin } = await leerEncabezado(req.db)
    if (!esDiaDeClase(fecha, inicio, fin)) {
      return res.status(400).json({ error: 'Esa fecha no es un día de clase de la ficha (de lunes a viernes, entre el inicio y el fin).' })
    }
    if (typeof presente !== 'boolean') return res.status(400).json({ error: 'Se esperaba presente: true o false.' })
    const documentos = Array.isArray(req.body?.documentos)
      ? [...new Set(req.body.documentos.map(soloDigitos).filter(Boolean))].slice(0, MAX_MARCAR_A_LA_VEZ)
      : []
    if (!documentos.length) return res.status(400).json({ error: 'Falta a quién marcar.' })

    res.json({ fecha, presentes: await marcarAsistencia(req.db, fecha, documentos, presente) })
  } catch (error) {
    console.error('Error al marcar asistencia:', error)
    res.status(500).json({ error: 'Error al marcar la asistencia' })
  }
})

/* ----- Asistencia con código del día ----- */

// El profe abre la asistencia de hoy por 15 minutos y proyecta el código
app.post('/api/admin/asistencia/abrir', async (req, res) => {
  try {
    if (!exigirAdmin(req, res, 'Solo el instructor puede abrir la asistencia')) return
    const hoy = hoyEnColombia()
    const { inicio, fin } = await leerEncabezado(req.db)
    if (!esDiaDeClase(hoy, inicio, fin)) {
      return res.status(400).json({ error: 'Hoy no es día de clase de la ficha. Revisa las fechas del encabezado.' })
    }
    const abierta = await abrirAsistencia(req.db, hoy)
    res.set('Cache-Control', 'no-store')
    res.json({ ...estadoCodigo(abierta), presentes: await presentesDelDia(req.db, hoy) })
  } catch (error) {
    console.error('Error al abrir la asistencia:', error)
    res.status(500).json({ error: 'Error al abrir la asistencia' })
  }
})

// El panel del profe lo pregunta cada pocos segundos para mostrar el código nuevo y quién va llegando
app.get('/api/admin/asistencia/codigo', async (req, res) => {
  try {
    if (!exigirAdmin(req, res, 'Solo el instructor puede ver el código')) return
    const hoy = hoyEnColombia()
    const abierta = await leerAsistenciaAbierta(req.db)
    res.set('Cache-Control', 'no-store')
    if (!sigueAbierta(abierta, hoy)) return res.json({ abierta: false, presentes: await presentesDelDia(req.db, hoy) })
    res.json({ abierta: true, ...estadoCodigo(abierta), presentes: await presentesDelDia(req.db, hoy) })
  } catch (error) {
    console.error('Error al leer el código de asistencia:', error)
    res.status(500).json({ error: 'Error al leer el código' })
  }
})

app.post('/api/admin/asistencia/cerrar', async (req, res) => {
  try {
    if (!exigirAdmin(req, res, 'Solo el instructor puede cerrar la asistencia')) return
    await cerrarAsistencia(req.db)
    res.json({ abierta: false })
  } catch (error) {
    console.error('Error al cerrar la asistencia:', error)
    res.status(500).json({ error: 'Error al cerrar la asistencia' })
  }
})

// El aprendiz se marca a sí mismo con el código que está en el tablero
app.post('/api/aprendices/asistencia', async (req, res) => {
  try {
    if (!req.aprendiz) {
      return res.status(401).json({ error: 'Entra con tu cuenta para marcar asistencia.', sesionAprendizVencida: req.sesionAprendizVencida })
    }
    const documento = req.aprendiz.documento
    const ip = ipDeLaPeticion(req)
    // Sin esto, con 4 letras alguien podría probar códigos a lo loco
    const objetivo = `codigo-asistencia:${documento}`
    if (await demasiadosIntentos(req.db, ip, objetivo, 5)) {
      return res.status(429).json({ error: 'Demasiados códigos equivocados. Pídele al profe que te marque a mano.' })
    }

    const hoy = hoyEnColombia()
    const abierta = await leerAsistenciaAbierta(req.db)
    if (!sigueAbierta(abierta, hoy)) {
      return res.status(409).json({ error: 'La asistencia de hoy no está abierta. Si llegaste tarde, díselo al profe.' })
    }
    if (!codigoValido(abierta, normalizarCodigo(req.body?.codigo))) {
      await registrarFallo(req.db, ip, objetivo)
      return res.status(400).json({ error: 'Ese código no es el del tablero, o ya cambió. Míralo otra vez.' })
    }
    const nueva = await marcarConCodigo(req.db, hoy, documento)
    res.json({ fecha: hoy, yaEstaba: !nueva })
  } catch (error) {
    console.error('Error al marcar asistencia con código:', error)
    res.status(500).json({ error: 'Error al marcar la asistencia' })
  }
})

/* ----- Mi boletín ----- */

app.get('/api/aprendices/yo/boletin', async (req, res) => {
  try {
    if (!req.aprendiz) {
      return res.status(401).json({ error: 'Entra con tu cuenta para ver tu boletín.', sesionAprendizVencida: req.sesionAprendizVencida })
    }
    res.json(await boletinDe(req.db, req.aprendiz.documento))
  } catch (error) {
    console.error('Error al armar el boletín:', error)
    res.status(500).json({ error: 'Error al cargar tu boletín' })
  }
})

/* ----- Entrega del Caso MAREA (por grupo) ----- */

// Compañeros para armar el grupo: solo nombre y una referencia, nunca el número de documento
app.get('/api/aprendices/companeros', async (req, res) => {
  try {
    if (!req.aprendiz) return res.status(401).json({ error: 'Entra con tu cuenta.', sesionAprendizVencida: req.sesionAprendizVencida })
    const filas = await req.db.all('SELECT documento, nombre FROM aprendices WHERE documento != ?', [req.aprendiz.documento])
    res.json({
      companeros: filas
        .map(f => ({ ref: referenciaAprendiz(f.documento), nombre: f.nombre }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    })
  } catch (error) {
    console.error('Error al listar compañeros:', error)
    res.status(500).json({ error: 'Error al cargar los compañeros' })
  }
})

// Cómo se ve la entrega desde el lado del aprendiz: integrantes por nombre y la nota si ya la hay
function entregaParaAprendiz(entrega) {
  if (!entrega) return null
  return {
    integrantes: entrega.integrantes.map(i => ({ ref: referenciaAprendiz(i.documento), nombre: i.nombre })),
    createdAt: entrega.createdAt,
    updatedAt: entrega.updatedAt,
    calificada: Boolean(entrega.calificadoAt),
    nota: entrega.calificadoAt ? entrega.nota : null,
    calificacion: entrega.calificadoAt ? entrega.calificacion : null
  }
}

app.get('/api/caso/entrega', async (req, res) => {
  try {
    if (!req.aprendiz) return res.status(401).json({ error: 'Entra con tu cuenta.', sesionAprendizVencida: req.sesionAprendizVencida })
    res.json({ entrega: entregaParaAprendiz(await entregaDe(req.db, req.aprendiz.documento)) })
  } catch (error) {
    console.error('Error al leer la entrega:', error)
    res.status(500).json({ error: 'Error al cargar la entrega' })
  }
})

// Entregar o actualizar: { respuestas, companeros: [ref, ...] }. Se puede corregir hasta que el profe califique
app.post('/api/caso/entrega', async (req, res) => {
  try {
    if (!req.aprendiz) return res.status(401).json({ error: 'Entra con tu cuenta para entregar.', sesionAprendizVencida: req.sesionAprendizVencida })
    const quien = req.aprendiz.documento
    const respuestas = limpiarRespuestas(req.body?.respuestas)
    if (!Object.keys(respuestas).some(id => id.startsWith('srs-'))) {
      return res.status(400).json({ error: 'El SRS está vacío. Llénalo antes de entregar.' })
    }

    const refs = Array.isArray(req.body?.companeros) ? [...new Set(req.body.companeros.filter(r => typeof r === 'string'))] : []
    if (refs.length > MAX_INTEGRANTES - 1) {
      return res.status(400).json({ error: `Los grupos son de máximo ${MAX_INTEGRANTES} aprendices.` })
    }
    // Se traduce cada referencia a su documento; si alguna no existe, se avisa
    const porRef = new Map()
    for (const { documento } of await req.db.all('SELECT documento FROM aprendices WHERE documento != ?', [quien])) {
      porRef.set(referenciaAprendiz(documento), documento)
    }
    const companeros = refs.map(r => porRef.get(r))
    if (companeros.some(d => !d)) return res.status(400).json({ error: 'Uno de los compañeros escogidos ya no tiene cuenta.' })

    const resultado = await guardarEntrega(req.db, quien, [quien, ...companeros], respuestas)
    if (resultado.error) return res.status(resultado.status).json({ error: resultado.error })
    res.json({ entrega: entregaParaAprendiz(await leerEntrega(req.db, resultado.entregaId)) })
  } catch (error) {
    console.error('Error al guardar la entrega:', error)
    res.status(500).json({ error: 'Error al guardar la entrega' })
  }
})

app.get('/api/admin/caso/entregas', async (req, res) => {
  try {
    if (!exigirAdmin(req, res, 'Solo el instructor puede ver las entregas')) return
    res.json({ entregas: await listarEntregas(req.db) })
  } catch (error) {
    console.error('Error al listar entregas:', error)
    res.status(500).json({ error: 'Error al cargar las entregas' })
  }
})

app.get('/api/admin/caso/entregas/:id', async (req, res) => {
  try {
    if (!exigirAdmin(req, res, 'Solo el instructor puede ver las entregas')) return
    const entrega = await leerEntrega(req.db, req.params.id)
    if (!entrega) return res.status(404).json({ error: 'Entrega no encontrada' })
    res.json({ entrega: { ...entrega, integrantes: entrega.integrantes.map(i => i.nombre) } })
  } catch (error) {
    console.error('Error al leer la entrega:', error)
    res.status(500).json({ error: 'Error al cargar la entrega' })
  }
})

// { criterios: [{ puntos, retro }, ...] en el orden de la rúbrica, retroGeneral }
app.post('/api/admin/caso/entregas/:id/calificar', async (req, res) => {
  try {
    if (!exigirAdmin(req, res, 'Solo el instructor puede calificar')) return
    const { calificacion, nota, error } = validarCalificacion(req.body?.criterios, req.body?.retroGeneral)
    if (error) return res.status(400).json({ error })
    if (!(await calificarEntrega(req.db, req.params.id, calificacion, nota))) {
      return res.status(404).json({ error: 'Entrega no encontrada' })
    }
    res.json({ nota, calificacion })
  } catch (error) {
    console.error('Error al calificar la entrega:', error)
    res.status(500).json({ error: 'Error al calificar la entrega' })
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
