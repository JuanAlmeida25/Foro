// Contenido de la pestaña "📄 SRS" (Especificación de Requisitos de Software).
// Va aparte del componente para poder probarlo con node --test.
// Ojo: antes de dictar la clase, verifiquen que las normas y leyes sigan vigentes; las normas ISO se revisan cada pocos años.

export const SECCIONES_SRS = [
  { id: 'concepto', icono: '💡', titulo: '¿Qué es un SRS?' },
  { id: 'estructura', icono: '📑', titulo: 'Estructura' },
  { id: 'requisitos', icono: '✅', titulo: 'Buenos requisitos' },
  { id: 'normas', icono: '🌐', titulo: 'Normas internacionales' },
  { id: 'leyes', icono: '🇨🇴', titulo: 'Leyes colombianas' }
]

export const PARA_QUE_SIRVE = [
  {
    icono: '🤝',
    titulo: 'Acuerdo con el cliente',
    texto: 'Deja por escrito qué va a hacer el sistema y qué no. Lo que no está en el SRS no se prometió, y eso evita el clásico «yo pensé que también hacía…».'
  },
  {
    icono: '🧭',
    titulo: 'Guía para el equipo',
    texto: 'Analistas, diseñadores, programadores y testers trabajan sobre el mismo documento, así nadie se inventa su propia versión del proyecto.'
  },
  {
    icono: '🧪',
    titulo: 'Base de las pruebas',
    texto: 'Cada requisito tiene que poder comprobarse. Con el SRS se arman los casos de prueba y se decide si el software se acepta o no.'
  },
  {
    icono: '💰',
    titulo: 'Estimación y control de cambios',
    texto: 'Sirve para calcular tiempo y costo, y para saber cuándo un pedido nuevo es un cambio de alcance que hay que negociar aparte.'
  }
]

// SRS frente a la ficha técnica, que los aprendices ya conocen de la otra pestaña
export const SRS_VS_FICHA = [
  { aspecto: '¿Cuándo se hace?', srs: 'Al principio, antes de diseñar y programar.', ficha: 'Al final, cuando el producto ya existe o está por entregarse.' },
  { aspecto: '¿Qué responde?', srs: '¿Qué debe hacer el sistema y con qué calidad?', ficha: '¿Qué es este producto, qué necesita para funcionar y bajo qué licencia?' },
  { aspecto: '¿Para quién?', srs: 'Cliente y equipo de desarrollo.', ficha: 'Cliente, usuario final, comprador o entidad que registra el software.' },
  { aspecto: 'Nivel de detalle', srs: 'Alto: cada requisito numerado, medible y verificable.', ficha: 'Resumido: una o pocas páginas.' }
]

// Basada en la plantilla de IEEE 830, que la ISO/IEC/IEEE 29148 retoma con algunos ajustes
export const ESTRUCTURA_SRS = [
  {
    numero: '1',
    titulo: 'Introducción',
    descripcion: 'Pone en contexto a quien lee: de qué sistema se habla y cómo está organizado el documento.',
    partes: [
      'Propósito del documento y a quién va dirigido',
      'Alcance del sistema: qué hace, qué NO hace y qué beneficio trae',
      'Definiciones, siglas y abreviaturas',
      'Referencias (normas, actas, entrevistas, otros documentos)',
      'Visión general del resto del documento'
    ]
  },
  {
    numero: '2',
    titulo: 'Descripción general',
    descripcion: 'La foto completa del producto antes de bajar al detalle.',
    partes: [
      'Perspectiva del producto: si es independiente o parte de un sistema mayor',
      'Funciones principales, en resumen',
      'Características de los usuarios (roles, nivel de experiencia)',
      'Restricciones: leyes, hardware, lenguajes, presupuesto, plazos',
      'Suposiciones y dependencias (lo que se da por hecho y puede cambiar)'
    ]
  },
  {
    numero: '3',
    titulo: 'Requisitos específicos',
    descripcion: 'El corazón del SRS: cada requisito con su código, su prioridad y la forma de verificarlo.',
    partes: [
      'Interfaces externas: de usuario, de hardware, de software y de comunicaciones',
      'Requisitos funcionales (RF): lo que el sistema hace',
      'Requisitos no funcionales (RNF): rendimiento, seguridad, usabilidad, disponibilidad…',
      'Restricciones de diseño y estándares que hay que cumplir',
      'Requisitos de datos y de cumplimiento legal'
    ]
  },
  {
    numero: '4',
    titulo: 'Anexos',
    descripcion: 'Lo que apoya pero no es requisito.',
    partes: [
      'Modelos y diagramas (casos de uso, modelo de datos, prototipos)',
      'Matriz de trazabilidad: de dónde salió cada requisito y con qué prueba se verifica',
      'Historial de versiones y aprobaciones'
    ]
  }
]

// Las 9 características de un requisito individual según la ISO/IEC/IEEE 29148:2018
// (verificado con notario el 27-oct-2026; la lista sale de fuentes técnicas, el texto de la norma es de pago)
export const CARACTERISTICAS_REQUISITO = [
  { nombre: 'Necesario', detalle: 'Si se quita, el sistema queda cojo. Si nadie lo extraña, sobra.' },
  { nombre: 'Apropiado', detalle: 'Tiene el nivel de detalle justo: dice qué se necesita, sin meterse a diseñar el cómo.' },
  { nombre: 'Inequívoco', detalle: 'Se entiende de una sola manera. Nada de «rápido», «amigable» o «fácil».' },
  { nombre: 'Completo', detalle: 'No deja huecos que el programador tenga que adivinar.' },
  { nombre: 'Singular', detalle: 'Pide una sola cosa. Si tiene un «y» en el medio, a lo mejor son dos requisitos.' },
  { nombre: 'Factible', detalle: 'Se puede hacer con la tecnología, el tiempo y la plata disponibles.' },
  { nombre: 'Verificable', detalle: 'Existe una prueba que diga sí o no. Si no se puede medir, no se puede aceptar.' },
  { nombre: 'Correcto', detalle: 'Refleja lo que de verdad necesita el cliente, no lo que el equipo cree.' },
  { nombre: 'Conforme', detalle: 'Sigue la plantilla y las reglas de redacción que el equipo o el cliente aprobaron.' }
]

export const EJEMPLOS_REQUISITO = [
  {
    malo: 'El sistema debe ser rápido.',
    bueno: 'RNF-03: La consulta de inventario debe mostrar resultados en máximo 2 segundos con 300 usuarios conectados al mismo tiempo.',
    porque: '«Rápido» no se puede probar; 2 segundos con 300 usuarios sí.'
  },
  {
    malo: 'El sistema debe ser seguro y fácil de usar.',
    bueno: 'RNF-07: Las contraseñas se guardan cifradas con un algoritmo de hash con sal (por ejemplo, bcrypt o scrypt).\nRNF-08: Un usuario nuevo debe poder registrar una venta sin ayuda en menos de 5 minutos.',
    porque: 'Eran dos requisitos en uno, y ninguno era medible.'
  },
  {
    malo: 'El administrador podrá gestionar los usuarios.',
    bueno: 'RF-12: El administrador podrá crear, editar, desactivar y reiniciar la contraseña de los usuarios.',
    porque: '«Gestionar» no dice qué acciones exactas hay que programar ni probar.'
  }
]

export const NORMAS_INTERNACIONALES = [
  {
    codigo: 'ISO/IEC/IEEE 29148:2018',
    organismo: 'ISO / IEC / IEEE',
    nombre: 'Ingeniería de requisitos',
    descripcion: 'Es la norma vigente para especificar requisitos (ISO la confirmó en 2024, aunque ya hay un borrador de la próxima edición). Define los procesos de ingeniería de requisitos, las características de un buen requisito y el contenido de los documentos de requisitos, entre ellos el SRS.',
    enElSrs: 'Es la referencia principal para la estructura del documento y la redacción de cada requisito.'
  },
  {
    codigo: 'IEEE 830-1998',
    organismo: 'IEEE',
    nombre: 'Práctica recomendada para la especificación de requisitos de software',
    descripcion: 'Es la plantilla clásica del SRS (Introducción, Descripción general, Requisitos específicos). Fue reemplazada por la ISO/IEC/IEEE 29148 en 2011, pero se sigue usando mucho en la formación.',
    enElSrs: 'Su plantilla es la base de la estructura que se enseña en esta pestaña. Al citarla, aclaren que es una norma histórica.'
  },
  {
    codigo: 'ISO/IEC 25010:2023',
    organismo: 'ISO / IEC (familia SQuaRE)',
    nombre: 'Modelo de calidad del producto de software',
    descripcion: 'Define las características de calidad del software. La edición de 2023 reemplazó a la de 2011: ahora son 9 características, se agregó la seguridad física u operacional (safety, que no hace daño a personas ni al ambiente; distinta de la seguridad de la información), la usabilidad pasó a llamarse capacidad de interacción y la portabilidad, flexibilidad.',
    enElSrs: 'Sirve como lista de chequeo para que no se olviden los requisitos no funcionales.'
  },
  {
    codigo: 'ISO/IEC 25030:2019',
    organismo: 'ISO / IEC (familia SQuaRE)',
    nombre: 'Requisitos de calidad',
    descripcion: 'Explica cómo convertir las características de calidad de la ISO/IEC 25010 en requisitos medibles.',
    enElSrs: 'Ayuda a pasar de «que sea confiable» a «disponibilidad del 99 % en horario laboral».'
  },
  {
    codigo: 'ISO/IEC/IEEE 12207:2026',
    organismo: 'ISO / IEC / IEEE',
    nombre: 'Procesos del ciclo de vida del software',
    descripcion: 'Describe los procesos desde que nace la idea hasta que el software se retira, incluida la definición de requisitos. La edición de abril de 2026 reemplazó a la de 2017.',
    enElSrs: 'Ubica al SRS dentro del ciclo de vida: es la salida del proceso de definición de requisitos y la entrada del diseño.'
  },
  {
    codigo: 'WCAG 2.2 y 2.1 (W3C)',
    organismo: 'World Wide Web Consortium',
    nombre: 'Pautas de accesibilidad para el contenido web',
    descripcion: 'Criterios para que un sitio o aplicación web lo pueda usar cualquier persona, incluidas las personas con discapacidad. Tiene niveles A, AA y AAA. La versión más reciente es la 2.2 (recomendación del W3C desde 2023); en Colombia, la Resolución 1519 de 2020 todavía cita la 2.1.',
    enElSrs: 'Se cita en los requisitos no funcionales de accesibilidad, por ejemplo: «cumplir WCAG 2.2 nivel AA» (o 2.1 AA si el cliente es una entidad pública colombiana).'
  }
]

export const LEYES_COLOMBIANAS = [
  {
    codigo: 'Ley 1581 de 2012',
    tipo: 'Ley estatutaria',
    nombre: 'Protección de datos personales (habeas data)',
    descripcion: 'Regula cómo se recogen, guardan, usan y circulan los datos personales. Pide autorización previa e informada del titular, una finalidad clara y medidas de seguridad. La reglamenta el Decreto 1377 de 2013, hoy compilado en el Decreto 1074 de 2015.',
    requisitos: [
      'RF de autorización: casilla de aceptación de la política de tratamiento de datos antes del registro',
      'RF para que el titular consulte, actualice o pida borrar sus datos',
      'RNF de seguridad: cifrado, control de acceso y registro de quién consultó qué'
    ]
  },
  {
    codigo: 'Ley 1273 de 2009',
    tipo: 'Ley',
    nombre: 'Delitos informáticos',
    descripcion: 'Agrega al Código Penal la protección de la información y de los datos: castiga el acceso abusivo a sistemas, la interceptación de datos, el daño informático y el uso de software malicioso, entre otros.',
    requisitos: [
      'RNF de autenticación y manejo de sesiones',
      'RNF de auditoría: guardar evidencia (logs) de los accesos y cambios importantes'
    ]
  },
  {
    codigo: 'Ley 527 de 1999',
    tipo: 'Ley',
    nombre: 'Mensajes de datos, comercio electrónico y firmas digitales',
    descripcion: 'Les da validez jurídica a los mensajes de datos y a las firmas electrónicas y digitales. Lo que se acepta o firma en el sistema puede servir como prueba.',
    requisitos: [
      'RF para guardar la constancia de aceptación de términos (quién, cuándo y qué versión)',
      'RNF de integridad: los documentos firmados no se pueden alterar sin que se note'
    ]
  },
  {
    codigo: 'Ley 23 de 1982 y Decisión Andina 351 de 1993',
    tipo: 'Ley y norma de la Comunidad Andina',
    nombre: 'Derecho de autor',
    descripcion: 'Protegen las obras, y el software se protege como obra literaria. La Ley 23 fue modificada, entre otras, por la Ley 1915 de 2018.',
    requisitos: [
      'Dejar claro en el SRS (o en el contrato que lo acompaña) quién es el titular del software y del propio documento',
      'Requisito de licenciamiento: con qué licencia se entrega y qué componentes de terceros usa'
    ]
  },
  {
    codigo: 'Decreto 1360 de 1989 (hoy Decreto 1066 de 2015)',
    tipo: 'Decreto reglamentario',
    nombre: 'Software como obra protegida y su registro',
    descripcion: 'Define el soporte lógico (software) como el programa de computador, la descripción de programa y el material auxiliar, y permite inscribirlo en el Registro Nacional de Derecho de Autor. Fue compilado y derogado por el Decreto 1066 de 2015 (arts. 2.6.1.3.1 y siguientes), que es el que se cita hoy. Ojo: el registro es voluntario y declarativo; los derechos existen aunque no se registre.',
    requisitos: [
      'El SRS puede servir de insumo para la «descripción del programa» o el material auxiliar, dos de los elementos que acepta la DNDA para el registro'
    ]
  },
  {
    codigo: 'Ley 1618 de 2013 y Resolución 1519 de 2020 (MinTIC)',
    tipo: 'Ley estatutaria y resolución',
    nombre: 'Derechos de las personas con discapacidad y accesibilidad web',
    descripcion: 'La Ley 1618 garantiza el acceso de las personas con discapacidad a la información y las comunicaciones. La Resolución 1519 de 2020 de MinTIC obliga a las entidades públicas a cumplir el nivel AA de WCAG 2.1 desde el 1 de enero de 2022.',
    requisitos: [
      'Si el cliente es una entidad pública: RNF de accesibilidad «cumplir WCAG 2.1 nivel AA» según la Resolución 1519 de 2020',
      'Para cualquier cliente es buena práctica: contraste, textos alternativos y navegación con teclado'
    ]
  }
]

export const ADVERTENCIA_VIGENCIA =
  'Las normas técnicas se actualizan y las leyes se modifican o reglamentan. Antes de citar una en un SRS real, revisen la versión vigente en la fuente oficial (ISO, IEEE, Secretaría del Senado o la entidad que la expidió).'
