// Licencias de software para la pestaña "⚖️ Licencias de Software" (src/components/LicenciasInfo.vue).
// Cada licencia: { id, nombre, corto, spdx, categoria, resumen, permite, exige, limita, proyectos, ideal, abuela, tabla }
// - proyectos: software conocido que usa la licencia (cada uno sale como una etiqueta).
// - abuela: la misma licencia explicada "como si tuviera 80 años", con comparaciones de cocina costeña.
// - categoria es el id de una de CATEGORIAS_LICENCIA.
// - tabla tiene un valor por cada columna de COLUMNAS_TABLA.
// - Las reglas de compatibilidad usan los mismos valores que la tabla: yes, cond o no.

export const CATEGORIAS_LICENCIA = [
  {
    id: 'dominio-publico',
    icono: '🌍',
    nombre: 'Dominio público',
    tono: '--ok',
    descripcion: 'El autor renuncia a todos los derechos posibles. Cualquiera puede hacer cualquier cosa con el código, sin siquiera dar crédito.',
    ejemplos: 'Unlicense, CC0 1.0'
  },
  {
    id: 'permisiva',
    icono: '🕊️',
    nombre: 'Permisivas',
    tono: '--ok',
    descripcion: 'Permiten usar, modificar e incluir el código incluso en software propietario. Solo exigen conservar el aviso de copyright y la licencia.',
    ejemplos: 'MIT, Apache 2.0, BSD 2/3-Clause'
  },
  {
    id: 'copyleft-debil',
    icono: '🧱',
    nombre: 'Copyleft débil',
    tono: '--warn',
    descripcion: 'Las modificaciones a la librería o a sus archivos deben compartirse con la misma licencia, pero puedes enlazarla desde software con otra licencia.',
    ejemplos: 'LGPL v3, MPL 2.0'
  },
  {
    id: 'copyleft-fuerte',
    icono: '🔁',
    nombre: 'Copyleft fuerte',
    tono: '--bad',
    descripcion: 'Toda obra derivada que se distribuya debe publicarse completa bajo la misma licencia, con su código fuente. AGPL extiende esto al uso a través de la red.',
    ejemplos: 'GPL v2, GPL v3, AGPL v3'
  },
  {
    id: 'propietaria',
    icono: '🔒',
    nombre: 'Propietarias',
    tono: '--muted',
    descripcion: 'El titular conserva todos los derechos y concede solo un permiso de uso (EULA). Normalmente prohíben copiar, modificar o hacer ingeniería inversa.',
    ejemplos: 'Windows, Microsoft Office, Adobe Photoshop'
  }
]

export const COLUMNAS_TABLA = [
  { id: 'comercial', nombre: 'Uso comercial' },
  { id: 'modificar', nombre: 'Modificar' },
  { id: 'distribuir', nombre: 'Distribuir' },
  { id: 'patentes', nombre: 'Licencia de patentes' },
  { id: 'revelar', nombre: 'Revelar código' },
  { id: 'misma', nombre: 'Misma licencia' },
  { id: 'red', nombre: 'Uso en red' }
]

// tabla: 'yes' = permitido o sin obligación, 'cond' = con condiciones, 'no' = no permitido u obligatorio
export const LICENCIAS = [
  {
    id: 'mit',
    nombre: 'MIT License',
    corto: 'MIT',
    spdx: 'MIT',
    categoria: 'permisiva',
    resumen: 'La licencia más popular en GitHub. Es corta y sencilla: haz lo que quieras con el código siempre que incluyas el aviso de copyright y el texto de la licencia.',
    permite: ['Uso comercial y privado', 'Modificar y redistribuir', 'Sublicenciar e integrar en software propietario'],
    exige: ['Conservar el aviso de copyright y la licencia'],
    limita: ['Sin garantía ni responsabilidad del autor', 'No otorga licencia de patentes de forma explícita'],
    proyectos: ['React', 'Vue.js', 'Angular', 'Node.js', 'jQuery', 'Bootstrap', 'Tailwind CSS', 'Electron', '.NET', 'Ruby on Rails', 'Código de VS Code (Code - OSS)'],
    ideal: 'Librerías y proyectos que buscan la máxima adopción.',
    abuela: 'Es como la receta del bollo limpio que regala la vecina: haz con ella lo que quieras, hasta venderlo en la esquina, pero di que la receta es de ella. Y si se te quema, la vecina no responde.',
    tabla: { comercial: 'yes', modificar: 'yes', distribuir: 'yes', patentes: 'cond', revelar: 'yes', misma: 'yes', red: 'yes' }
  },
  {
    id: 'apache',
    nombre: 'Apache License 2.0',
    corto: 'Apache 2.0',
    spdx: 'Apache-2.0',
    categoria: 'permisiva',
    resumen: 'Permisiva como MIT, pero más detallada: concede expresamente una licencia de patentes y revoca ese permiso a quien demande por patentes a los contribuidores.',
    permite: ['Uso comercial y privado', 'Modificar y redistribuir', 'Uso de las patentes de los contribuidores'],
    exige: ['Incluir licencia y archivo NOTICE si existe', 'Indicar los archivos modificados'],
    limita: ['No permite usar las marcas registradas del proyecto', 'Sin garantía ni responsabilidad'],
    proyectos: ['Kubernetes', 'Android (AOSP)', 'TypeScript', 'Kotlin', 'Swift', 'Spring Boot', 'TensorFlow', 'Apache Kafka', 'Apache HTTP Server'],
    ideal: 'Proyectos empresariales donde importa la protección frente a patentes.',
    abuela: 'Igualita a la MIT, pero con abogado incluido: la vecina te regala la receta y te firma que no te va a demandar por ella (eso son las patentes). Eso sí, si tú la demandas a ella, se acaba el permiso. Y no puedes vender tu bollo como «Bollos de la Vecina».',
    tabla: { comercial: 'yes', modificar: 'yes', distribuir: 'yes', patentes: 'yes', revelar: 'yes', misma: 'yes', red: 'yes' }
  },
  {
    id: 'bsd',
    nombre: 'BSD 3-Clause / 2-Clause',
    corto: 'BSD 3-Clause',
    spdx: 'BSD-3-Clause / BSD-2-Clause',
    categoria: 'permisiva',
    resumen: 'Muy parecida a MIT. La versión de 3 cláusulas añade que no se puede usar el nombre del autor para promocionar productos derivados sin permiso.',
    permite: ['Uso comercial y privado', 'Modificar y redistribuir', 'Integrar en software propietario'],
    exige: ['Conservar el aviso de copyright y la licencia'],
    limita: ['No usar el nombre del autor para promoción (3-Clause)', 'Sin garantía ni responsabilidad'],
    proyectos: ['FreeBSD', 'Django', 'Flask', 'Flutter', 'NumPy', 'pandas', 'nginx (BSD 2-Clause)', 'Lenguaje Go'],
    ideal: 'Proyectos académicos o que quieren proteger su nombre.',
    abuela: 'Prima hermana de la MIT: usa la receta como quieras y di de quién es, pero no pongas la foto de la vecina en tu letrero para vender más sin pedirle permiso.',
    tabla: { comercial: 'yes', modificar: 'yes', distribuir: 'yes', patentes: 'cond', revelar: 'yes', misma: 'yes', red: 'yes' }
  },
  {
    id: 'gpl',
    nombre: 'GNU General Public License v3 (y v2)',
    corto: 'GPL v3',
    spdx: 'GPL-3.0-only / GPL-3.0-or-later',
    categoria: 'copyleft-fuerte',
    resumen: 'La licencia copyleft por excelencia. Si distribuyes el programa o una obra derivada, debes entregar el código fuente completo bajo la misma licencia. La v3 añade licencia de patentes y medidas contra la «tivoización».',
    permite: ['Uso comercial y privado (puedes cobrar)', 'Modificar y redistribuir', 'Uso de las patentes de los contribuidores'],
    exige: ['Publicar el código fuente al distribuir', 'Licenciar las obras derivadas con GPL', 'Indicar los cambios realizados'],
    limita: ['No se puede integrar en software propietario distribuido', 'Sin garantía ni responsabilidad'],
    proyectos: ['Linux (GPL v2)', 'Git (GPL v2)', 'GIMP', 'Bash', 'WordPress (GPL v2+)', 'VLC media player', 'GCC', 'MySQL Community (también con licencia comercial)'],
    ideal: 'Proyectos que quieren garantizar que toda mejora siga siendo libre.',
    abuela: 'Es como la receta del arroz de coco de la abuela: la puedes usar y mejorar, pero si repartes tu versión mejorada tienes que pasar la receta completa con la misma condición. Aquí no hay secretos de cocina.',
    tabla: { comercial: 'yes', modificar: 'yes', distribuir: 'cond', patentes: 'yes', revelar: 'no', misma: 'no', red: 'yes' }
  },
  {
    id: 'lgpl',
    nombre: 'GNU Lesser General Public License v3',
    corto: 'LGPL v3',
    spdx: 'LGPL-3.0-only / LGPL-3.0-or-later',
    categoria: 'copyleft-debil',
    resumen: 'Pensada para librerías. Un programa propietario puede enlazar la librería sin volverse LGPL, pero las modificaciones a la propia librería deben compartirse.',
    permite: ['Uso comercial y privado', 'Enlazar desde software propietario', 'Modificar y redistribuir'],
    exige: ['Publicar los cambios hechos a la librería', 'Permitir que el usuario reemplace la librería enlazada'],
    limita: ['El copyleft aplica a la librería, no a tu aplicación', 'Sin garantía ni responsabilidad'],
    proyectos: ['GNU C Library (glibc)', 'FFmpeg', 'GTK', '7-Zip (en su mayor parte)', 'Qt (también con licencia comercial)'],
    ideal: 'Librerías que quieren ser usadas por todos sin perder las mejoras.',
    abuela: 'Es como el suero costeño que compras hecho: lo echas en tu plato y vendes el plato con tu receta secreta. Pero si le cambias algo al suero, la receta de ese suero sí la tienes que compartir.',
    tabla: { comercial: 'yes', modificar: 'yes', distribuir: 'cond', patentes: 'yes', revelar: 'cond', misma: 'cond', red: 'yes' }
  },
  {
    id: 'mpl',
    nombre: 'Mozilla Public License 2.0',
    corto: 'MPL 2.0',
    spdx: 'MPL-2.0',
    categoria: 'copyleft-debil',
    resumen: 'Copyleft a nivel de archivo: los archivos con licencia MPL que modifiques deben seguir siendo MPL y públicos, pero puedes combinarlos con archivos propios bajo cualquier licencia.',
    permite: ['Uso comercial y privado', 'Combinar con código propietario en otros archivos', 'Uso de patentes de los contribuidores'],
    exige: ['Publicar el código de los archivos MPL modificados', 'Conservar avisos de copyright y licencia'],
    limita: ['No permite usar las marcas registradas', 'Sin garantía ni responsabilidad'],
    proyectos: ['Firefox', 'Thunderbird', 'LibreOffice (MPL 2.0)', 'Syncthing', 'OpenTofu'],
    ideal: 'Un punto medio entre permisiva y GPL.',
    abuela: 'Va olla por olla: si le cambias algo a la olla del arroz de la abuela, esa olla la compartes; las otras ollas, con tus recetas, siguen siendo tuyas.',
    tabla: { comercial: 'yes', modificar: 'yes', distribuir: 'cond', patentes: 'yes', revelar: 'cond', misma: 'cond', red: 'yes' }
  },
  {
    id: 'agpl',
    nombre: 'GNU Affero General Public License v3',
    corto: 'AGPL v3',
    spdx: 'AGPL-3.0-only / AGPL-3.0-or-later',
    categoria: 'copyleft-fuerte',
    resumen: 'Igual que GPL v3 pero cierra el «hueco del SaaS»: si los usuarios interactúan con el programa modificado a través de la red, debes ofrecerles el código fuente.',
    permite: ['Uso comercial y privado', 'Modificar y redistribuir', 'Uso de patentes de los contribuidores'],
    exige: ['Publicar el código al distribuir o al ofrecerlo por red', 'Licenciar las obras derivadas con AGPL'],
    limita: ['Muy restrictiva para servicios web propietarios', 'Muchas empresas prohíben usar dependencias AGPL'],
    proyectos: ['Mastodon', 'Nextcloud', 'Grafana', 'Overleaf', 'Servidor de Bitwarden'],
    ideal: 'Aplicaciones web que no quieren ser aprovechadas como SaaS cerrado.',
    abuela: 'Como la GPL, pero también pa\' los restaurantes: aunque no regales la receta y solo vendas los platos en tu restaurante (la web), el que se los come tiene derecho a pedirte la receta.',
    tabla: { comercial: 'yes', modificar: 'yes', distribuir: 'cond', patentes: 'yes', revelar: 'no', misma: 'no', red: 'no' }
  },
  {
    id: 'unlicense',
    nombre: 'The Unlicense / CC0',
    corto: 'Unlicense',
    spdx: 'Unlicense / CC0-1.0',
    categoria: 'dominio-publico',
    resumen: 'Dedica la obra al dominio público. No exige ni siquiera atribución. En países donde no se puede renunciar a todos los derechos (como Colombia con los derechos morales) actúa como una licencia totalmente permisiva.',
    permite: ['Cualquier uso, sin condiciones'],
    exige: ['Nada'],
    limita: ['Sin garantía ni responsabilidad', 'No otorga licencia de patentes explícita'],
    proyectos: ['youtube-dl / yt-dlp (Unlicense)', 'Datos de Wikidata (CC0)', 'Snippets y datasets (CC0)', 'SQLite (dominio público, parecido)'],
    ideal: 'Ejemplos, plantillas y código que quieres regalar sin condiciones.',
    abuela: 'La abuela tira la receta por la ventana pa\' que la recoja el que quiera: no pide nada, ni siquiera que digan que es de ella. Aunque aquí en Colombia la receta siempre va a ser de la abuela (derechos morales), así no la cobre.',
    tabla: { comercial: 'yes', modificar: 'yes', distribuir: 'yes', patentes: 'cond', revelar: 'yes', misma: 'yes', red: 'yes' }
  },
  {
    id: 'propietaria',
    nombre: 'Licencia propietaria (EULA)',
    corto: 'Propietaria',
    spdx: 'LicenseRef-Proprietary',
    categoria: 'propietaria',
    resumen: 'El usuario no compra el software sino un permiso de uso con condiciones definidas por el titular: número de equipos, duración (suscripción o perpetua), territorio, etc.',
    permite: ['Usar el software según los términos del contrato'],
    exige: ['Aceptar el contrato de licencia (EULA)', 'Pagar la licencia o suscripción, si aplica'],
    limita: ['Prohíbe copiar, modificar o redistribuir', 'Suele prohibir la ingeniería inversa', 'No da acceso al código fuente'],
    proyectos: ['Windows', 'macOS', 'Microsoft Office', 'Photoshop', 'Illustrator', 'AutoCAD', 'WhatsApp', 'Zoom'],
    ideal: 'Productos comerciales donde el código es el activo del negocio.',
    abuela: 'Es como alquilar la casa de playa: la usas con las reglas del dueño (cuánta gente, cuántos días), pero no puedes tumbar paredes, ni sacarle copia a la llave, ni subarrendarla. La casa nunca es tuya.',
    tabla: { comercial: 'cond', modificar: 'no', distribuir: 'no', patentes: 'no', revelar: 'yes', misma: 'yes', red: 'yes' }
  }
]

export const REGLAS_COMPATIBILIDAD = [
  {
    tipo: 'yes',
    titulo: 'MIT / BSD / Apache dentro de un proyecto GPL v3',
    detalle: 'Permitido. El proyecto final se distribuye como GPL v3 y se conservan los avisos de copyright de las partes permisivas.'
  },
  {
    tipo: 'no',
    titulo: 'Código GPL dentro de un producto propietario distribuido',
    detalle: 'No permitido. Si distribuyes el producto, tendrías que liberarlo completo bajo GPL. La alternativa es buscar una librería permisiva o comprar una licencia comercial (doble licenciamiento).'
  },
  {
    tipo: 'cond',
    titulo: 'Apache 2.0 con GPL v2',
    detalle: 'Incompatibles: las cláusulas de patentes de Apache 2.0 son restricciones adicionales que GPL v2 no admite. Sí es compatible con GPL v3, o con proyectos «GPL v2 o posterior».'
  },
  {
    tipo: 'cond',
    titulo: 'Librería LGPL en una aplicación propietaria',
    detalle: 'Permitido si se enlaza (preferiblemente de forma dinámica) y el usuario puede sustituir la librería. Los cambios a la librería se publican como LGPL.'
  },
  {
    tipo: 'cond',
    titulo: 'Usar código GPL solo en el servidor (SaaS)',
    detalle: 'Con GPL no se considera distribución, así que no obliga a publicar el código. Con AGPL sí: los usuarios que acceden por red tienen derecho al código fuente.'
  },
  {
    tipo: 'no',
    titulo: 'Código sin licencia en GitHub',
    detalle: 'Que un repositorio sea público no significa que puedas usarlo. Sin archivo LICENSE, el autor conserva todos los derechos por defecto.'
  }
]
