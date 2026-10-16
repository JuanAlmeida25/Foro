// Lógica pura de la actividad de repaso: barajar, calificar y llevar el mejor puntaje.
// No depende de Vue ni del navegador, así que se puede probar con node --test.

// Devuelve una copia del arreglo en orden aleatorio (Fisher-Yates).
export function barajar(arr, rnd = Math.random) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    const t = a[i]
    a[i] = a[j]
    a[j] = t
  }
  return a
}

// Baraja el orden de los casos y el de las opciones de cada caso, sin tocar los datos originales.
export function prepararCasos(casos, rnd = Math.random) {
  return barajar(casos, rnd).map(c => ({ ...c, opciones: barajar(c.opciones, rnd) }))
}

// Cuántas licencias quedaron en su familia correcta. `ubicacion` es { idTarjeta: idFamilia }.
export function aciertosClasificacion(tarjetas, ubicacion) {
  return tarjetas.filter(t => ubicacion[t.id] === t.familia).length
}

// Si la opción elegida en un caso es la correcta. `respuestas` es { idCaso: índiceOpción }.
export function acertoCaso(caso, respuestas) {
  const k = respuestas[caso.id]
  return k !== undefined && k !== null && !!(caso.opciones[k] && caso.opciones[k].ok)
}

export function aciertosCasos(casos, respuestas) {
  return casos.filter(c => acertoCaso(c, respuestas)).length
}

// Resultado completo de un intento.
export function calificar({ tarjetas, ubicacion, casos, respuestas }) {
  const clasificacion = aciertosClasificacion(tarjetas, ubicacion)
  const enCasos = aciertosCasos(casos, respuestas)
  return {
    clasificacion,
    casos: enCasos,
    total: clasificacion + enCasos,
    maximo: tarjetas.length + casos.length
  }
}

// Título y texto del resultado según el puntaje.
export function mensajeResultado(total, maximo) {
  if (total >= maximo - 2) {
    return {
      titulo: 'Dominas el tema',
      texto: 'Tienes claros los tipos de licencia y sabes aplicarlos a casos reales. Estás listo para argumentar en el foro.'
    }
  }
  if (total >= Math.ceil(maximo * 0.6)) {
    return {
      titulo: 'Vas por buen camino',
      texto: 'Repasa los puntos de abajo antes de publicar tu aporte; son justo los que suelen generar debate.'
    }
  }
  return {
    titulo: 'Conviene repasar',
    texto: 'Lee las explicaciones de abajo y vuelve a intentarlo. Las licencias y las opciones cambian de orden en cada intento.'
  }
}

// Suma un intento al registro guardado y conserva el mejor puntaje.
export function actualizarRegistro(previo, resultado, fecha = new Date().toISOString()) {
  const mejorPrevio = previo && typeof previo.mejor === 'number' ? previo.mejor : null
  const intentos = previo && typeof previo.intentos === 'number' ? previo.intentos : 0
  return {
    mejor: mejorPrevio === null ? resultado.total : Math.max(mejorPrevio, resultado.total),
    intentos: intentos + 1,
    maximo: resultado.maximo,
    ultimo: { ...resultado, fecha },
    esRecord: mejorPrevio !== null && resultado.total > mejorPrevio
  }
}
