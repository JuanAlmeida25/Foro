// Asistencia de la ficha (traída del proyecto Razonar): el profe marca quién vino cada día y la
// planilla del SENA sale con la firma de cada aprendiz. El aprendiz solo puede marcarse a sí mismo
// con el código del día que proyecta el profe.

import crypto from 'node:crypto'
import { datosPublicos } from './aprendices.js'
import { errorRangoFicha } from '../src/utils/fichaAsistencia.js'

// Tablas iguales en SQLite y Postgres. "ajustes" guarda el encabezado de la planilla como JSON
export const SCHEMA_ASISTENCIA = `
  CREATE TABLE IF NOT EXISTS asistencia (
    fecha TEXT NOT NULL,
    documento TEXT NOT NULL,
    PRIMARY KEY (fecha, documento)
  );

  CREATE TABLE IF NOT EXISTS ajustes (
    clave TEXT PRIMARY KEY,
    valor TEXT NOT NULL
  );
`

const CLAVE_ENCABEZADO = 'asistencia_encabezado'

// Un salón grande no pasa de esto; es solo para que nadie mande 10.000 documentos de un golpe
export const MAX_MARCAR_A_LA_VEZ = 200

export const ENCABEZADO_VACIO = { ficha: '', programa: '', codigoCentro: '', inicio: '', fin: '' }

export async function leerEncabezado(db) {
  const fila = await db.get('SELECT valor FROM ajustes WHERE clave = ?', [CLAVE_ENCABEZADO])
  if (!fila) return { ...ENCABEZADO_VACIO }
  try {
    return { ...ENCABEZADO_VACIO, ...JSON.parse(fila.valor) }
  } catch {
    return { ...ENCABEZADO_VACIO }
  }
}

// Devuelve { encabezado } o { error } si las fechas no cuadran
export async function guardarEncabezado(db, encabezado) {
  const error = errorRangoFicha(encabezado.inicio, encabezado.fin)
  if (error) return { error }
  await db.run(
    'INSERT INTO ajustes (clave, valor) VALUES (?, ?) ON CONFLICT (clave) DO UPDATE SET valor = excluded.valor',
    [CLAVE_ENCABEZADO, JSON.stringify(encabezado)]
  )
  return { encabezado }
}

// { 'AAAA-MM-DD': [documentos que vinieron] }
export async function leerAsistencia(db) {
  const filas = await db.all('SELECT fecha, documento FROM asistencia ORDER BY fecha')
  const porFecha = {}
  for (const { fecha, documento } of filas) (porFecha[fecha] ||= []).push(documento)
  return porFecha
}

export async function presentesDelDia(db, fecha) {
  const filas = await db.all('SELECT documento FROM asistencia WHERE fecha = ? ORDER BY documento', [fecha])
  return filas.map(f => f.documento)
}

// Marca o desmarca de una vez a varios en un día. Solo cuenta a los que tienen cuenta
export async function marcarAsistencia(db, fecha, documentos, presente) {
  await db.transaction(async tx => {
    for (const documento of documentos) {
      if (presente) {
        await tx.run(
          `INSERT INTO asistencia (fecha, documento)
           SELECT ?, documento FROM aprendices WHERE documento = ?
           ON CONFLICT DO NOTHING`,
          [fecha, documento]
        )
      } else {
        await tx.run('DELETE FROM asistencia WHERE fecha = ? AND documento = ?', [fecha, documento])
      }
    }
  })
  return presentesDelDia(db, fecha)
}

// Todo lo que necesita la planilla para imprimirse, firmas incluidas (son imágenes, por eso van aparte)
export async function datosPlanilla(db) {
  const aprendices = (await db.all('SELECT * FROM aprendices'))
    .map(datosPublicos)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  const firmas = Object.fromEntries(
    (await db.all('SELECT documento, firma FROM firmas_aprendiz')).map(f => [f.documento, f.firma])
  )
  return {
    encabezado: await leerEncabezado(db),
    asistencia: await leerAsistencia(db),
    aprendices,
    firmas
  }
}

/* ----- Asistencia con código del día ----- */
// El profe abre la asistencia, proyecta un código que cambia cada 3 minutos y cada aprendiz lo escribe
// desde su cuenta. Si alguien se lo manda por WhatsApp al que se quedó durmiendo, le dura poquito.

const CLAVE_ASISTENCIA_ABIERTA = 'asistencia_abierta'
export const MINUTOS_CODIGO = 3
export const MINUTOS_ABIERTA = 15
export const LARGO_CODIGO = 4
// Sin 0/O, 1/I/L, 2/Z, 5/S ni 8/B: que nadie pierda la asistencia por confundir una letra con un número
const ALFABETO_CODIGO = 'ACDEFGHJKMNPQRTUVWXY34679'
const MS_CODIGO = MINUTOS_CODIGO * 60 * 1000

// Mismo secreto y misma ventana de tiempo = mismo código. Es pura cuenta, así se puede probar
export function codigoAsistencia(secreto, ventana) {
  const huella = crypto.createHmac('sha256', secreto).update(String(ventana)).digest()
  let codigo = ''
  for (let i = 0; i < LARGO_CODIGO; i++) codigo += ALFABETO_CODIGO[huella[i] % ALFABETO_CODIGO.length]
  return codigo
}

export const ventanaDe = ahora => Math.floor(ahora / MS_CODIGO)

export const normalizarCodigo = valor =>
  typeof valor === 'string' ? valor.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, LARGO_CODIGO) : ''

export async function leerAsistenciaAbierta(db) {
  const fila = await db.get('SELECT valor FROM ajustes WHERE clave = ?', [CLAVE_ASISTENCIA_ABIERTA])
  if (!fila) return null
  try {
    return JSON.parse(fila.valor)
  } catch {
    return null
  }
}

async function guardarAjuste(db, clave, valor) {
  await db.run(
    'INSERT INTO ajustes (clave, valor) VALUES (?, ?) ON CONFLICT (clave) DO UPDATE SET valor = excluded.valor',
    [clave, JSON.stringify(valor)]
  )
}

// Abre (o vuelve a abrir, con secreto nuevo) la asistencia de ese día por 15 minutos
export async function abrirAsistencia(db, fecha, ahora = Date.now()) {
  const abierta = { fecha, secreto: crypto.randomBytes(16).toString('hex'), abiertaHasta: ahora + MINUTOS_ABIERTA * 60 * 1000 }
  await guardarAjuste(db, CLAVE_ASISTENCIA_ABIERTA, abierta)
  return abierta
}

export async function cerrarAsistencia(db) {
  await db.run('DELETE FROM ajustes WHERE clave = ?', [CLAVE_ASISTENCIA_ABIERTA])
}

export const sigueAbierta = (abierta, fecha, ahora = Date.now()) =>
  Boolean(abierta) && abierta.fecha === fecha && abierta.abiertaHasta > ahora

// Lo que ve el profe en el video beam: el código de ahora y cuánto le falta para cambiar
export function estadoCodigo(abierta, ahora = Date.now()) {
  const ventana = ventanaDe(ahora)
  return {
    fecha: abierta.fecha,
    codigo: codigoAsistencia(abierta.secreto, ventana),
    cambiaEn: (ventana + 1) * MS_CODIGO,
    abiertaHasta: abierta.abiertaHasta
  }
}

// Se acepta también el código anterior: el que lo estaba escribiendo justo cuando cambió no tiene la culpa
export function codigoValido(abierta, codigo, ahora = Date.now()) {
  if (!abierta || codigo.length !== LARGO_CODIGO) return false
  const ventana = ventanaDe(ahora)
  return [ventana, ventana - 1].some(v => crypto.timingSafeEqual(
    Buffer.from(codigoAsistencia(abierta.secreto, v)),
    Buffer.from(codigo)
  ))
}

// Marca al aprendiz en ese día. Devuelve true si quedó marcado ahora, false si ya estaba
export async function marcarConCodigo(db, fecha, documento) {
  const { changes } = await db.run(
    'INSERT INTO asistencia (fecha, documento) VALUES (?, ?) ON CONFLICT DO NOTHING',
    [fecha, documento]
  )
  return changes === 1
}
