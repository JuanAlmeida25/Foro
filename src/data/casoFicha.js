// Actividad "Caso MAREA": el aprendiz arma el SRS y la ficha técnica de un software a partir
// de pedazos de información regados en cuatro documentos (como pasa en la vida real).
// La versión completa para imprimir está en actividades/actividad-ficha-tecnica-software.md
// El solucionario vive en el servidor (server/casoFichaSolucionario.js) y solo se le entrega al profe.

export const LS_CASO_FICHA_KEY = 'foro-caso-ficha-marea-v1'

export const INFO_ACTIVIDAD = [
  { campo: 'Programa de formación', detalle: 'Tecnólogo en Análisis y Desarrollo de Software (ADSO)' },
  { campo: 'Competencia relacionada', detalle: 'Establecer requisitos de la solución de software de acuerdo con estándares y procedimiento técnico (el instructor ajusta el código según el diseño curricular vigente de la ficha).' },
  { campo: 'Resultados de aprendizaje', detalle: 'RA1. Identificar y documentar las características técnicas, funcionales y no funcionales de un producto de software. RA2. Aplicar la normatividad nacional e internacional de calidad, derechos de autor y protección de datos en la documentación del producto.' },
  { campo: 'Duración sugerida', detalle: '8 horas: 1 h de lectura y análisis del caso, 2 h de redacción del SRS, 3 h de elaboración de la ficha, 1 h de preguntas de análisis y 1 h de socialización.' },
  { campo: 'Modalidad', detalle: 'Grupos de 2 a 3 aprendices' },
  { campo: 'Producto a entregar', detalle: 'Dos PDF compartidos en el aporte del foro: (1) el SRS con código SRS-ADSO-2026-XX y (2) la ficha técnica con código FT-ADSO-2026-XX, la tabla de supuestos y vacíos y las respuestas a las preguntas de análisis.' }
];

export const PROPOSITO = [
  'En la vida real nadie le entrega al desarrollador una ficha técnica llena. La información llega a pedazos: una conversación con el cliente, un correo con afán, un audio de WhatsApp, unas notas de reunión escritas a la carrera. Su trabajo como analista es recoger esos pedazos, ordenarlos y detectar lo que falta o se contradice.',
  'La información necesaria está en el caso, pero dispersa. Algunos datos faltan o se contradicen a propósito: deben detectarlos y declararlos como supuestos.'
];

export const NOTA_FICCION = 'La cooperativa, las personas y dos de las librerías del caso (balanza-bt-link e "Iconos Marinos Pro") son ficticias y se crearon solo para este ejercicio. Las demás tecnologías y las normas citadas son reales.'

export const CONTEXTO = [
  'La Cooperativa de Pescadores Artesanales Brisas del Cabo (COOPEBRISAS) queda en el corregimiento del Cabo de la Vela, municipio de Uribia, La Guajira. Tiene 46 socios activos, casi todos pescadores de lancha, y una oficina pequeña al lado del centro de acopio donde se pesa, se registra y se vende el pescado a los compradores que llegan de Riohacha y Maicao.',
  'Hasta hoy todo se maneja en un cuaderno de tapa dura y una hoja de Excel que solo entiende la contadora. Cada fin de mes se forma el mismo problema: los socios reclaman que les pagaron menos kilos de los que entregaron, los compradores piden factura y nadie sabe cuánto pargo rojo se vendió en el trimestre.',
  'Un grupo de aprendices ADSO del SENA Regional Guajira, que está en su proyecto formativo, aceptó desarrollarles un sistema. Lo bautizaron MAREA (Manejo Administrativo de Registros, Entregas y Abonos).'
];

// Cada documento trae solo las partes que usa: diálogo, encabezado de correo, párrafos o lista
export const DOCUMENTOS = [
  {
    id: 'doc1',
    icono: '🎙️',
    titulo: 'Documento 1: Entrevista con el gerente',
    fecha: '12 de agosto de 2026',
    dialogo: [
      { quien: 'Aprendiz', texto: 'Don Efraín, cuéntenos qué necesita.' },
      { quien: 'Efraín Epieyú (gerente)', texto: 'Mire, mijo, lo primero es que cuando llega la lancha, la muchacha del acopio pese el pescado y quede registrado: quién lo trajo, qué especie, cuántos kilos y a qué precio. Ya. Que no haya más pelea. Tenemos una balanza nueva que tiene Bluetooth, la compramos en Barranquilla, a ver si sirve pa\' algo.' },
      { quien: 'Aprendiz', texto: '¿Y los pescadores también usarían el sistema?' },
      { quien: 'Efraín', texto: 'Sí, que cada socio vea en el celular lo que ha entregado y lo que se le debe. Pero ojo: aquí la señal es malita. En el acopio a veces hay 3G, a veces nada. Eso tiene que funcionar aunque se caiga la señal y después mandar todo cuando vuelva.' },
      { quien: 'Aprendiz', texto: '¿Qué celulares tienen los socios?' },
      { quien: 'Efraín', texto: 'De todo. La mayoría son Android baratos, de esos de 2 gigas de memoria. Hay uno que otro con iPhone, pero esos son los hijos, que ya estudian en Riohacha.' },
      { quien: 'Aprendiz', texto: '¿Y en la oficina?' },
      { quien: 'Efraín', texto: 'Un computador de escritorio con Windows 10, 4 gigas de RAM, y un portátil viejito de la contadora. La pantalla del escritorio es chiquita, no sé de cuánto será.' },
      { quien: 'Aprendiz', texto: '¿Qué más debe hacer el sistema?' },
      { quien: 'Efraín', texto: 'Que saque el reporte del mes pa\' pagarle a cada socio, en PDF, que se pueda imprimir. Y unas gráficas de qué especies se venden más, eso lo pide la Gobernación cuando uno va a pedir apoyo. Ah, y que diga en un mapa en qué zona pescó cada lancha, porque la Autoridad de Pesca a veces pregunta.' },
      { quien: 'Aprendiz', texto: '¿Cuántas personas usarían el sistema al mismo tiempo?' },
      { quien: 'Efraín', texto: 'Uff, en temporada de pargo entra todo el mundo a la vez. Somos 46 socios, pero con los ayudantes y los compradores puede que lleguen a 300 personas mirando.' },
      { quien: 'Aprendiz', texto: 'Y una cosa importante: ¿el programa sería de la cooperativa?' },
      { quien: 'Efraín', texto: '¡Claro! Eso es nuestro. Nadie más lo puede tener. Si otra cooperativa lo quiere, que nos lo compre a nosotros.' }
    ]
  },
  {
    id: 'doc2',
    icono: '📧',
    titulo: 'Documento 2: Correo de la contadora',
    fecha: '19 de agosto de 2026',
    encabezado: {
      de: 'Yoleida Pushaina — contabilidad@coopebrisas.example',
      para: 'Equipo MAREA',
      asunto: 'Lo que les faltó preguntar'
    },
    parrafos: [
      'Buenas tardes, muchachos:',
      'Don Efraín se emociona y se le olvidan cosas. Les cuento lo que yo necesito:'
    ],
    lista: [
      'Que cada socio tenga su ficha con cédula, teléfono, dirección, número de cuenta en Bancamía o Nequi, y los datos de los beneficiarios del fondo de solidaridad. Ahí van los hijos menores de edad, con su registro civil y el nombre del colegio.',
      'Que yo pueda registrar los abonos y los anticipos que se les dan a los socios, para descontarlos en la liquidación del mes.',
      'Que el sistema tenga usuarios distintos: el gerente ve todo, yo veo la plata, la del acopio solo registra pesajes y el socio solo ve lo suyo.',
      'El reporte del mes lo necesito máximo en 10 segundos, porque cuando lo saco hay fila de socios esperando.',
      'Los compradores piden comprobante de compra. No sé si eso tiene que ser factura electrónica de la DIAN; eso lo tengo que consultar con el revisor fiscal.',
      'Y por favor, que nadie pueda borrar un pesaje. Si se equivocan, que quede anulado pero que se vea.'
    ],
    cierre: [
      'Ah, y me comentó don Efraín que ustedes le iban a dar soporte por seis meses después de entregarlo. ¿Eso es así?',
      'Gracias, Yoleida'
    ]
  },
  {
    id: 'doc3',
    icono: '📝',
    titulo: 'Documento 3: Notas de la reunión técnica',
    fecha: '26 de agosto de 2026',
    parrafos: ['Notas tomadas por Dayana en el tablero y pasadas a limpio:'],
    lista: [
      'Stack acordado: Vue 3 + Vite como PWA (aplicación web instalable que funciona sin conexión), empaquetada para Android con Capacitor 6 (MIT). Almacenamiento sin conexión en el celular con Dexie.js (Apache 2.0) sobre IndexedDB. Backend en Node.js 20 LTS + Express (MIT), API REST. Base de datos PostgreSQL 16 (PostgreSQL License, permisiva). Autenticación con JWT y contraseñas cifradas con bcrypt (MIT).',
      'Librerías: Chart.js (MIT) para las gráficas, jsPDF (MIT) para los reportes en PDF y Leaflet (BSD-2-Clause) para el mapa de zonas de pesca.',
      'balanza-bt-link v2.3 (GPL v3): es la única librería que encontramos que lee la balanza Bluetooth de la cooperativa. Va dentro del APK de Android que se le instala a la muchacha del acopio y también a los socios (todos usan el mismo APK).',
      '"Iconos Marinos Pro": paquete de íconos de peces descargado de un sitio web, con licencia CC BY-NC 4.0 (Creative Commons Atribución–No Comercial). Están bonitos y ya los pusimos en toda la interfaz.',
      'Servidor: no está definido. Don Efraín dijo que "el sobrino sabe de eso". Tocará preguntar si es un VPS, un hosting compartido o un computador en la oficina.',
      'Seguridad: HTTPS obligatorio. Bloqueo de cuenta después de 5 intentos fallidos. Copia de seguridad de la base de datos todas las noches.',
      'Rendimiento: registrar un pesaje no puede demorar más de 3 segundos en el celular, aunque no haya señal (se guarda local y se sincroniza después).',
      'Usabilidad: letras grandes y botones grandes. Varios socios mayores no leen bien. Toda la interfaz en español; se habló de poner también wayuunaiki, pero quedó pendiente.',
      'Versión: la entrega del 30 de noviembre será la primera versión estable. Antes de eso hubo una versión de prueba para el acopio.',
      'Garantía: el instructor dice que el soporte después de la entrega lo debe definir el contrato. Jhon cree que se dijo un año, no seis meses.',
      'Pendiente: nadie ha firmado nada con la cooperativa. Solo hay un acta de inicio del proyecto formativo, firmada por el instructor y el gerente, que dice "desarrollo de un sistema de información para COOPEBRISAS". No menciona derechos de autor.'
    ]
  },
  {
    id: 'doc4',
    icono: '🔊',
    titulo: 'Documento 4: Audio de WhatsApp de don Efraín',
    fecha: '2 de septiembre de 2026 (transcrito)',
    parrafos: [
      '"Muchachos, buenas. Una cosita: la Gobernación nos dijo que si el sistema sirve, de pronto lo quieren pasar a las otras cooperativas de pescadores de la Alta Guajira, que son como once. Pero eso sí, que el nombre de COOPEBRISAS quede ahí, y si es posible que nos paguen algo. Ah, y la Autoridad de Pesca quiere que el reporte de zonas le llegue directo, ¿eso se puede conectar? Bueno, ustedes verán. Gracias, que Dios me los bendiga."'
    ]
  }
];

export const EQUIPO = [
  { campo: 'Aprendices', detalle: 'Dayana Ipuana Gómez, Jhon Fredy Bermúdez Uriana y Luis Ángel Fince Ortiz' },
  { campo: 'Ficha ADSO', detalle: '2901457 (ficticia)' },
  { campo: 'Instructora líder', detalle: 'Ing. Martha Cotes' },
  { campo: 'Centro de formación', detalle: 'Centro AgroEmpresarial y Acuicola, SENA Regional Guajira' }
];

export const INSTRUCCIONES = [
  { titulo: 'Lectura individual', tiempo: '20 min', texto: 'Cada integrante lee el caso completo y subraya con colores distintos: datos técnicos (hardware y software), funcionales (lo que hace el sistema), de calidad (tiempos, seguridad, usabilidad), legales (licencias, autoría, datos personales) y de soporte.' },
  { titulo: 'Cacería de vacíos y contradicciones', tiempo: '40 min', texto: 'En grupo, listen lo que falta, lo que se contradice o lo que está ambiguo. Para cada uno escriban el supuesto que van a asumir y la pregunta que le harían al cliente. Pista: hay al menos 6. Revisen usuarios concurrentes, servidor, garantía, resolución de pantalla, iOS, versión, factura electrónica, idioma y titularidad del código. No se salten este paso: es el que diferencia a un analista de un digitador.' },
  { titulo: 'Redacción del SRS', tiempo: '2 h', texto: 'Antes de la ficha va el SRS: primero se dice qué debe hacer el sistema y después se describe el producto. Llenen la pestaña "Plantilla SRS" con la estructura de la IEEE 830 / ISO/IEC/IEEE 29148 (revisen la pestaña 📄 SRS del menú). Cada requisito lleva código (RF-01, RNF-01), es singular, verificable y tiene su criterio de aceptación. En la matriz de trazabilidad digan de qué documento del caso salió cada requisito; si salió de un supuesto, márquenlo con [S#].' },
  { titulo: 'Clasificación por apartados', tiempo: '30 min', texto: 'Ubiquen cada dato subrayado en uno de los 8 apartados de la ficha. Si un dato sirve para dos apartados, úsenlo en ambos.' },
  { titulo: 'Auditoría de licencias', tiempo: '30 min', texto: 'Para cada librería y herramienta del stack anoten: nombre, versión, licencia, tipo (permisiva, copyleft o restrictiva), dónde se usa y si es compatible con el modelo de licencia que quiere el cliente. Marquen las que generen conflicto y propongan una solución.' },
  { titulo: 'Diligenciamiento de la ficha técnica', tiempo: '2 h', texto: 'Llenen la pestaña "Plantilla ficha". Los módulos y los requisitos no funcionales de la ficha salen del SRS: no los inventen de nuevo, resúmanlos. Usen su propio código FT-ADSO-2026- seguido del número de grupo y versionamiento semántico (MAYOR.MENOR.PARCHE) justificado. Todo requisito no funcional debe ser medible y llevar su característica ISO/IEC 25010. Donde usen un supuesto, márquenlo con [S#].' },
  { titulo: 'Preguntas de análisis', tiempo: '40 min', texto: 'Respondan las preguntas con argumentos y citando la norma correspondiente, en máximo 10 líneas cada una.' },
  { titulo: 'Entrega y socialización', tiempo: '1 h', texto: 'Descarguen los dos PDF (SRS y ficha) y compártanlos en su aporte del foro. En la socialización cada grupo presenta en 5 minutos su solución al dilema de licencias y su supuesto más arriesgado.' }
];

// Plantilla de la ficha: los 8 apartados de FichaTecnicaInfo.vue más el encabezado y la tabla de supuestos.
// Las tablas del .md se volvieron campos de texto para que se puedan llenar en el navegador.
export const APARTADOS_PLANTILLA = [
  {
    id: 'encabezado',
    titulo: 'Encabezado del documento',
    campos: [
      { id: 'enc-codigo', label: 'Código', ayuda: 'FT-ADSO-2026-__ (número de su grupo)' },
      { id: 'enc-version-doc', label: 'Versión del documento' },
      { id: 'enc-estado', label: 'Estado', ayuda: 'Borrador, En revisión o Liberado' },
      { id: 'enc-fecha', label: 'Fecha de emisión' }
    ]
  },
  {
    id: 'a1',
    titulo: '1. Identificación y Control del Producto',
    campos: [
      { id: 'a1-nombre', label: 'Nombre del software' },
      { id: 'a1-acronimo', label: 'Acrónimo y significado' },
      { id: 'a1-version', label: 'Versión del software y justificación', largo: true },
      { id: 'a1-tipo', label: 'Tipo de aplicativo' },
      { id: 'a1-autores', label: 'Autores, número de ficha ADSO, instructor y centro', largo: true },
      { id: 'a1-fechas', label: 'Fecha de emisión y de última modificación' },
      { id: 'a1-cliente', label: 'Organización cliente y persona de contacto' }
    ]
  },
  {
    id: 'a2',
    titulo: '2. Descripción General y Alcance',
    campos: [
      { id: 'a2-resumen', label: 'Resumen descriptivo del sistema (máx. 5 líneas)', largo: true },
      { id: 'a2-problema', label: 'Problema que resuelve', largo: true },
      { id: 'a2-objetivo', label: 'Objetivo general', largo: true },
      { id: 'a2-especificos', label: 'Objetivos específicos (mínimo 4)', largo: true },
      { id: 'a2-usuarios', label: 'Usuarios y roles (perfil de cada uno)', largo: true },
      { id: 'a2-alcance', label: 'Alcance: qué SÍ incluye esta versión', largo: true },
      { id: 'a2-exclusiones', label: 'Límites y exclusiones: qué NO incluye', largo: true }
    ]
  },
  {
    id: 'a3',
    titulo: '3. Requerimientos de Hardware',
    campos: [
      { id: 'a3-movil', label: 'Celular (acopio y socios): mínimo y recomendado', ayuda: 'Arquitectura, RAM, almacenamiento, pantalla, Bluetooth, GPS', largo: true },
      { id: 'a3-oficina', label: 'Equipo de oficina: mínimo y recomendado', ayuda: 'Arquitectura, RAM, almacenamiento, resolución', largo: true },
      { id: 'a3-servidor', label: 'Servidor: mínimo y recomendado', ayuda: 'CPU, RAM, disco', largo: true },
      { id: 'a3-red', label: 'Red: velocidad y tipo de conexión', largo: true }
    ]
  },
  {
    id: 'a4',
    titulo: '4. Requerimientos de Software y Plataforma',
    campos: [
      { id: 'a4-so', label: 'Sistemas operativos soportados (con versión mínima)', largo: true },
      { id: 'a4-navegadores', label: 'Navegadores compatibles (con versión mínima)' },
      { id: 'a4-backend', label: 'Entorno de ejecución del backend y motor de base de datos' },
      { id: 'a4-frameworks', label: 'Frameworks y herramientas de construcción' },
      { id: 'a4-librerias', label: 'Librerías de terceros (nombre, versión, licencia)', largo: true },
      { id: 'a4-no-soportado', label: 'Plataformas NO soportadas en esta versión' }
    ]
  },
  {
    id: 'a5',
    titulo: '5. Módulos y Características Funcionales',
    campos: [
      { id: 'a5-modulos', label: 'Módulos del sistema', ayuda: 'Uno por línea: módulo – funcionalidades principales – roles que lo usan', largo: true }
    ]
  },
  {
    id: 'a6',
    titulo: '6. Criterios de Calidad y Requisitos No Funcionales (ISO/IEC 25010)',
    campos: [
      { id: 'a6-rnf', label: 'Requisitos no funcionales (mínimo 6)', ayuda: 'Uno por línea: RNF-01 – requisito medible – característica ISO/IEC 25010 – cómo se verifica', largo: true },
      { id: 'a6-datos', label: 'Datos personales que recoge el sistema (Ley 1581 de 2012)', largo: true },
      { id: 'a6-menores', label: 'Datos sensibles o de menores de edad', largo: true },
      { id: 'a6-responsable', label: 'Responsable y encargado del tratamiento' },
      { id: 'a6-autorizacion', label: 'Mecanismo de autorización y medidas de seguridad', largo: true }
    ]
  },
  {
    id: 'a7',
    titulo: '7. Modelo de Licenciamiento y Propiedad Intelectual',
    campos: [
      { id: 'a7-licencia', label: 'Tipo de licencia del producto' },
      { id: 'a7-morales', label: 'Titular de los derechos morales (y fundamento legal)', largo: true },
      { id: 'a7-patrimoniales', label: 'Titular de los derechos patrimoniales (y fundamento legal)', largo: true },
      { id: 'a7-redistribucion', label: 'Redistribución con fines comerciales: ¿permitida o prohibida?' },
      { id: 'a7-registro', label: 'Registro ante la DNDA (Decreto 1066 de 2015, antes Decreto 1360 de 1989)' },
      { id: 'a7-auditoria', label: 'Auditoría de licencias de terceros', ayuda: 'Uno por línea: librería – licencia – tipo – ¿compatible? – acción', largo: true }
    ]
  },
  {
    id: 'a8',
    titulo: '8. Soporte, Mantenimiento y Garantía',
    campos: [
      { id: 'a8-canales', label: 'Canales de soporte y reporte de incidentes' },
      { id: 'a8-garantia', label: 'Periodo de garantía, qué cubre y qué no', largo: true },
      { id: 'a8-tiempos', label: 'Tiempos de respuesta según severidad', largo: true },
      { id: 'a8-versiones', label: 'Política de parches y versiones (SemVer)', largo: true },
      { id: 'a8-manuales', label: 'Manuales disponibles' }
    ]
  },
  {
    id: 'supuestos',
    titulo: 'Tabla de supuestos y vacíos de información',
    campos: [
      { id: 'sup-tabla', label: 'Supuestos [S1], [S2]…', ayuda: 'Uno por línea: S# – vacío o contradicción – documento donde aparece – supuesto asumido – pregunta para el cliente', largo: true }
    ]
  }
];

// Plantilla del SRS, con la estructura de la pestaña 📄 SRS (IEEE 830 / ISO/IEC/IEEE 29148).
// Los ids empiezan por "srs-" para que no se pisen con los de la ficha en el localStorage
export const APARTADOS_SRS = [
  {
    id: 'srs-encabezado',
    titulo: 'Encabezado del documento',
    campos: [
      { id: 'srs-codigo', label: 'Código', ayuda: 'SRS-ADSO-2026-__ (número de su grupo)' },
      { id: 'srs-version', label: 'Versión del documento' },
      { id: 'srs-estado', label: 'Estado', ayuda: 'Borrador, En revisión o Aprobado' },
      { id: 'srs-fecha', label: 'Fecha' }
    ]
  },
  {
    id: 's1',
    titulo: '1. Introducción',
    campos: [
      { id: 'srs-proposito', label: 'Propósito del documento y a quién va dirigido', largo: true },
      { id: 'srs-alcance', label: 'Alcance: qué hace MAREA, qué NO hace y qué beneficio trae', largo: true },
      { id: 'srs-definiciones', label: 'Definiciones, siglas y abreviaturas', ayuda: 'Una por línea: término – significado (PWA, APK, acopio, liquidación…)', largo: true },
      { id: 'srs-referencias', label: 'Referencias', ayuda: 'Documentos del caso, actas y normas que citan', largo: true }
    ]
  },
  {
    id: 's2',
    titulo: '2. Descripción general',
    campos: [
      { id: 'srs-perspectiva', label: 'Perspectiva del producto (componentes y con qué se conecta)', largo: true },
      { id: 'srs-funciones', label: 'Funciones principales, en resumen', largo: true },
      { id: 'srs-usuarios', label: 'Características de los usuarios (rol, experiencia, limitaciones)', largo: true },
      { id: 'srs-restricciones', label: 'Restricciones (legales, de hardware, de red, tecnológicas)', largo: true },
      { id: 'srs-suposiciones', label: 'Suposiciones y dependencias', ayuda: 'Usen los mismos [S#] de la tabla de supuestos', largo: true }
    ]
  },
  {
    id: 's3',
    titulo: '3. Requisitos específicos',
    campos: [
      { id: 'srs-interfaces', label: 'Interfaces externas', ayuda: 'De usuario, de hardware (balanza Bluetooth, GPS), de software y de comunicaciones', largo: true },
      { id: 'srs-rf', label: 'Requisitos funcionales (mínimo 10)', ayuda: 'Uno por línea: RF-01 – el sistema debe… – rol – prioridad (Alta, Media o Baja) – criterio de aceptación', largo: true },
      { id: 'srs-rnf', label: 'Requisitos no funcionales (mínimo 6)', ayuda: 'Uno por línea: RNF-01 – requisito medible – característica ISO/IEC 25010 – cómo se verifica', largo: true },
      { id: 'srs-legales', label: 'Requisitos legales y de cumplimiento', ayuda: 'Ley 1581 de 2012, licencias de terceros, derechos de autor', largo: true }
    ]
  },
  {
    id: 's4',
    titulo: '4. Matriz de trazabilidad',
    campos: [
      { id: 'srs-trazabilidad', label: 'Trazabilidad', ayuda: 'Uno por línea: código del requisito – de dónde salió (Doc 1 a 4 o S#) – prueba con la que se verifica', largo: true }
    ]
  }
]

export const PREGUNTAS_CASO = [
  { id: 'pc1', titulo: 'Dilema GPL', pregunta: 'La librería balanza-bt-link tiene licencia GPL v3 y va dentro del APK que se instala en los celulares de los socios. Don Efraín quiere que el software sea "solo de la cooperativa" (propietario). ¿Es posible cumplir ambas cosas? Propongan al menos tres alternativas y digan cuál recomiendan y por qué.' },
  { id: 'pc2', titulo: '¿De quién es el código?', pregunta: 'Según la Ley 23 de 1982 y la Decisión Andina 351 de 1993, ¿quién es el titular de los derechos morales y quién de los derechos patrimoniales de MAREA? No hay contrato firmado y el acta de inicio no menciona derechos de autor. ¿Qué documento recomiendan firmar antes de la entrega y qué debería decir?' },
  { id: 'pc3', titulo: 'Íconos "No Comercial"', pregunta: 'La cooperativa vende pescado y la Gobernación podría pagar por llevar el sistema a otras once cooperativas. ¿Pueden seguir usando "Iconos Marinos Pro" (CC BY-NC 4.0)? Justifiquen y propongan una solución.' },
  { id: 'pc4', titulo: 'Datos de menores', pregunta: 'El correo de la contadora pide guardar datos de los hijos menores de edad de los socios (registro civil y colegio). ¿Qué exige la Ley 1581 de 2012 para tratar esos datos? ¿Son todos estrictamente necesarios para el objetivo del sistema? ¿Qué recomendarían?' },
  { id: 'pc5', titulo: 'Calidad medible', pregunta: 'Escojan tres características de ISO/IEC 25010 críticas para MAREA, considerando la señal 3G intermitente, los celulares de 2 GB de RAM y los socios mayores. Para cada una, escriban un requisito medible y digan cómo lo probarían.' },
  { id: 'pc6', titulo: 'Supuestos', pregunta: 'De todos los vacíos que encontraron, ¿cuál es el más riesgoso para el proyecto si el supuesto resulta equivocado? Expliquen el impacto en costo, tiempo o en el aspecto legal.' }
];

export const NOTA_APROBACION = 70

export const RUBRICA_CASO = [
  { criterio: 'Identificación y alcance (apartados 1 y 2)', puntos: 10,
    excelente: 'Todos los campos completos, SemVer justificado, objetivos medibles y exclusiones explícitas.',
    bueno: 'Campos completos, con objetivos poco precisos o sin exclusiones claras.',
    basico: 'Faltan 2 o 3 campos o el alcance es confuso.',
    insuficiente: 'Apartados incompletos o copiados del ejemplo.' },
  { criterio: 'Documento SRS (IEEE 830 / ISO/IEC/IEEE 29148)', puntos: 20,
    excelente: 'Estructura completa; 10 o más RF con código, prioridad y criterio de aceptación; RNF medibles con su característica ISO/IEC 25010; requisitos legales; matriz de trazabilidad hacia los documentos del caso y los supuestos.',
    bueno: 'Estructura completa, pero algunos requisitos sin criterio de aceptación o sin trazabilidad.',
    basico: 'Faltan secciones o hay requisitos ambiguos («rápido», «fácil», «gestionar») o con dos cosas en uno.',
    insuficiente: 'Sin SRS, o es una copia de la ficha técnica con otro título.' },
  { criterio: 'Requerimientos técnicos (apartados 3 y 4)', puntos: 10,
    excelente: 'Distingue mínimo y recomendado para móvil, oficina y servidor; versiones mínimas y plataformas no soportadas.',
    bueno: 'Completo, pero sin distinguir mínimo y recomendado en algún componente.',
    basico: 'Solo cubre un tipo de dispositivo o le faltan versiones.',
    insuficiente: 'Datos inventados o contradictorios con el caso.' },
  { criterio: 'Módulos funcionales (apartado 5)', puntos: 5,
    excelente: '7 o más módulos coherentes con roles y con los RF del SRS, incluyendo sincronización sin conexión y anulación sin borrado.',
    bueno: 'De 5 a 6 módulos coherentes.',
    basico: 'Menos de 5 módulos o sin relación con roles.',
    insuficiente: 'Lista genérica que no corresponde al caso.' },
  { criterio: 'Calidad y datos personales (apartado 6)', puntos: 10,
    excelente: '6 o más RNF medibles, bien clasificados en ISO/IEC 25010 y con forma de verificarlos; tratamiento de datos completo, con datos de menores.',
    bueno: 'RNF medibles con alguna clasificación errada; datos personales parciales.',
    basico: 'RNF no medibles o sin clasificar.',
    insuficiente: 'Sin RNF o sin análisis de datos personales.' },
  { criterio: 'Licenciamiento y propiedad intelectual (apartado 7)', puntos: 15,
    excelente: 'Auditoría completa, detecta los conflictos GPL y CC BY-NC, propone una solución viable y analiza la titularidad con fundamento legal.',
    bueno: 'Detecta un solo conflicto o la titularidad está poco fundamentada.',
    basico: 'Lista licencias sin analizar compatibilidad.',
    insuficiente: 'Sin auditoría o con conclusiones legales erradas.' },
  { criterio: 'Soporte y garantía (apartado 8)', puntos: 5,
    excelente: 'Resuelve la contradicción de 6 meses frente a 1 año con un supuesto declarado; define cobertura, tiempos por severidad y política de versiones.',
    bueno: 'Completo pero sin tiempos por severidad.',
    basico: 'Solo menciona el periodo.',
    insuficiente: 'Vacío.' },
  { criterio: 'Tabla de supuestos', puntos: 15,
    excelente: '6 o más vacíos o contradicciones bien identificados, con supuesto y pregunta al cliente; supuestos marcados [S#] en la ficha.',
    bueno: 'De 4 a 5 vacíos bien tratados.',
    basico: 'De 2 a 3 vacíos.',
    insuficiente: 'Ninguno o inventados.' },
  { criterio: 'Preguntas de análisis y presentación', puntos: 10,
    excelente: 'Respuestas argumentadas con normas citadas correctamente; documento ordenado y sin errores de ortografía.',
    bueno: 'Argumentadas, con alguna norma mal citada.',
    basico: 'Respuestas superficiales.',
    insuficiente: 'Sin responder o copiadas.' }
];
