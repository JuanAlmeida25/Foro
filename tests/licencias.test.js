import test from 'node:test'
import assert from 'node:assert/strict'
import { CATEGORIAS_LICENCIA, LICENCIAS, COLUMNAS_TABLA, REGLAS_COMPATIBILIDAD } from '../src/data/licencias.js'

// Valores que entienden simbolo() y textoMarca() en LicenciasInfo.vue
const MARCAS = ['yes', 'cond', 'no']

const sinRepetidos = (lista, nombre) => {
  assert.equal(new Set(lista).size, lista.length, `No debe haber ${nombre} repetidos`)
}
const textoNoVacio = valor => typeof valor === 'string' && valor.trim() !== ''

test('Categorías: ids únicos y campos obligatorios', () => {
  sinRepetidos(CATEGORIAS_LICENCIA.map(c => c.id), 'ids de categoría')
  for (const c of CATEGORIAS_LICENCIA) {
    for (const campo of ['id', 'icono', 'nombre', 'descripcion', 'ejemplos']) {
      assert.ok(textoNoVacio(c[campo]), `${c.id}: falta "${campo}"`)
    }
    assert.match(c.tono, /^--[a-z-]+$/, `${c.id}: el tono debe ser una variable CSS`)
  }
})

test('Licencias: ids únicos, campos obligatorios y categoría existente', () => {
  sinRepetidos(LICENCIAS.map(l => l.id), 'ids de licencia')
  sinRepetidos(LICENCIAS.map(l => l.corto), 'nombres cortos (son las filas de la tabla)')

  const categorias = new Set(CATEGORIAS_LICENCIA.map(c => c.id))
  for (const l of LICENCIAS) {
    for (const campo of ['id', 'nombre', 'corto', 'spdx', 'resumen', 'proyectos', 'ideal']) {
      assert.ok(textoNoVacio(l[campo]), `${l.id}: falta "${campo}"`)
    }
    for (const lista of ['permite', 'exige', 'limita']) {
      assert.ok(Array.isArray(l[lista]) && l[lista].length > 0, `${l.id}: "${lista}" debe tener al menos un elemento`)
      assert.ok(l[lista].every(textoNoVacio), `${l.id}: "${lista}" tiene elementos vacíos`)
    }
    assert.ok(categorias.has(l.categoria), `${l.id}: categoría desconocida "${l.categoria}"`)
  }
})

test('Cada categoría tiene al menos una licencia (el filtro nunca queda vacío)', () => {
  for (const c of CATEGORIAS_LICENCIA) {
    assert.ok(LICENCIAS.some(l => l.categoria === c.id), `${c.id}: no tiene licencias`)
  }
})

test('Tabla comparativa: cada licencia tiene exactamente un valor válido por columna', () => {
  const columnas = COLUMNAS_TABLA.map(c => c.id)
  sinRepetidos(columnas, 'columnas')
  assert.ok(COLUMNAS_TABLA.every(c => textoNoVacio(c.nombre)), 'Todas las columnas tienen nombre')

  for (const l of LICENCIAS) {
    assert.deepEqual(Object.keys(l.tabla).sort(), [...columnas].sort(), `${l.id}: columnas de la tabla distintas`)
    for (const [columna, valor] of Object.entries(l.tabla)) {
      assert.ok(MARCAS.includes(valor), `${l.id}.${columna}: valor desconocido "${valor}"`)
    }
  }
})

test('Reglas de compatibilidad: tipo válido, título y detalle', () => {
  assert.ok(REGLAS_COMPATIBILIDAD.length > 0)
  sinRepetidos(REGLAS_COMPATIBILIDAD.map(r => r.titulo), 'títulos de regla')
  for (const r of REGLAS_COMPATIBILIDAD) {
    assert.ok(MARCAS.includes(r.tipo), `"${r.titulo}": tipo desconocido "${r.tipo}"`)
    assert.ok(textoNoVacio(r.titulo) && textoNoVacio(r.detalle), 'Toda regla tiene título y detalle')
  }
})
