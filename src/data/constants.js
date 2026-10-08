export const LS_KEY = 'foro-licenciamiento-ev01'

export const TEXT_KEYS = ['saludo', 'q1', 'q2', 'q3', 'q4', 'cierre']
export const ALL_KEYS = ['autor', 'ficha', ...TEXT_KEYS]
export const Q_KEYS = ['q1', 'q2', 'q3', 'q4']
export const MIN_WORDS = 40

export const TITLES = {
  saludo: 'Saludo',
  q1: '1. ¿Qué es software?',
  q2: '2. ¿Qué es una licencia de software?',
  q3: '3. Tipos de licencia de software',
  q4: '4. ¿Cuáles son las más adecuadas y por qué?',
  cierre: 'Conclusión'
}

export const CAMPOS = [
  {
    key: 'saludo',
    label: 'Saludo e introducción',
    rows: 3,
    placeholder: 'Saluda al instructor y a tus compañeros y cuenta en una o dos frases de qué trata tu aporte.'
  },
  {
    key: 'q1',
    q: 'PREGUNTA 1',
    label: '¿Qué es software?',
    rows: 5,
    placeholder: 'Define el software, diferéncialo del hardware y menciona sus tipos.'
  },
  {
    key: 'q2',
    q: 'PREGUNTA 2',
    label: '¿Qué es una licencia de software?',
    rows: 5,
    placeholder: 'Explica qué es una licencia, qué define y qué normas la regulan en Colombia.'
  },
  {
    key: 'q3',
    q: 'PREGUNTA 3',
    label: 'Tipos de licencia de software',
    rows: 6,
    placeholder: 'Describe los tipos de licencia y cuáles son los más usados hoy.'
  },
  {
    key: 'q4',
    q: 'PREGUNTA 4',
    label: '¿Cuáles son las más adecuadas y por qué?',
    rows: 6,
    placeholder: 'Argumenta qué licencia conviene según el proyecto, el cliente y los costos.'
  },
  {
    key: 'cierre',
    label: 'Conclusión',
    rows: 3,
    placeholder: 'Cierra con tu reflexión e invita a tus compañeros a debatir.'
  }
]

export const PASOS = [
  { t: 'Reconoce', d: 'Un acierto concreto de su aporte.' },
  { t: 'Complementa', d: 'Un dato, norma o ejemplo que él no mencionó.' },
  { t: 'Cuestiona', d: 'Una idea que matizarías y por qué.' },
  { t: 'Invita', d: 'Una pregunta que siga el debate.' }
]

export const DRAFT = {
  saludo: `Cordial saludo, instructor y compañeros.

Comparto mi aporte al foro sobre licenciamiento de software. Lo organicé según las cuatro preguntas orientadoras y al final propongo qué licencias convienen a nuestro proyecto formativo, Construcción de software integrador de tecnologías orientadas a servicios.`,

  q1: `El software es el conjunto de programas, instrucciones, datos y documentación que le indican a un equipo de cómputo qué hacer y cómo hacerlo. Es la parte lógica de un sistema informático; el hardware es la parte física.

En Colombia el software tiene definición legal. La Decisión Andina 351 de 1993 lo describe como la expresión de un conjunto de instrucciones que, incorporadas en un dispositivo, hacen que un computador ejecute una tarea u obtenga un resultado. El Decreto 1360 de 1989 lo llama «soporte lógico» e incluye en él el programa de computador, su descripción y el material auxiliar, como los manuales. Para la ley, entonces, el software es una obra protegida por el derecho de autor, igual que un libro o una canción.

Se suele clasificar en tres grupos:
• Software de sistema: sistemas operativos y controladores, como Windows, Linux o Android.
• Software de aplicación: programas para tareas del usuario, como ofimática, navegadores o sistemas de facturación.
• Software de programación: herramientas para crear otros programas, como compiladores, editores de código y frameworks.`,

  q2: `Una licencia de software es un contrato entre el titular de los derechos de autor de un programa (licenciante) y quien lo va a usar (licenciatario). Con la licencia el titular no vende el programa, sino que autoriza ciertos usos bajo unas condiciones. Cuando una empresa compra Windows, adquiere el derecho de usarlo en un equipo, no la propiedad del código.

Una licencia normalmente define:
• Qué se puede hacer: instalar, copiar, modificar, distribuir o usar con fines comerciales.
• El alcance: número de usuarios, equipos o núcleos, y el territorio.
• La duración: perpetua o por suscripción.
• El costo y la forma de pago, si los hay.
• Las restricciones, como la prohibición de hacer ingeniería inversa o de revender.
• Las garantías y los límites de responsabilidad.

En Colombia el marco legal lo forman la Ley 23 de 1982 sobre derechos de autor, la Ley 44 de 1993, el Decreto 1360 de 1989 y la Decisión Andina 351 de 1993. Usar software sin la licencia correspondiente es piratería y puede traer sanciones civiles y penales; el Código Penal (Ley 599 de 2000) la castiga como violación a los derechos patrimoniales de autor. Por eso, al formular la propuesta técnica de un proyecto no basta con elegir la tecnología: también hay que revisar sus licencias y lo que cuestan.`,

  q3: `Las licencias se pueden agrupar según la libertad que dan sobre el código fuente:

• Propietarias o privativas. El código es cerrado y el usuario acepta un contrato de licencia de usuario final (EULA). Ejemplos: Windows, Microsoft 365, Adobe Photoshop y Oracle Database. Sus modalidades más comunes son la perpetua, la suscripción, la OEM (preinstalada en el equipo), la licencia por volumen para empresas y la académica.

• Freeware, shareware y freemium. El freeware se usa gratis pero el código sigue cerrado, como Adobe Acrobat Reader. El shareware se prueba por un tiempo o con funciones limitadas antes de pagar, como WinRAR. Hoy predomina el freemium: una versión básica gratuita y funciones avanzadas de pago.

• Software libre con copyleft. Parte de las cuatro libertades que define la Free Software Foundation: usar, estudiar, distribuir y mejorar el programa. El copyleft obliga a que las versiones modificadas se distribuyan con la misma licencia. Hay copyleft fuerte, como la GPL-2.0 (núcleo de Linux), la GPL-3.0 y la AGPL-3.0, que extiende la obligación al software que se ofrece por internet; y copyleft débil, como la LGPL y la MPL-2.0, que permiten usar la librería desde software cerrado pero exigen compartir los cambios hechos a la librería.

• Código abierto permisivo. Permite usar, modificar e incluso incluir el código en un producto comercial cerrado, con pocas condiciones, como conservar el aviso de derechos de autor. Las más conocidas son MIT (React, Node.js), Apache-2.0 (Spring Boot, Kubernetes), que además incluye una concesión expresa de patentes, y BSD (Django).

• Dominio público y Creative Commons. CC0 y Unlicense renuncian a casi todos los derechos. Las licencias Creative Commons sirven para documentación, imágenes y contenidos, pero no se recomiendan para código.

• Código disponible (source-available). Dejan ver el código pero restringen algunos usos comerciales, como la Business Source License. La Open Source Initiative no las considera código abierto.

¿Cuáles se usan más hoy? En su ranking de 2025, la Open Source Initiative reportó que la licencia MIT fue la más consultada, con cerca de 1,53 millones de visitas, seguida por Apache-2.0 (344 mil), BSD-3-Clause (214 mil), BSD-2-Clause (128 mil), GPL-2.0 (76 mil) y GPL-3.0 (55 mil). El dato hay que leerlo con cuidado, porque mide visitas a la página de cada licencia y no proyectos que la usan; aun así muestra el peso de las licencias permisivas. En el software comercial la tendencia es pasar de la licencia perpetua a la suscripción, como ocurrió con Microsoft 365 y Adobe Creative Cloud. Además, algunas empresas cambiaron proyectos abiertos a licencias de código disponible, y la comunidad respondió con bifurcaciones abiertas como OpenTofu (de Terraform) y Valkey (de Redis).`,

  q4: `No hay una licencia mejor que todas. La adecuada depende del tipo de proyecto, del modelo de negocio y de las licencias de los componentes que usamos. Mi análisis:

• Para el proyecto formativo que publicamos en GitHub recomiendo Apache-2.0 o MIT. Son fáciles de entender, permiten que otros reutilicen el código y son compatibles con la mayoría de librerías. Me inclino por Apache-2.0 si el proyecto puede llegar a una empresa, porque protege frente a reclamos por patentes.
• Para software a la medida que se entrega a un cliente, lo adecuado es un contrato que defina la licencia o la cesión de derechos patrimoniales. En las obras creadas por contrato de prestación de servicios o de trabajo, la ley colombiana presume, salvo pacto en contrario, que esos derechos pasan a quien encarga la obra, siempre que el contrato conste por escrito (art. 20 de la Ley 23 de 1982, modificado por la Ley 1450 de 2011). Por eso conviene dejarlo claro en la propuesta técnica.
• Si queremos que toda mejora vuelva a la comunidad, la opción es GPL-3.0; y si el sistema se ofrece como servicio web, AGPL-3.0.
• Para manuales y documentación, Creative Commons BY o BY-SA.

Antes de elegir hay que revisar la compatibilidad de las dependencias. React y Node.js usan MIT, Spring Boot usa Apache-2.0, PostgreSQL tiene su propia licencia permisiva y MySQL Community se distribuye bajo GPL-2.0 con una licencia comercial aparte. Si un producto cerrado incorpora código GPL, queda obligado a liberar su código al distribuirlo.

También pesa el costo. Una licencia propietaria implica pagos por usuario o por equipo que deben quedar en la propuesta económica. El software libre ahorra ese pago, pero no es gratis del todo: requiere soporte, capacitación y mantenimiento. Por eso la decisión se debe tomar con el costo total de propiedad y no solo con el precio de compra.`,

  cierre: `El licenciamiento hace parte de las especificaciones técnicas de una solución; no es un trámite legal que se deja para el final. Elegir bien la licencia protege el trabajo del equipo, evita riesgos legales al cliente y permite estimar costos reales en la propuesta económica.

Quedo atento a sus aportes. Me interesa saber qué licencia eligieron para su proyecto y por qué.`
}
