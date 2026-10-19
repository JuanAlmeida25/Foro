import test from 'node:test'
import assert from 'node:assert/strict'
import { resumenPorAprendiz, estadoNota, generarCsv, ID_GUIA_OFICIAL } from '../src/utils/panel.js'
import { SEED_APORTE_ID } from '../server/seed.js'
import { BANDOS, VEREDICTOS } from '../server/juicio.js'
import { BANDOS_JUICIO, VEREDICTOS_JUICIO, contarBandos } from '../src/data/juicio.js'

test('El panel reconoce la guía oficial con el mismo id del servidor', () => {
  assert.equal(ID_GUIA_OFICIAL, SEED_APORTE_ID)
})

test('Los bandos y veredictos del navegador coinciden con los del servidor', () => {
  assert.deepEqual(BANDOS_JUICIO.map(b => b.id), BANDOS)
  assert.deepEqual(VEREDICTOS_JUICIO.map(v => v.id), VEREDICTOS)
  assert.deepEqual(contarBandos([{ bando: 'fiscalia' }, { bando: 'fiscalia' }, { bando: '' }, { bando: 'defensa' }]),
    { fiscalia: 2, defensa: 1, neutral: 0 })
})

test('estadoNota: 70 o más aprueba', () => {
  assert.equal(estadoNota(null), 'sin-calificar')
  assert.equal(estadoNota(undefined), 'sin-calificar')
  assert.equal(estadoNota(69), 'no-aprobado')
  assert.equal(estadoNota(70), 'aprobado')
  assert.equal(estadoNota(0), 'no-aprobado')
})

test('resumenPorAprendiz agrupa por nombre y cuenta solo réplicas a compañeros', () => {
  const aportes = [
    { id: ID_GUIA_OFICIAL, autor: 'Instructor', calificacion: 98, created_at: '2026-10-01' },
    { id: 'a1', autor: 'Ana María', ficha: '2977456', calificacion: 60, created_at: '2026-10-03' },
    { id: 'a2', autor: 'ana  maria', ficha: '', calificacion: 85, created_at: '2026-10-02' },
    { id: 'a3', autor: 'Luis', ficha: '2977456', calificacion: null, created_at: '2026-10-04' }
  ]
  const replicas = [
    { autor: 'Luis', aporte_id: 'a1' },
    { autor: 'LUIS', aporte_id: 'a2' },
    { autor: 'Luis', aporte_id: 'a3' }, // a su propio aporte: no cuenta
    { autor: 'Luis', aporte_id: ID_GUIA_OFICIAL }, // a la guía: no cuenta
    { autor: 'Sofía', aporte_id: 'a3' }
  ]
  const filas = resumenPorAprendiz(aportes, replicas)
  assert.deepEqual(filas.map(f => [f.autor, f.estado, f.nota, f.replicas, f.aportes.length]), [
    ['Ana María', 'aprobado', 85, 0, 2],
    ['Luis', 'sin-calificar', null, 2, 1],
    ['Sofía', 'sin-aporte', null, 1, 0]
  ])
  assert.equal(filas[0].primerAporte, '2026-10-02')
  assert.ok(!filas.some(f => f.autor === 'Instructor'), 'La guía oficial no sale en el panel')
})

test('generarCsv: BOM, punto y coma, comillas y protección contra fórmulas', () => {
  const csv = generarCsv(
    [{ n: 'Pérez; "el Pibe"', nota: 90 }, { n: '=HYPERLINK("http://x")', nota: null }],
    [{ titulo: 'Nombre', valor: f => f.n }, { titulo: 'Nota', valor: f => f.nota }]
  )
  assert.ok(csv.startsWith('﻿'))
  const lineas = csv.slice(1).trimEnd().split('\r\n')
  assert.deepEqual(lineas, [
    'Nombre;Nota',
    '"Pérez; ""el Pibe""";90',
    '"\'=HYPERLINK(""http://x"")";'
  ])
})
