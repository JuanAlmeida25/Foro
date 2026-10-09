import test from 'node:test'
import assert from 'node:assert/strict'
import { words, blank, pdfSafe, fmtDate, fmtTime, slug } from '../src/utils/text.js'
import { PREGUNTAS_DEFECTO } from '../src/data/constants.js'

test('Conteo de palabras (words)', () => {
  assert.equal(words(''), 0)
  assert.equal(words('   '), 0)
  assert.equal(words('Hola'), 1)
  assert.equal(words('Una licencia de software es un contrato formal.'), 8)
  assert.equal(words('Palabra1   Palabra2\n\nPalabra3\tPalabra4'), 4)
})

test('Estado inicial en blanco (blank)', () => {
  const b = blank()
  assert.equal(b.autor, '')
  assert.equal(b.ficha, '')
  assert.equal(b.respuesta, '', 'La caja de respuesta debe iniciar completamente vacía')
  assert.equal(b.clave_edicion, '')
  assert.equal(b.pregunta, PREGUNTAS_DEFECTO, 'La pregunta debe iniciar fijada a las 4 preguntas orientadoras oficiales')
})

test('Sanitización tipográfica para PDF (pdfSafe)', () => {
  const raw = '“Texto con comillas” y ‘simples’, guión largo — y viñeta • con puntos…'
  const safe = pdfSafe(raw)
  assert.doesNotMatch(safe, /[“”]/, 'No debe tener comillas curvas dobles')
  assert.doesNotMatch(safe, /[‘’]/, 'No debe tener comillas curvas simples')
  assert.doesNotMatch(safe, /[–—]/, 'No debe tener guiones largos em/en')
  assert.doesNotMatch(safe, /•/, 'No debe tener caracteres de viñeta')
  assert.doesNotMatch(safe, /…/, 'No debe tener elipsis tipográfico')
})

test('Generación de slug para nombres de archivo seguros (slug)', () => {
  assert.equal(slug('Juan Camilo Pérez'), 'Juan_Camilo_Perez')
  assert.equal(slug('Licenciamiento 2026!'), 'Licenciamiento_2026')
})
