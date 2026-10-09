import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PREGUNTAS_DEFECTO, INITIAL_FORUM_POSTS, PASOS } from '../src/data/constants.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

test('Integridad de Preguntas Orientadoras Oficiales', () => {
  assert.ok(PREGUNTAS_DEFECTO, 'Las preguntas por defecto deben existir')
  assert.match(PREGUNTAS_DEFECTO, /1\.\s*¿Qué es un software\?/i, 'Debe incluir pregunta 1')
  assert.match(PREGUNTAS_DEFECTO, /2\.\s*¿Qué es una licencia de software\?/i, 'Debe incluir pregunta 2')
  assert.match(PREGUNTAS_DEFECTO, /3\.\s*Tipos de licencias de software/i, 'Debe incluir pregunta 3')
  assert.match(PREGUNTAS_DEFECTO, /4\.\s*¿Cuáles son las más adecuadas y por qué\?/i, 'Debe incluir pregunta 4')
})

test('Integridad de la Guía Oficial del Instructor en el Foro', () => {
  assert.ok(Array.isArray(INITIAL_FORUM_POSTS) && INITIAL_FORUM_POSTS.length >= 1, 'Debe existir al menos la entrada oficial')
  const guia = INITIAL_FORUM_POSTS.find(p => p.id === 'guia-como-hacer-la-entrada-al-foro')
  assert.ok(guia, 'La guía oficial del instructor debe estar presente')
  assert.equal(guia.autor, 'Instructor / Vocero ADSO')
  assert.equal(guia.calificacion, 98, 'La guía debe conservar su calificación oficial')
  assert.equal(guia.clave_edicion, '2501', 'La guía debe conservar su clave de edición')

  // Validar que los 4 pasos del instructivo estén completos
  assert.match(guia.respuesta, /PASO 1:\s*IDENTIFICACIÓN DEL APRENDIZ/i)
  assert.match(guia.respuesta, /PASO 2:\s*PREGUNTAS ORIENTADORAS DEL FORO/i)
  assert.match(guia.respuesta, /PASO 3:\s*REDACTAR EL CONTENIDO DE TU ENTRADA/i)
  assert.match(guia.respuesta, /PASO 4:\s*PUBLICACIÓN Y CALIFICACIÓN/i)

  // Validar que tenga el comentario demo
  assert.ok(guia.comentarios && guia.comentarios.length >= 1, 'Debe conservar el comentario de réplica demostrativo')
})

test('Integridad del Módulo de Ficha Técnica y Normativa', () => {
  const fichaPath = path.join(__dirname, '../src/components/FichaTecnicaInfo.vue')
  assert.ok(fs.existsSync(fichaPath), 'El componente FichaTecnicaInfo.vue debe existir')
  
  const content = fs.readFileSync(fichaPath, 'utf8')
  
  // Validar que no se hayan eliminado las normas internacionales
  assert.match(content, /ISO\/IEC 25010/i, 'Debe contener la norma ISO/IEC 25010')
  assert.match(content, /ISO\/IEC\/IEEE 29148/i, 'Debe contener la norma ISO/IEC/IEEE 29148')
  assert.match(content, /IEEE 830/i, 'Debe contener la norma IEEE 830')
  assert.match(content, /ISO\/IEC\/IEEE 12207/i, 'Debe contener la norma ISO 12207')
  
  // Validar que no se haya eliminado el marco legal colombiano
  assert.match(content, /Ley 23 de 1982/i, 'Debe contener la Ley 23 de 1982')
  assert.match(content, /Decreto 1360 de 1989/i, 'Debe contener el Decreto 1360 de 1989')
  assert.match(content, /Decisión Andina 351/i, 'Debe contener la Decisión Andina 351')
  assert.match(content, /Ley 1581 de 2012/i, 'Debe contener la Ley 1581 de 2012 (Habeas Data)')
  assert.match(content, /NTC-ISO\/IEC 25010/i, 'Debe contener la NTC-ISO/IEC 25010')

  // Validar que exista la sección de preguntas para socializar
  assert.match(content, /preguntas-socializar/i, 'Debe contener la subpestaña de preguntas para socializar')
})
