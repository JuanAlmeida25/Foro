import test from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { crearAdaptadorSqlite, SCHEMA_SEGURIDAD, SCHEMA_EVALUACIONES } from '../server/database.js'
import { SCHEMA_REACCIONES } from '../server/reacciones.js'
import { SCHEMA_JUICIO } from '../server/juicio.js'
import { SCHEMA_APRENDICES, MAX_FALLOS_PIN } from '../server/aprendices.js'
import { SCHEMA_ASISTENCIA } from '../server/asistencia.js'
import { SCHEMA_ENTREGAS_CASO } from '../server/entregasCaso.js'
import { crearSesionAdmin, crearSesionAprendiz, leerSesionAprendiz, sesionAdminValida } from '../server/seguridad.js'
import { hojasDeAsistencia, esDiaDeClase, errorRangoFicha, fechaValida } from '../src/utils/fichaAsistencia.js'
import { resumenPorAprendiz } from '../src/utils/panel.js'
import app from '../server/app.js'

// Base en memoria con las mismas tablas que server/db.js
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
  db.exec(SCHEMA_SEGURIDAD)
  db.exec(SCHEMA_REACCIONES)
  db.exec(SCHEMA_JUICIO)
  db.exec(SCHEMA_APRENDICES)
  db.exec(SCHEMA_ASISTENCIA)
  db.exec(SCHEMA_EVALUACIONES)
  db.exec(SCHEMA_ENTREGAS_CASO)
  return { crudo: db, adaptador: crearAdaptadorSqlite(db) }
}

const { crudo, adaptador } = crearDb()
app.set('obtenerDb', () => adaptador)

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

// Cada prueba usa documentos distintos para no pisarse con las demás
async function registrar(documento, nombre = 'Dayana Ipuana', pin = '4821') {
  const res = await pedir('/api/aprendices/registro', {
    method: 'POST',
    body: { nombre, documento, tipoDocumento: 'CC', ficha: '2825000', pin }
  })
  assert.equal(res.status, 201, res.body.error)
  return res.body.token
}

// Una firma PNG chiquita pero válida
const FIRMA = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

/* ----- Fechas de la ficha ----- */

test('Las hojas de asistencia van de lunes a viernes, dos semanas por hoja', () => {
  // 22 oct 2026 es jueves y 13 nov es viernes: arranca el lunes 19 y salen 2 hojas
  const hojas = hojasDeAsistencia('2026-10-22', '2026-11-13')
  assert.equal(hojas.length, 2)
  assert.equal(hojas[0].desde, '2026-10-19')
  assert.equal(hojas[0].dias.length, 10)
  assert.equal(hojas[0].dias[0].dentroDeLaFicha, false, 'El lunes 19 es antes de que empiece la ficha')
  assert.equal(hojas[0].dias[3].fecha, '2026-10-22')
  assert.equal(hojas[0].dias[3].dentroDeLaFicha, true)
  assert.equal(hojas[1].hasta, '2026-11-13')
  assert.deepEqual(hojasDeAsistencia('', ''), [], 'Sin fechas no hay hojas')
})

test('Solo cuentan los días de clase dentro de la ficha', () => {
  assert.equal(esDiaDeClase('2026-10-22', '2026-10-22', '2026-11-13'), true)
  assert.equal(esDiaDeClase('2026-10-24', '2026-10-22', '2026-11-13'), false, 'Sábado')
  assert.equal(esDiaDeClase('2026-10-21', '2026-10-22', '2026-11-13'), false, 'Antes del inicio')
  assert.equal(esDiaDeClase('2026-11-16', '2026-10-22', '2026-11-13'), false, 'Después del fin')
  assert.equal(esDiaDeClase('2026-10-22', '', ''), false, 'Sin fechas de ficha no se marca nada')
  assert.equal(fechaValida('2026-02-30'), false)
  assert.ok(errorRangoFicha('2026-11-13', '2026-10-22'), 'El fin no puede ser antes del inicio')
  assert.ok(errorRangoFicha('2026-01-01', '2028-01-01'), 'Un rango de dos años es un error de digitación')
})

/* ----- Sesión ----- */

test('El token del aprendiz no se puede falsificar ni sirve como admin', () => {
  const { token } = crearSesionAprendiz('1122334455', 1)
  assert.deepEqual(leerSesionAprendiz(token), { documento: '1122334455', version: 1 })
  assert.equal(leerSesionAprendiz(token.replace('1122334455', '9988776655')), null, 'Cambiar el documento invalida la firma')
  assert.equal(leerSesionAprendiz(token.replace('.1.', '.2.')), null, 'Cambiar la versión invalida la firma')
  assert.equal(sesionAdminValida(token), false)
  assert.equal(leerSesionAprendiz(crearSesionAdmin().token), null)
})

/* ----- Cuentas ----- */

test('HTTP: registrarse, ver quién soy y no dejar registrar el mismo documento dos veces', async () => {
  const token = await registrar('1000000001')
  const yo = await pedir('/api/aprendices/yo', { headers: comoAprendiz(token) })
  assert.equal(yo.body.aprendiz.nombre, 'Dayana Ipuana')
  assert.equal(yo.body.aprendiz.tieneFirma, false)
  assert.ok(!('pin' in yo.body.aprendiz), 'El PIN cifrado nunca sale')

  const fila = crudo.prepare("SELECT pin FROM aprendices WHERE documento = '1000000001'").get()
  assert.ok(fila.pin.startsWith('scrypt$') && !fila.pin.includes('4821'), 'El PIN se guarda cifrado')

  const otraVez = await pedir('/api/aprendices/registro', {
    method: 'POST', body: { nombre: 'Otro Nombre', documento: '1000000001', tipoDocumento: 'CC', pin: '0000' }
  })
  assert.equal(otraVez.status, 409, 'Nadie le cambia el PIN a otro registrándose con su documento')

  const sinSesion = await pedir('/api/aprendices/yo')
  assert.equal(sinSesion.body.aprendiz, null)
})

test('HTTP: validaciones del registro', async () => {
  const casos = [
    { nombre: 'Ana', documento: '1000000002', tipoDocumento: 'CC', pin: '1234' },
    { nombre: 'Ana Pérez', documento: '123', tipoDocumento: 'CC', pin: '1234' },
    { nombre: 'Ana Pérez', documento: '1000000002', tipoDocumento: 'XX', pin: '1234' },
    { nombre: 'Ana Pérez', documento: '1000000002', tipoDocumento: 'CC', pin: '12a4' }
  ]
  for (const body of casos) {
    assert.equal((await pedir('/api/aprendices/registro', { method: 'POST', body })).status, 400, JSON.stringify(body))
  }
})

test(`HTTP: ${MAX_FALLOS_PIN} PIN malos bloquean la cuenta aunque después pongan el bueno`, async () => {
  await registrar('1000000003', 'Luis Epieyú', '7351')
  const malo = { documento: '1000000003', pin: '0000' }

  const primero = await pedir('/api/aprendices/entrar', { method: 'POST', body: malo })
  assert.equal(primero.status, 401)
  assert.equal(primero.body.intentosRestantes, 2)
  await pedir('/api/aprendices/entrar', { method: 'POST', body: malo })
  const tercero = await pedir('/api/aprendices/entrar', { method: 'POST', body: malo })
  assert.equal(tercero.status, 429)
  assert.equal(tercero.body.bloqueado, true)
  assert.ok(tercero.body.bloqueadoHasta > Date.now())

  const bueno = await pedir('/api/aprendices/entrar', { method: 'POST', body: { documento: '1000000003', pin: '7351' } })
  assert.equal(bueno.status, 429, 'Bloqueado es bloqueado, así acierte')

  // El profe lo ve bloqueado y le da un PIN nuevo, que lo desbloquea
  const lista = await pedir('/api/admin/aprendices', { headers: comoAdmin() })
  assert.equal(lista.body.aprendices.find(a => a.documento === '1000000003').bloqueado, true)
  const { body } = await pedir('/api/admin/aprendices/1000000003/reiniciar-pin', { method: 'POST', headers: comoAdmin() })
  assert.match(body.pin, /^\d{4}$/)
  const entra = await pedir('/api/aprendices/entrar', { method: 'POST', body: { documento: '1000000003', pin: body.pin } })
  assert.equal(entra.status, 200)
})

test('HTTP: un documento que no existe da el mismo error que un PIN malo', async () => {
  const res = await pedir('/api/aprendices/entrar', { method: 'POST', body: { documento: '1999999999', pin: '1234' } })
  assert.equal(res.status, 401)
  assert.match(res.body.error, /Documento o PIN incorrecto/)
})

test('HTTP: reiniciar el PIN cierra las sesiones viejas', async () => {
  const token = await registrar('1000000004', 'Rosa Uriana')
  assert.ok((await pedir('/api/aprendices/yo', { headers: comoAprendiz(token) })).body.aprendiz)
  await pedir('/api/admin/aprendices/1000000004/reiniciar-pin', { method: 'POST', headers: comoAdmin() })
  assert.equal((await pedir('/api/aprendices/yo', { headers: comoAprendiz(token) })).body.aprendiz, null)
  const publicar = await pedir('/api/aportes', {
    method: 'POST', headers: comoAprendiz(token), body: { pregunta: '¿?', respuesta: 'Algo' }
  })
  assert.equal(publicar.status, 401)
  assert.equal(publicar.body.sesionAprendizVencida, true)
})

test('HTTP: la firma se guarda una sola vez y debe ser un PNG', async () => {
  const token = await registrar('1000000005', 'Carlos Pushaina')
  const mala = await pedir('/api/aprendices/perfil', { method: 'POST', headers: comoAprendiz(token), body: { firma: 'data:image/svg+xml;base64,PHN2Zz4=' } })
  assert.equal(mala.status, 400)

  const buena = await pedir('/api/aprendices/perfil', { method: 'POST', headers: comoAprendiz(token), body: { firma: FIRMA } })
  assert.equal(buena.status, 200)
  assert.equal(buena.body.aprendiz.tieneFirma, true)

  const otra = await pedir('/api/aprendices/perfil', { method: 'POST', headers: comoAprendiz(token), body: { firma: FIRMA } })
  assert.equal(otra.status, 409)

  // El profe se la borra y puede firmar otra vez
  await pedir('/api/admin/aprendices/1000000005?solo=firma', { method: 'DELETE', headers: comoAdmin() })
  const repetida = await pedir('/api/aprendices/perfil', { method: 'POST', headers: comoAprendiz(token), body: { firma: FIRMA } })
  assert.equal(repetida.status, 200)
})

test('HTTP: solo el profe ve, corrige y borra aprendices', async () => {
  const token = await registrar('1000000006', 'Nombre Mal Escrito')
  assert.equal((await pedir('/api/admin/aprendices')).status, 403)
  assert.equal((await pedir('/api/admin/aprendices', { headers: comoAprendiz(token) })).status, 403)

  const corregido = await pedir('/api/admin/aprendices/1000000006', {
    method: 'PUT', headers: comoAdmin(), body: { nombre: 'Nombre Bien Escrito', tipoDocumento: 'TI', ficha: '2825001' }
  })
  assert.equal(corregido.body.aprendiz.nombre, 'Nombre Bien Escrito')
  assert.equal(corregido.body.aprendiz.tipoDocumento, 'TI')

  await pedir('/api/admin/aprendices/1000000006', { method: 'DELETE', headers: comoAdmin() })
  assert.equal((await pedir('/api/aprendices/yo', { headers: comoAprendiz(token) })).body.aprendiz, null, 'Sin cuenta no hay sesión')
})

/* ----- Foro con cuenta ----- */

test('HTTP: sin cuenta no se publica ni se replica', async () => {
  const aporte = await pedir('/api/aportes', { method: 'POST', body: { autor: 'Fantasma', pregunta: '¿?', respuesta: 'Boo', clave_edicion: '1234' } })
  assert.equal(aporte.status, 401)
  assert.equal(aporte.body.necesitaCuenta, true)

  crudo.exec(`INSERT INTO aportes (id, autor, pregunta, respuesta, created_at, updated_at)
    VALUES ('viejo', 'Ana', '¿GPL?', 'Sí', '2026-10-01T00:00:00Z', '2026-10-01T00:00:00Z')`)
  const replica = await pedir('/api/aportes/viejo/comentarios', { method: 'POST', body: { autor: 'Fantasma', contenido: 'Boo' } })
  assert.equal(replica.status, 401)
})

test('HTTP: con cuenta, el nombre sale de la cuenta y solo el dueño edita su aporte', async () => {
  const dueno = await registrar('1000000007', 'Yolima Gouriyú')
  const otro = await registrar('1000000008', 'Jhon Ipuana')

  const creado = await pedir('/api/aportes', {
    method: 'POST',
    headers: comoAprendiz(dueno),
    body: { autor: 'Me Hago Pasar Por Otro', ficha: '999', pregunta: '¿MIT o GPL?', respuesta: 'MIT, porque…' }
  })
  assert.equal(creado.status, 201, creado.body.error)
  assert.equal(creado.body.autor, 'Yolima Gouriyú', 'El nombre del cuerpo se ignora')
  assert.equal(creado.body.ficha, '2825000', 'La ficha también sale de la cuenta')
  assert.equal(creado.body.es_mio, 1)
  assert.equal(creado.body.tiene_clave, 0, 'Con cuenta no hace falta clave de autor')
  const id = creado.body.id

  // En el listado: es mío para el dueño, no para el otro, y el documento nunca sale
  const paraDueno = await pedir('/api/aportes', { headers: comoAprendiz(dueno) })
  const paraOtro = await pedir('/api/aportes', { headers: comoAprendiz(otro) })
  assert.equal(paraDueno.body.find(a => a.id === id).es_mio, 1)
  assert.equal(paraOtro.body.find(a => a.id === id).es_mio, 0)
  assert.ok(!JSON.stringify(paraOtro.body).includes('1000000007'), 'El documento no se filtra en el listado')

  const editaOtro = await pedir(`/api/aportes/${id}`, {
    method: 'PUT', headers: comoAprendiz(otro), body: { pregunta: 'Hackeado', respuesta: 'Jaja' }
  })
  assert.equal(editaOtro.status, 403)

  const editaDueno = await pedir(`/api/aportes/${id}`, {
    method: 'PUT', headers: comoAprendiz(dueno), body: { autor: 'Otro Nombre', pregunta: '¿MIT o GPL? (corregida)', respuesta: 'MIT.' }
  })
  assert.equal(editaDueno.status, 200)
  assert.equal(editaDueno.body.autor, 'Yolima Gouriyú')
  assert.equal(editaDueno.body.pregunta, '¿MIT o GPL? (corregida)')

  // La réplica del otro sale con su nombre de la cuenta
  const replica = await pedir(`/api/aportes/${id}/comentarios`, {
    method: 'POST', headers: comoAprendiz(otro), body: { autor: 'Yolima Gouriyú', contenido: 'Buen punto' }
  })
  assert.equal(replica.status, 201)
  assert.equal(replica.body.autor, 'Jhon Ipuana')

  // El panel del profe los cuenta por documento
  const resumen = await pedir('/api/admin/resumen', { headers: comoAdmin() })
  const filas = resumenPorAprendiz(resumen.body.aportes, resumen.body.replicas)
  assert.equal(filas.find(f => f.documento === '1000000007').aportes.length, 1)
  assert.equal(filas.find(f => f.documento === '1000000008').replicas, 1)

  const borraOtro = await pedir(`/api/aportes/${id}`, { method: 'DELETE', headers: comoAprendiz(otro) })
  assert.equal(borraOtro.status, 403)
  const borraDueno = await pedir(`/api/aportes/${id}`, { method: 'DELETE', headers: comoAprendiz(dueno) })
  assert.equal(borraDueno.status, 200)
  const quedan = crudo.prepare('SELECT COUNT(*) AS n FROM autoria_aprendiz WHERE objetivo_id = ?').get(id)
  assert.equal(quedan.n, 0, 'Al borrar el aporte no queda autoría huérfana')
})

test('El panel junta por documento aunque el nombre cambie, y lo viejo por nombre', () => {
  const aportes = [
    { id: 'x1', autor: 'Ana Pérez', documento: '111', calificacion: 80, created_at: '1' },
    { id: 'x2', autor: 'Ana  perez', documento: '', calificacion: null, created_at: '2' }
  ]
  const replicas = [
    { autor: 'Ana María Pérez', documento: '111', aporte_id: 'x2', created_at: '3' },
    { autor: 'ana pérez', documento: '', aporte_id: 'x1', created_at: '4' }
  ]
  const filas = resumenPorAprendiz(aportes, replicas)
  const conCuenta = filas.find(f => f.documento === '111')
  assert.equal(conCuenta.aportes.length, 1)
  assert.equal(conCuenta.replicas, 1, 'La réplica con otro nombre pero el mismo documento es de ella')
})

/* ----- Asistencia ----- */

test('HTTP: el profe pone las fechas, marca asistencia y la planilla trae las firmas', async () => {
  const token = await registrar('1000000009', 'Wilmer Epinayú')
  await pedir('/api/aprendices/perfil', { method: 'POST', headers: comoAprendiz(token), body: { firma: FIRMA } })

  assert.equal((await pedir('/api/admin/asistencia')).status, 403)
  assert.equal((await pedir('/api/admin/asistencia', { headers: comoAprendiz(token) })).status, 403)

  // Sin fechas de ficha no se puede marcar
  const sinFechas = await pedir('/api/admin/asistencia', {
    method: 'PUT', headers: comoAdmin(), body: { fecha: '2026-10-22', documentos: ['1000000009'], presente: true }
  })
  assert.equal(sinFechas.status, 400)

  const fechasAlReves = await pedir('/api/admin/asistencia/encabezado', {
    method: 'PUT', headers: comoAdmin(), body: { ficha: '2825000', inicio: '2026-11-13', fin: '2026-10-22' }
  })
  assert.equal(fechasAlReves.status, 400)

  const encabezado = await pedir('/api/admin/asistencia/encabezado', {
    method: 'PUT', headers: comoAdmin(),
    body: { ficha: '2825000', programa: 'Análisis y Desarrollo de Software', codigoCentro: '9227', inicio: '2026-10-22', fin: '2026-11-13' }
  })
  assert.equal(encabezado.status, 200, encabezado.body.error)

  const sabado = await pedir('/api/admin/asistencia', {
    method: 'PUT', headers: comoAdmin(), body: { fecha: '2026-10-24', documentos: ['1000000009'], presente: true }
  })
  assert.equal(sabado.status, 400)

  const marcado = await pedir('/api/admin/asistencia', {
    method: 'PUT', headers: comoAdmin(), body: { fecha: '2026-10-22', documentos: ['1000000009', '5555555555'], presente: true }
  })
  assert.equal(marcado.status, 200)
  assert.deepEqual(marcado.body.presentes, ['1000000009'], 'Un documento sin cuenta no se marca')

  const planilla = await pedir('/api/admin/asistencia/planilla', { headers: comoAdmin() })
  assert.equal(planilla.body.encabezado.inicio, '2026-10-22')
  assert.deepEqual(planilla.body.asistencia['2026-10-22'], ['1000000009'])
  assert.equal(planilla.body.firmas['1000000009'], FIRMA)
  assert.ok(planilla.body.aprendices.some(a => a.documento === '1000000009'))

  const desmarcado = await pedir('/api/admin/asistencia', {
    method: 'PUT', headers: comoAdmin(), body: { fecha: '2026-10-22', documentos: ['1000000009'], presente: false }
  })
  assert.deepEqual(desmarcado.body.presentes, [])
})
