export const LS_KEY = 'foro-licenciamiento-v3'
export const LS_FORUM_POSTS_KEY = 'foro-compartido-posts-v1'

export const PASOS = [
  { t: 'Reconoce', d: 'Valora un acierto concreto del aporte de tu compañero.' },
  { t: 'Complementa', d: 'Aporta normas colombianas (Ley 23/1982, Decisión 351) o casos técnicos.' },
  { t: 'Cuestiona', d: 'Matiza con respeto alguna idea o plantea una postura alternativa.' },
  { t: 'Invita', d: 'Formula una pregunta abierta para continuar el debate formativo.' }
]

export const DRAFT = {
  pregunta: '¿Qué es una licencia de software y cuáles son las más adecuadas para nuestro proyecto formativo y por qué?',
  respuesta: `Una licencia de software es un contrato formal entre el titular de los derechos de autor (licenciante) y quien adquiere el derecho a utilizar el programa (licenciatario). A través de ella no se transfiere la propiedad del código, sino que se autorizan ciertos usos bajo condiciones específicas (alcance, duración, facultades de modificación, distribución comercial y límites de responsabilidad).

En Colombia, el marco legal está regulado principalmente por la Ley 23 de 1982 sobre derechos de autor, el Decreto 1360 de 1989 (que define el software como «soporte lógico» protegido) y la Decisión Andina 351 de 1993. La utilización de software sin la respectiva licencia constituye infracción a los derechos patrimoniales de autor, tipificada en el Código Penal.

Para nuestro proyecto formativo («Construcción de software integrador de tecnologías orientadas a servicios»), considero que las licencias más adecuadas son:

1. Licencia Apache 2.0 o MIT para el repositorio principal:
   • Son licencias de código abierto permisivas que facilitan la reutilización y colaboración técnica.
   • Recomiendo específicamente Apache 2.0 porque incluye una cláusula explícita de concesión de patentes y protección legal ante posibles litigios, lo cual brinda mayor seguridad si el proyecto escala comercialmente.

2. Contrato de cesión o licencia propietaria si se entrega a un cliente específico:
   • En software desarrollado a la medida, la ley colombiana (art. 20 de la Ley 23 de 1982, modificado por la Ley 1450 de 2011) presume que los derechos patrimoniales se transfieren a quien encarga la obra, salvo pacto en contrario por escrito. Por tanto, las condiciones deben quedar claramente estipuladas en la propuesta técnica y económica.

3. Licencias de dependencias:
   • Es esencial auditar que las librerías empleadas (Spring Boot, Vue, React, PostgreSQL) no contravengan nuestro modelo de distribución, evitando el uso de licencias copyleft fuertes (como GPL-3.0) si el objetivo es distribuir un paquete cerrado sin obligación de liberar el código fuente.

En conclusión, elegir la licencia adecuada desde el inicio protege el esfuerzo de desarrollo del equipo, minimiza contingencias jurídicas y permite estimar con precisión el costo total de propiedad (TCO) para la organización.`
}

// Entrada oficial permanente garantizada para el foro en cualquier entorno (Local, GitHub o Vercel)
export const INITIAL_FORUM_POSTS = [
  {
    id: 'guia-como-hacer-la-entrada-al-foro',
    autor: 'Instructor / Vocero ADSO',
    ficha: 'Ficha ADSO - SENA',
    pregunta: 'Guía Oficial: ¿Cómo hacer y estructurar tu entrada (aporte) en el foro temático?',
    respuesta: `Estimados aprendices:

Esta guía detalla los pasos, criterios técnicos y recomendaciones para elaborar y publicar con éxito su entrada (aporte principal) en el foro temático de Licenciamiento de Software.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 PASO 1: IDENTIFICACIÓN DEL APRENDIZ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Dirígete a la pestaña "Redactar Mi Aporte".
2. Ingresa tu Nombre Completo en el campo correspondiente.
3. Ingresa tu Número de Ficha de formación (por ejemplo, 2977456).
4. Asigna una Clave o PIN de Autor (ej. 1234) para que en el futuro solo tú puedas modificar o editar tu entrada.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 PASO 2: FORMULAR LA PREGUNTA ORIENTADORA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En el campo "Pregunta o tema a debatir", escribe de forma completa y clara la pregunta orientadora de la evidencia:
• Ejemplo recomendado: «¿Qué es una licencia de software y cuáles son las más adecuadas para nuestro proyecto formativo y por qué?»

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✍️ PASO 3: REDACTAR EL CONTENIDO DE TU ENTRADA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En el campo "Respuesta y argumentación", redacta tu aporte reflexivo asegurándote de cubrir:
1. Concepto técnico y legal: Explica qué es una licencia de software (un contrato que otorga derecho de uso, sin transferir la titularidad de los derechos morales de autor).
2. Marco normativo en Colombia: Cita las normas aplicables al soporte lógico (Ley 23 de 1982, Decisión Andina 351 de 1993 y Decreto 1360 de 1989).
3. Clasificación de licencias: Distingue entre licencias privativas/propietarias, software libre (copyleft fuerte/débil) y código abierto permisivo (MIT, Apache-2.0, BSD).
4. Análisis aplicado al proyecto formativo: Concluye argumentando qué licencia conviene a tu proyecto de software y por qué (costos, reutilización de código, compatibilidad de librerías y protección de patentes).
• Criterio de extensión: Se sugiere un mínimo de 40 palabras en prosa estructurada y cuidando la ortografía técnica.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 PASO 4: PUBLICACIÓN Y CALIFICACIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Mientras redactas, el editor guarda automáticamente tus avances locales.
2. Al terminar, haz clic en el botón "Publicar en el Foro" ubicado en la barra superior.
3. Tu entrada quedará publicada de inmediato para toda la ficha, permitiendo que tus compañeros la lean y aporten réplicas reflexivas en la sección de comentarios.`,
    clave_edicion: '2501',
    calificacion: 98,
    retroalimentacion: 'Excelente estructura metodológica. La guía cumple plenamente con los lineamientos de la competencia formativa.',
    calificado_at: '2026-10-09T03:46:33.699Z',
    created_at: '2026-10-09T03:46:33.699Z',
    updated_at: '2026-10-09T03:46:33.699Z',
    total_comentarios: 1,
    tiene_clave: 1,
    comentarios: [
      {
        id: 'comentario-demo-entrada',
        aporte_id: 'guia-como-hacer-la-entrada-al-foro',
        autor: 'Aprendiz ADSO',
        comentario_citado: 'Asigna una Clave o PIN de Autor para que solo tú puedas modificar tu entrada',
        contenido: 'Excelente guía, instructor. Quedan muy claros los 4 puntos que debemos abordar en la entrada al foro para cumplir con la rúbrica de evaluación.',
        created_at: '2026-10-09T03:46:33.699Z'
      }
    ]
  }
]
