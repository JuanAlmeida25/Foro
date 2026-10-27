// Fechas de la ficha para la asistencia. Las usan el panel del profe, la planilla y el servidor.
// Aquí las fechas siempre viajan como texto 'AAAA-MM-DD': el inicio y el fin los pone el profe
// en el encabezado de la planilla, así que no hay que tocar código cada vez que arranca una ficha.

export const PATRON_FECHA = /^\d{4}-\d{2}-\d{2}$/

// Máximo de días entre inicio y fin: una ficha larga cabe de sobra, un año escrito mal no
export const MAX_DIAS_FICHA = 400

// Fecha como texto 'AAAA-MM-DD' en hora local (toISOString la corre a UTC y en Colombia de noche cambia de día)
export function textoFecha(fecha) {
  const dos = (n) => String(n).padStart(2, '0')
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`
}

export function leerTextoFecha(texto) {
  const [anio, mes, dia] = texto.split('-').map(Number)
  return new Date(anio, mes - 1, dia)
}

// ¿Es una fecha que existe? El 2026-02-30 tiene la forma pero no existe
export function fechaValida(texto) {
  return typeof texto === 'string' && PATRON_FECHA.test(texto) && textoFecha(leerTextoFecha(texto)) === texto
}

const sumarDias = (fecha, dias) => new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + dias)

// Devuelve el error si el rango no sirve, o '' si está bien
export function errorRangoFicha(inicio, fin) {
  if (!fechaValida(inicio) || !fechaValida(fin)) return 'Escribe la fecha de inicio y la de fin de la ficha.'
  if (fin < inicio) return 'La fecha de fin no puede ser antes que la de inicio.'
  const dias = (leerTextoFecha(fin) - leerTextoFecha(inicio)) / 86_400_000
  if (dias > MAX_DIAS_FICHA) return `Entre el inicio y el fin no pueden pasar más de ${MAX_DIAS_FICHA} días.`
  return ''
}

export const NOMBRES_DIA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

// El formato de asistencia del SENA trae 2 semanas por hoja (lunes a viernes, dos veces).
// Cada hoja arranca el lunes de la semana en que empieza la ficha, y así hasta cubrir el último día.
// Sin fechas válidas no hay hojas: primero el profe tiene que llenar el encabezado.
export function hojasDeAsistencia(inicio, fin) {
  if (errorRangoFicha(inicio, fin)) return []
  const desdeFicha = leerTextoFecha(inicio)
  const hastaFicha = leerTextoFecha(fin)
  const lunes = sumarDias(desdeFicha, -((desdeFicha.getDay() + 6) % 7))
  const hojas = []
  for (let desde = lunes; desde <= hastaFicha; desde = sumarDias(desde, 14)) {
    const dias = [0, 1, 2, 3, 4, 7, 8, 9, 10, 11].map((n, i) => {
      const fecha = sumarDias(desde, n)
      return { fecha: textoFecha(fecha), nombre: NOMBRES_DIA[i % 5], dentroDeLaFicha: fecha >= desdeFicha && fecha <= hastaFicha }
    })
    hojas.push({ desde: dias[0].fecha, hasta: dias[9].fecha, dias })
  }
  return hojas
}

// Solo se puede marcar asistencia de lunes a viernes y dentro de la ficha
export function esDiaDeClase(texto, inicio, fin) {
  if (!fechaValida(texto) || errorRangoFicha(inicio, fin)) return false
  const diaSemana = leerTextoFecha(texto).getDay()
  return diaSemana >= 1 && diaSemana <= 5 && texto >= inicio && texto <= fin
}

// El "hoy" de la clase es el de Colombia: en Vercel el servidor anda en hora UTC y a las 7 p. m. ya sería mañana
export function hoyEnColombia(ahora = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(ahora)
}
