import test from 'node:test'
import assert from 'node:assert/strict'
import { TERMINOS, CATEGORIAS_GLOSARIO } from '../src/data/glosario.js'
import { normalizar, buscarTerminos, sugerencias, resaltar, distancia, inicial } from '../src/utils/glosario.js'

test('Datos del glosario: ids únicos, categorías válidas y relacionados existentes', () => {
  const ids = TERMINOS.map(t => t.id)
  assert.equal(new Set(ids).size, ids.length, 'No debe haber ids repetidos')
  assert.ok(TERMINOS.length >= 40, 'El glosario debe tener al menos 40 términos')

  const categorias = new Set(CATEGORIAS_GLOSARIO.map(c => c.id))
  for (const t of TERMINOS) {
    assert.ok(categorias.has(t.categoria), `${t.id}: categoría desconocida "${t.categoria}"`)
    assert.ok(t.termino && t.definicion, `${t.id}: falta término o definición`)
    for (const r of t.relacionados) {
      assert.ok(ids.includes(r), `${t.id}: relacionado inexistente "${r}"`)
      assert.notEqual(r, t.id, `${t.id}: no puede relacionarse consigo mismo`)
    }
  }
})

// Muestra propia para que las pruebas de búsqueda no dependan del contenido editorial de TERMINOS
const MUESTRA = [
  { id: 'licencia', termino: 'Licencia', sinonimos: ['permiso de uso'], definicion: 'Autorización del titular.' },
  { id: 'codigo-fuente', termino: 'Código fuente', sinonimos: ['source code'], definicion: 'Texto del programa.' },
  { id: 'copyleft', termino: 'Copyleft', sinonimos: [], definicion: 'Obliga a compartir con la misma licencia.' },
  { id: 'derechos-autor', termino: 'Derechos de autor', sinonimos: ['copyright'], definicion: 'Protegen la obra.' },
  { id: 'nandu', termino: 'Ñandú', sinonimos: [], definicion: 'Ave usada como ejemplo de la ñ.' },
  { id: 'nano', termino: 'Nano', sinonimos: [], definicion: 'Editor de texto.' }
]

test('normalizar ignora tildes, mayúsculas y espacios en los extremos', () => {
  assert.equal(normalizar('  Código Fuente '), 'codigo fuente')
  assert.equal(normalizar('ÁÉÍÓÚ Ü'), 'aeiou u')
  assert.equal(normalizar(null), '')
})

test('normalizar conserva la ñ: es otra letra, no una n con tilde', () => {
  assert.equal(normalizar('Ñandú'), 'ñandu')
  assert.equal(normalizar('AÑO'), 'año')
  assert.notEqual(normalizar('año'), normalizar('ano'))
  // También si llega descompuesta (n + virgulilla)
  assert.equal(normalizar('An\u0303o'), 'año')
})

test('La inicial de un término con Ñ es Ñ (habilita ese botón del índice A–Z)', () => {
  assert.equal(inicial('Ñandú'), 'Ñ')
  assert.equal(inicial('ñu'), 'Ñ')
  assert.equal(inicial('Nano'), 'N')
  assert.equal(inicial('Ético'), 'E')
  // Mismo cálculo que letrasConTerminos en GlosarioInfo.vue
  const letras = new Set(MUESTRA.map(t => inicial(t.termino)))
  assert.ok(letras.has('Ñ') && letras.has('N'))
})

test('Sin consulta devuelve todos los términos en orden alfabético', () => {
  const todos = buscarTerminos(TERMINOS, '   ')
  assert.equal(todos.length, TERMINOS.length)
  assert.deepEqual(buscarTerminos(MUESTRA, '').map(t => t.id),
    ['codigo-fuente', 'copyleft', 'derechos-autor', 'licencia', 'nano', 'nandu'])
})

test('Encuentra términos sin importar tildes ni mayúsculas', () => {
  assert.equal(buscarTerminos(MUESTRA, 'CODIGO FUENTE')[0].id, 'codigo-fuente')
  assert.equal(buscarTerminos(MUESTRA, 'derechos de autor')[0].id, 'derechos-autor')
})

test('Buscar con ñ no confunde la ñ con la n', () => {
  assert.deepEqual(buscarTerminos(MUESTRA, 'ÑANDU').map(t => t.id), ['nandu'])
  assert.deepEqual(buscarTerminos(MUESTRA, 'nan').map(t => t.id), ['nano'])
})

test('Prioriza coincidencia exacta, luego el comienzo del término y al final la definición', () => {
  const muestra = [
    { id: 'def', termino: 'Zeta', sinonimos: [], definicion: 'habla de copyleft' },
    { id: 'contiene', termino: 'Licencia copyleft', sinonimos: [], definicion: '' },
    { id: 'empieza', termino: 'Copyleft débil', sinonimos: [], definicion: '' },
    { id: 'exacto', termino: 'Copyleft', sinonimos: [], definicion: '' }
  ]
  assert.deepEqual(buscarTerminos(muestra, 'copyleft').map(t => t.id), ['exacto', 'empieza', 'contiene', 'def'])
})

test('Los sinónimos también se buscan', () => {
  assert.equal(buscarTerminos(MUESTRA, 'source code')[0].id, 'codigo-fuente')
  assert.equal(buscarTerminos(MUESTRA, 'copyright')[0].id, 'derechos-autor')
})

test('Sugiere términos parecidos cuando hay errores de escritura', () => {
  assert.equal(buscarTerminos(MUESTRA, 'copileft').length, 0)
  assert.equal(sugerencias(MUESTRA, 'copileft')[0].id, 'copyleft')
  assert.equal(sugerencias(MUESTRA, 'liscencia')[0].id, 'licencia')
  assert.deepEqual(sugerencias(MUESTRA, ''), [])
  assert.deepEqual(sugerencias(MUESTRA, 'xqzwvk'), [], 'Algo sin parecido no debe sugerir nada')
  // También con el glosario real
  assert.equal(sugerencias(TERMINOS, 'copileft')[0].id, 'copyleft')
})

test('distancia de edición', () => {
  assert.equal(distancia('gato', 'gato'), 0)
  assert.equal(distancia('gato', 'pato'), 1)
  assert.equal(distancia('', 'abc'), 3)
})

test('resaltar marca la consulta conservando el texto original con tildes', () => {
  assert.deepEqual(resaltar('El Código y el código', 'codigo'), [
    { texto: 'El ', marca: false },
    { texto: 'Código', marca: true },
    { texto: ' y el ', marca: false },
    { texto: 'código', marca: true }
  ])
  assert.deepEqual(resaltar('Texto', ''), [{ texto: 'Texto', marca: false }])
  assert.equal(resaltar('Texto', 'zz').map(s => s.texto).join(''), 'Texto')
})

test('resaltar con ñ marca exactamente la palabra en el texto original', () => {
  assert.deepEqual(resaltar('El Ñandú y la ñandú', 'ñandu'), [
    { texto: 'El ', marca: false },
    { texto: 'Ñandú', marca: true },
    { texto: ' y la ', marca: false },
    { texto: 'ñandú', marca: true }
  ])
  // La n sin virgulilla no marca la ñ
  assert.deepEqual(resaltar('Año', 'ano'), [{ texto: 'Año', marca: false }])
  // Los índices siguen bien después de una ñ
  assert.deepEqual(resaltar('Señal de código', 'codigo'), [
    { texto: 'Señal de ', marca: false },
    { texto: 'código', marca: true }
  ])
})
