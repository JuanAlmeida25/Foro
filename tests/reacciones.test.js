import test from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import {
  SCHEMA_REACCIONES,
  SQL_TOTAL_REACCIONES_APORTE,
  SQL_TOTAL_REACCIONES_COMENTARIO,
  votanteValido,
  cifrarVotante,
  objetivoExiste,
  alternarReaccion,
  contarReacciones,
  borrarReaccionesDeAporte,
  borrarReaccionesDeComentario
} from '../server/reacciones.js'

// Mismo adaptador que server/database.js usa con SQLite, sobre una base en memoria
function crearDb() {
  const db = new DatabaseSync(':memory:')
  db.exec(`
    CREATE TABLE aportes (id TEXT PRIMARY KEY, autor TEXT NOT NULL);
    CREATE TABLE comentarios (id TEXT PRIMARY KEY, aporte_id TEXT NOT NULL, autor TEXT NOT NULL);
    INSERT INTO aportes VALUES ('a1', 'Ana'), ('a2', 'Luis');
    INSERT INTO comentarios VALUES ('c1', 'a1', 'Sofía'), ('c2', 'a1', 'Carlos');
  `)
  db.exec(SCHEMA_REACCIONES)
  return {
    async all(sql, params = []) { return db.prepare(sql).all(...params) },
    async get(sql, params = []) { return db.prepare(sql).get(...params) },
    async run(sql, params = []) { return { changes: Number(db.prepare(sql).run(...params).changes) } }
  }
}

const VOTANTE_1 = 'navegador-uno-1234567890'
const VOTANTE_2 = 'navegador-dos-1234567890'

test('Valida el identificador anónimo del navegador', () => {
  assert.equal(votanteValido(VOTANTE_1), true)
  assert.equal(votanteValido('corto'), false)
  assert.equal(votanteValido('x'.repeat(65)), false)
  assert.equal(votanteValido(12345678901234567), false)
})

test('El identificador se guarda cifrado, nunca tal cual', async () => {
  const db = crearDb()
  await alternarReaccion(db, 'aporte', 'a1', VOTANTE_1)
  const filas = await db.all('SELECT votante FROM reacciones')
  assert.equal(filas.length, 1)
  assert.notEqual(filas[0].votante, VOTANTE_1)
  assert.equal(filas[0].votante, cifrarVotante(VOTANTE_1))
})

test('Alternar: la primera vez suma, la segunda quita', async () => {
  const db = crearDb()
  assert.deepEqual(await alternarReaccion(db, 'aporte', 'a1', VOTANTE_1), { reaccionado: true, total: 1 })
  assert.deepEqual(await alternarReaccion(db, 'aporte', 'a1', VOTANTE_1), { reaccionado: false, total: 0 })
  assert.deepEqual(await alternarReaccion(db, 'aporte', 'a1', VOTANTE_1), { reaccionado: true, total: 1 })
})

test('Cada navegador cuenta una sola vez y aportes y comentarios se cuentan por separado', async () => {
  const db = crearDb()
  await alternarReaccion(db, 'aporte', 'a1', VOTANTE_1)
  await alternarReaccion(db, 'aporte', 'a1', VOTANTE_2)
  await alternarReaccion(db, 'comentario', 'c1', VOTANTE_1)

  assert.equal(await contarReacciones(db, 'aporte', 'a1'), 2)
  assert.equal(await contarReacciones(db, 'aporte', 'a2'), 0)
  assert.equal(await contarReacciones(db, 'comentario', 'c1'), 1)
})

test('Las subconsultas de los listados devuelven los totales', async () => {
  const db = crearDb()
  await alternarReaccion(db, 'aporte', 'a1', VOTANTE_1)
  await alternarReaccion(db, 'comentario', 'c2', VOTANTE_1)
  await alternarReaccion(db, 'comentario', 'c2', VOTANTE_2)

  const aportes = await db.all(`SELECT a.id, ${SQL_TOTAL_REACCIONES_APORTE('a.id')} AS total_reacciones FROM aportes a ORDER BY a.id`)
  assert.deepEqual(aportes.map(a => [a.id, a.total_reacciones]), [['a1', 1], ['a2', 0]])

  const comentarios = await db.all(`SELECT comentarios.id, ${SQL_TOTAL_REACCIONES_COMENTARIO('comentarios.id')} AS total_reacciones FROM comentarios ORDER BY id`)
  assert.deepEqual(comentarios.map(c => [c.id, c.total_reacciones]), [['c1', 0], ['c2', 2]])
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
  await alternarReaccion(db, 'aporte', 'a1', VOTANTE_1)
  await alternarReaccion(db, 'aporte', 'a2', VOTANTE_1)
  await alternarReaccion(db, 'comentario', 'c1', VOTANTE_1)
  await alternarReaccion(db, 'comentario', 'c2', VOTANTE_1)

  await borrarReaccionesDeComentario(db, 'c2')
  assert.equal(await contarReacciones(db, 'comentario', 'c2'), 0)
  assert.equal(await contarReacciones(db, 'comentario', 'c1'), 1)

  await borrarReaccionesDeAporte(db, 'a1')
  assert.equal(await contarReacciones(db, 'aporte', 'a1'), 0)
  assert.equal(await contarReacciones(db, 'comentario', 'c1'), 0, 'Las de sus comentarios también se borran')
  assert.equal(await contarReacciones(db, 'aporte', 'a2'), 1, 'Las de otros aportes se conservan')
})
