import test from 'node:test'
import assert from 'node:assert/strict'
import { FILTROS_ESTADO, buscarFiltro, filtrarAportes, indexarBusqueda, textoBuscable, hayFiltroActivo } from '../src/utils/filtros.js'

const APORTES = [
  { id: 'sin', autor: 'Ana Gómez', ficha: '2977456', pregunta: '¿Qué es una licencia?', respuesta: 'Habla de la GPL', calificacion: null, total_comentarios: 0 },
  { id: 'aprobado', autor: 'Luis Pérez', ficha: '2977456', pregunta: '¿Qué es una licencia?', respuesta: 'Explica la licencia MIT', calificacion: 85, total_comentarios: 3 },
  { id: 'limite', autor: 'Sofía Ruiz', ficha: '3001234', pregunta: 'Tipos de licencias', respuesta: 'Software propietario y código abierto', calificacion: 70, total_comentarios: 1 },
  { id: 'reprobado', autor: 'Carlos Díaz', ficha: '3001234', pregunta: 'Tipos de licencias', respuesta: 'Copyleft', calificacion: 40, total_comentarios: 0 }
]
const ids = lista => lista.map(a => a.id)

test('Filtros de estado disponibles', () => {
  assert.deepEqual(FILTROS_ESTADO.map(f => f.id), ['todos', 'sin-calificar', 'aprobados', 'no-aprobados', 'sin-replicas'])
  assert.equal(buscarFiltro('no-existe').id, 'todos')
})

test('Cada estado filtra lo que corresponde (70 aprueba)', () => {
  assert.deepEqual(ids(filtrarAportes(APORTES, { estado: 'todos' })), ['sin', 'aprobado', 'limite', 'reprobado'])
  assert.deepEqual(ids(filtrarAportes(APORTES, { estado: 'sin-calificar' })), ['sin'])
  assert.deepEqual(ids(filtrarAportes(APORTES, { estado: 'aprobados' })), ['aprobado', 'limite'])
  assert.deepEqual(ids(filtrarAportes(APORTES, { estado: 'no-aprobados' })), ['reprobado'])
  assert.deepEqual(ids(filtrarAportes(APORTES, { estado: 'sin-replicas' })), ['sin', 'reprobado'])
})

test('La búsqueda revisa autor, ficha, pregunta y respuesta sin importar tildes', () => {
  assert.deepEqual(ids(filtrarAportes(APORTES, { texto: 'gomez' })), ['sin'])
  assert.deepEqual(ids(filtrarAportes(APORTES, { texto: '3001234' })), ['limite', 'reprobado'])
  assert.deepEqual(ids(filtrarAportes(APORTES, { texto: 'CODIGO ABIERTO' })), ['limite'])
  assert.deepEqual(ids(filtrarAportes(APORTES, { texto: 'nada que ver' })), [])
})

test('Con el índice precalculado el resultado es el mismo', () => {
  const indice = indexarBusqueda(APORTES)
  assert.equal(indice.size, APORTES.length)
  assert.equal(indice.get(APORTES[0]), textoBuscable(APORTES[0]))
  for (const texto of ['gomez', '3001234', 'CODIGO ABIERTO', 'licencia', 'nada que ver', '']) {
    assert.deepEqual(ids(filtrarAportes(APORTES, { texto }, indice)), ids(filtrarAportes(APORTES, { texto })), texto)
  }
})

test('El índice es el que se usa para buscar y no mezcla campos', () => {
  const indice = new Map([[APORTES[0], 'texto del indice']])
  assert.deepEqual(ids(filtrarAportes([APORTES[0]], { texto: 'indice' }, indice)), ['sin'])
  // "Gómez" + "2977456" juntos no forman una palabra
  assert.deepEqual(ids(filtrarAportes(APORTES, { texto: 'gomez2977' })), [])
})

test('Búsqueda y estado se combinan', () => {
  assert.deepEqual(ids(filtrarAportes(APORTES, { texto: 'licencia', estado: 'aprobados' })), ['aprobado', 'limite'])
})

test('Detecta si hay algún filtro activo', () => {
  assert.equal(hayFiltroActivo({}), false)
  assert.equal(hayFiltroActivo({ texto: '   ' }), false)
  assert.equal(hayFiltroActivo({ texto: 'mit' }), true)
  assert.equal(hayFiltroActivo({ estado: 'aprobados' }), true)
})
