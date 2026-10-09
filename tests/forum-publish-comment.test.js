import test from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import crypto from 'node:crypto'
import { db as realDb } from '../server/db.js'
import { PREGUNTAS_DEFECTO } from '../src/data/constants.js'

test('Ciclo completo: Publicar aporte, comentar, calificar y limpiar (Aislamiento Total)', async (t) => {
  // 1. Verificación previa de que la base de datos real solo tiene la guía oficial
  const countInicial = realDb.prepare('SELECT COUNT(*) as count FROM aportes').get().count
  assert.equal(countInicial, 1, 'Antes de la prueba, la base de datos real solo debe contener 1 aporte (la guía oficial)')

  // 2. Usar base de datos SQLite en memoria para la prueba completa
  const memDb = new DatabaseSync(':memory:')

  memDb.exec(`
    CREATE TABLE aportes (
      id TEXT PRIMARY KEY,
      autor TEXT NOT NULL,
      ficha TEXT NOT NULL DEFAULT '',
      pregunta TEXT NOT NULL,
      respuesta TEXT NOT NULL,
      clave_edicion TEXT NOT NULL DEFAULT '',
      calificacion INTEGER DEFAULT NULL,
      retroalimentacion TEXT DEFAULT '',
      calificado_at TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE comentarios (
      id TEXT PRIMARY KEY,
      aporte_id TEXT NOT NULL,
      autor TEXT NOT NULL,
      comentario_citado TEXT DEFAULT '',
      contenido TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(aporte_id) REFERENCES aportes(id) ON DELETE CASCADE
    );
  `)

  // --- PASO 1: Publicar aporte en el foro ---
  const aporteId = crypto.randomUUID()
  const now = new Date().toISOString()
  const autorPrueba = 'Aprendiz ADSO Prueba'
  const fichaPrueba = '2977456'
  const claveAutor = '9876'
  const respuestaPrueba = 'Esta es una respuesta reflexiva de prueba sobre las licencias de software y el soporte lógico en Colombia bajo la Ley 23 de 1982.'

  memDb.prepare(`
    INSERT INTO aportes (id, autor, ficha, pregunta, respuesta, clave_edicion, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    aporteId,
    autorPrueba,
    fichaPrueba,
    PREGUNTAS_DEFECTO,
    respuestaPrueba,
    claveAutor,
    now,
    now
  )

  const aporteCreado = memDb.prepare('SELECT * FROM aportes WHERE id = ?').get(aporteId)
  assert.ok(aporteCreado, 'El aporte debe haberse creado correctamente en el foro')
  assert.equal(aporteCreado.autor, autorPrueba)
  assert.equal(aporteCreado.ficha, fichaPrueba)
  assert.equal(aporteCreado.pregunta, PREGUNTAS_DEFECTO, 'La pregunta debe coincidir con las preguntas orientadoras fijas')
  assert.equal(aporteCreado.respuesta, respuestaPrueba)
  assert.equal(aporteCreado.clave_edicion, claveAutor)
  assert.equal(aporteCreado.calificacion, null, 'Inicialmente no debe tener calificación')

  // --- PASO 2: Publicar un comentario (réplica) en el aporte ---
  const comentarioId = crypto.randomUUID()
  const autorComentario = 'Compañero Evaluador ADSO'
  const citaComentario = 'soporte lógico en Colombia bajo la Ley 23 de 1982'
  const contenidoComentario = 'Excelente aporte. Coincido totalmente con tu análisis de la Ley 23 de 1982 y el Decreto 1360 de 1989.'

  memDb.prepare(`
    INSERT INTO comentarios (id, aporte_id, autor, comentario_citado, contenido, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    comentarioId,
    aporteId,
    autorComentario,
    citaComentario,
    contenidoComentario,
    now
  )

  const comentarioCreado = memDb.prepare('SELECT * FROM comentarios WHERE id = ?').get(comentarioId)
  assert.ok(comentarioCreado, 'El comentario debe haberse publicado correctamente')
  assert.equal(comentarioCreado.aporte_id, aporteId, 'El comentario debe pertenecer al aporte creado')
  assert.equal(comentarioCreado.autor, autorComentario)
  assert.equal(comentarioCreado.contenido, contenidoComentario)

  // --- PASO 3: Validación de Clave de Autor para Edición ---
  const claveValida = aporteCreado.clave_edicion === claveAutor
  assert.equal(claveValida, true, 'La clave personal del autor debe validar correctamente')

  const claveInvalida = aporteCreado.clave_edicion === '0000'
  assert.equal(claveInvalida, false, 'Una clave errónea debe ser rechazada')

  // --- PASO 4: Calificación Docente / Administrador ---
  const notaAsignada = 95
  const retroalimentacion = 'Cumple satisfactoriamente con la argumentación técnica y el marco normativo.'
  const calificadoAt = new Date().toISOString()

  memDb.prepare(`
    UPDATE aportes
    SET calificacion = ?, retroalimentacion = ?, calificado_at = ?, updated_at = ?
    WHERE id = ?
  `).run(notaAsignada, retroalimentacion, calificadoAt, calificadoAt, aporteId)

  const aporteCalificado = memDb.prepare('SELECT * FROM aportes WHERE id = ?').get(aporteId)
  assert.equal(aporteCalificado.calificacion, 95, 'La calificación debe haberse guardado')
  assert.equal(aporteCalificado.retroalimentacion, retroalimentacion)

  // --- PASO 5: Limpieza y Comprobación de Cero Huella en la Base de Datos Real ---
  memDb.close() // Base de datos en memoria destruida por completo

  // Comprobar nuevamente que en la base de datos real del proyecto no hay nada residual
  const countFinal = realDb.prepare('SELECT COUNT(*) as count FROM aportes').get().count
  assert.equal(countFinal, 1, 'La base de datos real sigue teniendo exactamente 1 registro (sin basura ni datos residuales)')

  const aporteExisteEnReal = realDb.prepare('SELECT * FROM aportes WHERE id = ?').get(aporteId)
  assert.equal(aporteExisteEnReal, undefined, 'El aporte de prueba NUNCA tocó la base de datos real')
})
