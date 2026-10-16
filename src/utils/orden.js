// Orden de los aportes del foro por fecha y hora.
// Lógica pura (sin Vue ni navegador) para poder probarla con node --test.

export const ORDENES = [
  { id: 'recientes', label: 'Más recientes primero', campo: 'created_at', dir: 'desc' },
  { id: 'antiguos', label: 'Más antiguos primero', campo: 'created_at', dir: 'asc' },
  { id: 'editados', label: 'Editados recientemente', campo: 'updated_at', dir: 'desc' },
  { id: 'utiles', label: 'Más útiles primero', campo: 'created_at', dir: 'desc', porReacciones: true }
]

export const ORDEN_POR_DEFECTO = 'recientes'

export function buscarOrden(id) {
  return ORDENES.find(o => o.id === id) || ORDENES.find(o => o.id === ORDEN_POR_DEFECTO)
}

// Milisegundos de una fecha ISO, o null si falta o no es válida
function tiempo(valor) {
  if (!valor) return null
  const t = Date.parse(valor)
  return Number.isNaN(t) ? null : t
}

// Devuelve una copia de los aportes ordenada según el criterio elegido.
// Los aportes sin fecha válida quedan siempre al final; los empates conservan el orden original.
// En "Más útiles" manda el número de reacciones y la fecha solo desempata.
export function ordenarAportes(aportes, idOrden) {
  const { campo, dir, porReacciones } = buscarOrden(idOrden)
  return aportes
    .map((a, i) => ({ a, i, r: Number(a.total_reacciones) || 0, t: tiempo(a[campo]) ?? (campo === 'updated_at' ? tiempo(a.created_at) : null) }))
    .sort((x, y) => {
      if (porReacciones && x.r !== y.r) return y.r - x.r
      if (x.t === null && y.t === null) return x.i - y.i
      if (x.t === null) return 1
      if (y.t === null) return -1
      if (x.t !== y.t) return dir === 'asc' ? x.t - y.t : y.t - x.t
      return x.i - y.i
    })
    .map(x => x.a)
}

// Si el aporte se editó después de publicarlo (al crearlo, el servidor guarda la misma fecha en ambos campos)
export function fueEditado(aporte) {
  const creado = tiempo(aporte.created_at)
  const editado = tiempo(aporte.updated_at)
  return creado !== null && editado !== null && editado - creado > 1000
}

// Fecha y hora completas, con año, para el texto de ayuda al pasar el cursor
export function fechaCompleta(iso) {
  const t = tiempo(iso)
  if (t === null) return ''
  return new Date(t).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' })
}
