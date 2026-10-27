import test from 'node:test'
import assert from 'node:assert/strict'
import {
  CATEGORIAS_EVALUACION,
  PREGUNTAS_EVALUACION,
  LS_EVALUACION_KEY
} from '../src/data/evaluacion.js'
import {
  barajarArray,
  prepararEvaluacion,
  calificarEvaluacion,
  mensajeDictamen,
  formatearCuentaRegresiva,
  DURACION_EXAMEN_SEGUNDOS,
  MAX_INFRACCIONES_CAMBIO_VENTANA
} from '../src/utils/evaluacion.js'

test('Límite de tiempo de 1 hora y formato de cuenta regresiva', () => {
  assert.equal(DURACION_EXAMEN_SEGUNDOS, 3600, 'El examen debe tener un límite de 1 hora (3600 segundos)')
  assert.equal(MAX_INFRACCIONES_CAMBIO_VENTANA, 1, 'El límite de advertencias por cambio de ventana debe ser 1 (cierra al segundo intento)')

  assert.equal(formatearCuentaRegresiva(3600), '01:00:00')
  assert.equal(formatearCuentaRegresiva(3599), '59:59')
  assert.equal(formatearCuentaRegresiva(65), '01:05')
  assert.equal(formatearCuentaRegresiva(9), '00:09')
  assert.equal(formatearCuentaRegresiva(0), '00:00')
  assert.equal(formatearCuentaRegresiva(-5), '00:00')
})

test('Integridad de las categorías y preguntas de la evaluación', () => {
  assert.ok(LS_EVALUACION_KEY, 'Debe existir la clave de almacenamiento en LocalStorage')
  assert.ok(CATEGORIAS_EVALUACION.length >= 4, 'Deben existir al menos 4 categorías temáticas')

  const catIds = new Set(CATEGORIAS_EVALUACION.map(c => c.id))
  assert.equal(catIds.size, CATEGORIAS_EVALUACION.length, 'Los IDs de categorías deben ser únicos')

  assert.ok(PREGUNTAS_EVALUACION.length >= 15, 'Deben existir al menos 15 preguntas de evaluación')

  const preguntaIds = new Set()
  for (const p of PREGUNTAS_EVALUACION) {
    assert.ok(p.id, 'Toda pregunta debe tener un id')
    assert.ok(!preguntaIds.has(p.id), `ID duplicado: ${p.id}`)
    preguntaIds.add(p.id)

    assert.ok(catIds.has(p.categoria), `La categoría ${p.categoria} de la pregunta ${p.id} debe existir`)
    assert.ok(p.enunciado && p.enunciado.length > 20, `Enunciado suficiente en ${p.id}`)
    assert.ok(p.explicacion && p.explicacion.length > 30, `Explicación suficiente en ${p.id}`)
    assert.ok(p.norma, `Norma citada en ${p.id}`)

    assert.equal(p.opciones.length, 4, `La pregunta ${p.id} debe tener 4 opciones de respuesta`)
    const correctas = p.opciones.filter(o => o.ok)
    assert.equal(correctas.length, 1, `La pregunta ${p.id} debe tener exactamente una opción correcta`)

    const opcionIds = new Set(p.opciones.map(o => o.id))
    assert.equal(opcionIds.size, 4, `Opciones con IDs únicos en ${p.id}`)
  }

  // Verificar que cada categoría tenga preguntas asociadas
  for (const c of CATEGORIAS_EVALUACION) {
    const cuenta = PREGUNTAS_EVALUACION.filter(p => p.categoria === c.id).length
    assert.ok(cuenta >= 2, `La categoría ${c.nombre} debe tener al menos 2 preguntas asignadas`)
  }
})

test('Barajar array no muta original y conserva elementos', () => {
  const original = [1, 2, 3, 4, 5, 6, 7, 8]
  const copiaOriginal = [...original]
  const barajado = barajarArray(original)

  assert.deepEqual(original, copiaOriginal, 'El array original no debe ser mutado')
  assert.equal(barajado.length, original.length, 'La longitud debe conservarse')
  assert.deepEqual([...barajado].sort(), [...original].sort(), 'Debe contener los mismos elementos')
})

test('Calificación de evaluación completa perfecta', () => {
  const respuestasPerfectas = {}
  PREGUNTAS_EVALUACION.forEach(p => {
    const correcta = p.opciones.find(o => o.ok)
    respuestasPerfectas[p.id] = correcta.id
  })

  const res = calificarEvaluacion(PREGUNTAS_EVALUACION, respuestasPerfectas)
  assert.equal(res.aciertos, PREGUNTAS_EVALUACION.length)
  assert.equal(res.porcentaje, 100)
  assert.equal(res.aprobado, true)
  assert.equal(res.detallePreguntas.every(d => d.acerto), true)

  Object.values(res.porCategoria).forEach(cat => {
    assert.equal(cat.porcentaje, 100)
  })
})

test('Calificación con cero aciertos', () => {
  const respuestasErradas = {}
  PREGUNTAS_EVALUACION.forEach(p => {
    const incorrecta = p.opciones.find(o => !o.ok)
    respuestasErradas[p.id] = incorrecta.id
  })

  const res = calificarEvaluacion(PREGUNTAS_EVALUACION, respuestasErradas)
  assert.equal(res.aciertos, 0)
  assert.equal(res.porcentaje, 0)
  assert.equal(res.aprobado, false)
})

test('Calificación con umbral de aprobación SENA (70%)', () => {
  const dictamenAlto = mensajeDictamen(95)
  assert.equal(dictamenAlto.tono, 'ok')
  assert.ok(dictamenAlto.estado.includes('COMPETENTE'))

  const dictamenAprobado = mensajeDictamen(70)
  assert.equal(dictamenAprobado.tono, 'ok')
  assert.equal(dictamenAprobado.estado, 'COMPETENTE')

  const dictamenMedio = mensajeDictamen(65)
  assert.equal(dictamenMedio.tono, 'warn')
  assert.ok(dictamenMedio.estado.includes('AÚN NO COMPETENTE'))

  const dictamenBajo = mensajeDictamen(30)
  assert.equal(dictamenBajo.tono, 'bad')
})

test('API: Registrar evaluación y consultar exclusivamente en ventana del instructor', async () => {
  const { DatabaseSync } = await import('node:sqlite')
  const { crearAdaptadorSqlite, SCHEMA_SEGURIDAD, SCHEMA_EVALUACIONES } = await import('../server/database.js')
  const { SCHEMA_REACCIONES } = await import('../server/reacciones.js')
  const { SCHEMA_JUICIO } = await import('../server/juicio.js')
  const { SCHEMA_APRENDICES } = await import('../server/aprendices.js')
  const { SCHEMA_ASISTENCIA } = await import('../server/asistencia.js')
  const { SCHEMA_ENTREGAS_CASO } = await import('../server/entregasCaso.js')
  const { crearSesionAdmin } = await import('../server/seguridad.js')
  const { default: app } = await import('../server/app.js')

  const testDb = new DatabaseSync(':memory:')
  testDb.exec(`
    CREATE TABLE aportes (
      id TEXT PRIMARY KEY, autor TEXT NOT NULL, ficha TEXT NOT NULL DEFAULT '',
      pregunta TEXT NOT NULL, respuesta TEXT NOT NULL, clave_edicion TEXT NOT NULL DEFAULT '',
      calificacion INTEGER DEFAULT NULL, retroalimentacion TEXT DEFAULT '', calificado_at TEXT DEFAULT '',
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE comentarios (
      id TEXT PRIMARY KEY, aporte_id TEXT NOT NULL, autor TEXT NOT NULL,
      comentario_citado TEXT DEFAULT '', contenido TEXT NOT NULL, created_at TEXT NOT NULL
    );
  `)
  testDb.exec(SCHEMA_SEGURIDAD)
  testDb.exec(SCHEMA_REACCIONES)
  testDb.exec(SCHEMA_JUICIO)
  testDb.exec(SCHEMA_APRENDICES)
  testDb.exec(SCHEMA_ASISTENCIA)
  testDb.exec(SCHEMA_EVALUACIONES)
  testDb.exec(SCHEMA_ENTREGAS_CASO)

  const adaptador = crearAdaptadorSqlite(testDb)
  app.set('obtenerDb', () => adaptador)

  const servidor = app.listen(0)
  await new Promise(resolve => servidor.once('listening', resolve))
  const base = `http://127.0.0.1:${servidor.address().port}`

  try {
    // 1. Sin cuenta no se entrega; con cuenta, el nombre sale de la cuenta y no del formulario
    const cuerpo = { aprendiz: 'Me Hago Pasar', aciertos: 1, total: 20, porcentaje: 5 }
    const sinCuenta = await fetch(`${base}/api/evaluaciones`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo)
    })
    assert.equal(sinCuenta.status, 401)

    const registro = await fetch(`${base}/api/aprendices/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Carlos Vives', documento: '1065000111', tipoDocumento: 'CC', ficha: '2670142', pin: '4567' })
    })
    const { token: tokenAprendiz } = await registro.json()

    const resEntrega = await fetch(`${base}/api/evaluaciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Aprendiz-Token': tokenAprendiz },
      body: JSON.stringify({
        aprendiz: 'Otro Nombre Cualquiera',
        ficha: '2670142',
        aciertos: 18,
        total: 20,
        porcentaje: 90,
        aprobado: true,
        tiempo_empleado: 1420,
        infracciones: 1,
        motivo_finalizacion: 'entrega_normal',
        detalle_json: []
      })
    })

    assert.equal(resEntrega.status, 201)
    const jsonEntrega = await resEntrega.json()
    assert.ok(jsonEntrega.ok)
    assert.ok(jsonEntrega.id)

    // 2. Consulta sin permiso de admin (debe ser rechazada con 403 Forbidden)
    const resSinAdmin = await fetch(`${base}/api/admin/evaluaciones`)
    assert.equal(resSinAdmin.status, 403)

    // 3. Consulta desde la ventana del instructor (con token admin)
    const token = crearSesionAdmin().token
    const resAdmin = await fetch(`${base}/api/admin/evaluaciones`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    assert.equal(resAdmin.status, 200)
    const lista = await resAdmin.json()
    assert.equal(lista.length, 1)
    assert.equal(lista[0].aprendiz, 'Carlos Vives')
    assert.equal(lista[0].porcentaje, 90)
    assert.equal(lista[0].aprobado, 1)
    assert.equal(lista[0].infracciones, 1)

    // 4. Instructor elimina intento
    const resDel = await fetch(`${base}/api/admin/evaluaciones/${lista[0].id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert.equal(resDel.status, 200)

    const resDespues = await fetch(`${base}/api/admin/evaluaciones`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const listaDespues = await resDespues.json()
    assert.equal(listaDespues.length, 0)
  } finally {
    await new Promise(resolve => servidor.close(resolve))
  }
})
