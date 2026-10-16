import test from 'node:test'
import assert from 'node:assert/strict'
import { FAMILIAS, TARJETAS, CASOS, LS_REPASO_KEY } from '../src/data/repaso.js'
import {
  barajar,
  prepararCasos,
  aciertosClasificacion,
  acertoCaso,
  calificar,
  mensajeResultado,
  actualizarRegistro
} from '../src/utils/repaso.js'

// Generador de números con semilla para que el barajado sea reproducible en las pruebas
function rndConSemilla(semilla) {
  let s = semilla
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

test('Integridad de las familias y licencias del repaso', () => {
  assert.ok(LS_REPASO_KEY, 'Debe existir la clave de almacenamiento del repaso')
  assert.equal(FAMILIAS.length, 5, 'Deben existir las 5 familias de licencias')
  const idsFamilia = new Set(FAMILIAS.map(f => f.id))
  assert.equal(idsFamilia.size, FAMILIAS.length, 'Los ids de familia no se pueden repetir')

  assert.equal(TARJETAS.length, 10, 'Deben existir 10 licencias para clasificar')
  assert.equal(new Set(TARJETAS.map(t => t.id)).size, TARJETAS.length, 'Los ids de licencia no se pueden repetir')
  for (const t of TARJETAS) {
    assert.ok(idsFamilia.has(t.familia), `${t.nombre} apunta a una familia que no existe`)
    assert.ok(t.porque && t.porque.length > 40, `${t.nombre} debe explicar por qué pertenece a su familia`)
  }
  for (const f of FAMILIAS) {
    assert.ok(TARJETAS.some(t => t.familia === f.id), `La familia ${f.nombre} debe tener al menos una licencia`)
  }
})

test('Clasificación correcta de licencias clave', () => {
  const familiaDe = nombre => TARJETAS.find(t => t.nombre === nombre).familia
  assert.equal(familiaDe('MIT'), 'perm')
  assert.equal(familiaDe('Apache-2.0'), 'perm')
  assert.equal(familiaDe('GPL-3.0'), 'fuerte')
  assert.equal(familiaDe('AGPL-3.0'), 'fuerte')
  assert.equal(familiaDe('LGPL-2.1'), 'debil')
  assert.equal(familiaDe('MPL-2.0'), 'debil')
  assert.equal(familiaDe('CC0-1.0'), 'pd')
  assert.equal(familiaDe('Adobe Acrobat Reader (gratuito)'), 'prop', 'El freeware es propietario: gratis no es libre')
})

test('Cada caso práctico tiene 4 opciones y una sola correcta', () => {
  assert.equal(CASOS.length, 6, 'Deben existir 6 casos prácticos')
  assert.equal(new Set(CASOS.map(c => c.id)).size, CASOS.length, 'Los ids de caso no se pueden repetir')
  for (const c of CASOS) {
    assert.equal(c.opciones.length, 4, `El caso "${c.tema}" debe tener 4 opciones`)
    assert.equal(c.opciones.filter(o => o.ok).length, 1, `El caso "${c.tema}" debe tener exactamente una opción correcta`)
    assert.ok(c.enunciado.trim().endsWith('?'), `El enunciado de "${c.tema}" debe terminar en pregunta`)
    assert.ok(c.explicacion.length > 80, `El caso "${c.tema}" debe traer una explicación`)
  }
})

test('Las explicaciones citan la normativa colombiana verificada', () => {
  const texto = CASOS.map(c => c.explicacion).join(' ')
  assert.match(texto, /Ley 23 de 1982, art\. 9/)
  assert.match(texto, /art\. 20 de la Ley 23 de 1982, modificado por el art\. 28 de la Ley 1450 de 2011/)
  assert.match(texto, /art\. 271 del Código Penal, modificado por la Ley 1032 de 2006/)
})

test('Barajar conserva los elementos y no modifica el original', () => {
  const original = [1, 2, 3, 4, 5, 6]
  const copia = barajar(original, rndConSemilla(7))
  assert.deepEqual(original, [1, 2, 3, 4, 5, 6], 'El arreglo original no debe cambiar')
  assert.deepEqual([...copia].sort(), [...original].sort(), 'Debe tener los mismos elementos')

  const casos = prepararCasos(CASOS, rndConSemilla(3))
  assert.equal(casos.length, CASOS.length)
  for (const c of casos) {
    const base = CASOS.find(x => x.id === c.id)
    assert.equal(c.opciones.length, base.opciones.length)
    assert.equal(c.opciones.filter(o => o.ok).length, 1, 'Barajar no puede cambiar cuál opción es correcta')
  }
})

test('Calificación de un intento', () => {
  // Todas bien en la clasificación menos una
  const ubicacion = Object.fromEntries(TARJETAS.map(t => [t.id, t.familia]))
  ubicacion.mpl = 'fuerte'
  assert.equal(aciertosClasificacion(TARJETAS, ubicacion), 9)

  // Responder bien los 3 primeros casos y mal los otros 3
  const respuestas = {}
  CASOS.forEach((c, i) => {
    const correcta = c.opciones.findIndex(o => o.ok)
    respuestas[c.id] = i < 3 ? correcta : (correcta + 1) % c.opciones.length
  })
  assert.equal(acertoCaso(CASOS[0], respuestas), true)
  assert.equal(acertoCaso(CASOS[5], respuestas), false)
  assert.equal(acertoCaso(CASOS[0], {}), false, 'Un caso sin responder no cuenta como acierto')

  const r = calificar({ tarjetas: TARJETAS, ubicacion, casos: CASOS, respuestas })
  assert.deepEqual(r, { clasificacion: 9, casos: 3, total: 12, maximo: 16 })
})

test('Mensaje del resultado según el puntaje', () => {
  assert.equal(mensajeResultado(16, 16).titulo, 'Dominas el tema')
  assert.equal(mensajeResultado(14, 16).titulo, 'Dominas el tema')
  assert.equal(mensajeResultado(13, 16).titulo, 'Vas por buen camino')
  assert.equal(mensajeResultado(10, 16).titulo, 'Vas por buen camino')
  assert.equal(mensajeResultado(9, 16).titulo, 'Conviene repasar')
})

test('El registro conserva el mejor puntaje y cuenta los intentos', () => {
  const r1 = actualizarRegistro(null, { total: 10, maximo: 16, clasificacion: 7, casos: 3 }, 'f1')
  assert.equal(r1.mejor, 10)
  assert.equal(r1.intentos, 1)
  assert.equal(r1.esRecord, false, 'El primer intento no se marca como récord')

  const r2 = actualizarRegistro(r1, { total: 8, maximo: 16, clasificacion: 6, casos: 2 }, 'f2')
  assert.equal(r2.mejor, 10, 'Un puntaje menor no reemplaza el mejor')
  assert.equal(r2.intentos, 2)
  assert.equal(r2.ultimo.total, 8)

  const r3 = actualizarRegistro(r2, { total: 14, maximo: 16, clasificacion: 10, casos: 4 }, 'f3')
  assert.equal(r3.mejor, 14)
  assert.equal(r3.esRecord, true)
  assert.equal(r3.ultimo.fecha, 'f3')
})
