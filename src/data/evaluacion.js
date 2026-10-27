// Banco de preguntas y categorías para la Evaluación de Conocimientos del Proyecto SENA ADSO
// Abarca: Licenciamiento de software, Marco Jurídico Colombiano (Ley 23/1982, Ley 1450/2011,
// Art. 271 Código Penal, Ley 1273/2009, Ley 1581/2012), Ficha Técnica de Software y Casos de Estudio.

export const LS_EVALUACION_KEY = 'foro-evaluacion-conocimientos-v1'

export const CATEGORIAS_EVALUACION = [
  {
    id: 'licencias',
    nombre: 'Licenciamiento de Software',
    icono: '⚖️',
    descripcion: 'Familias de licencias (MIT, Apache, GPL, LGPL, AGPL, Propietarias, Dominio Público), compatibilidad y cláusulas clave.'
  },
  {
    id: 'normativa',
    nombre: 'Marco Jurídico y Normativo',
    icono: '📜',
    descripcion: 'Legislación colombiana: Ley 23 de 1982, Ley 1450 de 2011, Art. 271 del Código Penal, Ley 1273 de 2009 y Ley 1581 de 2012.'
  },
  {
    id: 'derechos',
    nombre: 'Derechos Morales y Patrimoniales',
    icono: '🛡️',
    descripcion: 'Diferencias jurídicas, titularidad en obras por encargo, inalienabilidad y transferencia de derechos en el desarrollo de software.'
  },
  {
    id: 'ficha-tecnica',
    nombre: 'Ficha Técnica y Estándares ISO',
    icono: '📘',
    descripcion: 'Estructura formal de la ficha FT-ADSO, requerimientos RF/RNF, trazabilidad y normas ISO/IEC 25010 e ISO/IEC 12207.'
  },
  {
    id: 'casos-practicos',
    nombre: 'Casos Prácticos y Arquitectura',
    icono: '🧩',
    descripcion: 'Resolución de dilemas reales de licenciamiento, código sin licencia, auditoría de dependencias y requerimientos en entornos reales.'
  }
]

export const PREGUNTAS_EVALUACION = [
  {
    id: 'eval-01',
    categoria: 'licencias',
    dificultad: 'Básico',
    enunciado: '¿Cuál es la principal característica que distingue a una licencia de software permisiva (como MIT o BSD) de una con copyleft fuerte (como GPL-3.0)?',
    opciones: [
      { id: 'a', texto: 'Las licencias permisivas permiten incorporar el código en proyectos con código cerrado sin exigir liberar el producto derivado, mientras que el copyleft fuerte exige compartir el código fuente bajo la misma licencia.', ok: true },
      { id: 'b', texto: 'Las licencias permisivas prohíben expresamente cobrar por el software o utilizarlo en actividades comerciales.', ok: false },
      { id: 'c', texto: 'El copyleft fuerte renuncia a todos los derechos de autor, mientras que las permisivas obligan a pagar regalías al creador original.', ok: false },
      { id: 'd', texto: 'Las licencias permisivas solo pueden usarse en proyectos académicos o gubernamentales sin fines de lucro.', ok: false }
    ],
    explicacion: 'Las licencias permisivas imponen requisitos mínimos (básicamente conservar el aviso de copyright y la nota de licencia), permitiendo redistribuir el software incluso de forma propietaria o cerrada. Por el contrario, el copyleft fuerte (GPL) impone el principio de reciprocidad: toda obra derivada que se distribuya debe mantenerse libre y con su código fuente abierto bajo la misma licencia GPL.',
    norma: 'Fundamentos de Licenciamiento de Software Libre (FSF / OSI)'
  },
  {
    id: 'eval-02',
    categoria: 'licencias',
    dificultad: 'Intermedio',
    enunciado: 'Una empresa tecnológica desea publicar una librería de código abierto permitiendo su uso comercial irrestricto, pero necesita protección explícita frente a demandas de patentes de los colaboradores y requiere trazabilidad de archivos modificados. ¿Qué licencia es la más idónea?',
    opciones: [
      { id: 'a', texto: 'Apache-2.0, ya que incluye una concesión expresa de licencias de patente por parte de los contribuidores y exige documentar los cambios realizados.', ok: true },
      { id: 'b', texto: 'MIT, porque al tener menos de 20 líneas de texto elimina cualquier riesgo legal relacionado con patentes.', ok: false },
      { id: 'c', texto: 'GPL-2.0, porque permite cerrar el código de cualquier modificación sin dar explicaciones.', ok: false },
      { id: 'd', texto: 'EULA Propietaria, ya que prohíbe que cualquier persona ejecute o descargue el código.', ok: false }
    ],
    explicacion: 'La licencia Apache-2.0 se diferencia principalmente de la MIT en dos aspectos fundamentales: otorga una concesión expresa de derechos de patente de los contribuyentes hacia los usuarios (con terminación automática si un usuario demanda por patentes), y exige explícitamente incluir un aviso en los archivos que hayan sido modificados.',
    norma: 'Apache License 2.0 (Secciones 3 y 4b)'
  },
  {
    id: 'eval-03',
    categoria: 'licencias',
    dificultad: 'Avanzado',
    enunciado: 'Un equipo de desarrollo toma un software bajo licencia GPL-3.0, le realiza modificaciones sustanciales y lo ofrece al público exclusivamente como un servicio en la nube (SaaS / Web), sin distribuir binarios instalables a los clientes. ¿Por qué la licencia AGPL-3.0 fue creada específicamente para este escenario?',
    opciones: [
      { id: 'a', texto: 'Porque la GPL-3.0 solo se activa ante la «distribución» de copias binarias; la AGPL-3.0 añade la obligación de poner el código fuente modificado a disposición de quienes interactúen con el software a través de una red informática.', ok: true },
      { id: 'b', texto: 'Porque la AGPL-3.0 prohíbe alojar software en servidores conectados a Internet.', ok: false },
      { id: 'c', texto: 'Porque la AGPL-3.0 permite cobrar una tarifa mensual obligatoria a los desarrolladores del software original.', ok: false },
      { id: 'd', texto: 'Porque la GPL-3.0 no permitía compilación en lenguajes modernos de backend como Node.js o Python.', ok: false }
    ],
    explicacion: 'La GNU Affero General Public License (AGPL-3.0) cierra el llamado "vacío del proveedor de servicios de aplicaciones" (ASP loop-hole). Bajo la GPL estándar, brindar un servicio web no constituye "distribución", por lo que no existía obligación de publicar el código modificado. La AGPL extiende la obligación de entrega del código fuente a los usuarios que interactúan con el programa a través de una red de computadores.',
    norma: 'GNU Affero General Public License v3 (Sección 13)'
  },
  {
    id: 'eval-04',
    categoria: 'licencias',
    dificultad: 'Intermedio',
    enunciado: '¿Cuál es la diferencia fundamental entre una licencia de tipo Copyleft Débil (como LGPL o MPL) y una de Copyleft Fuerte (como GPL)?',
    opciones: [
      { id: 'a', texto: 'El copyleft débil permite enlazar la librería desde una aplicación con otra licencia (incluso cerrada), exigiendo liberar únicamente las modificaciones hechas a la librería misma; el copyleft fuerte contagia a toda la aplicación integrada.', ok: true },
      { id: 'b', texto: 'El copyleft débil no tiene ninguna validez jurídica internacional.', ok: false },
      { id: 'c', texto: 'El copyleft fuerte obliga a pagar al autor, mientras que el débil es completamente gratuito.', ok: false },
      { id: 'd', texto: 'El copyleft débil prohíbe el uso de bases de datos relacionales.', ok: false }
    ],
    explicacion: 'La LGPL (Lesser General Public License) y la MPL (Mozilla Public License) están diseñadas para permitir que librerías o módulos abiertos sean consumidos y enlazados por aplicaciones con licencias distintas (incluyendo software propietario comercial), siempre y cuando las modificaciones directas al código de la librería cubierta se mantengan abiertas bajo la misma licencia.',
    norma: 'GNU Lesser General Public License (LGPL v2.1/v3.0)'
  },
  {
    id: 'eval-05',
    categoria: 'licencias',
    dificultad: 'Básico',
    enunciado: 'Si un programa como Adobe Acrobat Reader puede descargarse e instalarse sin pagar un solo peso, ¿por qué NO se considera Software Libre sino Software Propietario (Freeware)?',
    opciones: [
      { id: 'a', texto: 'Porque no concede las 4 libertades esenciales: su código es cerrado, su licencia (EULA) prohíbe la modificación, ingeniería inversa y redistribución no autorizada. "Gratis" (precio cero) no equivale a "Libre" (libertad del usuario).', ok: true },
      { id: 'b', texto: 'Porque cualquier software que corra en el sistema operativo Windows pierde automáticamente su estatus de software libre.', ok: false },
      { id: 'c', texto: 'Porque el software libre obliga por ley a cobrar una suscripción anual.', ok: false },
      { id: 'd', texto: 'Porque únicamente el software escrito en lenguaje C puede clasificarse como software libre.', ok: false }
    ],
    explicacion: 'El software libre se define por otorgar las cuatro libertades (ejecutar, estudiar/modificar, redistribuir copias y distribuir versiones modificadas). El freeware es software propietario que tiene precio cero de adquisición, pero mantiene el código fuente cerrado y restringe severamente los derechos de uso y distribución mediante un contrato de adhesión (EULA).',
    norma: 'Las 4 Libertades del Software Libre (Free Software Foundation)'
  },
  {
    id: 'eval-06',
    categoria: 'normativa',
    dificultad: 'Básico',
    enunciado: 'Según el Artículo 9 de la Ley 23 de 1982 sobre Derechos de Autor en Colombia, ¿en qué momento nace la protección jurídica sobre un software o código fuente desarrollado por un autor?',
    opciones: [
      { id: 'a', texto: 'Nace automáticamente desde el momento de la creación de la obra, sin necesidad de registro formal, depósito ni formalidad alguna ante ninguna autoridad.', ok: true },
      { id: 'b', texto: 'Nace únicamente a partir de la fecha de radicación y pago de la tasa en la Dirección Nacional de Derecho de Autor (DNDA).', ok: false },
      { id: 'c', texto: 'Nace cuando el software es publicado formalmente en una tienda de aplicaciones o repositorio público.', ok: false },
      { id: 'd', texto: 'Nace solamente si el código fuente incluye ante notario público una declaración jurada de originalidad.', ok: false }
    ],
    explicacion: 'El Art. 9 de la Ley 23 de 1982 establece el principio declarativo de los derechos de autor (en consonancia con el Convenio de Berna): la protección nace por el hecho mismo de la creación, sin que se requiera registro formal obligatorio ante la DNDA. El registro ante la DNDA es meramente declarativo y sirve como medio de prueba o publicidad, no como requisito de existencia.',
    norma: 'Ley 23 de 1982, Artículo 9 (Marco de Derechos de Autor en Colombia)'
  },
  {
    id: 'eval-07',
    categoria: 'normativa',
    dificultad: 'Intermedio',
    enunciado: 'Un desarrollador es contratado bajo un contrato de prestación de servicios para crear un módulo de facturación para una clínica. El contrato no estipuló cláusula expresa sobre propiedad intelectual. Con base en el Artículo 20 de la Ley 23 de 1982 (modificado por el Art. 28 de la Ley 1450 de 2011), ¿a quién pertenecen los derechos patrimoniales?',
    opciones: [
      { id: 'a', texto: 'Se presumen transferidos a la clínica contratante en la medida necesaria para sus actividades habituales, pero el desarrollador conserva siempre sus derechos morales (paternidad e integridad).', ok: true },
      { id: 'b', texto: 'Pertenecen exclusivamente al desarrollador, quien puede prohibirle a la clínica seguir utilizando el software.', ok: false },
      { id: 'c', texto: 'Pasan a ser de dominio público de manera inmediata por falta de contrato escrito de cesión.', ok: false },
      { id: 'd', texto: 'El desarrollador transfiere tanto los derechos patrimoniales como los morales, perdiendo el derecho a ser reconocido como autor.', ok: false }
    ],
    explicacion: 'La Ley 1450 de 2011 (art. 28), al modificar el art. 20 de la Ley 23 de 1982, consagró la presunción legal de cesión: en las obras creadas en virtud de un contrato de trabajo o de prestación de servicios por encargo, se presume que los derechos patrimoniales sobre la obra han sido transferidos al empleador o contratante en la medida necesaria para sus actividades. Los derechos morales son irrenunciables y permanecen con el autor.',
    norma: 'Ley 23 de 1982, Art. 20 (modificado por Ley 1450 de 2011, Art. 28)'
  },
  {
    id: 'eval-08',
    categoria: 'derechos',
    dificultad: 'Intermedio',
    enunciado: 'En el marco del derecho de autor colombiano, ¿cuáles son las características legales de los Derechos Morales de un programador sobre su software?',
    opciones: [
      { id: 'a', texto: 'Son perpetuos, inalienables, irrenunciables e imprescriptibles; incluyen el derecho de paternidad (ser reconocido como autor) y el de integridad (oponerse a deformaciones de la obra).', ok: true },
      { id: 'b', texto: 'Son temporales (duran 50 años), pueden venderse o cederse mediante factura comercial y caducan si el autor fallece.', ok: false },
      { id: 'c', texto: 'Son derechos exclusivos para cobrar regalías y vender copias en plataformas digitales.', ok: false },
      { id: 'd', texto: 'Solo aplican a obras literarias escritas en papel, nunca al software ni a bases de datos.', ok: false }
    ],
    explicacion: 'Los derechos morales protegen el vínculo personalísimo e intelectual entre el autor y su creación. Por mandato legal y constitucional, son inalienables (no se pueden transferir ni vender), irrenunciables (no se puede pactar renunciar a ellos), perpetuos e imprescriptibles. El autor siempre conservará el derecho a que se reconozca su nombre y a defender la integridad de la obra.',
    norma: 'Ley 23 de 1982, Artículo 11 y Decisión Andina 351 de 1993'
  },
  {
    id: 'eval-09',
    categoria: 'derechos',
    dificultad: 'Intermedio',
    enunciado: 'A diferencia de los derechos morales, ¿qué facultades confieren los Derechos Patrimoniales de autor sobre un programa de computador?',
    opciones: [
      { id: 'a', texto: 'Facultades exclusivamente económicas para autorizar o prohibir la reproducción, comunicación pública, distribución, traducción, adaptación o cualquier transformación comercial de la obra.', ok: true },
      { id: 'b', texto: 'La potestad ética de exigir que nunca se le agreguen nuevas líneas de código al software.', ok: false },
      { id: 'c', texto: 'La obligación de responder penalmente por cualquier fallo de seguridad del sistema.', ok: false },
      { id: 'd', texto: 'El derecho de exigir un título universitario honorífico en ingeniería.', ok: false }
    ],
    explicacion: 'Los derechos patrimoniales son de carácter económico. Permiten a su titular explotar financieramente la obra y autorizar o prohibir actos como el copiado, distribución de licencias, venta, alquiler, transmisión por redes o modificaciones derivadas.',
    norma: 'Ley 23 de 1982, Artículo 12 y Decisión 351 de la CAN'
  },
  {
    id: 'eval-10',
    categoria: 'normativa',
    dificultad: 'Avanzado',
    enunciado: 'Una empresa instala copias piratas de un motor de bases de datos comercial en 40 servidores de producción sin contar con licencias válidas para ahorrar costos. Conforme al Artículo 271 del Código Penal Colombiano, ¿a qué consecuencias legales se expone la organización y los responsables?',
    opciones: [
      { id: 'a', texto: 'Incurren en el delito penal de Defraudación a los derechos patrimoniales de autor, sancionado con penas privativas de la libertad (prisión) y millonarias multas económicas.', ok: true },
      { id: 'b', texto: 'No existe sanción penal en Colombia, únicamente una amonestación verbal de la Cámara de Comercio.', ok: false },
      { id: 'c', texto: 'Solo tendrían que desinstalar el programa en un plazo de 6 meses sin pagar ninguna indemnización.', ok: false },
      { id: 'd', texto: 'La sanción es solo una recomendación técnica sin valor judicial obligatorio.', ok: false }
    ],
    explicacion: 'El Artículo 271 del Código Penal Colombiano (modificado por la Ley 1032 de 2006) tipifica la defraudación a los derechos patrimoniales de autor como delito penal. Quien reproduzca, distribuya, comercialice o use obras o software protegido sin la autorización previa y expresa del titular enfrenta penas de prisión (de 4 a 8 años) y multas que pueden alcanzar hasta 1.000 SMLMV.',
    norma: 'Código Penal Colombiano, Artículo 271 (Ley 599 de 2000 y Ley 1032 de 2006)'
  },
  {
    id: 'eval-11',
    categoria: 'normativa',
    dificultad: 'Intermedio',
    enunciado: 'La Ley 1273 de 2009 en Colombia creó el tipo penal de Delitos Informáticos. ¿Cuál de las siguientes conductas está expresamente tipificada en dicha norma como "Acceso abusivo a un sistema informático" (Art. 269A)?',
    opciones: [
      { id: 'a', texto: 'Acceder sin autorización o excediendo la autorización a todo o parte de un sistema informático protegido o no con medidas de seguridad.', ok: true },
      { id: 'b', texto: 'Olvidar la contraseña personal del correo institucional de la empresa.', ok: false },
      { id: 'c', texto: 'Utilizar una computadora con el brillo de pantalla al nivel máximo.', ok: false },
      { id: 'd', texto: 'Actualizar el sistema operativo a la última versión disponible en el fabricante.', ok: false }
    ],
    explicacion: 'La Ley 1273 de 2009 incorporó al Código Penal el título de los delitos contra la confidencialidad, la integridad y la disponibilidad de los datos y de los sistemas informáticos. El art. 269A sanciona a quien, sin autorización o excediendo la que tenga, acceda a un sistema informático, imponiendo pena de prisión.',
    norma: 'Ley 1273 de 2009, Artículo 269A (Delitos Informáticos)'
  },
  {
    id: 'eval-12',
    categoria: 'normativa',
    dificultad: 'Intermedio',
    enunciado: 'Al diseñar la arquitectura de un software en Colombia que almacena datos personales, cédulas, teléfonos y montos de pago de usuarios (como en el caso MAREA), ¿qué obligaciones técnicas impone la Ley 1581 de 2012 (Protección de Datos Personales / Habeas Data)?',
    opciones: [
      { id: 'a', texto: 'Obtener autorización previa, expresa e informada del titular, definir una política de tratamiento de datos, garantizar confidencialidad y permitir que los usuarios consulten, actualicen o supriman su información.', ok: true },
      { id: 'b', texto: 'Publicar la base de datos abierta en Internet para que cualquier persona pueda auditar los saldos libremente.', ok: false },
      { id: 'c', texto: 'No exige ningún control si la base de datos está guardada en formato SQLite o Excel.', ok: false },
      { id: 'd', texto: 'Prohíbe a cualquier empresa guardar información digital en computadores.', ok: false }
    ],
    explicacion: 'La Ley 1581 de 2012 y el Decreto 1377 de 2013 regulan el principio de Habeas Data en Colombia. Exigen que todo responsable o encargado de tratamiento de datos cuente con autorización previa e informada, mantenga medidas de seguridad para evitar adulteración o fuga de datos, y ofrezca canales efectivos para el ejercicio de los derechos de consulta y rectificación.',
    norma: 'Ley Estatutaria 1581 de 2012 (Régimen General de Protección de Datos Personales)'
  },
  {
    id: 'eval-13',
    categoria: 'ficha-tecnica',
    dificultad: 'Básico',
    enunciado: '¿Cuál es el propósito primordial de la Ficha Técnica de Software (FT-ADSO) en el ciclo de vida de un proyecto de desarrollo informático?',
    opciones: [
      { id: 'a', texto: 'Actuar como documento técnico formal que consolida especificaciones funcionales, no funcionales, requerimientos de entorno, arquitectura y régimen de licenciamiento, sirviendo de anexo contractual y trazabilidad de entrega.', ok: true },
      { id: 'b', texto: 'Ser un folleto publicitario destinado a promocionar el software en redes sociales y vallas de carretera.', ok: false },
      { id: 'c', texto: 'Reemplazar las pruebas unitarias y el código fuente compilado.', ok: false },
      { id: 'd', texto: 'Servir como un comprobante de pago bancario de impuestos.', ok: false }
    ],
    explicacion: 'La Ficha Técnica de Software es el documento de ingeniería que sintetiza las capacidades, límites operativos y base legal del producto. Garantiza la trazabilidad entre lo pactado con los interesados y lo entregado por el equipo de desarrollo, delimitando la responsabilidad contractual y los requerimientos mínimos de infraestructura.',
    norma: 'Estándares de Documentación de Software SENA / ISO/IEC 12207'
  },
  {
    id: 'eval-14',
    categoria: 'ficha-tecnica',
    dificultad: 'Intermedio',
    enunciado: 'En la estructura formal de una Ficha Técnica de Software, ¿cuál de los siguientes enunciados corresponde adecuadamente a un Requerimiento No Funcional (RNF) y NO a un Requerimiento Funcional (RF)?',
    opciones: [
      { id: 'a', texto: '«El sistema debe cifrar los datos sensibles en reposo mediante AES-256 y responder consultas de saldo en menos de 1.5 segundos con hasta 100 usuarios concurrentes».', ok: true },
      { id: 'b', texto: '«El sistema debe registrar los kilos de pargo rojo capturados por cada pescador artesanal».', ok: false },
      { id: 'c', texto: '«El sistema debe generar un comprobante de liquidación mensual en formato PDF para el socio».', ok: false },
      { id: 'd', texto: '«El sistema debe permitir que el administrador edite el precio por kilogramo de cada especie».', ok: false }
    ],
    explicacion: 'Los Requerimientos Funcionales (RF) definen «qué hace» el sistema (acciones, transacciones, reportes, casos de uso). Los Requerimientos No Funcionales (RNF) definen «cómo lo hace» y las restricciones de calidad: rendimiento, seguridad (cifrado), concurrencia, disponibilidad, usabilidad y tiempo de respuesta.',
    norma: 'Ingeniería de Requerimientos / ISO/IEC 25010'
  },
  {
    id: 'eval-15',
    categoria: 'ficha-tecnica',
    dificultad: 'Avanzado',
    enunciado: 'El estándar internacional ISO/IEC 25010 establece el modelo de calidad para productos de software. ¿Cuáles de las siguientes son características de calidad definidas en dicha norma?',
    opciones: [
      { id: 'a', texto: 'Adecuación funcional, Eficiencia de desempeño, Compatibilidad, Usabilidad, Fiabilidad, Seguridad, Mantenibilidad y Portabilidad.', ok: true },
      { id: 'b', texto: 'Costo financiero, Popularidad en redes sociales, Cantidad de líneas de código y Color del logotipo corporativo.', ok: false },
      { id: 'c', texto: 'Monopolio de mercado, Ventas trimestrales y Ausencia total de contratos legales.', ok: false },
      { id: 'd', texto: 'Uso obligatorio de servidores físicos en lugar de servicios en la nube.', ok: false }
    ],
    explicacion: 'ISO/IEC 25010 (que reemplazó a ISO 9126) define 8 características fundamentales de calidad del producto de software: adecuación funcional, eficiencia de desempeño, compatibilidad, usabilidad, fiabilidad, seguridad, mantenibilidad y portabilidad. Estas características orientan la formulación rigurosa de los RNF en la ficha técnica.',
    norma: 'Estándar Internacional ISO/IEC 25010: Systems and software engineering - SQuaRE'
  },
  {
    id: 'eval-16',
    categoria: 'ficha-tecnica',
    dificultad: 'Intermedio',
    enunciado: 'En el apartado de «Régimen Legal y Licenciamiento de Componentes de Terceros» de la Ficha Técnica, ¿por qué es imperativo auditar y listar todas las librerías dependientes (como paquetes npm)?',
    opciones: [
      { id: 'a', texto: 'Para prevenir incompatibilidades legales de licencias (ej. copyleft infeccioso en software privativo), mitigar riesgos de vulnerabilidades y cumplir con las atribuciones de copyright obligatorias.', ok: true },
      { id: 'b', texto: 'Para que el cliente final pague una tarifa de instalación por cada archivo JavaScript descargado.', ok: false },
      { id: 'c', texto: 'Es un trámite sin importancia técnica que solo sirve para rellenar páginas del informe.', ok: false },
      { id: 'd', texto: 'Para solicitar que el software sea declarado patrimonio de la humanidad.', ok: false }
    ],
    explicacion: 'El análisis de dependencias de terceros (Software Composition Analysis - SCA) es crítico: una librería con licencia GPL incorporada en un producto que el cliente planea vender como propietario cerrado crearía una grave infracción legal o exigiría abrir todo el código. Además, documentar las dependencias garantiza el cumplimiento de los avisos de crédito exigidos por licencias MIT/Apache.',
    norma: 'Gestión de Riesgos de Cadena de Suministro de Software / ISO/IEC 12207'
  },
  {
    id: 'eval-17',
    categoria: 'casos-practicos',
    dificultad: 'Avanzado',
    enunciado: 'Caso Práctico: Encuentras en GitHub un repositorio público con un código excelente que resuelve exactamente el algoritmo que necesitas para tu empresa, pero el repositorio NO contiene ningún archivo de licencia (LICENSE) ni mención alguna. ¿Qué puedes hacer legalmente?',
    opciones: [
      { id: 'a', texto: 'No puedes usarlo, modificarlo ni distribuirlo comercialmente sin autorización previa del autor, porque según los convenios internacionales (Berna), «sin licencia» significa «todos los derechos reservados» por defecto.', ok: true },
      { id: 'b', texto: 'Puedes usarlo y venderlo libremente, porque todo lo que esté subido públicamente a GitHub se convierte automáticamente en Dominio Público.', ok: false },
      { id: 'c', texto: 'Solo debes agregarle una licencia MIT inventada por ti y ya queda legalizado para tu empresa.', ok: false },
      { id: 'd', texto: 'Puedes cambiarle los nombres de las variables y así la ley ya no protege el derecho de autor.', ok: false }
    ],
    explicacion: 'La ausencia de licencia no significa que el código sea de libre uso. Por defecto, en virtud del Convenio de Berna y la Ley 23 de 1982, el autor conserva todos los derechos reservados. Aunque GitHub permite ver y bifurcar públicamente el repositorio por sus términos de servicio, no concede derechos de explotación, modificación ni integración en software de terceros sin una licencia explícita.',
    norma: 'Convenio de Berna para la Protección de las Obras Literarias y Artísticas / Términos de Servicio de GitHub'
  },
  {
    id: 'eval-18',
    categoria: 'casos-practicos',
    dificultad: 'Avanzado',
    enunciado: 'Caso Práctico: En el proyecto MAREA (Cooperativa de Pescadores en La Guajira), el gerente indica que la balanza Bluetooth tiene señal intermitente y en la playa casi no hay conexión a internet 3G. Como analistas ADSO, ¿qué solución arquitectónica debe declararse en la Ficha Técnica?',
    opciones: [
      { id: 'a', texto: 'Una arquitectura web progresiva (PWA) con almacenamiento local seguro (IndexedDB/LocalStorage) que opere offline y sincronice automáticamente las transacciones con el servidor central al detectar conectividad.', ok: true },
      { id: 'b', texto: 'Obligar a los pescadores a comprar satélites espaciales privados para cada lancha antes de poder pescar.', ok: false },
      { id: 'c', texto: 'Configurar una base de datos Oracle Enterprise en el celular de 2 GB de RAM de cada pescador.', ok: false },
      { id: 'd', texto: 'Declarar en la ficha técnica que el sistema no funcionará los días que haya nubes en el cielo.', ok: false }
    ],
    explicacion: 'La ficha técnica debe reflejar la viabilidad operativa bajo las condiciones reales del entorno (La Guajira, zona rural sin conectividad garantizada). Un diseño offline-first respaldado por tecnologías como Service Workers e IndexedDB asegura la captura ininterrumpida de pesajes en el centro de acopio y su posterior conciliación transaccional con la base de datos central.',
    norma: 'Diseño de Requerimientos de Entorno y Arquitectura FT-ADSO'
  },
  {
    id: 'eval-19',
    categoria: 'casos-practicos',
    dificultad: 'Intermedio',
    enunciado: 'Un aprendiz ADSO afirma: «Como colocamos la licencia CC0 (Dominio Público) a nuestro proyecto de software en Colombia, hemos renunciado legalmente a que nuestro nombre aparezca en los créditos como autores». ¿Es jurídicamente válida esta afirmación?',
    opciones: [
      { id: 'a', texto: 'No es válida: en la legislación colombiana (sistema de derecho continental / autor civil), los derechos morales como la paternidad son irrenunciables e inalienables; la CC0 libera los derechos patrimoniales al máximo, pero el derecho a ser reconocido como autor prevalece.', ok: true },
      { id: 'b', texto: 'Es totalmente válida: en Colombia es legal y obligatorio renunciar al nombre propio al registrar un proyecto en GitHub.', ok: false },
      { id: 'c', texto: 'Es válida únicamente si el aprendiz tiene menos de 25 años de edad al momento del commit.', ok: false },
      { id: 'd', texto: 'No es válida porque en Colombia solo existe la licencia GPL-1.0.', ok: false }
    ],
    explicacion: 'En la tradición jurídica de Derecho de Autor (colombiana y latinoamericana), a diferencia del Copyright anglosajón, la renuncia a los derechos morales es nula de pleno derecho. Las licencias CC0 o Unlicense funcionan en Colombia como una renuncia plena a los derechos patrimoniales y una licencia de uso irrestricta, pero el autor conserva siempre el derecho moral de paternidad.',
    norma: 'Ley 23 de 1982, Artículo 11 y Régimen Andino de Derecho de Autor'
  },
  {
    id: 'eval-20',
    categoria: 'casos-practicos',
    dificultad: 'Avanzado',
    enunciado: 'Caso Práctico: Durante una auditoría a un sistema que se va a comercializar con código cerrado a clientes bancarios, se detecta que un programador incorporó una librería bajo GPL-3.0 mediante compilación estática. ¿Cuáles son las dos únicas alternativas legales viables que tiene el equipo técnico?',
    opciones: [
      { id: 'a', texto: '1) Sustituir la librería por una con licencia permisiva (MIT, Apache) o copyleft débil (LGPL); o 2) Comprar una licencia comercial propietaria al autor original (si ofrece licenciamiento dual).', ok: true },
      { id: 'b', texto: '1) Cambiar el nombre del autor en el archivo package.json; o 2) Ocultar el archivo .git.', ok: false },
      { id: 'c', texto: '1) Pagar una propina a la policía; o 2) Desconectar los servidores durante la noche.', ok: false },
      { id: 'd', texto: '1) Convertir todo el backend a HTML; o 2) Borrar la base de datos de producción.', ok: false }
    ],
    explicacion: 'La GPL-3.0 no permite la distribución en un producto privativo con código cerrado. Las salidas técnicas y comerciales válidas son: reescribir/reemplazar el componente usando una alternativa permisiva (MIT/BSD/Apache) o LGPL debidamente enlazada, adquirir una excepción comercial bajo un modelo de licenciamiento dual (dual-licensing) con el titular de los derechos, o asumir la obligación de publicar el código de la solución bajo GPL-3.0.',
    norma: 'Auditoría de Cumplimiento de Licencias Open Source y Mitigación de Riesgos'
  }
]
