// Solucionario del Caso MAREA, solo para el instructor.
// Vive en el servidor y solo sale por /api/admin/caso-ficha/solucionario con token de admin,
// así que ya no viaja en el paquete del navegador (antes cualquiera lo veía con F12).
// Antes de usarlo, verifiquen la vigencia de las normas y del reglamento de propiedad intelectual del SENA.

export const VACIOS = [
  { id: 'S1', vacio: 'Usuarios concurrentes: 46 socios frente a "hasta 300 personas mirando"', donde: 'Entrevista', supuesto: 'Diseñar para 300 usuarios concurrentes en temporada alta (escenario pesimista) y confirmar con el cliente.' },
  { id: 'S2', vacio: 'Servidor no definido ("el sobrino sabe")', donde: 'Notas técnicas', supuesto: 'VPS Linux en la nube con 2 vCPU, 4 GB de RAM y 40 GB SSD. Se descarta el PC de la oficina por conectividad y disponibilidad.' },
  { id: 'S3', vacio: 'Garantía: 6 meses (gerente y contadora) frente a 1 año (Jhon)', donde: 'Correo y notas', supuesto: 'Se asumen 6 meses porque lo dicen dos fuentes del cliente; debe quedar en el contrato.' },
  { id: 'S4', vacio: 'Resolución de pantalla de la oficina desconocida', donde: 'Entrevista', supuesto: 'Mínimo 1366×768 (común en equipos de ese rango).' },
  { id: 'S5', vacio: 'iOS: hay usuarios con iPhone, pero el APK es solo Android', donde: 'Entrevista y notas', supuesto: 'iOS no se soporta como app nativa en la v1.0.0; los usuarios de iPhone usan la PWA desde Safari, sin lectura de balanza.' },
  { id: 'S6', vacio: 'Factura electrónica DIAN por definir', donde: 'Correo', supuesto: 'Fuera del alcance de la v1.0.0: el sistema emite un "comprobante interno de compra" que no es factura.' },
  { id: 'S7', vacio: 'Wayuunaiki pendiente', donde: 'Notas', supuesto: 'Solo español en la v1.0.0; la arquitectura queda preparada para varios idiomas (i18n).' },
  { id: 'S8', vacio: 'Titularidad: no hay contrato y el acta no menciona derechos', donde: 'Notas y entrevista', supuesto: 'Ver la respuesta de la pregunta 2. Es el vacío más riesgoso.' },
  { id: 'S9', vacio: 'Integración con la Autoridad de Pesca ("¿eso se puede conectar?")', donde: 'Audio', supuesto: 'Fuera del alcance: solo se exporta el reporte de zonas en PDF o CSV.' },
  { id: 'S10', vacio: 'Versión: hubo una versión de prueba antes', donde: 'Notas', supuesto: 'La versión de prueba fue 0.x (por ejemplo, 0.9.0); la entrega del 30 de noviembre es la 1.0.0.' }
];

// SRS-ADSO-2026-07 de referencia, en resumen. Los RF salen de los documentos del caso; se califica
// que estén bien redactados y trazados, no que coincidan palabra por palabra
export const SRS_REFERENCIA = [
  { titulo: '1. Introducción', puntos: [
    'Propósito: especificar los requisitos de MAREA para que COOPEBRISAS los apruebe y el equipo los desarrolle y pruebe. Lectores: gerente, contadora, instructora y equipo.',
    'Alcance: registro de pesajes con balanza Bluetooth también sin conexión, liquidación mensual con abonos y anticipos, consulta del socio, reportes y mapa de zonas. NO incluye factura electrónica DIAN [S6], integración con la Autoridad de Pesca [S9], app nativa iOS [S5] ni wayuunaiki [S7].',
    'Definiciones mínimas: acopio, pesaje, anulación, liquidación, abono, anticipo, PWA, APK, sincronización.',
    'Referencias: Documentos 1 a 4 del caso, acta de inicio, ISO/IEC/IEEE 29148, ISO/IEC 25010, Ley 1581 de 2012, Ley 23 de 1982 y Decisión Andina 351.'
  ] },
  { titulo: '2. Descripción general', puntos: [
    'Perspectiva: PWA (Vue 3) + APK Android con Capacitor + API REST (Node.js) + PostgreSQL; se conecta con la balanza por Bluetooth y usa el GPS del celular.',
    'Usuarios: gerente (ve todo), contadora (finanzas), operaria de acopio (solo pesajes), socio (solo lo suyo; varios mayores con baja visión) y administrador técnico.',
    'Restricciones: señal 3G intermitente, celulares de 2 GB de RAM, Ley 1581 de 2012 (incluye datos de menores), licencias de terceros (GPL v3 y CC BY-NC en conflicto).',
    'Suposiciones: 300 usuarios concurrentes [S1], servidor VPS [S2], garantía de 6 meses [S3], resolución mínima 1366×768 [S4].'
  ] },
  { titulo: '3. Requisitos específicos', puntos: [
    'Interfaces: balanza Bluetooth (lectura del peso), GPS del celular, pantallas de letra grande y botones grandes, API REST con HTTPS.',
    'RF-01 Registrar pesaje (socio, especie, kilos, precio) leyendo la balanza – operaria – Alta (Doc 1).',
    'RF-02 Guardar pesajes sin conexión y sincronizarlos al volver la señal – operaria – Alta (Doc 1, Doc 3).',
    'RF-03 Anular un pesaje con motivo, sin borrarlo, dejando registro visible – operaria y contadora – Alta (Doc 2).',
    'RF-04 Registrar abonos y anticipos – contadora – Alta (Doc 2).',
    'RF-05 Generar la liquidación mensual por socio en PDF – contadora – Alta (Doc 1, Doc 2).',
    'RF-06 Consultar entregas y saldo propios desde el celular – socio – Alta (Doc 1).',
    'RF-07 Gestionar socios y beneficiarios con autorización de tratamiento de datos – contadora – Alta (Doc 2).',
    'RF-08 Autenticación con roles (gerente, contadora, acopio, socio) – todos – Alta (Doc 2, Doc 3).',
    'RF-09 Gráficas de ventas por especie – gerente – Media (Doc 1).',
    'RF-10 Registrar y mostrar en un mapa la zona de pesca de cada lancha – operaria y gerente – Media (Doc 1).',
    'RF-11 Emitir comprobante interno de compra (no es factura electrónica) [S6] – contadora – Media (Doc 2).',
    'RNF: los mismos RNF-01 a RNF-07 de la ficha resuelta (pesaje en menos de 3 s sin conexión, liquidación en menos de 10 s, 300 concurrentes [S1], HTTPS y bloqueo tras 5 intentos, no borrado, respaldo nocturno, letra de 18 px y contraste WCAG 2.1 AA).',
    'Legales: autorización previa e informada (Ley 1581), datos de menores solo nombre y parentesco, reemplazar balanza-bt-link (GPL v3) e "Iconos Marinos Pro" (CC BY-NC) si el producto es propietario, firmar la cesión de derechos patrimoniales antes de entregar.'
  ] },
  { titulo: '4. Matriz de trazabilidad', puntos: [
    'Cada RF y RNF apunta al documento del caso de donde salió (o al supuesto [S#]) y a una prueba concreta. Ejemplos: RF-02 → Doc 1 y Doc 3 → registrar 20 pesajes en modo avión y sincronizar sin pérdidas; RNF-02 → Doc 2 → cronometrar la liquidación de 46 socios.',
    'Se valora que detecten requisitos sin fuente (inventados) y fuentes sin requisito (cosas que el cliente pidió y se les olvidaron).'
  ] }
];

// Ficha FT-ADSO-2026-07 resuelta, en resumen
export const FICHA_RESUELTA = [
  { titulo: '1. Identificación y Control del Producto', puntos: [
    'Nombre: MAREA – Manejo Administrativo de Registros, Entregas y Abonos.',
    'Versión 1.0.0: primera versión estable; la de prueba fue 0.9.0 [S10].',
    'Tipo: PWA (Vue 3) + app Android con Capacitor + API REST (Node.js/Express) + PostgreSQL.',
    'Autores: Dayana Ipuana Gómez, Jhon Fredy Bermúdez Uriana y Luis Ángel Fince Ortiz. Ficha 2901457. Instructora: Ing. Martha Cotes.',
    'Cliente: COOPEBRISAS, Cabo de la Vela, Uribia (La Guajira). Contacto: Efraín Epieyú (gerente).'
  ] },
  { titulo: '2. Descripción General y Alcance', puntos: [
    'Objetivo general: sistematizar el registro de entregas y la liquidación de pagos para dar trazabilidad y transparencia a socios y compradores.',
    'Específicos: registrar pesajes con la balanza Bluetooth también sin conexión; liquidar pagos descontando abonos y anticipos; consulta del socio desde el celular; reportes PDF y gráficas por especie; georreferenciar zonas de pesca.',
    'Roles: gerente, contadora, operaria de acopio, socio y administrador técnico.',
    'Exclusiones: factura electrónica DIAN [S6], integración con la Autoridad de Pesca [S9], app nativa iOS [S5], wayuunaiki [S7] y despliegue multi-cooperativa.'
  ] },
  { titulo: '3. Requerimientos de Hardware', puntos: [
    'Celular: mínimo ARM64, 2 GB RAM, 200 MB libres, pantalla de 5", Bluetooth 4.0 y GPS; recomendado 3 GB RAM y 500 MB.',
    'PC de oficina: mínimo x64, 4 GB RAM, 500 MB libres, 1366×768 [S4]; recomendado 8 GB y 1920×1080.',
    'Servidor [S2]: mínimo 2 vCPU, 4 GB RAM, 40 GB SSD; recomendado 4 vCPU, 8 GB, 80 GB SSD.',
    'Red: 3G intermitente (modo sin conexión); sincronización con 1 Mbps o más.'
  ] },
  { titulo: '4. Requerimientos de Software y Plataforma', puntos: [
    'Android 9+ (APK), Windows 10+ en la oficina (navegador), servidor Ubuntu 24.04 LTS.',
    'Chrome 110+, Edge 110+, Firefox 115+ y Safari 16+ (solo PWA, sin balanza) [S5].',
    'Node.js 20 LTS + Express, PostgreSQL 16, IndexedDB con Dexie.js en el celular.',
    'No soportado: iOS nativo, Windows 7 e Internet Explorer.'
  ] },
  { titulo: '5. Módulos Funcionales', puntos: [
    'Autenticación y roles (JWT, 5 roles, bloqueo tras 5 intentos).',
    'Socios y beneficiarios, con autorización de tratamiento de datos.',
    'Pesajes desde la balanza Bluetooth; se anulan, nunca se borran.',
    'Sincronización sin conexión con cola local en Dexie.',
    'Finanzas: abonos, anticipos y liquidación mensual.',
    'Reportes: liquidación en PDF, gráficas por especie, comprobante interno y CSV.',
    'Mapa de zonas con Leaflet y bitácora de auditoría.'
  ] },
  { titulo: '6. Calidad y Requisitos No Funcionales', puntos: [
    'RNF-01: guardar un pesaje en menos de 3 s en un celular de 2 GB, aun sin conexión (Eficiencia de desempeño).',
    'RNF-02: liquidación mensual en PDF en menos de 10 s (Eficiencia de desempeño).',
    'RNF-03: 300 usuarios concurrentes con p95 menor de 2 s [S1] (Capacidad).',
    'RNF-04: HTTPS TLS 1.2+, bcrypt, bloqueo tras 5 intentos y control por rol (Seguridad).',
    'RNF-05: ningún pesaje se elimina; las anulaciones quedan en bitácora (Seguridad: no repudio).',
    'RNF-06: 0 % de pérdida al sincronizar; respaldo nocturno con 30 días de retención (Fiabilidad).',
    'RNF-07: texto de 18 px o más, botones de 48×48 px y contraste WCAG 2.1 AA (Usabilidad).',
    'Ley 1581: COOPEBRISAS es responsable; el proveedor del servidor, encargado. Autorización previa y expresa, datos bancarios cifrados y minimizar datos de menores (solo nombre y parentesco).'
  ] },
  { titulo: '7. Licenciamiento y Propiedad Intelectual', puntos: [
    'Licencia propietaria de uso para COOPEBRISAS, siempre que se reemplacen balanza-bt-link y los íconos CC BY-NC.',
    'Derechos morales: los tres aprendices; irrenunciables (Ley 23 de 1982, Decisión Andina 351 art. 11).',
    'Derechos patrimoniales: sin contrato escrito no se puede presumir que son de la cooperativa; hay que firmar antes de entregar.',
    'Registro ante la DNDA recomendado: es declarativo, pero sirve como prueba.',
    'MIT, Apache 2.0, BSD-2 y PostgreSQL License: compatibles, conservando avisos. GPL v3 y CC BY-NC 4.0: no compatibles con el modelo propietario.'
  ] },
  { titulo: '8. Soporte y Garantía', puntos: [
    'Garantía de 6 meses [S3]: cubre defectos frente a la ficha; no cubre cambios de alcance ni daños de terceros.',
    'Severidad: crítica 24 h, media 72 h, baja en la siguiente versión de mantenimiento.',
    'SemVer: PARCHE para correcciones, MENOR para funciones compatibles y MAYOR para cambios incompatibles (multi-cooperativa).',
    'Dejar definido quién da soporte cuando los aprendices terminen su etapa formativa.'
  ] }
];

export const RESPUESTAS_ESPERADAS = [
  { id: 'pc1', respuesta: 'La GPL v3 es copyleft: si se distribuye una obra que la incorpora, la obra completa va bajo GPL v3 con código fuente. El APK llega a los celulares de los socios, así que hay distribución y no puede ser propietario cerrado. Alternativas: (a) reemplazar la librería por una permisiva o escribir un módulo propio con el protocolo del fabricante; (b) separar un APK interno del acopio (frágil); (c) pedir licencia comercial al autor; (d) publicar MAREA bajo GPL v3. Recomendada: la (a), o la (d) si el cliente acepta. Se valora que noten que "es de uso interno" no aplica cuando el APK llega a los socios.' },
  { id: 'pc2', respuesta: 'Morales: los tres aprendices, siempre (Ley 23 de 1982; Decisión Andina 351, art. 11). Patrimoniales: se transfieren solo por escrito (Decisión Andina 351, arts. 30-31; Ley 23 art. 20 modificado por la Ley 1450 de 2011, art. 28). Sin contrato y con un acta que no dice nada, no hay base para afirmar que COOPEBRISAS es titular. Revisar el reglamento de propiedad intelectual vigente del SENA. Recomendación: firmar cesión o licencia exclusiva entre aprendices, SENA (si aplica) y COOPEBRISAS, con alcance, territorio, tiempo, remuneración, reconocimiento de autoría y quién licencia a otras cooperativas.' },
  { id: 'pc3', respuesta: 'La cláusula NC prohíbe usos orientados a obtener ventaja comercial. El uso interno es zona gris, pero venderle o licenciarle el sistema a la Gobernación o a otras cooperativas sí es comercial. Solución: reemplazar por íconos permisivos o propios, o pedir licencia comercial al autor; mientras se usen, cumplir la atribución (BY).' },
  { id: 'pc4', respuesta: 'El art. 7 de la Ley 1581 restringe los datos de menores; la Sentencia C-748 de 2011 y el Decreto 1377 de 2013 (compilado en el 1074 de 2015) lo permiten si responde al interés superior del menor y hay autorización del representante legal. Por finalidad y necesidad, el colegio y el registro civil no hacen falta para liquidar pesca. Guardar solo nombre y parentesco, con autorización expresa, acceso restringido a la contadora y política de tratamiento publicada.' },
  { id: 'pc5', respuesta: 'Válidas si están bien justificadas: Fiabilidad (0 pesajes perdidos al sincronizar 100 registros hechos en modo avión); Eficiencia (pesaje en menos de 3 s en 2 GB y liquidación en menos de 10 s, medido con cronómetro, Lighthouse o pruebas de carga); Usabilidad (un socio mayor de 60 consulta su saldo en 3 toques o menos sin ayuda, contraste WCAG AA); Seguridad (la operaria de acopio no ve datos financieros, con un caso de prueba por rol).' },
  { id: 'pc6', respuesta: 'La más fuerte: la titularidad (S8). Si se asume que el código es de la cooperativa y no lo es, hay conflictos legales al licenciarlo a la Gobernación. También aceptables si se argumentan bien: S1 (300 usuarios cambia el servidor y el costo) o S6 (factura electrónica DIAN agrega un módulo grande con proveedor tecnológico). Se califica el argumento, no la elección.' }
];

export const ERRORES_FRECUENTES = [
  'Poner "Licencia MIT" para todo el producto porque "casi todas las librerías son MIT", sin notar el conflicto GPL.',
  'Afirmar que la cooperativa es la dueña "porque lo pidió", sin contrato escrito.',
  'Escribir requisitos no funcionales sin número ("rápido", "seguro", "fácil de usar").',
  'Copiar los requerimientos de hardware de la ficha de ejemplo FT-ADSO-2026-01, que es de otro producto.',
  'Olvidar el servidor en el apartado 3 o dejar iOS como "soportado" sin aclarar las limitaciones.',
  'Tratar los datos de los menores igual que los de los adultos.',
  'En el SRS: requisitos dobles ("registrar y liquidar") o sin criterio de aceptación, que no se pueden probar.',
  'En el SRS: escribir el diseño en vez del requisito ("usar PostgreSQL") dentro de los RF; eso es una restricción, no una función.',
  'Copiar los apartados de la ficha y llamarlos SRS: el SRS va antes y con más detalle, la ficha es el resumen del producto.'
];
