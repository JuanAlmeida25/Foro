import test from 'node:test'
import assert from 'node:assert/strict'
import { CRITERIOS_RUBRICA, PLANTILLAS_RETRO } from '../src/data/rubrica.js'
import { sumarRubrica, agregarPlantilla } from '../src/utils/rubrica.js'

test('La rúbrica suma exactamente 100 y no repite criterios', () => {
  const ids = CRITERIOS_RUBRICA.map(c => c.id)
  assert.equal(new Set(ids).size, ids.length)
  assert.equal(sumarRubrica(CRITERIOS_RUBRICA, ids), 100)
  assert.ok(CRITERIOS_RUBRICA.every(c => Number.isInteger(c.puntos) && c.puntos > 0))
})

test('sumarRubrica suma solo lo marcado e ignora ids desconocidos', () => {
  assert.equal(sumarRubrica(CRITERIOS_RUBRICA, []), 0)
  assert.equal(sumarRubrica(CRITERIOS_RUBRICA, ['normas', 'tipos']), 40)
  assert.equal(sumarRubrica(CRITERIOS_RUBRICA, new Set(['redaccion', 'inventado'])), 5)
})

test('agregarPlantilla no repite una retroalimentación ya escrita', () => {
  const [a, b] = PLANTILLAS_RETRO.map(p => p.texto)
  assert.equal(agregarPlantilla('', a), a)
  assert.equal(agregarPlantilla(a, b), `${a}\n\n${b}`)
  assert.equal(agregarPlantilla(`${a}\n\n${b}`, a), `${a}\n\n${b}`)
})
