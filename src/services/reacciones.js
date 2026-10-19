// Reacciones "👍 Útil" que hizo este navegador.
// Se recuerdan en localStorage para pintar el botón activo; el conteo real lo lleva el servidor.

import { reactive } from 'vue'

const LS_VOTANTE_KEY = 'foro-votante-v1'
const LS_REACCIONES_KEY = 'foro-reacciones-v1'

let votanteEnMemoria = ''

// El servidor solo acepta identificadores con formato UUID
const PATRON_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// UUID v4. crypto.randomUUID() solo existe en páginas seguras (https o localhost),
// así que si falta se arma uno con el mismo formato a partir de bytes aleatorios.
function nuevoId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID()
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40 // versión 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80 // variante RFC 4122
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

// Identificador anónimo de este navegador (el servidor solo guarda su hash)
export function idVotante() {
  try {
    let id = localStorage.getItem(LS_VOTANTE_KEY)
    // Los identificadores antiguos sin formato UUID se reemplazan por uno nuevo
    if (!id || !PATRON_UUID.test(id)) {
      id = nuevoId()
      localStorage.setItem(LS_VOTANTE_KEY, id)
    }
    return id
  } catch (e) {
    // Sin almacenamiento: el identificador dura hasta recargar la página
    if (!votanteEnMemoria) votanteEnMemoria = nuevoId()
    return votanteEnMemoria
  }
}

function leerGuardadas() {
  try {
    const lista = JSON.parse(localStorage.getItem(LS_REACCIONES_KEY) || '[]')
    return Array.isArray(lista) ? lista : []
  } catch (e) {
    return []
  }
}

const clave = (tipo, id) => `${tipo}:${id}`

// { 'aporte:abc': true, 'comentario:xyz': true }
const mias = reactive(Object.fromEntries(leerGuardadas().map(k => [k, true])))

export function yaReaccione(tipo, id) {
  return Boolean(mias[clave(tipo, id)])
}

export function marcarReaccion(tipo, id, valor) {
  const k = clave(tipo, id)
  if (valor) mias[k] = true
  else delete mias[k]
  try {
    localStorage.setItem(LS_REACCIONES_KEY, JSON.stringify(Object.keys(mias)))
  } catch (e) {
    // Sin almacenamiento el botón activo solo se recuerda durante esta visita
  }
}
