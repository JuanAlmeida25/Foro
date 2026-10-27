import { jsPDF } from 'jspdf'
import { pdfSafe } from './text.js'
import { LS_EVALUACION_KEY, CATEGORIAS_EVALUACION, PREGUNTAS_EVALUACION } from '../data/evaluacion.js'

// Constantes de seguridad y tiempo para el examen
export const DURACION_EXAMEN_SEGUNDOS = 3600 // 1 hora exacta (60 min)
export const MAX_INFRACCIONES_CAMBIO_VENTANA = 1 // 1 sola advertencia permitida; al segundo intento se cierra el examen

// Formatear cuenta regresiva (segundos a HH:MM:SS o MM:SS)
export function formatearCuentaRegresiva(segundosRestantes) {
  const s = Math.max(0, Math.floor(segundosRestantes))
  const horas = Math.floor(s / 3600)
  const minutos = Math.floor((s % 3600) / 60)
  const segundos = s % 60

  if (horas > 0) {
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`
  }
  return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`
}

// Barajar array (Fisher-Yates) sin mutar original
export function barajarArray(arr, rng = Math.random) {
  const copia = [...arr]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

// Preparar conjunto de preguntas barajadas
export function prepararEvaluacion(preguntas = PREGUNTAS_EVALUACION, opcionesAleatorias = false, rng = Math.random) {
  const seleccion = barajarArray(preguntas, rng)
  return seleccion.map(p => ({
    ...p,
    opciones: opcionesAleatorias ? barajarArray(p.opciones, rng) : [...p.opciones]
  }))
}

// Calcular puntaje total y por categorías
export function calificarEvaluacion(preguntas, respuestasUsuario = {}) {
  let aciertos = 0
  const total = preguntas.length

  const porCategoria = {}
  CATEGORIAS_EVALUACION.forEach(cat => {
    porCategoria[cat.id] = {
      id: cat.id,
      nombre: cat.nombre,
      icono: cat.icono,
      total: 0,
      aciertos: 0,
      porcentaje: 0
    }
  })

  const detallePreguntas = preguntas.map(p => {
    const seleccionId = respuestasUsuario[p.id]
    const opcionCorrecta = p.opciones.find(o => o.ok)
    const acerto = Boolean(seleccionId && opcionCorrecta && seleccionId === opcionCorrecta.id)

    if (acerto) aciertos++

    if (porCategoria[p.categoria]) {
      porCategoria[p.categoria].total++
      if (acerto) porCategoria[p.categoria].aciertos++
    }

    return {
      preguntaId: p.id,
      enunciado: p.enunciado,
      categoria: p.categoria,
      dificultad: p.dificultad,
      seleccionId: seleccionId || null,
      correctaId: opcionCorrecta ? opcionCorrecta.id : null,
      acerto,
      opciones: p.opciones,
      explicacion: p.explicacion,
      norma: p.norma
    }
  })

  // Calcular porcentajes por categoría
  Object.values(porCategoria).forEach(cat => {
    cat.porcentaje = cat.total > 0 ? Math.round((cat.aciertos / cat.total) * 100) : 0
  })

  const porcentaje = total > 0 ? Math.round((aciertos / total) * 100) : 0
  const aprobado = porcentaje >= 70

  return {
    aciertos,
    total,
    porcentaje,
    aprobado,
    porCategoria,
    detallePreguntas
  }
}

// Mensaje pedagógico según el puntaje obtenido
export function mensajeDictamen(porcentaje) {
  if (porcentaje >= 90) {
    return {
      titulo: '¡Excelente Dominio Técnico y Jurídico!',
      estado: 'COMPETENTE DESTACADO',
      tono: 'ok',
      resumen: 'Has demostrado una comprensión sólida e integral sobre licenciamiento de software, legislación colombiana, fichas técnicas y toma de decisiones arquitectónicas en proyectos reales.'
    }
  }
  if (porcentaje >= 70) {
    return {
      titulo: '¡Aprobado con Éxito!',
      estado: 'COMPETENTE',
      tono: 'ok',
      resumen: 'Alcanzaste los criterios de competencia requeridos para el programa ADSO. Identificas los riesgos legales de licencias y la rigurosidad de las fichas técnicas.'
    }
  }
  if (porcentaje >= 50) {
    return {
      titulo: 'En Proceso de Afianzamiento',
      estado: 'AÚN NO COMPETENTE',
      tono: 'warn',
      resumen: 'Tienes bases conceptuales, pero es necesario profundizar en las leyes específicas (Ley 23/1982, Código Penal Art. 271) y en las cláusulas de compatibilidad (GPL vs AGPL vs Apache).'
    }
  }
  return {
    titulo: 'Requiere Estudio y Refuerzo',
    estado: 'AÚN NO COMPETENTE',
    tono: 'bad',
    resumen: 'Se recomienda repasar con detalle las 5 familias de licencias, los derechos morales vs patrimoniales y las características de calidad de la norma ISO/IEC 25010.'
  }
}

// Historial en LocalStorage
export function cargarHistorial() {
  try {
    const raw = localStorage.getItem(LS_EVALUACION_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    return []
  }
}

export function guardarResultadoHistorial(resultado, aprendiz = {}) {
  try {
    const historial = cargarHistorial()
    const nuevoRegistro = {
      id: 'eval-' + Date.now(),
      fecha: new Date().toISOString(),
      nombreAprendiz: (aprendiz.nombre || 'Aprendiz ADSO').trim(),
      ficha: (aprendiz.ficha || 'ADSO').trim(),
      aciertos: resultado.aciertos,
      total: resultado.total,
      porcentaje: resultado.porcentaje,
      aprobado: resultado.aprobado
    }
    historial.unshift(nuevoRegistro)
    // Conservar los últimos 20 intentos
    const recortado = historial.slice(0, 20)
    localStorage.setItem(LS_EVALUACION_KEY, JSON.stringify(recortado))
    return nuevoRegistro
  } catch (e) {
    return null
  }
}

// Generador de Certificado / Informe de Evaluación en PDF
export function descargarCertificadoPdf(resultado, aprendiz = {}) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  const M = 48
  const W = doc.internal.pageSize.getWidth() - M * 2
  const H = doc.internal.pageSize.getHeight()
  let y = M

  const ensure = h => {
    if (y + h > H - M) {
      doc.addPage()
      y = M
    }
  }

  // Encabezado institucional decorativo
  doc.setFillColor(79, 70, 229) // Indigo accent
  doc.rect(M, y, W, 6, 'F')
  y += 18

  // Título principal
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(20, 26, 51)
  doc.text(pdfSafe('SERVICIO NACIONAL DE APRENDIZAJE - SENA'), M, y)
  y += 16

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(91, 100, 130)
  doc.text(pdfSafe('Tecnólogo en Análisis y Desarrollo de Software (ADSO)'), M, y)
  y += 14

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(14, 116, 144)
  doc.text(pdfSafe('INFORME OFICIAL DE EVALUACIÓN DE CONOCIMIENTOS'), M, y)
  y += 24

  // Línea divisoria
  doc.setDrawColor(225, 229, 240)
  doc.setLineWidth(1)
  doc.line(M, y, M + W, y)
  y += 18

  // Datos del Aprendiz
  const nombre = (aprendiz.nombre || 'Aprendiz ADSO').trim()
  const ficha = (aprendiz.ficha || 'Ficha Formativa').trim()
  const fechaStr = new Date().toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  doc.setFillColor(245, 246, 251)
  doc.roundedRect(M, y, W, 60, 4, 4, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(20, 26, 51)
  doc.text(pdfSafe(`Aprendiz: ${nombre}`), M + 14, y + 20)
  doc.text(pdfSafe(`Ficha / Grupo: ${ficha}`), M + 14, y + 36)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(91, 100, 130)
  doc.text(pdfSafe(`Fecha de emisión: ${fechaStr}`), M + 14, y + 50)

  // Calificación en la esquina de la tarjeta
  const dictamen = mensajeDictamen(resultado.porcentaje)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  if (resultado.aprobado) {
    doc.setTextColor(19, 138, 85) // Verde ok
  } else {
    doc.setTextColor(194, 38, 63) // Rojo
  }
  doc.text(`${resultado.porcentaje}%`, M + W - 70, y + 30)

  doc.setFontSize(9)
  doc.text(pdfSafe(dictamen.estado), M + W - 110, y + 46)

  y += 76

  // Resumen de Dictamen
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(20, 26, 51)
  doc.text(pdfSafe('1. Dictamen Pedagógico y Resultados Generales'), M, y)
  y += 16

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(40, 45, 65)
  const lineasDictamen = doc.splitTextToSize(pdfSafe(dictamen.resumen), W)
  lineasDictamen.forEach(l => {
    doc.text(l, M, y)
    y += 14
  })
  y += 10

  // Métricas numéricas
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text(pdfSafe(`• Total de preguntas: ${resultado.total}`), M + 10, y)
  y += 14
  doc.text(pdfSafe(`• Respuestas correctas: ${resultado.aciertos} / ${resultado.total}`), M + 10, y)
  y += 14
  doc.text(pdfSafe(`• Calificación final: ${resultado.porcentaje} sobre 100 puntos`), M + 10, y)
  y += 14
  doc.text(pdfSafe(`• Criterio de Aprobación SENA: ${resultado.aprobado ? 'APROBADO (>= 70%)' : 'NO APROBADO (< 70%)'}`), M + 10, y)
  y += 24

  // Desglose por Áreas Temáticas
  ensure(140)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(20, 26, 51)
  doc.text(pdfSafe('2. Desglose de Competencias por Módulo Temático'), M, y)
  y += 18

  Object.values(resultado.porCategoria).forEach(cat => {
    ensure(36)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(30, 40, 70)
    doc.text(pdfSafe(`${cat.nombre}: ${cat.aciertos} de ${cat.total} correctas (${cat.porcentaje}%)`), M + 10, y)

    // Barra de progreso visual en el PDF
    y += 6
    doc.setFillColor(225, 229, 240)
    doc.roundedRect(M + 10, y, W - 20, 6, 2, 2, 'F')
    if (cat.porcentaje > 0) {
      if (cat.porcentaje >= 70) doc.setFillColor(19, 138, 85)
      else if (cat.porcentaje >= 50) doc.setFillColor(161, 92, 7)
      else doc.setFillColor(194, 38, 63)
      doc.roundedRect(M + 10, y, Math.max(8, ((W - 20) * cat.porcentaje) / 100), 6, 2, 2, 'F')
    }
    y += 16
  })

  // Sección 3: Síntesis de Normativa y Estándares Evaluados
  ensure(120)
  y += 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(20, 26, 51)
  doc.text(pdfSafe('3. Normas Técnicas y Jurídicas Cubiertas en la Prueba'), M, y)
  y += 16

  const normas = [
    '• Ley 23 de 1982 (Derechos de Autor) - Arts. 9 (protección sin registro) y 20 (obras por encargo).',
    '• Ley 1450 de 2011 (Art. 28) - Presunción legal de transferencia de derechos patrimoniales.',
    '• Código Penal Colombiano (Art. 271) - Defraudación a los derechos patrimoniales de autor.',
    '• Ley 1273 de 2009 - Régimen legal de Delitos Informáticos en Colombia.',
    '• Ley Estatutaria 1581 de 2012 - Protección de Datos Personales y Habeas Data.',
    '• Estándares Internacionales ISO/IEC 25010 (Calidad de Software) e ISO/IEC 12207 (Ciclo de Vida).'
  ]

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(60, 65, 85)
  normas.forEach(n => {
    ensure(16)
    doc.text(pdfSafe(n), M + 10, y)
    y += 13
  })

  // Pie de página con firma y validez
  ensure(60)
  y += 24
  doc.setDrawColor(200, 205, 220)
  doc.line(M, y, M + 180, y)
  y += 12
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(40, 45, 65)
  doc.text(pdfSafe('Firma / Registro del Aprendiz'), M, y)
  y += 10
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.setTextColor(110, 115, 135)
  doc.text(pdfSafe('Evaluación individual autónoma generada digitalmente.'), M, y)

  const nombreArchivo = `Evaluacion_Conocimientos_${(aprendiz.nombre || 'Aprendiz').replace(/[^a-zA-Z0-9]/g, '_')}_${resultado.porcentaje}pts.pdf`
  doc.save(nombreArchivo)
}
