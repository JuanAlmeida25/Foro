import test from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { DatabaseSync } from 'node:sqlite'
import {
  SCHEMA_REACCIONES,
  MAX_REACCIONES_POR_IP,
  OBJETIVO_LIMITE_REACCIONES,
  sqlTotalReacciones,
  votanteValido,
  hashVotante,
  objetivoExiste,
  fijarReaccion,
  contarReacciones,
  borrarReaccionesDeAporte,
  borrarReaccionesDeComentario
} from '../server/reacciones.js'
import { crearAdaptadorSqlite, SCHEMA_SEGURIDAD } from '../server/database.js'
import { SCHEMA_JUICIO } from '../server/juicio.js'
import { MENSAJE_DEMASIADOS_INTENTOS, crearSesionAdmin } from '../server/seguridad.js'
import app from '../server/app.js'

// El mismo adaptador que server/database.js usa con SQLite, sobre una base en memoria
function crearDb() {
  const db = new DatabaseSync(':memory:')
  db.exec(`
    CREATE TABLE aportes (id TEXT PRIMARY KEY, autor TEXT NOT NULL);
    CREATE TABLE comentarios (id TEXT PRIMARY KEY, aporte_id TEXT NOT NULL, autor TEXT NOT NULL);
    INSERT INTO aportes VALUES ('a1', 'Ana'), ('a2', 'Luis');
    INSERT INTO comentarios VALUES ('c1', 'a1', 'Sofía'), ('c2', 'a1', 'Carlos');
  `)
  db.exec(SCHEMA_SEGURIDAD)
  db.exec(SCHEMA_REACCIONES)
  db.exec(SCHEMA_JUICIO)
  return crearAdaptadorSqlite(db)
}

const VOTANTE_1 = '3f2b8c1e-5d4a-4f6b-9c7e-1a2b3c4d5e6f'
const VOTANTE_2 = 'a9e8d7c6-b5a4-4c3d-8e2f-0a1b2c3d4e5f'

test('El identificador del navegador debe ser un UUID', () => {
  assert.equal(votanteValido(VOTANTE_1), true)
  assert.equal(votanteValido(VOTANTE_1.toUpperCase()), true)
  assert.equal(votanteValido(crypto.randomUUID()), true)
  assert.equal(votanteValido('navegador-uno-1234567890'), false)
  assert.equal(votanteValido('0123456789abcdef0123456789abcdef'), false, 'Sin guiones no es un UUID')
  assert.equal(votanteValido(VOTANTE_1 + 'x'), false)
  assert.equal(votanteValido(12345678901234567), false)
  assert.equal(votanteValido(undefined), false)
})

test('Del identificador solo se guarda su hash, nunca tal cual', async () => {
  const db = crearDb()
  await fijarReaccion(db, 'aporte', 'a1', VOTANTE_1, true)
  const filas = await db.all('SELECT votante FROM reacciones')
  assert.equal(filas.length, 1)
  assert.notEqual(filas[0].votante, VOTANTE_1)
  assert.equal(filas[0].votante, hashVotante(VOTANTE_1))
  assert.equal(hashVotante(VOTANTE_1.toUpperCase()), hashVotante(VOTANTE_1), 'El mismo UUID en mayúsculas cuenta igual')
})

test('Reaccionar es idempotente: repetir true o false no cambia el resultado', async () => {
  const db = crearDb()
  assert.deepEqual(await fijarReaccion(db, 'aporte', 'a1', VOTANTE_1, true), { reaccionado: true, total: 1 })
  assert.deepEqual(await fijarReaccion(db, 'aporte', 'a1', VOTANTE_1, true), { reaccionado: true, total: 1 })
  assert.deepEqual(await fijarReaccion(db, 'aporte', 'a1', VOTANTE_1, false), { reaccionado: false, total: 0 })
  assert.deepEqual(await fijarReaccion(db, 'aporte', 'a1', VOTANTE_1, false), { reaccionado: false, total: 0 })
})

test('Cada navegador cuenta una sola vez y aportes y comentarios se cuentan por separado', async () => {
  const db = crearDb()
  await fijarReaccion(db, 'aporte', 'a1', VOTANTE_1, true)
  await fijarReaccion(db, 'aporte', 'a1', VOTANTE_2, true)
  await fijarReaccion(db, 'comentario', 'c1', VOTANTE_1, true)

  assert.equal(await contarReacciones(db, 'aporte', 'a1'), 2)
  assert.equal(await contarReacciones(db, 'aporte', 'a2'), 0)
  assert.equal(await contarReacciones(db, 'comentario', 'c1'), 1)
})

test('La subconsulta de los listados devuelve los totales', async () => {
  const db = crearDb()
  await fijarReaccion(db, 'aporte', 'a1', VOTANTE_1, true)
  await fijarReaccion(db, 'comentario', 'c2', VOTANTE_1, true)
  await fijarReaccion(db, 'comentario', 'c2', VOTANTE_2, true)

  const aportes = await db.all(`SELECT a.id, ${sqlTotalReacciones('aporte', 'a.id')} AS total_reacciones FROM aportes a ORDER BY a.id`)
  assert.deepEqual(aportes.map(a => [a.id, a.total_reacciones]), [['a1', 1], ['a2', 0]])

  const comentarios = await db.all(`SELECT comentarios.id, ${sqlTotalReacciones('comentario', 'comentarios.id')} AS total_reacciones FROM comentarios ORDER BY id`)
  assert.deepEqual(comentarios.map(c => [c.id, c.total_reacciones]), [['c1', 0], ['c2', 2]])
})

test('La subconsulta rechaza tipos y columnas desconocidos', () => {
  assert.throws(() => sqlTotalReacciones('usuario', 'a.id'), /Tipo de reacción no válido/)
  assert.throws(() => sqlTotalReacciones("aporte' OR '1'='1", 'a.id'), /Tipo de reacción no válido/)
  assert.throws(() => sqlTotalReacciones('aporte', 'a.id; DROP TABLE aportes'), /Columna no válida/)
  assert.throws(() => sqlTotalReacciones('aporte', 'A.ID'), /Columna no válida/)
  assert.throws(() => sqlTotalReacciones('aporte', ''), /Columna no válida/)
})

test('Solo se puede reaccionar a aportes y comentarios que existen', async () => {
  const db = crearDb()
  assert.equal(await objetivoExiste(db, 'aporte', 'a1'), true)
  assert.equal(await objetivoExiste(db, 'aporte', 'no-existe'), false)
  assert.equal(await objetivoExiste(db, 'comentario', 'c1'), true)
  assert.equal(await objetivoExiste(db, 'comentario', 'a1'), false, 'Un id de aporte no es un comentario')
})

test('Al eliminar un aporte o comentario se borran sus reacciones', async () => {
  const db = crearDb()
  await fijarReaccion(db, 'aporte', 'a1', VOTANTE_1, true)
  await fijarReaccion(db, 'aporte', 'a2', VOTANTE_1, true)
  await fijarReaccion(db, 'comentario', 'c1', VOTANTE_1, true)
  await fijarReaccion(db, 'comentario', 'c2', VOTANTE_1, true)

  await borrarReaccionesDeComentario(db, 'c2')
  assert.equal(await contarReacciones(db, 'comentario', 'c2'), 0)
  assert.equal(await contarReacciones(db, 'comentario', 'c1'), 1)

  await borrarReaccionesDeAporte(db, 'a1')
  assert.equal(await contarReacciones(db, 'aporte', 'a1'), 0)
  assert.equal(await contarReacciones(db, 'comentario', 'c1'), 0, 'Las de sus comentarios también se borran')
  assert.equal(await contarReacciones(db, 'aporte', 'a2'), 1, 'Las de otros aportes se conservan')
})

test('transaction() confirma todo o deshace todo', async () => {
  const db = crearDb()
  await fijarReaccion(db, 'aporte', 'a1', VOTANTE_1, true)

  await assert.rejects(db.transaction(async tx => {
    await borrarReaccionesDeAporte(tx, 'a1')
    await tx.run('DELETE FROM comentarios WHERE aporte_id = ?', ['a1'])
    throw new Error('falla a mitad del borrado')
  }), /falla a mitad/)
  assert.equal(await contarReacciones(db, 'aporte', 'a1'), 1, 'Las reacciones vuelven tras el ROLLBACK')
  assert.equal((await db.all('SELECT id FROM comentarios WHERE aporte_id = ?', ['a1'])).length, 2)

  const valor = await db.transaction(async tx => {
    await borrarReaccionesDeAporte(tx, 'a1')
    await tx.run('DELETE FROM comentarios WHERE aporte_id = ?', ['a1'])
    await tx.run('DELETE FROM aportes WHERE id = ?', ['a1'])
    return 'listo'
  })
  assert.equal(valor, 'listo')
  assert.equal(await objetivoExiste(db, 'aporte', 'a1'), false)
  assert.equal(await contarReacciones(db, 'aporte', 'a1'), 0)
})

test('Las consultas que llegan durante una transacción esperan a que termine', async () => {
  const db = crearDb()
  let soltar
  const pausa = new Promise(resolve => { soltar = resolve })

  const transaccion = db.transaction(async tx => {
    await tx.run('DELETE FROM aportes WHERE id = ?', ['a2'])
    await pausa
    throw new Error('se deshace')
  })
  const lectura = db.get('SELECT id FROM aportes WHERE id = ?', ['a2'])
  soltar()

  await assert.rejects(transaccion)
  assert.deepEqual({ ...(await lectura) }, { id: 'a2' }, 'La lectura no ve el borrado que se deshizo')
})

/* ----- Ruta HTTP POST /api/reacciones ----- */

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

// Cada prueba usa su propia IP (cabecera x-forwarded-for) para no gastar el límite de las demás
async function reaccionar(cuerpo, ip) {
  const res = await fetch(`${base}/api/reacciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': ip },
    body: JSON.stringify(cuerpo)
  })
  return { status: res.status, body: await res.json() }
}

test('HTTP: pone y quita la reacción con reaccionar true/false', async () => {
  const ip = '10.0.0.1'
  const pedido = { tipo: 'comentario', id: 'c1', votante: VOTANTE_1 }
  assert.deepEqual(await reaccionar({ ...pedido, reaccionar: true }, ip), { status: 200, body: { reaccionado: true, total: 1 } })
  assert.deepEqual(await reaccionar({ ...pedido, reaccionar: true }, ip), { status: 200, body: { reaccionado: true, total: 1 } })
  assert.deepEqual(await reaccionar({ ...pedido, reaccionar: false }, ip), { status: 200, body: { reaccionado: false, total: 0 } })
})

test('HTTP: 400 por tipo, votante o reaccionar no válidos', async () => {
  const ip = '10.0.0.2'
  const valido = { tipo: 'aporte', id: 'a2', votante: VOTANTE_1, reaccionar: true }

  for (const tipo of ['usuario', '', 5, undefined]) {
    assert.equal((await reaccionar({ ...valido, tipo }, ip)).status, 400, `tipo ${tipo}`)
  }
  assert.equal((await reaccionar({ ...valido, id: '' }, ip)).status, 400, 'sin id')

  for (const votante of ['navegador-uno-1234567890', '0123456789abcdef0123456789abcdef', 123, undefined]) {
    const r = await reaccionar({ ...valido, votante }, ip)
    assert.equal(r.status, 400, `votante ${votante}`)
    assert.equal(r.body.error, 'Identificador de navegador no válido')
  }

  for (const valor of ['true', 1, 0, null, undefined]) {
    assert.equal((await reaccionar({ ...valido, reaccionar: valor }, ip)).status, 400, `reaccionar ${valor}`)
  }

  assert.equal(await contarReacciones(db, 'aporte', 'a2'), 0, 'Ninguna petición inválida dejó reacción')
})

test('HTTP: 404 si el aporte o comentario no existe', async () => {
  const ip = '10.0.0.3'
  const r1 = await reaccionar({ tipo: 'aporte', id: 'no-existe', votante: VOTANTE_1, reaccionar: true }, ip)
  assert.deepEqual(r1, { status: 404, body: { error: 'Aporte no encontrado' } })
  const r2 = await reaccionar({ tipo: 'comentario', id: 'a1', votante: VOTANTE_1, reaccionar: true }, ip)
  assert.deepEqual(r2, { status: 404, body: { error: 'Comentario no encontrado' } })
})

test('HTTP: 429 al pasarse del límite de peticiones por IP', async () => {
  const ip = '10.0.0.4'
  // Simula que esta IP ya hizo casi todas las peticiones permitidas
  const ahora = new Date().toISOString()
  for (let i = 0; i < MAX_REACCIONES_POR_IP - 1; i++) {
    await db.run('INSERT INTO intentos_fallidos (ip, objetivo, created_at) VALUES (?, ?, ?)', [ip, OBJETIVO_LIMITE_REACCIONES, ahora])
  }
  const pedido = { tipo: 'aporte', id: 'a2', votante: VOTANTE_2, reaccionar: true }

  assert.equal((await reaccionar(pedido, ip)).status, 200, 'La última petición permitida pasa')
  assert.deepEqual(await reaccionar(pedido, ip), { status: 429, body: { error: MENSAJE_DEMASIADOS_INTENTOS } })
  assert.equal((await reaccionar({ ...pedido, votante: 'no-uuid' }, ip)).status, 429, 'También se limitan las peticiones inválidas')
  assert.equal((await reaccionar(pedido, '10.0.0.5')).status, 200, 'Otra IP no se ve afectada')
})

test('HTTP: peticiones simultáneas dejan el estado final correcto', async () => {
  const ip = '10.0.0.6'
  const votantes = Array.from({ length: 10 }, () => crypto.randomUUID())

  // Diez navegadores distintos, y el primero repite su petición cinco veces a la vez
  const respuestas = await Promise.all([
    ...votantes.map(votante => reaccionar({ tipo: 'aporte', id: 'a1', votante, reaccionar: true }, ip)),
    ...Array.from({ length: 5 }, () => reaccionar({ tipo: 'aporte', id: 'a1', votante: votantes[0], reaccionar: true }, ip))
  ])
  assert.ok(respuestas.every(r => r.status === 200 && r.body.reaccionado === true))
  assert.equal(await contarReacciones(db, 'aporte', 'a1'), votantes.length, 'Cada navegador cuenta una sola vez')

  // La mitad quita su reacción a la vez (dos veces cada uno) mientras otros la vuelven a poner
  await Promise.all([
    ...votantes.slice(0, 5).flatMap(votante => [
      reaccionar({ tipo: 'aporte', id: 'a1', votante, reaccionar: false }, ip),
      reaccionar({ tipo: 'aporte', id: 'a1', votante, reaccionar: false }, ip)
    ]),
    ...votantes.slice(5).map(votante => reaccionar({ tipo: 'aporte', id: 'a1', votante, reaccionar: true }, ip))
  ])
  assert.equal(await contarReacciones(db, 'aporte', 'a1'), 5)

  const final = await reaccionar({ tipo: 'aporte', id: 'a1', votante: votantes[9], reaccionar: true }, ip)
  assert.deepEqual(final.body, { reaccionado: true, total: 5 })
})

test('HTTP: al eliminar un comentario se borran también sus reacciones (en una transacción)', async () => {
  await fijarReaccion(db, 'comentario', 'c2', VOTANTE_1, true)
  const res = await fetch(`${base}/api/comentarios/c2`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${crearSesionAdmin().token}` }
  })
  assert.equal(res.status, 200)
  assert.equal(await objetivoExiste(db, 'comentario', 'c2'), false)
  assert.equal(await contarReacciones(db, 'comentario', 'c2'), 0)
})
