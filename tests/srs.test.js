import test from 'node:test'
import assert from 'node:assert/strict'
import {
  SECCIONES_SRS,
  ESTRUCTURA_SRS,
  CARACTERISTICAS_REQUISITO,
  EJEMPLOS_REQUISITO,
  NORMAS_INTERNACIONALES,
  LEYES_COLOMBIANAS
} from '../src/data/srs.js'

test('La pestaña SRS tiene sus cinco secciones sin ids repetidos', () => {
  const ids = SECCIONES_SRS.map(s => s.id)
  assert.deepEqual(ids, ['concepto', 'estructura', 'requisitos', 'normas', 'leyes'])
})

test('La estructura trae las tres partes clásicas de la IEEE 830', () => {
  const titulos = ESTRUCTURA_SRS.map(p => p.titulo)
  for (const parte of ['Introducción', 'Descripción general', 'Requisitos específicos']) {
    assert.ok(titulos.includes(parte), `Falta la parte «${parte}»`)
  }
})

test('Se citan la norma vigente y la histórica, y la histórica avisa que fue reemplazada', () => {
  const codigos = NORMAS_INTERNACIONALES.map(n => n.codigo)
  assert.ok(codigos.some(c => c.startsWith('ISO/IEC/IEEE 29148')), 'Falta la ISO/IEC/IEEE 29148')
  const ieee830 = NORMAS_INTERNACIONALES.find(n => n.codigo.startsWith('IEEE 830'))
  assert.ok(ieee830, 'Falta la IEEE 830')
  assert.match(ieee830.descripcion, /reemplazada/i)
})

test('Las leyes colombianas clave están y cada una dice qué requisitos genera', () => {
  const codigos = LEYES_COLOMBIANAS.map(l => l.codigo).join(' | ')
  for (const ley of ['Ley 1581 de 2012', 'Ley 1273 de 2009', 'Ley 527 de 1999', 'Ley 23 de 1982', 'Decreto 1360 de 1989']) {
    assert.ok(codigos.includes(ley), `Falta la ${ley}`)
  }
  for (const l of LEYES_COLOMBIANAS) {
    assert.ok(l.requisitos.length > 0, `${l.codigo} no dice qué requisitos genera`)
  }
})

test('Los ejemplos bien escritos llevan código de requisito y las características no se repiten', () => {
  for (const e of EJEMPLOS_REQUISITO) assert.match(e.bueno, /\bR(N)?F-\d+/)
  const nombres = CARACTERISTICAS_REQUISITO.map(c => c.nombre)
  assert.equal(new Set(nombres).size, nombres.length)
})
