import test from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { crearAdaptadorSqlite, SCHEMA_SEGURIDAD } from '../server/database.js'
import { SCHEMA_REACCIONES } from '../server/reacciones.js'
import { SCHEMA_JUICIO, BANDOS, VEREDICTOS } from '../server/juicio.js'
import { crearSesionAdmin } from '../server/seguridad.js'
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
    INSERT INTO aportes (id, autor, pregunta, respuesta, created_at, updated_at) VALUES
      ('a1', 'Ana', '¿GPL o MIT?', 'Escogí GPL', '2026-10-01T00:00:00Z', '2026-10-01T00:00:00Z'),
      ('a2', 'Luis', '¿Y el EULA?', 'Propietaria', '2026-10-02T00:00:00Z', '2026-10-02T00:00:00Z');
    INSERT INTO comentarios (id, aporte_id, autor, contenido, created_at) VALUES
      ('c1', 'a1', 'Sofía', 'Buen punto', '2026-10-03T00:00:00Z');
  `)
  db.exec(SCHEMA_SEGURIDAD)
  db.exec(SCHEMA_REACCIONES)
  db.exec(SCHEMA_JUICIO)
  return crearAdaptadorSqlite(db)
}

const db = crearDb()
app.set('obtenerDb', () => db)

let servidor
let base
test.before(async () => {
  servidor = app.listen(0)
  await new Promise(resolve => servidor.once('listening', resolve))
  base = `http://127.0.0.1:${servidor.address().port}`
})
test.after(() => new Promise(resolve => servidor.close(resolve)))

const comoAdmin = () => ({ Authorization: `Bearer ${crearSesionAdmin().token}` })

async function pedir(ruta, { method = 'GET', body, headers = {} } = {}) {
  const res = await fetch(`${base}${ruta}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body)
  })
  return { status: res.status, body: await res.json() }
}

test('Bandos y veredictos conocidos', () => {
  assert.deepEqual(BANDOS, ['fiscalia', 'defensa', 'neutral'])
  assert.deepEqual(VEREDICTOS, ['fiscalia', 'defensa', 'dividido'])
})

test('HTTP: solo el administrador abre juicios, dicta sentencia y ve el panel', async () => {
  assert.equal((await pedir('/api/aportes/a1/juicio', { method: 'POST', body: { abierto: true } })).status, 403)
  assert.equal((await pedir('/api/aportes/a1/sentencia', { method: 'POST', body: { veredicto: 'defensa', sentencia: 'x' } })).status, 403)
  assert.equal((await pedir('/api/admin/resumen')).status, 403)
})

test('HTTP: abrir juicio, replicar con bando y dictar sentencia sin tocar la nota', async () => {
  const abierto = await pedir('/api/aportes/a1/juicio', { method: 'POST', body: { abierto: true }, headers: comoAdmin() })
  assert.equal(abierto.status, 200)
  assert.equal(abierto.body.juicio.veredicto, '')

  const fiscal = await pedir('/api/aportes/a1/comentarios', {
    method: 'POST', body: { autor: 'Pedro', contenido: 'Acuso: la GPL no le sirve al cliente', bando: 'fiscalia' }
  })
  assert.equal(fiscal.status, 201)
  assert.equal(fiscal.body.bando, 'fiscalia')

  const sinBando = await pedir('/api/aportes/a1/comentarios', { method: 'POST', body: { autor: 'Rosa', contenido: 'Yo solo miro' } })
  assert.equal(sinBando.body.bando, 'neutral', 'Sin bando, la réplica queda neutral')

  const malo = await pedir('/api/aportes/a1/comentarios', { method: 'POST', body: { autor: 'X', contenido: 'Y', bando: 'jurado' } })
  assert.equal(malo.status, 400)

  const sentencia = await pedir('/api/aportes/a1/sentencia', {
    method: 'POST', body: { veredicto: 'defensa', sentencia: 'La GPL sí aplica: no se distribuye cerrado.' }, headers: comoAdmin()
  })
  assert.equal(sentencia.status, 200)
  assert.equal(sentencia.body.juicio.veredicto, 'defensa')

  const detalle = await pedir('/api/aportes/a1')
  assert.equal(detalle.body.juicio.veredicto, 'defensa')
  assert.equal(detalle.body.calificacion, null, 'La sentencia va aparte de la calificación')
  const bandos = Object.fromEntries(detalle.body.comentarios.map(c => [c.autor, c.bando]))
  assert.deepEqual(bandos, { Sofía: '', Pedro: 'fiscalia', Rosa: 'neutral' })

  const lista = await pedir('/api/aportes')
  const a1 = lista.body.find(a => a.id === 'a1')
  assert.equal(a1.en_juicio, 1)
  assert.equal(a1.juicio_veredicto, 'defensa')

  // Volver a abrirlo no borra la sentencia
  const otraVez = await pedir('/api/aportes/a1/juicio', { method: 'POST', body: { abierto: true }, headers: comoAdmin() })
  assert.equal(otraVez.body.juicio.veredicto, 'defensa')
})

test('HTTP: fuera de juicio las réplicas no llevan bando y no se puede sentenciar', async () => {
  const replica = await pedir('/api/aportes/a2/comentarios', { method: 'POST', body: { autor: 'Ana', contenido: 'Ok', bando: 'fiscalia' } })
  assert.equal(replica.status, 201)
  assert.equal(replica.body.bando, '')

  const sentencia = await pedir('/api/aportes/a2/sentencia', {
    method: 'POST', body: { veredicto: 'fiscalia', sentencia: 'Culpable' }, headers: comoAdmin()
  })
  assert.equal(sentencia.status, 404)
})

test('HTTP: sentencia con veredicto o texto no válidos responde 400', async () => {
  await pedir('/api/aportes/a2/juicio', { method: 'POST', body: { abierto: true }, headers: comoAdmin() })
  const sinVeredicto = await pedir('/api/aportes/a2/sentencia', { method: 'POST', body: { veredicto: 'culpable', sentencia: 'x' }, headers: comoAdmin() })
  assert.equal(sinVeredicto.status, 400)
  const sinTexto = await pedir('/api/aportes/a2/sentencia', { method: 'POST', body: { veredicto: 'dividido', sentencia: '  ' }, headers: comoAdmin() })
  assert.equal(sinTexto.status, 400)

  const archivado = await pedir('/api/aportes/a2/juicio', { method: 'POST', body: { abierto: false }, headers: comoAdmin() })
  assert.deepEqual(archivado.body, { juicio: null })
})

test('HTTP: el resumen del profe trae aportes y réplicas', async () => {
  const { status, body } = await pedir('/api/admin/resumen', { headers: comoAdmin() })
  assert.equal(status, 200)
  assert.deepEqual(body.aportes.map(a => a.id), ['a1', 'a2'])
  assert.ok(body.replicas.some(r => r.autor === 'Pedro' && r.aporte_id === 'a1'))
  assert.ok(!('clave_edicion' in body.aportes[0]), 'El resumen nunca expone las claves de autor')
})

test('HTTP: eliminar un aporte borra su juicio y los bandos de sus réplicas', async () => {
  const res = await pedir('/api/aportes/a1', { method: 'DELETE', headers: comoAdmin() })
  assert.equal(res.status, 200)
  assert.equal(await db.get('SELECT * FROM juicios WHERE aporte_id = ?', ['a1']), undefined)
  const bandos = await db.get('SELECT CAST(COUNT(*) AS INTEGER) AS n FROM bandos_comentario')
  assert.equal(bandos.n, 0, 'No quedan bandos huérfanos de las réplicas de a1')
})
