// Búsqueda y filtros de "Explorar Foro".
// Lógica pura (sin Vue ni navegador) para poder probarla con node --test.

import { normalizar } from './glosario.js'

// Mismo umbral que muestra "Aprobado" en AporteDetalle.vue
export const NOTA_APROBATORIA = 70

const calificado = a => a.calificacion !== null && a.calificacion !== undefined

export const FILTROS_ESTADO = [
  { id: 'todos', label: 'Todos', cumple: () => true },
  { id: 'sin-calificar', label: 'Sin calificar', cumple: a => !calificado(a) },
  { id: 'aprobados', label: 'Aprobados', cumple: a => calificado(a) && a.calificacion >= NOTA_APROBATORIA },
  { id: 'no-aprobados', label: 'No aprobados', cumple: a => calificado(a) && a.calificacion < NOTA_APROBATORIA },
  { id: 'sin-replicas', label: 'Sin réplicas', cumple: a => !Number(a.total_comentarios) }
]

export const FILTRO_POR_DEFECTO = 'todos'

export function buscarFiltro(id) {
  return FILTROS_ESTADO.find(f => f.id === id) || FILTROS_ESTADO.find(f => f.id === FILTRO_POR_DEFECTO)
}

const CAMPOS_BUSQUEDA = ['autor', 'ficha', 'pregunta', 'respuesta']

// Texto normalizado de un aporte en el que se busca. Los campos se separan con un salto de línea
// para que la búsqueda no encuentre palabras partidas entre dos campos.
export function textoBuscable(aporte) {
  return CAMPOS_BUSQUEDA.map(c => normalizar(aporte[c])).join('\n')
}

// Precalcula el texto de búsqueda de cada aporte (se recalcula solo cuando cambian los aportes,
// no con cada letra que se escribe en el buscador)
export function indexarBusqueda(aportes) {
  return new Map(aportes.map(a => [a, textoBuscable(a)]))
}

// Aportes que contienen el texto (sin importar tildes ni mayúsculas) y cumplen el estado elegido.
// "indice" es opcional: el resultado de indexarBusqueda(aportes), para no normalizar en cada búsqueda.
export function filtrarAportes(aportes, { texto = '', estado = FILTRO_POR_DEFECTO } = {}, indice = null) {
  const q = normalizar(texto)
  const { cumple } = buscarFiltro(estado)
  return aportes.filter(a =>
    cumple(a) && (!q || (indice?.get(a) ?? textoBuscable(a)).includes(q))
  )
}

export function hayFiltroActivo({ texto = '', estado = FILTRO_POR_DEFECTO } = {}) {
  return Boolean(normalizar(texto)) || estado !== FILTRO_POR_DEFECTO
}
