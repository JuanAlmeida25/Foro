// Contenido inicial del foro: la guía oficial del instructor y su comentario demostrativo,
// tal como están en server/foro.db. Se carga automáticamente cuando la base está vacía,
// tanto en SQLite (local) como en Postgres (Vercel).

const instructivoPregunta = 'Guía Oficial: ¿Cómo hacer y estructurar tu entrada (aporte) en el foro temático?'

const instructivoRespuesta = `Estimados aprendices:

Esta guía detalla los pasos, criterios técnicos y recomendaciones para elaborar y publicar con éxito su entrada (aporte principal) en el foro temático de Licenciamiento de Software.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 PASO 1: IDENTIFICACIÓN DEL APRENDIZ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Dirígete a la pestaña "Redactar Mi Aporte".
2. Ingresa tu Nombre Completo en el campo correspondiente.
3. Ingresa tu Número de Ficha de formación (por ejemplo, 2977456).
• Esto permite registrar e identificar debidamente tu autoría en la base de datos del foro.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 PASO 2: PREGUNTAS ORIENTADORAS DEL FORO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
El campo "Pregunta o tema a debatir" contiene las 4 preguntas orientadoras oficiales del foro:
1. ¿Qué es un software?
2. ¿Qué es una licencia de software?
3. Tipos de licencias de software
4. ¿Cuáles son las más adecuadas y por qué?
Asegúrate de responder a cada uno de estos puntos en tu argumentación.
• La pregunta debe delimitar el tema técnico y legal sobre el cual vas a profundizar.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✍️ PASO 3: REDACTAR EL CONTENIDO DE TU ENTRADA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En el campo "Respuesta y argumentación", redacta tu aporte reflexivo asegurándote de cubrir los siguientes aspectos:
1. Concepto técnico y legal: Explica qué es una licencia de software (un contrato que otorga derecho de uso, sin transferir la titularidad de los derechos morales de autor).
2. Marco normativo en Colombia: Cita las normas aplicables al soporte lógico (Ley 23 de 1982, Decisión Andina 351 de 1993 y Decreto 1360 de 1989).
3. Clasificación de licencias: Distingue entre licencias privativas/propietarias, software libre (copyleft fuerte/débil) y código abierto permisivo (MIT, Apache-2.0, BSD).
4. Análisis aplicado al proyecto formativo: Concluye argumentando qué licencia conviene a tu proyecto de software y por qué (costos, reutilización de código, compatibilidad de librerías y protección de patentes).
• Criterio de extensión: Se sugiere un mínimo de 40 palabras en prosa estructurada y cuidando la ortografía técnica.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 PASO 4: PUBLICACIÓN Y PARTICIPACIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Mientras redactas, el editor guarda automáticamente tus avances locales.
2. Al terminar, haz clic en el botón "Publicar en el Foro" ubicado en la barra superior.
3. Tu entrada quedará publicada de inmediato para toda la ficha, permitiendo que tus compañeros la lean y aporten réplicas reflexivas en la sección de comentarios.`

export const SEED_APORTE_ID = 'guia-como-hacer-la-entrada-al-foro'

export function buildSeed() {
  return {
    aporte: {
      id: SEED_APORTE_ID,
      autor: 'Instructor / Vocero ADSO',
      ficha: 'Ficha ADSO - SENA',
      pregunta: instructivoPregunta,
      respuesta: instructivoRespuesta,
      clave_edicion: 'CLAVE-VIEJA',
      calificacion: 98,
      retroalimentacion: 'Cumple con todos los criterios de evaluación.',
      calificado_at: '2026-10-09T04:21:24.830Z',
      created_at: '2026-10-09T03:46:33.699Z',
      updated_at: '2026-10-09T03:46:33.699Z'
    },
    comentario: {
      id: 'comentario-demo-entrada',
      aporte_id: SEED_APORTE_ID,
      autor: 'Aprendiz ADSO',
      comentario_citado: 'Análisis aplicado al proyecto formativo: Concluye argumentando qué licencia conviene a tu proyecto',
      contenido: 'Excelente guía, instructor. Quedan muy claros los 4 puntos que debemos abordar en la entrada al foro para cumplir con la rúbrica de evaluación.',
      created_at: '2026-10-09T03:46:33.699Z'
    }
  }
}
