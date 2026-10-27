// El aprendiz que tiene la sesión abierta en esta pestaña (o null). Lo usan la barra de arriba,
// el editor de aportes, las réplicas y la pestaña "Mi cuenta".

import { ref } from 'vue'
import {
  sesionAprendizGuardada,
  guardarSesionAprendiz,
  quienSoy,
  registrarAprendiz as registrarEnServidor,
  entrarAprendiz as entrarEnServidor,
  completarPerfil as completarEnServidor
} from './api.js'

export const aprendiz = ref(sesionAprendizGuardada()?.aprendiz ?? null)

function guardar(sesion) {
  guardarSesionAprendiz(sesion)
  aprendiz.value = sesion?.aprendiz ?? null
}

export async function registrarAprendiz(datos) {
  guardar(await registrarEnServidor(datos))
}

export async function entrarAprendiz(documento, pin) {
  guardar(await entrarEnServidor(documento, pin))
}

// Tipo de documento o firma: el servidor devuelve cómo quedó y se actualiza aquí
export async function completarPerfil(datos) {
  const { aprendiz: actual } = await completarEnServidor(datos)
  guardar({ ...sesionAprendizGuardada(), aprendiz: actual })
}

export function salirAprendiz() {
  guardar(null)
}

// Al abrir la página se le pregunta al servidor: si el profe le reinició el PIN, la sesión ya no vale
export async function revisarSesionAprendiz() {
  const sesion = sesionAprendizGuardada()
  if (!sesion) {
    aprendiz.value = null
    return
  }
  try {
    const { aprendiz: actual } = await quienSoy()
    if (actual) guardar({ ...sesion, aprendiz: actual })
    else salirAprendiz()
  } catch (e) {
    // Sin internet no se le cierra la sesión: ya se revisará cuando vuelva la señal
  }
}
