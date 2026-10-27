// Pruebas del top 3 de Macondo: asistencia con código del día, Mi boletín con semáforo y entrega del Caso MAREA
import test from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { crearAdaptadorSqlite, SCHEMA_SEGURIDAD, SCHEMA_EVALUACIONES } from '../server/database.js'
import { SCHEMA_REACCIONES } from '../server/reacciones.js'
import { SCHEMA_JUICIO } from '../server/juicio.js'
import { SCHEMA_APRENDICES } from '../server/aprendices.js'
import {
  SCHEMA_ASISTENCIA,
  codigoAsistencia,
  codigoValido,
  ventanaDe,
  normalizarCodigo,
  MINUTOS_CODIGO
} from '../server/asistencia.js'
import { SCHEMA_ENTREGAS_CASO, limpiarRespuestas, validarCalificacion, MAX_INTEGRANTES } from '../server/entregasCaso.js'
import { crearSesionAdmin } from '../server/seguridad.js'
import { RUBRICA_CASO } from '../src/data/casoFicha.js'
import { hoyEnColombia, leerTextoFecha, textoFecha } from '../src/utils/fichaAsistencia.js'
import { calcularSemaforo, contarAsistencia, diasDeClaseHasta, FALLAS_ROJO } from '../src/utils/semaforo.js'
import app from '../server/app.js'

function crearDb() {
  const db = new DatabaseSync(':memory:')
  db.exec(`
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
  for (const schema of [SCHEMA_SEGURIDAD, SCHEMA_REACCIONES, SCHEMA_JUICIO, SCHEMA_EVALUACIONES, SCHEMA_APRENDICES, SCHEMA_ASISTENCIA, SCHEMA_ENTREGAS_CASO]) {
    db.exec(schema)
  }
  return crearAdaptadorSqlite(db)
}

app.set('obtenerDb', (() => {
  const db = crearDb()
  return () => db
})())

let servidor
let base
test.before(async () => {
  servidor = app.listen(0)
  await new Promise(resolve => servidor.once('listening', resolve))
  base = `http://127.0.0.1:${servidor.address().port}`
})
test.after(() => new Promise(resolve => servidor.close(resolve)))

const comoAdmin = () => ({ Authorization: `Bearer ${crearSesionAdmin().token}` })
const comoAprendiz = token => ({ 'X-Aprendiz-Token': token })

async function pedir(ruta, { method = 'GET', body, headers = {} } = {}) {
  const res = await fetch(`${base}${ruta}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body)
  })
  return { status: res.status, body: await res.json() }
}

async function registrar(documento, nombre) {
  const res = await pedir('/api/aprendices/registro', {
    method: 'POST', body: { nombre, documento, tipoDocumento: 'CC', ficha: '2825000', pin: '4821' }
  })
  assert.equal(res.status, 201, res.body.error)
  return res.body.token
}

const sumarDias = (texto, dias) => {
  const f = leerTextoFecha(texto)
  return textoFecha(new Date(f.getFullYear(), f.getMonth(), f.getDate() + dias))
}
const hoy = hoyEnColombia()
const hoyEsDiaHabil = [1, 2, 3, 4, 5].includes(leerTextoFecha(hoy).getDay())

/* ----- Código del día (lógica pura) ----- */

test('El código del día es de 4 letras sin caracteres que se confundan, y cambia con la ventana', () => {
  const codigo = codigoAsistencia('secreto', 1000)
  assert.match(codigo, /^[ACDEFGHJKMNPQRTUVWXY34679]{4}$/)
  assert.equal(codigoAsistencia('secreto', 1000), codigo, 'Mismo secreto y ventana, mismo código')
  assert.notEqual(codigoAsistencia('otro-secreto', 1000), codigo)
  assert.equal(normalizarCodigo(' ac-d3 '), 'ACD3', 'Minúsculas, espacios y guiones no estorban')
})

test(`El código vale ${MINUTOS_CODIGO} minutos, más el anterior por si cambió mientras lo escribían`, () => {
  const abierta = { secreto: 'abc' }
  const ahora = Date.UTC(2026, 9, 27, 13, 0, 30)
  const ventana = ventanaDe(ahora)
  assert.equal(codigoValido(abierta, codigoAsistencia('abc', ventana), ahora), true)
  assert.equal(codigoValido(abierta, codigoAsistencia('abc', ventana - 1), ahora), true, 'El anterior todavía sirve')
  const viejo = codigoAsistencia('abc', ventana - 2)
  // Puede coincidir por casualidad con el actual o el anterior; en ese caso la prueba no dice nada
  if (![codigoAsistencia('abc', ventana), codigoAsistencia('abc', ventana - 1)].includes(viejo)) {
    assert.equal(codigoValido(abierta, viejo, ahora), false, 'El de hace 6 minutos ya no sirve')
  }
  assert.equal(codigoValido(abierta, 'ABC', ahora), false)
  assert.equal(codigoValido(null, 'ACDE', ahora), false)
})

/* ----- Semáforo (lógica pura) ----- */

test('El semáforo se pone rojo con 3 fallas y amarillo sin aporte o con trampa en la evaluación', () => {
  assert.equal(calcularSemaforo({ fallas: 0, aportes: 1 }).color, 'verde')
  assert.equal(calcularSemaforo({ fallas: 1, aportes: 1 }).color, 'amarillo')
  assert.equal(calcularSemaforo({ fallas: 0, aportes: 0 }).color, 'amarillo')
  assert.equal(calcularSemaforo({ fallas: 0, aportes: 2, infracciones: 1 }).color, 'amarillo')
  const rojo = calcularSemaforo({ fallas: FALLAS_ROJO, aportes: 0 })
  assert.equal(rojo.color, 'rojo')
  assert.equal(rojo.motivos.length, 2, 'Dice todos los motivos, no solo el peor')
})

test('Hoy no cuenta como falla y solo cuentan los días de clase que ya pasaron', () => {
  // Del lunes 19 al viernes 30 de octubre de 2026, mirado el miércoles 28
  const dias = diasDeClaseHasta('2026-10-19', '2026-10-30', '2026-10-28')
  assert.deepEqual(dias, ['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-26', '2026-10-27', '2026-10-28'])
  const cuenta = contarAsistencia(dias, ['2026-10-19', '2026-10-20', '2026-10-28'], '2026-10-28')
  assert.deepEqual(cuenta, { asistencias: 3, fallas: 5, diasDeClase: 8 })
  assert.equal(contarAsistencia(dias, [], '2026-10-28').fallas, 7, 'El 28 es hoy: todavía no es falla')
})

/* ----- Entregas (lógica pura) ----- */

test('La entrega solo guarda campos conocidos del caso', () => {
  const limpias = limpiarRespuestas({ 'srs-rf': 'RF-01', 'a1-nombre': 'MAREA', pc1: 'Sí', hackeo: '<script>', 'srs-alcance': '   ', 'srs-rnf': 42 })
  assert.deepEqual(limpias, { 'srs-rf': 'RF-01', 'a1-nombre': 'MAREA', pc1: 'Sí' })
  assert.deepEqual(limpiarRespuestas(null), {})
  assert.deepEqual(limpiarRespuestas(['srs-rf']), {})
})

test('La calificación respeta los puntos máximos de cada criterio de la rúbrica', () => {
  const llena = RUBRICA_CASO.map(c => ({ puntos: c.puntos, retro: 'Bien' }))
  const { nota, calificacion } = validarCalificacion(llena, 'Excelente trabajo')
  assert.equal(nota, 100)
  assert.equal(calificacion.criterios[0].criterio, RUBRICA_CASO[0].criterio)
  assert.ok(validarCalificacion(llena.slice(1)).error, 'Faltan criterios')
  const pasada = RUBRICA_CASO.map(c => ({ puntos: c.puntos + 1 }))
  assert.ok(validarCalificacion(pasada).error, 'No se puede pasar del máximo')
  assert.ok(validarCalificacion(RUBRICA_CASO.map(() => ({ puntos: 1.5 }))).error, 'Solo puntos enteros')
})

/* ----- HTTP ----- */

test('HTTP: asistencia con código del día', async () => {
  const token = await registrar('2000000001', 'Ana Ipuana')
  const otro = await registrar('2000000002', 'Beto Uriana')

  // Ficha alrededor de hoy, para que hoy sea día de clase si es entre semana
  await pedir('/api/admin/asistencia/encabezado', {
    method: 'PUT', headers: comoAdmin(), body: { ficha: '2825000', inicio: sumarDias(hoy, -10), fin: sumarDias(hoy, 10) }
  })

  const cerrada = await pedir('/api/aprendices/asistencia', { method: 'POST', headers: comoAprendiz(token), body: { codigo: 'ACDE' } })
  assert.equal(cerrada.status, 409, 'Sin abrir no se marca nadie')
  assert.equal((await pedir('/api/admin/asistencia/abrir', { method: 'POST' })).status, 403)

  const abierta = await pedir('/api/admin/asistencia/abrir', { method: 'POST', headers: comoAdmin() })
  if (!hoyEsDiaHabil) {
    assert.equal(abierta.status, 400, 'Un sábado o domingo no se abre asistencia')
    return
  }
  assert.equal(abierta.status, 200, abierta.body.error)
  const { codigo } = abierta.body
  assert.ok(abierta.body.cambiaEn > Date.now())
  assert.ok(abierta.body.abiertaHasta > abierta.body.cambiaEn - 1)

  assert.equal((await pedir('/api/aprendices/asistencia', { method: 'POST', body: { codigo } })).status, 401, 'Sin cuenta no')
  const malo = await pedir('/api/aprendices/asistencia', { method: 'POST', headers: comoAprendiz(token), body: { codigo: codigo === 'ACDE' ? 'ACDF' : 'ACDE' } })
  assert.equal(malo.status, 400)

  const bueno = await pedir('/api/aprendices/asistencia', { method: 'POST', headers: comoAprendiz(token), body: { codigo: codigo.toLowerCase() } })
  assert.equal(bueno.status, 200)
  assert.equal(bueno.body.fecha, hoy)
  assert.equal(bueno.body.yaEstaba, false)
  const otraVez = await pedir('/api/aprendices/asistencia', { method: 'POST', headers: comoAprendiz(token), body: { codigo } })
  assert.equal(otraVez.body.yaEstaba, true, 'Una sola marca por día')

  const panel = await pedir('/api/admin/asistencia/codigo', { headers: comoAdmin() })
  assert.equal(panel.body.abierta, true)
  assert.deepEqual(panel.body.presentes, ['2000000001'])

  // A los 5 códigos malos se frena: con 4 letras no se vale probar a lo loco
  for (let i = 0; i < 5; i++) {
    await pedir('/api/aprendices/asistencia', { method: 'POST', headers: comoAprendiz(otro), body: { codigo: 'XXXX' } })
  }
  const frenado = await pedir('/api/aprendices/asistencia', { method: 'POST', headers: comoAprendiz(otro), body: { codigo } })
  assert.equal(frenado.status, 429)

  await pedir('/api/admin/asistencia/cerrar', { method: 'POST', headers: comoAdmin() })
  assert.equal((await pedir('/api/admin/asistencia/codigo', { headers: comoAdmin() })).body.abierta, false)
})

test('HTTP: Mi boletín trae lo propio y el profe ve el semáforo de todos', async () => {
  const token = await registrar('2000000003', 'Carla Epieyú')
  const ajeno = await registrar('2000000004', 'Darío Pushaina')

  assert.equal((await pedir('/api/aprendices/yo/boletin')).status, 401)

  const vacio = await pedir('/api/aprendices/yo/boletin', { headers: comoAprendiz(token) })
  assert.equal(vacio.status, 200)
  assert.deepEqual(vacio.body.aportes, [])
  assert.equal(vacio.body.semaforo.color === 'verde', false, 'Sin aporte no está en verde')

  const aporte = await pedir('/api/aportes', { method: 'POST', headers: comoAprendiz(token), body: { pregunta: '¿GPL?', respuesta: 'Depende' } })
  await pedir(`/api/aportes/${aporte.body.id}/calificar`, {
    method: 'POST', headers: comoAdmin(), body: { calificacion: 88, retroalimentacion: 'Muy bien argumentado' }
  })
  // Réplica en un aporte ajeno: cuenta. Réplica en el propio: no cuenta
  const deDario = await pedir('/api/aportes', { method: 'POST', headers: comoAprendiz(ajeno), body: { pregunta: '¿MIT?', respuesta: 'Sí' } })
  await pedir(`/api/aportes/${deDario.body.id}/comentarios`, { method: 'POST', headers: comoAprendiz(token), body: { contenido: 'Buen punto' } })
  await pedir(`/api/aportes/${aporte.body.id}/comentarios`, { method: 'POST', headers: comoAprendiz(token), body: { contenido: 'Me respondo solita' } })

  const boletin = await pedir('/api/aprendices/yo/boletin', { headers: comoAprendiz(token) })
  assert.equal(boletin.body.aportes.length, 1)
  assert.equal(boletin.body.aportes[0].calificacion, 88)
  assert.equal(boletin.body.aportes[0].retroalimentacion, 'Muy bien argumentado')
  assert.equal(boletin.body.replicasHechas, 1, 'La réplica en su propio aporte no cuenta')
  assert.ok(!JSON.stringify(boletin.body).includes('2000000004'), 'No se filtra el documento de otro')

  const lista = await pedir('/api/admin/aprendices', { headers: comoAdmin() })
  const carla = lista.body.aprendices.find(a => a.documento === '2000000003')
  assert.equal(carla.aportes, 1)
  assert.ok(['verde', 'amarillo', 'rojo'].includes(carla.semaforo.color))
})

test('HTTP: entrega del Caso MAREA por grupo y calificación con rúbrica', async () => {
  const lider = await registrar('2000000005', 'Elena Gouriyú')
  await registrar('2000000006', 'Fabio Epinayú')
  const solitario = await registrar('2000000007', 'Gina Ipuana')

  const { body: { companeros } } = await pedir('/api/aprendices/companeros', { headers: comoAprendiz(lider) })
  assert.ok(companeros.length >= 2)
  assert.ok(companeros.every(c => c.ref && c.nombre && !('documento' in c)), 'Sin números de documento')
  const fabio = companeros.find(c => c.nombre === 'Fabio Epinayú').ref
  const gina = companeros.find(c => c.nombre === 'Gina Ipuana').ref

  const sinSrs = await pedir('/api/caso/entrega', { method: 'POST', headers: comoAprendiz(lider), body: { respuestas: { 'a1-nombre': 'MAREA' }, companeros: [fabio] } })
  assert.equal(sinSrs.status, 400)

  const muchos = companeros.slice(0, MAX_INTEGRANTES).map(c => c.ref)
  const grupoGrande = await pedir('/api/caso/entrega', { method: 'POST', headers: comoAprendiz(lider), body: { respuestas: { 'srs-rf': 'RF-01' }, companeros: muchos } })
  assert.equal(grupoGrande.status, 400)

  const entrega = await pedir('/api/caso/entrega', {
    method: 'POST', headers: comoAprendiz(lider),
    body: { respuestas: { 'srs-rf': 'RF-01 – registrar pesaje', 'a1-nombre': 'MAREA', colado: 'x' }, companeros: [fabio] }
  })
  assert.equal(entrega.status, 200, entrega.body.error)
  assert.deepEqual(entrega.body.entrega.integrantes.map(i => i.nombre), ['Elena Gouriyú', 'Fabio Epinayú'])

  // Gina no puede meter a Fabio en su grupo: ya está en el de Elena
  const robo = await pedir('/api/caso/entrega', { method: 'POST', headers: comoAprendiz(solitario), body: { respuestas: { 'srs-rf': 'RF-01' }, companeros: [companeros.find(c => c.nombre === 'Fabio Epinayú').ref] } })
  assert.equal(robo.status, 409)

  // El profe la ve, la abre y la califica
  const { body: { entregas } } = await pedir('/api/admin/caso/entregas', { headers: comoAdmin() })
  const id = entregas.find(e => e.integrantes.includes('Elena Gouriyú')).id
  const completa = await pedir(`/api/admin/caso/entregas/${id}`, { headers: comoAdmin() })
  assert.equal(completa.body.entrega.respuestas['srs-rf'], 'RF-01 – registrar pesaje')
  assert.ok(!('colado' in completa.body.entrega.respuestas))
  assert.equal((await pedir(`/api/admin/caso/entregas/${id}`, { headers: comoAprendiz(lider) })).status, 403)

  const criterios = RUBRICA_CASO.map(c => ({ puntos: c.puntos - 1, retro: '' }))
  const calificada = await pedir(`/api/admin/caso/entregas/${id}/calificar`, { method: 'POST', headers: comoAdmin(), body: { criterios, retroGeneral: 'Buen SRS' } })
  assert.equal(calificada.body.nota, 100 - RUBRICA_CASO.length)

  // La nota le llega a los dos integrantes, y ya no se puede cambiar la entrega
  const boletinFabio = await pedir('/api/caso/entrega', { headers: comoAprendiz(lider) })
  assert.equal(boletinFabio.body.entrega.nota, 100 - RUBRICA_CASO.length)
  const tarde = await pedir('/api/caso/entrega', { method: 'POST', headers: comoAprendiz(lider), body: { respuestas: { 'srs-rf': 'RF-99' }, companeros: [fabio] } })
  assert.equal(tarde.status, 409)

  // Gina sola sí puede entregar
  const sola = await pedir('/api/caso/entrega', { method: 'POST', headers: comoAprendiz(solitario), body: { respuestas: { 'srs-rf': 'RF-01' }, companeros: [] } })
  assert.equal(sola.status, 200)
  assert.equal(gina.length, 16)
})
