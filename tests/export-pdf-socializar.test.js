import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { buildPdfPreguntasSocializar } from '../src/utils/exporter.js'

const preguntasSocializar = [
  {
    id: 'ps1',
    pregunta: '¿Por qué la ficha técnica se considera la «partida de nacimiento» y el contrato técnico de un software? ¿Qué riesgos legales, económicos y reputacionales asume un equipo de desarrollo al entregar un producto sin este documento?'
  },
  {
    id: 'ps2',
    pregunta: 'Entre las 8 características de calidad de la norma ISO/IEC 25010 (Adecuación funcional, Rendimiento, Compatibilidad, Usabilidad, Fiabilidad, Seguridad, Mantenibilidad y Portabilidad), ¿cuáles dos consideran más críticas en su proyecto formativo y por qué?'
  },
  {
    id: 'ps3',
    pregunta: '¿Qué método o criterio técnico debe utilizar un equipo de ingenieros para calcular los «requerimientos mínimos» y «requerimientos recomendados» sin inflar los costos de adquisición para el usuario ni provocar colapsos del sistema?'
  },
  {
    id: 'ps4',
    pregunta: 'Si un aprendiz o desarrollador crea un software como empleado o por contrato de prestación de servicios en Colombia: ¿Quién conserva los derechos morales y quién los patrimoniales según el Artículo 20 de la Ley 23 de 1982? ¿Cómo debe quedar estipulado en la ficha técnica?'
  },
  {
    id: 'ps5',
    pregunta: 'Si en el desarrollo de su proyecto integran librerías con licencia GPL v3 (copyleft fuerte) y módulos con licencias permisivas (MIT o Apache 2.0), ¿qué consecuencias jurídicas tiene esto sobre la licencia final que pueden declarar en la ficha técnica?'
  },
  {
    id: 'ps6',
    pregunta: '¿En qué momentos del ciclo de vida debe actualizarse la ficha técnica de un sistema? Ante la corrección de un bug menor (PATCH) frente a un cambio de arquitectura o motor de base de datos (MAJOR), ¿cómo se gestiona la versión de la ficha frente al cliente?'
  }
]

const respuestasMuestra = {
  ps1: 'La ficha técnica es fundamental porque delimita el alcance acordado y las condiciones operativas. Entregar sin ella expone al equipo a demandas por sobrecostos y garantías infinitas.',
  ps2: 'Consideramos críticas la Seguridad (para proteger datos de usuarios según Ley 1581) y la Adecuación Funcional (para cumplir las reglas del negocio).',
  ps3: 'Realizando pruebas de carga y profiling (benchmarking) en servidores de prueba para medir el consumo real de RAM y procesador bajo concurrencia.',
  ps4: 'El programador conserva siempre los derechos morales (inalienables), mientras que los derechos patrimoniales se presumen cedidos a quien encargó la obra según el Art. 20.',
  ps5: 'La licencia GPL v3 posee naturaleza copyleft vírica, por lo que integrar sus librerías obliga a licenciar el software derivado como código abierto, impidiendo distribuirlo como privativo.',
  ps6: 'Debe actualizarse ante cambios que afecten la compatibilidad o dependencias, siguiendo Semantic Versioning (MAJOR para incompatibilidades, MINOR para nuevas funciones, PATCH para correcciones).'
}

test('Exportación a PDF de Preguntas para Socializar y Guardado en Descargas', async () => {
  // 1. Generar el PDF usando la función del sistema
  const blob = await buildPdfPreguntasSocializar(preguntasSocializar, respuestasMuestra)
  assert.ok(blob, 'La función buildPdfPreguntasSocializar debe retornar un objeto Blob')
  assert.ok(blob.size > 1000, `El tamaño del PDF generado debe ser mayor a 1 KB (tamaño real: ${blob.size} bytes)`)

  // 2. Convertir el Blob a Buffer para escribirlo en disco
  const arrayBuffer = await blob.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // 3. Validar cabecera mágica de archivo PDF (%PDF-)
  const magicHeader = buffer.subarray(0, 5).toString('ascii')
  assert.equal(magicHeader, '%PDF-', 'El archivo exportado debe comenzar con la cabecera estándar de PDF (%PDF-)')

  // 4. Guardar el archivo en la carpeta Descargas del usuario (/Users/juanalmeida/Downloads)
  const downloadsDir = '/Users/juanalmeida/Downloads'
  assert.ok(fs.existsSync(downloadsDir), 'La carpeta Downloads debe existir')

  const targetPath = path.join(downloadsDir, 'Respuestas_Socializacion_Ficha_Tecnica_Prueba.pdf')
  fs.writeFileSync(targetPath, buffer)

  // 5. Verificar que el archivo se guardó físicamente y tiene tamaño válido
  assert.ok(fs.existsSync(targetPath), 'El archivo exportado debe existir físicamente en Descargas')
  const stats = fs.statSync(targetPath)
  assert.ok(stats.size > 1000, `El archivo guardado en Descargas debe tener contenido real (${stats.size} bytes)`)

  console.log(`\n  ✅ Archivo PDF de prueba guardado exitosamente en: ${targetPath} (${stats.size} bytes)`)
})
