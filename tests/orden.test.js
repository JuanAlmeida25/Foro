import test from 'node:test'
import assert from 'node:assert/strict'
import { ORDENES, ORDEN_POR_DEFECTO, buscarOrden, ordenarAportes, fueEditado, fechaCompleta } from '../src/utils/orden.js'

const APORTES = [
  { id: 'b', created_at: '2026-10-10T15:30:00.000Z', updated_at: '2026-10-12T09:00:00.000Z' },
  { id: 'a', created_at: '2026-10-08T08:00:00.000Z', updated_at: '2026-10-08T08:00:00.000Z' },
  { id: 'c', created_at: '2026-10-10T15:45:00.000Z', updated_at: '2026-10-10T15:45:00.000Z' },
  { id: 'sin-fecha', created_at: null, updated_at: null }
]
const ids = lista => lista.map(a => a.id)
const porId = id => APORTES.find(a => a.id === id)

test('Opciones de orden disponibles', () => {
  assert.deepEqual(ORDENES.map(o => o.id), ['recientes', 'antiguos', 'editados', 'utiles'])
  assert.equal(ORDEN_POR_DEFECTO, 'recientes', 'Por defecto se mantiene el orden del servidor: más recientes primero')
  assert.equal(buscarOrden('no-existe').id, 'recientes', 'Un criterio desconocido usa el orden por defecto')
})

test('Más recientes primero ordena por fecha y hora de publicación', () => {
  // c y b son del mismo día; c se publicó 15 minutos después
  assert.deepEqual(ids(ordenarAportes(APORTES, 'recientes')), ['c', 'b', 'a', 'sin-fecha'])
})

test('Más antiguos primero invierte el orden y deja al final los aportes sin fecha', () => {
  assert.deepEqual(ids(ordenarAportes(APORTES, 'antiguos')), ['a', 'b', 'c', 'sin-fecha'])
})

test('Editados recientemente usa la fecha de la última edición', () => {
  assert.deepEqual(ids(ordenarAportes(APORTES, 'editados')), ['b', 'c', 'a', 'sin-fecha'])
})

test('Más útiles primero ordena por reacciones y desempata por fecha', () => {
  const reacciones = { b: 2, a: 5, c: 2 } // c es más reciente que b; sin-fecha no tiene reacciones
  const conReacciones = APORTES.map(a => (a.id in reacciones ? { ...a, total_reacciones: reacciones[a.id] } : { ...a }))
  assert.deepEqual(ids(ordenarAportes(conReacciones, 'utiles')), ['a', 'c', 'b', 'sin-fecha'])
})

test('Sin fecha de edición se usa la de publicación', () => {
  const lista = [
    { id: 'viejo', created_at: '2026-01-01T10:00:00.000Z' },
    { id: 'nuevo', created_at: '2026-05-01T10:00:00.000Z' }
  ]
  assert.deepEqual(ids(ordenarAportes(lista, 'editados')), ['nuevo', 'viejo'])
})

test('Ordenar no modifica la lista original y conserva los empates', () => {
  const copia = APORTES.slice()
  ordenarAportes(APORTES, 'antiguos')
  assert.deepEqual(APORTES, copia, 'La lista recibida no debe cambiar')

  const empate = [
    { id: 'x', created_at: '2026-10-10T10:00:00.000Z' },
    { id: 'y', created_at: '2026-10-10T10:00:00.000Z' }
  ]
  assert.deepEqual(ids(ordenarAportes(empate, 'recientes')), ['x', 'y'])
})

test('Solo se marca como editado lo que cambió después de publicarse', () => {
  assert.equal(fueEditado(porId('b')), true, 'b se editó dos días después')
  assert.equal(fueEditado(porId('a')), false, 'a tiene la misma fecha de publicación y edición')
  assert.equal(fueEditado(porId('sin-fecha')), false, 'Sin fechas no se puede decir que se editó')
})

test('Fecha completa para el texto de ayuda', () => {
  assert.equal(fechaCompleta(null), '')
  assert.equal(fechaCompleta('no es fecha'), '')
  assert.match(fechaCompleta('2026-10-10T15:30:00.000Z'), /2026/, 'Debe incluir el año')
})
