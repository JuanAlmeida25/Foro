// Glosario de licenciamiento de software para la pestaña "📖 Glosario".
// Cada término: { id, termino, sinonimos, categoria, definicion, ejemplo?, relacionados: [ids] }
// Las referencias legales colombianas coinciden con las de src/data/repaso.js.

export const CATEGORIAS_GLOSARIO = [
  { id: 'basicos', nombre: 'Conceptos básicos', icono: '💡' },
  { id: 'tipos', nombre: 'Tipos de licencia', icono: '🧭' },
  { id: 'licencias', nombre: 'Licencias específicas', icono: '📜' },
  { id: 'derecho', nombre: 'Derecho y normativa colombiana', icono: '⚖️' },
  { id: 'desarrollo', nombre: 'Desarrollo y distribución', icono: '🛠️' }
]

export const TERMINOS = [
  // ----- Conceptos básicos -----
  {
    id: 'software',
    termino: 'Software',
    sinonimos: ['programa', 'programa de ordenador', 'aplicación'],
    categoria: 'basicos',
    definicion: 'Conjunto de instrucciones, datos y documentación que le indican a un computador qué tareas realizar. Incluye el código fuente, el código ejecutable y sus manuales.',
    ejemplo: 'Un sistema operativo, un navegador web o la app de un banco son software.',
    relacionados: ['soporte-logico', 'codigo-fuente', 'licencia']
  },
  {
    id: 'codigo-fuente',
    termino: 'Código fuente',
    sinonimos: ['source code', 'fuentes'],
    categoria: 'basicos',
    definicion: 'Texto del programa escrito en un lenguaje legible por personas (JavaScript, Python, Java…). Es lo que el desarrollador lee y modifica.',
    ejemplo: 'Los archivos .vue y .js de este foro son su código fuente.',
    relacionados: ['codigo-objeto', 'codigo-abierto', 'copyleft']
  },
  {
    id: 'codigo-objeto',
    termino: 'Código objeto',
    sinonimos: ['binario', 'ejecutable', 'código máquina'],
    categoria: 'basicos',
    definicion: 'Resultado de compilar el código fuente: instrucciones que la máquina ejecuta pero que una persona no puede leer ni modificar con facilidad.',
    ejemplo: 'Un archivo .exe de Windows es código objeto.',
    relacionados: ['codigo-fuente', 'ingenieria-inversa']
  },
  {
    id: 'licencia',
    termino: 'Licencia de software',
    sinonimos: ['licencia', 'licenciamiento'],
    categoria: 'basicos',
    definicion: 'Autorización que da el titular de los derechos de autor para usar un software bajo ciertas condiciones. No transfiere la propiedad: el titular sigue siendo dueño de la obra.',
    ejemplo: 'Al instalar Office aceptas una licencia; al usar React aceptas la licencia MIT.',
    relacionados: ['eula', 'derechos-autor', 'licencia-permisiva', 'copyleft']
  },
  {
    id: 'software-libre',
    termino: 'Software libre',
    sinonimos: ['free software'],
    categoria: 'basicos',
    definicion: 'Software que respeta las cuatro libertades definidas por la Free Software Foundation: usarlo con cualquier propósito, estudiar cómo funciona, distribuir copias y mejorarlo. «Libre» se refiere a libertad, no a precio.',
    ejemplo: 'GNU/Linux, GIMP y LibreOffice son software libre.',
    relacionados: ['fsf', 'codigo-abierto', 'gpl', 'freeware']
  },
  {
    id: 'codigo-abierto',
    termino: 'Código abierto',
    sinonimos: ['open source'],
    categoria: 'basicos',
    definicion: 'Software cuya licencia cumple la Definición de Open Source de la OSI: permite acceder al código, modificarlo y redistribuirlo sin discriminar personas ni usos.',
    ejemplo: 'Vue.js, Kubernetes y Firefox son de código abierto.',
    relacionados: ['osi', 'software-libre', 'source-available']
  },
  {
    id: 'freeware',
    termino: 'Freeware',
    sinonimos: ['software gratuito', 'gratis'],
    categoria: 'basicos',
    definicion: 'Software que se distribuye sin costo, pero normalmente sin acceso al código ni permiso para modificarlo. Gratis no significa libre.',
    ejemplo: 'Muchos lectores de PDF o reproductores de video son freeware propietario.',
    relacionados: ['shareware', 'software-libre', 'licencia-propietaria']
  },
  {
    id: 'shareware',
    termino: 'Shareware',
    sinonimos: ['versión de prueba', 'trial'],
    categoria: 'basicos',
    definicion: 'Software propietario que se puede probar gratis por un tiempo o con funciones limitadas; para seguir usándolo hay que comprar la licencia.',
    ejemplo: 'Un editor que funciona 30 días y luego pide una clave de activación.',
    relacionados: ['freeware', 'licencia-propietaria', 'suscripcion']
  },
  {
    id: 'osi',
    termino: 'OSI',
    sinonimos: ['Open Source Initiative'],
    categoria: 'basicos',
    definicion: 'Organización que mantiene la Definición de Open Source y revisa qué licencias la cumplen. Una licencia «aprobada por la OSI» es oficialmente de código abierto.',
    relacionados: ['codigo-abierto', 'fsf', 'source-available']
  },
  {
    id: 'fsf',
    termino: 'FSF',
    sinonimos: ['Free Software Foundation', 'Fundación para el Software Libre'],
    categoria: 'basicos',
    definicion: 'Fundación creada por Richard Stallman en 1985 para promover el software libre. Publica las licencias GNU GPL, LGPL y AGPL.',
    relacionados: ['software-libre', 'gpl', 'osi']
  },

  // ----- Tipos de licencia -----
  {
    id: 'licencia-permisiva',
    termino: 'Licencia permisiva',
    sinonimos: ['permisiva'],
    categoria: 'tipos',
    definicion: 'Licencia abierta que permite usar, modificar e incluir el código incluso en software propietario. Normalmente solo exige conservar el aviso de copyright.',
    ejemplo: 'MIT, Apache 2.0 y BSD son permisivas.',
    relacionados: ['mit', 'apache', 'bsd', 'copyleft']
  },
  {
    id: 'copyleft',
    termino: 'Copyleft',
    sinonimos: ['copyleft fuerte', 'licencia recíproca'],
    categoria: 'tipos',
    definicion: 'Mecanismo que usa los derechos de autor para exigir que las obras derivadas que se distribuyan conserven la misma licencia libre y entreguen su código fuente. El copyleft fuerte aplica a todo el programa derivado.',
    ejemplo: 'Si modificas un programa GPL y lo distribuyes, tu versión también debe ser GPL.',
    relacionados: ['copyleft-debil', 'gpl', 'agpl', 'obra-derivada']
  },
  {
    id: 'copyleft-debil',
    termino: 'Copyleft débil',
    sinonimos: ['weak copyleft'],
    categoria: 'tipos',
    definicion: 'Copyleft limitado a la librería o a los archivos originales: los cambios a ese código deben compartirse, pero puede usarse desde programas con otra licencia, incluso propietaria.',
    ejemplo: 'LGPL y MPL 2.0.',
    relacionados: ['lgpl', 'mpl', 'copyleft', 'enlace']
  },
  {
    id: 'licencia-propietaria',
    termino: 'Licencia propietaria',
    sinonimos: ['software privativo', 'software propietario', 'licencia comercial'],
    categoria: 'tipos',
    definicion: 'Licencia en la que el titular conserva todos los derechos y solo concede un permiso de uso limitado. Suele prohibir copiar, modificar, redistribuir y hacer ingeniería inversa.',
    ejemplo: 'Windows, Microsoft Office y Adobe Photoshop.',
    relacionados: ['eula', 'suscripcion', 'pirateria']
  },
  {
    id: 'eula',
    termino: 'EULA',
    sinonimos: ['End User License Agreement', 'contrato de licencia de usuario final'],
    categoria: 'tipos',
    definicion: 'Contrato que el usuario acepta, por lo general al instalar o registrarse, y que fija qué puede y qué no puede hacer con un software propietario.',
    ejemplo: 'El cuadro «Acepto los términos» del instalador de un programa.',
    relacionados: ['licencia-propietaria', 'licencia']
  },
  {
    id: 'dominio-publico',
    termino: 'Dominio público',
    sinonimos: ['public domain'],
    categoria: 'tipos',
    definicion: 'Situación de una obra que ya no tiene derechos patrimoniales vigentes, o cuyo autor renunció a ellos, por lo que cualquiera puede usarla libremente. En Colombia los derechos morales nunca se pierden.',
    relacionados: ['cc0', 'derechos-morales', 'derechos-patrimoniales']
  },
  {
    id: 'doble-licencia',
    termino: 'Doble licenciamiento',
    sinonimos: ['dual licensing', 'licencia dual'],
    categoria: 'tipos',
    definicion: 'Modelo en el que el titular ofrece el mismo software bajo dos licencias: una libre (a menudo GPL) y otra comercial para quien no quiera cumplir las condiciones de la libre.',
    ejemplo: 'Qt se ofrece con LGPL v3/GPL o con licencia comercial.',
    relacionados: ['gpl', 'licencia-propietaria']
  },
  {
    id: 'source-available',
    termino: 'Source-available',
    sinonimos: ['código disponible', 'BSL', 'SSPL', 'Business Source License'],
    categoria: 'tipos',
    definicion: 'Licencias que permiten ver el código pero restringen ciertos usos, como ofrecerlo como servicio en la nube. No están aprobadas por la OSI, así que no son de código abierto.',
    ejemplo: 'La Business Source License (BSL) y la Server Side Public License (SSPL).',
    relacionados: ['codigo-abierto', 'osi', 'saas']
  },

  // ----- Licencias específicas -----
  {
    id: 'mit',
    termino: 'MIT',
    sinonimos: ['licencia MIT', 'MIT License'],
    categoria: 'licencias',
    definicion: 'Licencia permisiva muy corta: permite cualquier uso siempre que se incluya el aviso de copyright y el texto de la licencia. Es la más usada en GitHub.',
    ejemplo: 'React, Vue.js y Node.js usan MIT.',
    relacionados: ['licencia-permisiva', 'bsd', 'apache']
  },
  {
    id: 'apache',
    termino: 'Apache 2.0',
    sinonimos: ['Apache License', 'licencia Apache'],
    categoria: 'licencias',
    definicion: 'Licencia permisiva que además concede una licencia expresa de patentes y exige indicar los archivos modificados y conservar el archivo NOTICE.',
    ejemplo: 'Kubernetes, Android (AOSP) y TypeScript usan Apache 2.0.',
    relacionados: ['licencia-patentes', 'notice', 'mit']
  },
  {
    id: 'bsd',
    termino: 'BSD',
    sinonimos: ['BSD 3-Clause', 'BSD 2-Clause', 'licencia BSD'],
    categoria: 'licencias',
    definicion: 'Familia de licencias permisivas parecidas a MIT. La versión de 3 cláusulas prohíbe usar el nombre del autor para promocionar productos derivados sin permiso.',
    ejemplo: 'Django, Flask y el lenguaje Go usan BSD.',
    relacionados: ['mit', 'licencia-permisiva']
  },
  {
    id: 'gpl',
    termino: 'GPL',
    sinonimos: ['GNU GPL', 'General Public License', 'GPL v3', 'GPL v2'],
    categoria: 'licencias',
    definicion: 'Licencia copyleft fuerte de la FSF. Quien distribuya el programa o una obra derivada debe entregar el código fuente completo bajo la misma licencia. La versión 3 añade licencia de patentes y medidas contra la tivoización.',
    ejemplo: 'El kernel Linux (GPL v2), GIMP y Bash.',
    relacionados: ['copyleft', 'lgpl', 'agpl', 'tivoizacion']
  },
  {
    id: 'lgpl',
    termino: 'LGPL',
    sinonimos: ['GNU LGPL', 'Lesser General Public License'],
    categoria: 'licencias',
    definicion: 'Licencia de copyleft débil pensada para librerías: un programa propietario puede enlazarla sin volverse LGPL, pero los cambios a la librería deben publicarse.',
    ejemplo: 'La GNU C Library (glibc) y FFmpeg.',
    relacionados: ['copyleft-debil', 'enlace', 'gpl']
  },
  {
    id: 'agpl',
    termino: 'AGPL',
    sinonimos: ['GNU AGPL', 'Affero General Public License'],
    categoria: 'licencias',
    definicion: 'Igual que GPL v3, pero si los usuarios interactúan con el programa modificado a través de una red también tienen derecho a recibir su código fuente.',
    ejemplo: 'Mastodon, Nextcloud y Grafana.',
    relacionados: ['gpl', 'saas', 'copyleft']
  },
  {
    id: 'mpl',
    termino: 'MPL 2.0',
    sinonimos: ['Mozilla Public License'],
    categoria: 'licencias',
    definicion: 'Licencia con copyleft a nivel de archivo: los archivos MPL modificados deben seguir siendo MPL y públicos, pero pueden combinarse con archivos propios bajo cualquier licencia.',
    ejemplo: 'Firefox y Thunderbird.',
    relacionados: ['copyleft-debil', 'lgpl']
  },
  {
    id: 'cc0',
    termino: 'CC0 / Unlicense',
    sinonimos: ['CC0', 'Unlicense', 'Creative Commons Zero'],
    categoria: 'licencias',
    definicion: 'Herramientas para dedicar una obra al dominio público renunciando a todos los derechos posibles. Donde la ley no permite renunciar, funcionan como una licencia totalmente permisiva.',
    relacionados: ['dominio-publico', 'licencia-permisiva']
  },

  // ----- Derecho y normativa colombiana -----
  {
    id: 'derechos-autor',
    termino: 'Derechos de autor',
    sinonimos: ['derecho de autor', 'copyright'],
    categoria: 'derecho',
    definicion: 'Protección legal que la ley otorga al creador de una obra original. En el software protege la forma de expresión (el código), no la idea. Nace con la creación, sin necesidad de registro (Ley 23 de 1982, art. 9).',
    relacionados: ['derechos-morales', 'derechos-patrimoniales', 'ley-23', 'dnda']
  },
  {
    id: 'derechos-morales',
    termino: 'Derechos morales',
    sinonimos: ['paternidad', 'integridad de la obra'],
    categoria: 'derecho',
    definicion: 'Derechos personales del autor que no se pueden vender, ceder ni renunciar: ser reconocido como autor (paternidad) y oponerse a deformaciones de su obra (integridad).',
    ejemplo: 'Aunque una empresa compre tu software, tú sigues siendo reconocido como su autor.',
    relacionados: ['derechos-patrimoniales', 'derechos-autor', 'software-encargo']
  },
  {
    id: 'derechos-patrimoniales',
    termino: 'Derechos patrimoniales',
    sinonimos: ['derechos de explotación', 'derechos económicos'],
    categoria: 'derecho',
    definicion: 'Derechos de explotar económicamente la obra: reproducirla, distribuirla, transformarla y comunicarla. A diferencia de los morales, sí se pueden ceder o licenciar.',
    relacionados: ['derechos-morales', 'licencia', 'software-encargo']
  },
  {
    id: 'soporte-logico',
    termino: 'Soporte lógico',
    sinonimos: ['software (término legal)'],
    categoria: 'derecho',
    definicion: 'Nombre que usa la legislación colombiana para el software. El Decreto 1360 de 1989 lo reconoce como obra protegida por el derecho de autor e incluye el programa, la descripción del programa y el material auxiliar.',
    relacionados: ['software', 'derechos-autor', 'dnda']
  },
  {
    id: 'dnda',
    termino: 'DNDA',
    sinonimos: ['Dirección Nacional de Derecho de Autor'],
    categoria: 'derecho',
    definicion: 'Entidad colombiana encargada del registro de obras, incluido el software. El registro no crea el derecho (este nace con la obra), pero sirve como prueba de autoría y fecha.',
    relacionados: ['derechos-autor', 'soporte-logico']
  },
  {
    id: 'ley-23',
    termino: 'Ley 23 de 1982',
    sinonimos: ['ley de derechos de autor'],
    categoria: 'derecho',
    definicion: 'Ley colombiana sobre derechos de autor. Establece que la protección nace con la creación (art. 9) y regula la titularidad de las obras hechas por encargo (art. 20, modificado por el art. 28 de la Ley 1450 de 2011).',
    relacionados: ['derechos-autor', 'software-encargo', 'decision-351']
  },
  {
    id: 'decision-351',
    termino: 'Decisión Andina 351 de 1993',
    sinonimos: ['Decisión 351', 'régimen común andino'],
    categoria: 'derecho',
    definicion: 'Régimen común de derecho de autor para los países de la Comunidad Andina, incluida Colombia. Protege los programas de ordenador en los mismos términos que las obras literarias.',
    relacionados: ['ley-23', 'derechos-autor']
  },
  {
    id: 'art-271',
    termino: 'Artículo 271 del Código Penal',
    sinonimos: ['art. 271', 'delito contra derechos patrimoniales'],
    categoria: 'derecho',
    definicion: 'Norma penal colombiana que castiga la violación de los derechos patrimoniales de autor, como reproducir o distribuir software sin autorización. Modificado por la Ley 1032 de 2006, prevé prisión de cuatro a ocho años y multa.',
    relacionados: ['pirateria', 'derechos-patrimoniales']
  },
  {
    id: 'software-encargo',
    termino: 'Software por encargo',
    sinonimos: ['obra por encargo', 'contrato de prestación de servicios'],
    categoria: 'derecho',
    definicion: 'Software creado por contrato de trabajo o de prestación de servicios. El autor es el titular originario, pero se presume, salvo pacto en contrario y con contrato escrito, que los derechos patrimoniales pasan al encargante; los morales siguen siendo del autor.',
    relacionados: ['ley-23', 'derechos-morales', 'derechos-patrimoniales']
  },
  {
    id: 'pirateria',
    termino: 'Piratería de software',
    sinonimos: ['piratería', 'copia ilegal', 'crack'],
    categoria: 'derecho',
    definicion: 'Copiar, instalar, distribuir o usar software sin la licencia correspondiente, incluido instalarlo en más equipos de los autorizados. Genera responsabilidad civil y penal.',
    relacionados: ['art-271', 'licencia-propietaria']
  },

  // ----- Desarrollo y distribución -----
  {
    id: 'obra-derivada',
    termino: 'Obra derivada',
    sinonimos: ['trabajo derivado', 'derivative work'],
    categoria: 'desarrollo',
    definicion: 'Obra nueva basada en otra existente: una modificación, traducción o adaptación del código. Las licencias copyleft extienden sus condiciones a las obras derivadas que se distribuyan.',
    relacionados: ['copyleft', 'distribucion', 'fork']
  },
  {
    id: 'distribucion',
    termino: 'Distribución',
    sinonimos: ['redistribuir', 'redistribución'],
    categoria: 'desarrollo',
    definicion: 'Entregar copias del software a terceros, ya sea vendiéndolo, publicándolo para descarga o incluyéndolo en un producto. Es el momento en que se activan las obligaciones de la GPL.',
    relacionados: ['copyleft', 'saas', 'obra-derivada']
  },
  {
    id: 'sublicenciar',
    termino: 'Sublicenciar',
    sinonimos: ['sublicencia'],
    categoria: 'desarrollo',
    definicion: 'Conceder a otros, a su vez, permisos sobre un software que recibiste con licencia. MIT lo permite expresamente; las licencias copyleft no, porque cada receptor recibe la licencia directamente del autor original.',
    relacionados: ['mit', 'licencia']
  },
  {
    id: 'spdx',
    termino: 'SPDX',
    sinonimos: ['identificador SPDX', 'Software Package Data Exchange'],
    categoria: 'desarrollo',
    definicion: 'Estándar con identificadores cortos y únicos para cada licencia, usados en archivos de paquetes y en herramientas de auditoría.',
    ejemplo: '"license": "MIT" en package.json o "Apache-2.0", "GPL-3.0-only".',
    relacionados: ['dependencia', 'licencia']
  },
  {
    id: 'dependencia',
    termino: 'Dependencia',
    sinonimos: ['librería', 'biblioteca', 'paquete'],
    categoria: 'desarrollo',
    definicion: 'Código de terceros que tu proyecto necesita para funcionar. Cada dependencia tiene su propia licencia, y la licencia de tu proyecto debe ser compatible con todas.',
    ejemplo: 'Este foro depende de Vue (MIT) y Express (MIT).',
    relacionados: ['spdx', 'compatibilidad', 'enlace']
  },
  {
    id: 'compatibilidad',
    termino: 'Compatibilidad de licencias',
    sinonimos: ['licencias compatibles', 'incompatibilidad'],
    categoria: 'desarrollo',
    definicion: 'Posibilidad de combinar código con licencias distintas en una misma obra cumpliendo todas sus condiciones a la vez. En general el código fluye de permisivas hacia copyleft, no al revés.',
    ejemplo: 'Código MIT puede incluirse en un proyecto GPL, pero código GPL no en uno propietario distribuido.',
    relacionados: ['dependencia', 'copyleft', 'licencia-permisiva']
  },
  {
    id: 'enlace',
    termino: 'Enlace estático y dinámico',
    sinonimos: ['enlazar', 'linking', 'enlace dinámico', 'enlace estático'],
    categoria: 'desarrollo',
    definicion: 'Formas de unir un programa con una librería: el estático copia la librería dentro del ejecutable; el dinámico la carga al ejecutarse y permite reemplazarla. Es clave para cumplir la LGPL.',
    relacionados: ['lgpl', 'dependencia']
  },
  {
    id: 'saas',
    termino: 'SaaS',
    sinonimos: ['software como servicio', 'software as a service', 'nube'],
    categoria: 'desarrollo',
    definicion: 'Modelo en el que el software se ejecuta en servidores del proveedor y el usuario lo usa por internet, sin recibir una copia. Con GPL no se considera distribución; con AGPL sí genera obligaciones.',
    ejemplo: 'Gmail, Google Docs o Canva.',
    relacionados: ['agpl', 'distribucion', 'suscripcion']
  },
  {
    id: 'licencia-patentes',
    termino: 'Licencia de patentes',
    sinonimos: ['patentes', 'cláusula de patentes'],
    categoria: 'desarrollo',
    definicion: 'Permiso para usar las patentes de los contribuidores que cubren el software. Apache 2.0, GPL v3 y MPL 2.0 la incluyen expresamente; MIT y BSD no la mencionan.',
    relacionados: ['apache', 'gpl']
  },
  {
    id: 'tivoizacion',
    termino: 'Tivoización',
    sinonimos: ['tivoization'],
    categoria: 'desarrollo',
    definicion: 'Práctica de usar software libre en un dispositivo pero impedir técnicamente que el usuario instale versiones modificadas. Su nombre viene de los grabadores TiVo; la GPL v3 la prohíbe.',
    relacionados: ['gpl']
  },
  {
    id: 'notice',
    termino: 'Archivo NOTICE',
    sinonimos: ['NOTICE', 'avisos de atribución'],
    categoria: 'desarrollo',
    definicion: 'Archivo con los avisos de atribución de un proyecto Apache 2.0. Quien redistribuya el software debe conservarlo.',
    relacionados: ['apache', 'atribucion']
  },
  {
    id: 'atribucion',
    termino: 'Atribución',
    sinonimos: ['aviso de copyright', 'reconocimiento'],
    categoria: 'desarrollo',
    definicion: 'Obligación de reconocer al autor original conservando su aviso de copyright y el texto de la licencia. Es la condición principal de las licencias permisivas.',
    ejemplo: 'Copyright (c) 2026 Nombre del autor',
    relacionados: ['mit', 'notice', 'derechos-morales']
  },
  {
    id: 'garantia',
    termino: 'Exención de garantía',
    sinonimos: ['garantía', 'responsabilidad', 'as is', 'tal cual'],
    categoria: 'desarrollo',
    definicion: 'Cláusula, presente en casi todas las licencias abiertas, que indica que el software se entrega «tal cual», sin garantías, y que el autor no responde por los daños que cause su uso.',
    relacionados: ['licencia', 'mit']
  },
  {
    id: 'fork',
    termino: 'Fork',
    sinonimos: ['bifurcación'],
    categoria: 'desarrollo',
    definicion: 'Copia de un proyecto que se desarrolla de forma independiente del original. Las licencias abiertas lo permiten; el fork debe respetar la licencia original.',
    ejemplo: 'LibreOffice nació como fork de OpenOffice.',
    relacionados: ['obra-derivada', 'codigo-abierto']
  },
  {
    id: 'ingenieria-inversa',
    termino: 'Ingeniería inversa',
    sinonimos: ['descompilar', 'reverse engineering'],
    categoria: 'desarrollo',
    definicion: 'Analizar un programa compilado para deducir cómo funciona o reconstruir su código. Las licencias propietarias suelen prohibirla; la LGPL exige permitirla para depurar las modificaciones.',
    relacionados: ['codigo-objeto', 'licencia-propietaria', 'lgpl']
  },
  {
    id: 'suscripcion',
    termino: 'Licencia por suscripción',
    sinonimos: ['suscripción', 'licencia perpetua'],
    categoria: 'desarrollo',
    definicion: 'Modelo de licencia propietaria en el que se paga periódicamente (mensual o anual) por usar el software. Se contrapone a la licencia perpetua, que se paga una vez.',
    ejemplo: 'Microsoft 365 y Adobe Creative Cloud.',
    relacionados: ['licencia-propietaria', 'saas']
  }
]
