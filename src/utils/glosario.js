// Búsqueda en vivo del glosario de licenciamiento.
// Lógica pura (sin Vue ni navegador) para poder probarla con node --test.

// Marcas que normalize('NFD') separa de su letra: tildes, diéresis, virgulilla… (U+0300 a U+036F).
// Se captura también la n anterior para reconocer la ñ (n + virgulilla).
const DIACRITICOS = /[nN]?[\u0300-\u036f]/g
const VIRGULILLA = '\u0303'

// Quita los acentos pero conserva la ñ, que en español es una letra distinta de la n.
// Con NFC al final la ñ vuelve a ocupar un solo carácter, como en el texto original.
function sinAcentos(texto) {
  return texto
    .normalize('NFD')
    .replace(DIACRITICOS, m => (m.length === 2 && m[1] === VIRGULILLA ? m : m.slice(0, -1)))
    .normalize('NFC')
}

// Minúsculas y sin tildes: "Código" y "codigo" se consideran iguales (pero "año" y "ano" no)
export function normalizar(texto) {
  return sinAcentos(String(texto ?? '')).toLowerCase().trim()
}

// Qué tan bien coincide un término con la consulta (mayor es mejor, 0 = no coincide)
function puntaje(t, q) {
  const nombres = [t.termino, ...(t.sinonimos || [])].map(normalizar)
  if (nombres.some(n => n === q)) return 4
  if (nombres.some(n => n.startsWith(q))) return 3
  if (nombres.some(n => n.includes(q))) return 2
  if (normalizar(t.definicion).includes(q) || normalizar(t.ejemplo).includes(q)) return 1
  return 0
}

function alfabetico(a, b) {
  return normalizar(a.termino).localeCompare(normalizar(b.termino), 'es')
}

// Términos que coinciden con la consulta, los más relevantes primero.
// Con la consulta vacía devuelve todos en orden alfabético.
export function buscarTerminos(terminos, consulta) {
  const q = normalizar(consulta)
  if (!q) return [...terminos].sort(alfabetico)
  return terminos
    .map(t => ({ t, p: puntaje(t, q) }))
    .filter(x => x.p > 0)
    .sort((x, y) => y.p - x.p || alfabetico(x.t, y.t))
    .map(x => x.t)
}

// Distancia de edición entre dos textos (cuántas letras hay que cambiar)
export function distancia(a, b) {
  const fila = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    let previo = fila[0]
    fila[0] = i
    for (let j = 1; j <= b.length; j++) {
      const temp = fila[j]
      fila[j] = Math.min(fila[j] + 1, fila[j - 1] + 1, previo + (a[i - 1] === b[j - 1] ? 0 : 1))
      previo = temp
    }
  }
  return fila[b.length]
}

// Para cuando no hay resultados: los términos con nombre más parecido a lo escrito
export function sugerencias(terminos, consulta, maximo = 3) {
  const q = normalizar(consulta)
  if (!q) return []
  const limite = Math.max(2, Math.ceil(q.length * 0.4))
  return terminos
    .map(t => {
      const nombres = [t.termino, ...(t.sinonimos || [])].map(normalizar)
      // Compara contra el nombre completo y contra su comienzo del mismo largo que la consulta
      const d = Math.min(...nombres.flatMap(n => [distancia(q, n), distancia(q, n.slice(0, q.length))]))
      return { t, d }
    })
    .filter(x => x.d <= limite)
    .sort((x, y) => x.d - y.d || alfabetico(x.t, y.t))
    .slice(0, maximo)
    .map(x => x.t)
}

// Parte el texto en segmentos marcando dónde aparece la consulta (sin importar tildes ni mayúsculas).
// Se pinta con <mark> en la plantilla, sin v-html.
export function resaltar(texto, consulta) {
  const original = String(texto ?? '')
  const q = normalizar(consulta)
  if (!q || !original) return [{ texto: original, marca: false }]

  // normalizar() conserva la longitud letra por letra salvo el trim, así que se normaliza sin trim.
  // Si el texto viene descompuesto (NFD) o cambia de largo al pasar a minúsculas, no se resalta.
  const plano = sinAcentos(original).toLowerCase()
  if (plano.length !== original.length) return [{ texto: original, marca: false }]

  const segmentos = []
  let desde = 0
  let i = plano.indexOf(q)
  while (i !== -1) {
    if (i > desde) segmentos.push({ texto: original.slice(desde, i), marca: false })
    segmentos.push({ texto: original.slice(i, i + q.length), marca: true })
    desde = i + q.length
    i = plano.indexOf(q, desde)
  }
  if (desde < original.length) segmentos.push({ texto: original.slice(desde), marca: false })
  return segmentos
}

// Letra inicial para el índice A–Z
export function inicial(termino) {
  return normalizar(termino).charAt(0).toUpperCase()
}

// Sinónimos tan comunes que subrayarlos en cada aporte sería puro ruido
// ("programa", "licencia", "garantía"…). En la pestaña Glosario sí se pueden buscar.
const DEMASIADO_COMUNES = new Set([
  'programa', 'aplicacion', 'licencia', 'licenciamiento', 'fuentes', 'binario', 'ejecutable',
  'gratis', 'trial', 'permisiva', 'paternidad', 'nube', 'paquete', 'libreria', 'biblioteca',
  'garantia', 'responsabilidad', 'tal cual', 'reconocimiento', 'suscripcion', 'patentes',
  'enlazar', 'crack', 'pirateria', 'redistribuir', 'incompatibilidad', 'distribucion', 'notice'
])

const LETRA_O_NUMERO = /[\p{L}\p{N}]/u

// Nombres (término y sinónimos) que se buscan dentro de un texto, los más largos primero
// para que "Software libre" gane sobre "Software" y "GPL v3" sobre "GPL".
function nombresParaMarcar(terminos) {
  const nombres = []
  for (const t of terminos) {
    for (const nombre of [t.termino, ...(t.sinonimos || [])]) {
      const n = normalizar(nombre)
      if (n.length >= 3 && !DEMASIADO_COMUNES.has(n)) nombres.push({ n, t })
    }
  }
  return nombres.sort((a, b) => b.n.length - a.n.length)
}

// Parte un texto libre (un aporte, una réplica) en segmentos y marca los términos del glosario
// que aparecen como palabra completa. Cada término se marca solo la primera vez, para que el
// texto no quede subrayado de punta a punta. Se pinta en la plantilla, sin v-html.
// Devuelve [{ texto, termino? }], donde termino es el objeto del glosario.
export function marcarTerminos(texto, terminos) {
  const original = String(texto ?? '')
  if (!original) return [{ texto: original }]

  // Igual que en resaltar(): si el texto cambia de largo al normalizarlo, se deja tal cual
  const plano = sinAcentos(original).toLowerCase()
  if (plano.length !== original.length) return [{ texto: original }]

  const nombres = nombresParaMarcar(terminos)
  const yaMarcados = new Set()
  const segmentos = []
  let desde = 0

  for (let i = 0; i < plano.length; i++) {
    if (i > 0 && LETRA_O_NUMERO.test(plano[i - 1])) continue
    const hallado = nombres.find(({ n, t }) =>
      !yaMarcados.has(t.id) &&
      plano.startsWith(n, i) &&
      !LETRA_O_NUMERO.test(plano[i + n.length] ?? '')
    )
    if (!hallado) continue

    if (i > desde) segmentos.push({ texto: original.slice(desde, i) })
    segmentos.push({ texto: original.slice(i, i + hallado.n.length), termino: hallado.t })
    yaMarcados.add(hallado.t.id)
    desde = i + hallado.n.length
    i = desde - 1
  }

  if (desde < original.length) segmentos.push({ texto: original.slice(desde) })
  return segmentos
}
