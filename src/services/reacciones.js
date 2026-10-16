// Reacciones "👍 Útil" que hizo este navegador.
// Se recuerdan en localStorage para pintar el botón activo; el conteo real lo lleva el servidor.

import { reactive } from 'vue'

const LS_VOTANTE_KEY = 'foro-votante-v1'
const LS_REACCIONES_KEY = 'foro-reacciones-v1'

let votanteEnMemoria = ''

function nuevoId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID()
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
}

// Identificador anónimo de este navegador (el servidor solo guarda su versión cifrada)
export function idVotante() {
  try {
    let id = localStorage.getItem(LS_VOTANTE_KEY)
    if (!id) {
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
