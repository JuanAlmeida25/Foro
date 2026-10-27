// "Mi boletín": cómo va cada aprendiz en el foro, la asistencia, la evaluación y el Caso MAREA.
// Lo ve el aprendiz en Mi cuenta (solo lo suyo) y el profe en el semáforo de 👥 Aprendices (todos).

import { leerEncabezado } from './asistencia.js'
import { entregaDe } from './entregasCaso.js'
import { sqlTotalReacciones } from './reacciones.js'
import { hoyEnColombia } from '../src/utils/fichaAsistencia.js'
import { diasDeClaseHasta, contarAsistencia, calcularSemaforo } from '../src/utils/semaforo.js'

// La guía oficial del instructor no cuenta como aporte de nadie (mismo id que server/seed.js)
const ID_GUIA_OFICIAL = 'guia-como-hacer-la-entrada-al-foro'

// Números de todos los aprendices de una vez, para el semáforo del profe. { documento: { ... } }
export async function cifrasDeTodos(db, hoy = hoyEnColombia()) {
  const { inicio, fin } = await leerEncabezado(db)
  const dias = diasDeClaseHasta(inicio, fin, hoy)

  const porDocumento = {}
  const de = documento => (porDocumento[documento] ||= { fechas: [], aportes: 0, infracciones: 0 })

  for (const { documento, fecha } of await db.all('SELECT documento, fecha FROM asistencia')) de(documento).fechas.push(fecha)
  for (const { documento, n } of await db.all(`
    SELECT documento, CAST(COUNT(*) AS INTEGER) AS n FROM autoria_aprendiz
    WHERE tipo = 'aporte' AND objetivo_id != ? GROUP BY documento
  `, [ID_GUIA_OFICIAL])) de(documento).aportes = Number(n)
  for (const { documento, infracciones } of await db.all(`
    SELECT au.documento, e.infracciones FROM autoria_aprendiz au
    JOIN evaluaciones e ON e.id = au.objetivo_id
    WHERE au.tipo = 'evaluacion'
  `)) de(documento).infracciones += Number(infracciones) || 0

  const cifras = {}
  for (const [documento, d] of Object.entries(porDocumento)) {
    const asistencia = contarAsistencia(dias, d.fechas, hoy)
    cifras[documento] = { ...asistencia, aportes: d.aportes, semaforo: calcularSemaforo({ ...asistencia, ...d }) }
  }
  // Los que no tienen nada todavía también tienen semáforo (con todas sus fallas)
  const vacio = contarAsistencia(dias, [], hoy)
  cifras.porDefecto = { ...vacio, aportes: 0, semaforo: calcularSemaforo({ ...vacio, aportes: 0 }) }
  return cifras
}

// El boletín completo de un aprendiz: solo cosas suyas y nada que el profe no haya calificado
export async function boletinDe(db, documento, hoy = hoyEnColombia()) {
  const aportes = await db.all(`
    SELECT a.id, a.pregunta, a.calificacion, a.retroalimentacion, a.calificado_at, a.created_at,
      ${sqlTotalReacciones('aporte', 'a.id')} AS utiles,
      (SELECT CAST(COUNT(*) AS INTEGER) FROM comentarios c WHERE c.aporte_id = a.id) AS replicas_recibidas
    FROM aportes a
    JOIN autoria_aprendiz au ON au.tipo = 'aporte' AND au.objetivo_id = a.id
    WHERE au.documento = ? AND a.id != ?
    ORDER BY a.created_at DESC
  `, [documento, ID_GUIA_OFICIAL])

  // Réplicas que cuentan: las que hizo en aportes ajenos (igual que el panel del profe)
  const replicas = await db.get(`
    SELECT CAST(COUNT(*) AS INTEGER) AS n,
      COALESCE(SUM(${sqlTotalReacciones('comentario', 'c.id')}), 0) AS utiles
    FROM comentarios c
    JOIN autoria_aprendiz au ON au.tipo = 'comentario' AND au.objetivo_id = c.id
    LEFT JOIN autoria_aprendiz duenno ON duenno.tipo = 'aporte' AND duenno.objetivo_id = c.aporte_id
    WHERE au.documento = ? AND c.aporte_id != ? AND (duenno.documento IS NULL OR duenno.documento != ?)
  `, [documento, ID_GUIA_OFICIAL, documento])

  const { inicio, fin } = await leerEncabezado(db)
  const fechas = (await db.all('SELECT fecha FROM asistencia WHERE documento = ? ORDER BY fecha', [documento])).map(f => f.fecha)
  const asistencia = contarAsistencia(diasDeClaseHasta(inicio, fin, hoy), fechas, hoy)

  // La nota de la evaluación ya se la muestra la propia evaluación al terminar, así que aquí no es secreto
  const evaluaciones = await db.all(`
    SELECT e.porcentaje, e.aprobado, e.infracciones, e.created_at FROM evaluaciones e
    JOIN autoria_aprendiz au ON au.tipo = 'evaluacion' AND au.objetivo_id = e.id
    WHERE au.documento = ? ORDER BY e.created_at DESC
  `, [documento])

  const entrega = await entregaDe(db, documento)

  const infracciones = evaluaciones.reduce((suma, e) => suma + (Number(e.infracciones) || 0), 0)
  return {
    aportes: aportes.map(a => ({
      id: a.id,
      pregunta: a.pregunta,
      calificacion: a.calificacion === null || a.calificacion === undefined ? null : Number(a.calificacion),
      retroalimentacion: a.retroalimentacion || '',
      utiles: Number(a.utiles) || 0,
      replicasRecibidas: Number(a.replicas_recibidas) || 0,
      createdAt: a.created_at
    })),
    replicasHechas: Number(replicas?.n) || 0,
    utilesEnReplicas: Number(replicas?.utiles) || 0,
    asistencia: { ...asistencia, fechas },
    evaluaciones: evaluaciones.map(e => ({
      porcentaje: Number(e.porcentaje),
      aprobado: Boolean(Number(e.aprobado)),
      createdAt: e.created_at
    })),
    // De la entrega solo el estado y la nota: las respuestas ya las tiene el aprendiz en su navegador
    casoMarea: entrega
      ? {
          integrantes: entrega.integrantes.map(i => i.nombre),
          updatedAt: entrega.updatedAt,
          nota: entrega.calificadoAt ? entrega.nota : null,
          calificacion: entrega.calificadoAt ? entrega.calificacion : null
        }
      : null,
    semaforo: calcularSemaforo({ fallas: asistencia.fallas, aportes: aportes.length, infracciones })
  }
}
