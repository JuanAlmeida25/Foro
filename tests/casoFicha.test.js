import test from 'node:test'
import assert from 'node:assert/strict'
import {
  LS_CASO_FICHA_KEY,
  DOCUMENTOS,
  INSTRUCCIONES,
  APARTADOS_PLANTILLA,
  APARTADOS_SRS,
  PREGUNTAS_CASO,
  NOTA_APROBACION,
  RUBRICA_CASO
} from '../src/data/casoFicha.js'
import { VACIOS, SRS_REFERENCIA, FICHA_RESUELTA, RESPUESTAS_ESPERADAS, ERRORES_FRECUENTES } from '../server/casoFichaSolucionario.js'
import { idsDeCampos, progresoFicha, puntajeRubrica } from '../src/utils/casoFicha.js'
import { buildPdfFichaCaso, buildPdfSrsCaso } from '../src/utils/exporter.js'

test('Integridad del caso MAREA', () => {
  assert.ok(LS_CASO_FICHA_KEY, 'Debe existir la clave de almacenamiento del caso')
  assert.equal(DOCUMENTOS.length, 4, 'El caso trae 4 documentos regados')
  assert.equal(INSTRUCCIONES.length, 8, 'Las instrucciones son 8 pasos')
  const pasoSrs = INSTRUCCIONES.findIndex(p => /SRS/.test(p.titulo))
  const pasoFicha = INSTRUCCIONES.findIndex(p => /ficha/i.test(p.titulo))
  assert.ok(pasoSrs >= 0 && pasoSrs < pasoFicha, 'El SRS se redacta antes de la ficha técnica')
  for (const d of DOCUMENTOS) {
    const tieneContenido = d.dialogo?.length || d.parrafos?.length || d.lista?.length
    assert.ok(tieneContenido, `${d.titulo} no puede estar vacío`)
  }
})

test('La plantilla trae los 8 apartados de la ficha técnica', () => {
  const numerados = APARTADOS_PLANTILLA.filter(a => /^a[1-8]$/.test(a.id))
  assert.equal(numerados.length, 8, 'Deben estar los 8 apartados del formato de la página')
  assert.ok(APARTADOS_PLANTILLA.some(a => a.id === 'supuestos'), 'Falta la tabla de supuestos')

  const ids = idsDeCampos(APARTADOS_PLANTILLA)
  const idsSrs = idsDeCampos(APARTADOS_SRS)
  const idsPreguntas = PREGUNTAS_CASO.map(p => p.id)
  // Ficha, SRS y preguntas comparten el mismo objeto en el localStorage
  const todos = [...ids, ...idsSrs, ...idsPreguntas, 'participantes']
  // Si se repite un id, dos campos se pisan las respuestas en el localStorage
  assert.equal(new Set(todos).size, todos.length, 'Los ids de campos y preguntas no se pueden repetir')
  for (const a of APARTADOS_PLANTILLA) {
    assert.ok(a.campos.length > 0, `${a.titulo} debe tener al menos un campo`)
  }
})

test('La rúbrica suma 100 y la nota de aprobación es alcanzable', () => {
  assert.equal(puntajeRubrica(RUBRICA_CASO), 100)
  assert.ok(NOTA_APROBACION > 0 && NOTA_APROBACION <= 100)
  for (const r of RUBRICA_CASO) {
    assert.ok(r.excelente && r.bueno && r.basico && r.insuficiente, `${r.criterio} debe tener los 4 niveles`)
  }
})

test('El solucionario cubre todas las preguntas y apartados', () => {
  assert.ok(VACIOS.length >= 6, 'Se prometieron al menos 6 vacíos sembrados')
  assert.equal(FICHA_RESUELTA.length, 8, 'La ficha resuelta debe traer los 8 apartados')
  assert.deepEqual(
    RESPUESTAS_ESPERADAS.map(r => r.id).sort(),
    PREGUNTAS_CASO.map(p => p.id).sort(),
    'Cada pregunta debe tener su respuesta esperada'
  )
  assert.ok(ERRORES_FRECUENTES.length > 0)
})

test('Progreso de la ficha: ignora campos con solo espacios', () => {
  const apartados = [{ id: 'x', campos: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }] }]
  assert.deepEqual(progresoFicha(apartados, {}), { llenos: 0, total: 4, porcentaje: 0 })
  assert.deepEqual(progresoFicha(apartados, { a: 'MAREA', b: '   ', c: '1.0.0' }), { llenos: 2, total: 4, porcentaje: 50 })
  assert.deepEqual(progresoFicha([], {}), { llenos: 0, total: 0, porcentaje: 0 })
})

test('Exportación a PDF de la ficha del caso', async () => {
  const blob = await buildPdfFichaCaso(APARTADOS_PLANTILLA, PREGUNTAS_CASO, {
    'enc-codigo': 'FT-ADSO-2026-03',
    'a1-nombre': 'MAREA – Manejo Administrativo de Registros, Entregas y Abonos',
    pc1: 'Reemplazar balanza-bt-link por un módulo propio, porque la GPL v3 obliga a liberar el APK.',
    participantes: 'Dayana Ipuana Gómez, Jhon Fredy Bermúdez Uriana, Luis Ángel Fince Ortiz'
  })
  assert.ok(blob.size > 1000, `El PDF debe pesar más de 1 KB (pesó ${blob.size} bytes)`)
})

test('La plantilla del SRS sigue la estructura de la IEEE 830 / ISO/IEC/IEEE 29148', () => {
  const titulos = APARTADOS_SRS.map(a => a.titulo).join(' | ')
  for (const parte of ['Introducción', 'Descripción general', 'Requisitos específicos', 'trazabilidad']) {
    assert.ok(titulos.includes(parte), `Falta «${parte}» en el SRS`)
  }
  const ids = idsDeCampos(APARTADOS_SRS)
  assert.ok(ids.every(id => id.startsWith('srs-')), 'Los campos del SRS empiezan por srs- para no pisarse con la ficha')
  for (const id of ['srs-rf', 'srs-rnf', 'srs-trazabilidad']) assert.ok(ids.includes(id), `Falta el campo ${id}`)
})

test('El solucionario trae un SRS de referencia con al menos 10 RF', () => {
  assert.equal(SRS_REFERENCIA.length, APARTADOS_SRS.filter(a => /^s\d$/.test(a.id)).length, 'Una sección de referencia por sección numerada del SRS')
  const rf = SRS_REFERENCIA.flatMap(a => a.puntos).filter(p => /^RF-\d+/.test(p))
  assert.ok(rf.length >= 10, `Se piden mínimo 10 RF y la referencia trae ${rf.length}`)
})

test('Exportación a PDF del SRS del caso', async () => {
  const blob = await buildPdfSrsCaso(APARTADOS_SRS, {
    'srs-codigo': 'SRS-ADSO-2026-03',
    'srs-rf': 'RF-01 – El sistema debe registrar el pesaje leyendo la balanza – operaria – Alta – el peso queda igual al de la balanza',
    participantes: 'Dayana Ipuana Gómez'
  })
  assert.ok(blob.size > 1000, `El PDF debe pesar más de 1 KB (pesó ${blob.size} bytes)`)
})
