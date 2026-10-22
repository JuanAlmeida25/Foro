# Actividad de aprendizaje: Ficha técnica de un producto de software

## Caso "MAREA": la cooperativa que quería dejar el cuaderno

| Campo | Detalle |
|---|---|
| **Programa de formación** | Tecnólogo en Análisis y Desarrollo de Software (ADSO) |
| **Competencia relacionada** | Establecer requisitos de la solución de software de acuerdo con estándares y procedimiento técnico *(el instructor ajusta el código de la competencia según el diseño curricular vigente de la ficha)* |
| **Resultados de aprendizaje** | RA1. Identificar y documentar las características técnicas, funcionales y no funcionales de un producto de software. RA2. Aplicar la normatividad nacional e internacional de calidad, derechos de autor y protección de datos en la documentación del producto. |
| **Duración sugerida** | 6 horas: 1 h de lectura y análisis del caso, 3 h de elaboración de la ficha, 1 h de preguntas de análisis y 1 h de socialización |
| **Modalidad** | Grupos de 2 a 3 aprendices (también se puede hacer de forma individual) |
| **Producto a entregar** | 1) Ficha técnica diligenciada con código `FT-ADSO-2026-XX`. 2) Tabla de supuestos y vacíos de información. 3) Respuestas a las preguntas de análisis. Todo en un solo documento PDF o Markdown, publicado como aporte en el foro. |
| **Material de apoyo** | Módulo "Ficha Técnica" del foro: estructura estándar de 8 apartados, normas internacionales (ISO/IEC 25010, ISO/IEC/IEEE 29148, IEEE 830, ISO/IEC/IEEE 12207, ISO/IEC 25040) y normatividad colombiana (Ley 23 de 1982, Decreto 1360 de 1989, Decisión Andina 351 de 1993, Ley 527 de 1999, Ley 1273 de 2009, Ley 1581 de 2012, NTC-ISO/IEC 25010). |

---

## 1. Propósito de la actividad

En la vida real nadie le entrega al desarrollador una ficha técnica llena. La información llega a pedazos: una conversación con el cliente, un correo con afán, un audio de WhatsApp, unas notas de reunión escritas a la carrera. Su trabajo como analista es **recoger esos pedazos, ordenarlos y detectar lo que falta o se contradice**.

En esta actividad van a elaborar la ficha técnica de un software a partir de un caso. La información necesaria está en el caso, pero **dispersa**. Algunos datos faltan o se contradicen a propósito: deben detectarlos y declararlos como **supuestos**.

> **Nota:** La cooperativa, las personas y dos de las librerías del caso (`balanza-bt-link` e "Iconos Marinos Pro") son **ficticias** y se crearon solo para este ejercicio. Las demás tecnologías y las normas citadas son reales.

---

## 2. El caso

### 2.1 Contexto

La **Cooperativa de Pescadores Artesanales Brisas del Cabo (COOPEBRISAS)** queda en el corregimiento del Cabo de la Vela, municipio de Uribia, La Guajira. Tiene 46 socios activos, casi todos pescadores de lancha, y una oficina pequeña al lado del centro de acopio donde se pesa, se registra y se vende el pescado a los compradores que llegan de Riohacha y Maicao.

Hasta hoy todo se maneja en un cuaderno de tapa dura y una hoja de Excel que solo entiende la contadora. Cada fin de mes se forma el mismo problema: los socios reclaman que les pagaron menos kilos de los que entregaron, los compradores piden factura y nadie sabe cuánto pargo rojo se vendió en el trimestre.

Un grupo de aprendices ADSO del SENA Regional Guajira, que está en su proyecto formativo, aceptó desarrollarles un sistema. Lo bautizaron **MAREA** (*Manejo Administrativo de Registros, Entregas y Abonos*).

### 2.2 Documento 1: Transcripción de la entrevista con el gerente (12 de agosto de 2026)

> **Aprendiz:** Don Efraín, cuéntenos qué necesita.
>
> **Efraín Epieyú (gerente de COOPEBRISAS):** Mire, mijo, lo primero es que cuando llega la lancha, la muchacha del acopio pese el pescado y quede registrado: quién lo trajo, qué especie, cuántos kilos y a qué precio. Ya. Que no haya más pelea. Tenemos una balanza nueva que tiene Bluetooth, la compramos en Barranquilla, a ver si sirve pa' algo.
>
> **Aprendiz:** ¿Y los pescadores también usarían el sistema?
>
> **Efraín:** Sí, que cada socio vea en el celular lo que ha entregado y lo que se le debe. Pero ojo: aquí la señal es malita. En el acopio a veces hay 3G, a veces nada. Eso tiene que funcionar aunque se caiga la señal y después mandar todo cuando vuelva.
>
> **Aprendiz:** ¿Qué celulares tienen los socios?
>
> **Efraín:** De todo. La mayoría son Android baratos, de esos de 2 gigas de memoria. Hay uno que otro con iPhone, pero esos son los hijos, que ya estudian en Riohacha.
>
> **Aprendiz:** ¿Y en la oficina?
>
> **Efraín:** Un computador de escritorio con Windows 10, 4 gigas de RAM, y un portátil viejito de la contadora. La pantalla del escritorio es chiquita, no sé de cuánto será.
>
> **Aprendiz:** ¿Qué más debe hacer el sistema?
>
> **Efraín:** Que saque el reporte del mes pa' pagarle a cada socio, en PDF, que se pueda imprimir. Y unas gráficas de qué especies se venden más, eso lo pide la Gobernación cuando uno va a pedir apoyo. Ah, y que diga en un mapa en qué zona pescó cada lancha, porque la Autoridad de Pesca a veces pregunta.
>
> **Aprendiz:** ¿Cuántas personas usarían el sistema al mismo tiempo?
>
> **Efraín:** Uff, en temporada de pargo entra todo el mundo a la vez. Somos 46 socios, pero con los ayudantes y los compradores puede que lleguen a 300 personas mirando.
>
> **Aprendiz:** Y una cosa importante: ¿el programa sería de la cooperativa?
>
> **Efraín:** ¡Claro! Eso es nuestro. Nadie más lo puede tener. Si otra cooperativa lo quiere, que nos lo compre a nosotros.

### 2.3 Documento 2: Correo de la contadora (19 de agosto de 2026)

> **De:** Yoleida Pushaina — contabilidad@coopebrisas.example
> **Para:** Equipo MAREA
> **Asunto:** Lo que les faltó preguntar
>
> Buenas tardes, muchachos:
>
> Don Efraín se emociona y se le olvidan cosas. Les cuento lo que yo necesito:
>
> 1. Que cada socio tenga su ficha con cédula, teléfono, dirección, número de cuenta en Bancamía o Nequi, y los datos de los beneficiarios del fondo de solidaridad. Ahí van los hijos menores de edad, con su registro civil y el nombre del colegio.
> 2. Que yo pueda registrar los abonos y los anticipos que se les dan a los socios, para descontarlos en la liquidación del mes.
> 3. Que el sistema tenga usuarios distintos: el gerente ve todo, yo veo la plata, la del acopio solo registra pesajes y el socio solo ve lo suyo.
> 4. El reporte del mes lo necesito máximo en 10 segundos, porque cuando lo saco hay fila de socios esperando.
> 5. Los compradores piden comprobante de compra. No sé si eso tiene que ser factura electrónica de la DIAN; eso lo tengo que consultar con el revisor fiscal.
> 6. Y por favor, que nadie pueda borrar un pesaje. Si se equivocan, que quede anulado pero que se vea.
>
> Ah, y me comentó don Efraín que ustedes le iban a dar soporte por seis meses después de entregarlo. ¿Eso es así?
>
> Gracias,
> Yoleida

### 2.4 Documento 3: Notas de la reunión técnica del equipo de aprendices (26 de agosto de 2026)

*Notas tomadas por Dayana en el tablero y pasadas a limpio:*

- **Stack acordado:**
  - Frontend: Vue 3 + Vite, como PWA (aplicación web instalable que funciona sin conexión). Se empaqueta para Android con Capacitor 6 (licencia MIT).
  - Almacenamiento sin conexión en el celular: Dexie.js (Apache 2.0) sobre IndexedDB.
  - Backend: Node.js 20 LTS + Express (MIT), API REST.
  - Base de datos: PostgreSQL 16 (PostgreSQL License, permisiva).
  - Autenticación con JWT y contraseñas cifradas con bcrypt (MIT).
- **Librerías:**
  - Chart.js (MIT) para las gráficas.
  - jsPDF (MIT) para los reportes en PDF.
  - Leaflet (BSD-2-Clause) para el mapa de zonas de pesca.
  - **`balanza-bt-link` v2.3 (GPL v3)**: es la única librería que encontramos que lee la balanza Bluetooth de la cooperativa. Va dentro del APK de Android que se le instala a la muchacha del acopio y también a los socios (todos usan el mismo APK).
  - **"Iconos Marinos Pro"**: paquete de íconos de peces descargado de un sitio web, con licencia **CC BY-NC 4.0** (Creative Commons Atribución–No Comercial). Están bonitos y ya los pusimos en toda la interfaz.
- **Servidor:** no está definido. Don Efraín dijo que "el sobrino sabe de eso". Tocará preguntar si es un VPS, un hosting compartido o un computador en la oficina.
- **Seguridad:** HTTPS obligatorio. Bloqueo de cuenta después de 5 intentos fallidos. Copia de seguridad de la base de datos todas las noches.
- **Rendimiento:** registrar un pesaje no puede demorar más de 3 segundos en el celular, aunque no haya señal (se guarda local y se sincroniza después).
- **Usabilidad:** letras grandes y botones grandes. Varios socios mayores no leen bien. Toda la interfaz en español; se habló de poner también wayuunaiki, pero quedó pendiente.
- **Versión:** la entrega del 30 de noviembre será la primera versión estable. Antes de eso hubo una versión de prueba para el acopio.
- **Garantía:** el instructor dice que el soporte después de la entrega lo debe definir el contrato. Jhon cree que se dijo un año, no seis meses.
- **Pendiente:** nadie ha firmado nada con la cooperativa. Solo hay un acta de inicio del proyecto formativo, firmada por el instructor y el gerente, que dice "desarrollo de un sistema de información para COOPEBRISAS". No menciona derechos de autor.

### 2.5 Documento 4: Audio de WhatsApp de don Efraín (transcrito, 2 de septiembre de 2026)

> "Muchachos, buenas. Una cosita: la Gobernación nos dijo que si el sistema sirve, de pronto lo quieren pasar a las otras cooperativas de pescadores de la Alta Guajira, que son como once. Pero eso sí, que el nombre de COOPEBRISAS quede ahí, y si es posible que nos paguen algo. Ah, y la Autoridad de Pesca quiere que el reporte de zonas le llegue directo, ¿eso se puede conectar? Bueno, ustedes verán. Gracias, que Dios me los bendiga."

### 2.6 Datos del equipo de desarrollo

- **Aprendices:** Dayana Ipuana Gómez, Jhon Fredy Bermúdez Uriana y Luis Ángel Fince Ortiz.
- **Ficha ADSO:** 2901457 *(ficticia)*.
- **Instructor líder:** Ing. Martha Cotes.
- **Centro de formación:** Centro Industrial y de Energías Alternativas, SENA Regional Guajira.

---

## 3. Instrucciones para el aprendiz

Sigan los pasos en orden. No se salten el paso 2: es el que diferencia a un analista de un digitador.

1. **Lectura individual (20 min).** Cada integrante lee el caso completo y subraya con colores distintos: datos técnicos (hardware y software), datos funcionales (lo que hace el sistema), datos de calidad (tiempos, seguridad, usabilidad), datos legales (licencias, autoría, datos personales) y datos de soporte.
2. **Cacería de vacíos y contradicciones (40 min).** En grupo, armen una tabla con lo que **falta**, lo que **se contradice** o lo que **está ambiguo**. Para cada caso escriban el supuesto que van a asumir y la pregunta que le harían al cliente. Formato:

   | # | Vacío o contradicción | Documento donde aparece | Supuesto asumido | Pregunta pendiente para el cliente |
   |---|---|---|---|---|

   *Pista: hay al menos 6. Revisen usuarios concurrentes, servidor, garantía, resolución de pantalla, iOS, versión, factura electrónica, idioma y titularidad del código.*
3. **Clasificación por apartados (30 min).** Ubiquen cada dato subrayado en uno de los 8 apartados de la ficha. Si un dato sirve para dos apartados, úsenlo en ambos.
4. **Auditoría de licencias (30 min).** Hagan una tabla con cada librería y herramienta del stack: nombre, versión, licencia, tipo (permisiva, copyleft o restrictiva), dónde se usa y si es compatible con el modelo de licencia que el cliente quiere. Marquen en rojo las que generen conflicto y propongan una solución.
5. **Diligenciamiento de la plantilla (2 h).** Llenen la plantilla de la sección 4. Reglas:
   - Asignen su propio código de ficha: `FT-ADSO-2026-` seguido del número de su grupo.
   - Usen versionamiento semántico (SemVer: `MAYOR.MENOR.PARCHE`). Justifiquen el número que elijan.
   - Todo requisito no funcional debe ser **medible** (un número, una unidad, una condición). "El sistema debe ser rápido" no vale; "el registro de un pesaje se guarda en menos de 3 s sin conexión" sí vale.
   - Cada requisito de calidad debe indicar la característica de ISO/IEC 25010 a la que pertenece.
   - Donde usen un supuesto, márquenlo con **[S#]** y remitan a la tabla del paso 2.
6. **Preguntas de análisis (40 min).** Respondan las preguntas de la sección 5 con argumentos y citando la norma correspondiente.
7. **Entrega y socialización (1 h).** Publiquen el documento como aporte en el foro. En la socialización cada grupo presenta en 5 minutos su solución al dilema de licencias y su supuesto más arriesgado.

---

## 4. Plantilla de la ficha técnica (para diligenciar)

> **SERVICIO NACIONAL DE APRENDIZAJE – SENA**
> **FICHA TÉCNICA DE PRODUCTO DE SOFTWARE**
> Programa ADSO • Actividad Caso MAREA

| Código | Versión del documento | Estado | Fecha de emisión |
|---|---|---|---|
| FT-ADSO-2026-__ | | ☐ Borrador ☐ En revisión ☐ Liberado | |

### Apartado 1. Identificación y Control del Producto

| Campo | Respuesta |
|---|---|
| Nombre del software | |
| Acrónimo y significado | |
| Versión del software (SemVer) y justificación | |
| Tipo de aplicativo | |
| Autores (nombres completos) | |
| Número de ficha ADSO | |
| Instructor y centro de formación | |
| Fecha de emisión | |
| Fecha de última modificación | |
| Organización cliente (nombre, ubicación) | |
| Persona de contacto del cliente | |

### Apartado 2. Descripción General y Alcance

| Campo | Respuesta |
|---|---|
| Resumen descriptivo del sistema (máx. 5 líneas) | |
| Problema que resuelve | |
| Objetivo general | |
| Objetivos específicos (mínimo 4) | 1. <br> 2. <br> 3. <br> 4. |
| Usuarios y roles (perfil de cada uno) | |
| Alcance: qué SÍ incluye esta versión | |
| Límites y exclusiones explícitas: qué NO incluye | |

### Apartado 3. Requerimientos de Hardware

| Componente | Elemento | Mínimo | Recomendado |
|---|---|---|---|
| Dispositivo móvil (acopio y socios) | Arquitectura | | |
| | Memoria RAM | | |
| | Almacenamiento libre | | |
| | Pantalla / resolución | | |
| | Otros (Bluetooth, GPS) | | |
| Equipo de oficina | Arquitectura | | |
| | Memoria RAM | | |
| | Almacenamiento libre | | |
| | Resolución de pantalla | | |
| Servidor | CPU / RAM / disco | | |
| Red | Velocidad y tipo de conexión | | |

### Apartado 4. Requerimientos de Software y Plataforma

| Campo | Respuesta |
|---|---|
| Sistemas operativos soportados (con versión mínima) | |
| Navegadores compatibles (con versión mínima) | |
| Entorno de ejecución del backend | |
| Motor de base de datos | |
| Frameworks y herramientas de construcción | |
| Librerías de terceros (nombre, versión, licencia) | |
| Plataformas NO soportadas en esta versión | |

### Apartado 5. Módulos y Características Funcionales

| # | Módulo | Funcionalidades principales | Rol(es) que lo usan |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |
| 6 | | | |
| 7 | | | |

### Apartado 6. Criterios de Calidad y Requisitos No Funcionales (ISO/IEC 25010)

| Código | Requisito no funcional (medible) | Característica ISO/IEC 25010 | Cómo se verifica |
|---|---|---|---|
| RNF-01 | | | |
| RNF-02 | | | |
| RNF-03 | | | |
| RNF-04 | | | |
| RNF-05 | | | |
| RNF-06 | | | |

**Tratamiento de datos personales (Ley 1581 de 2012):**

| Campo | Respuesta |
|---|---|
| Datos personales que recoge el sistema | |
| Datos sensibles o de menores de edad | |
| Responsable y encargado del tratamiento | |
| Mecanismo de autorización del titular | |
| Medidas de seguridad aplicadas | |

### Apartado 7. Modelo de Licenciamiento y Propiedad Intelectual

| Campo | Respuesta |
|---|---|
| Tipo de licencia del producto | |
| Titular de los derechos morales (y fundamento legal) | |
| Titular de los derechos patrimoniales (y fundamento legal) | |
| Redistribución con fines comerciales: ¿permitida o prohibida? | |
| Registro ante la DNDA (Decreto 1360 de 1989) | |

**Auditoría de licencias de terceros:**

| Librería / recurso | Licencia | Tipo | ¿Compatible con el modelo elegido? | Acción |
|---|---|---|---|---|
| | | | | |
| | | | | |
| | | | | |

### Apartado 8. Soporte, Mantenimiento y Garantía

| Campo | Respuesta |
|---|---|
| Canales de soporte y reporte de incidentes | |
| Periodo de garantía técnica | |
| Qué cubre y qué no cubre la garantía | |
| Tiempos de respuesta según severidad | |
| Política de parches y versiones (SemVer) | |
| Manuales disponibles | |

### Firmas

| Elaboró (aprendices) | Revisó (instructor) | Aprobó (cliente) |
|---|---|---|
| | | |

---

## 5. Preguntas de análisis

Respondan cada pregunta en máximo 10 líneas, con argumentos y citando la norma que aplica.

1. **Dilema GPL.** La librería `balanza-bt-link` tiene licencia GPL v3 y va dentro del APK que se instala en los celulares de los socios. Don Efraín quiere que el software sea "solo de la cooperativa" (propietario). ¿Es posible cumplir ambas cosas? Propongan **al menos tres alternativas** y digan cuál recomiendan y por qué.
2. **¿De quién es el código?** Según la Ley 23 de 1982 y la Decisión Andina 351 de 1993, ¿quién es el titular de los derechos morales y quién de los derechos patrimoniales de MAREA? Tengan en cuenta que no hay contrato firmado y que el acta de inicio no menciona derechos de autor. ¿Qué documento recomiendan firmar antes de la entrega y qué debería decir?
3. **Íconos "No Comercial".** La cooperativa vende pescado y la Gobernación podría pagar por llevar el sistema a otras once cooperativas. ¿Pueden seguir usando "Iconos Marinos Pro" (CC BY-NC 4.0)? Justifiquen y propongan una solución.
4. **Datos de menores.** El correo de la contadora pide guardar datos de los hijos menores de edad de los socios (registro civil y colegio). ¿Qué exige la Ley 1581 de 2012 para tratar esos datos? ¿Son todos estrictamente necesarios para el objetivo del sistema? ¿Qué recomendarían?
5. **Calidad medible.** Escojan tres características de ISO/IEC 25010 que consideren críticas para MAREA, considerando la señal 3G intermitente, los celulares de 2 GB de RAM y los socios mayores. Para cada una, escriban un requisito medible y digan cómo lo probarían.
6. **Supuestos.** De todos los vacíos que encontraron, ¿cuál es el más riesgoso para el proyecto si el supuesto resulta equivocado? Expliquen el impacto en costo, tiempo o en el aspecto legal.

---

## 6. Rúbrica de evaluación

Puntaje total: **100 puntos**. Aprobado: **70 puntos o más**.

| Criterio | Excelente | Bueno | Básico | Insuficiente | Puntos |
|---|---|---|---|---|---|
| **1. Identificación y alcance (apartados 1 y 2)** | Todos los campos completos, SemVer justificado, objetivos medibles y exclusiones explícitas (10) | Campos completos, con objetivos poco precisos o sin exclusiones claras (7) | Faltan 2 o 3 campos o el alcance es confuso (4) | Apartados incompletos o copiados del ejemplo (0-2) | /10 |
| **2. Requerimientos técnicos (apartados 3 y 4)** | Distingue mínimo y recomendado para móvil, oficina y servidor; versiones mínimas y plataformas no soportadas (15) | Completo, pero sin distinguir mínimo y recomendado en algún componente (11) | Solo cubre un tipo de dispositivo o le faltan versiones (6) | Datos inventados o contradictorios con el caso (0-3) | /15 |
| **3. Módulos funcionales (apartado 5)** | Identifica 7 o más módulos coherentes con roles, incluyendo sincronización sin conexión y anulación sin borrado (10) | De 5 a 6 módulos coherentes (7) | Menos de 5 módulos o sin relación con roles (4) | Lista genérica que no corresponde al caso (0-2) | /10 |
| **4. Calidad y datos personales (apartado 6)** | 6 o más RNF medibles, bien clasificados en ISO/IEC 25010 y con forma de verificarlos; tratamiento de datos personales completo, con datos de menores (15) | RNF medibles pero con alguna clasificación errada; datos personales parciales (11) | RNF no medibles o sin clasificar (6) | Sin RNF o sin análisis de datos personales (0-3) | /15 |
| **5. Licenciamiento y propiedad intelectual (apartado 7)** | Auditoría completa de licencias, detecta conflictos GPL y CC BY-NC, propone una solución viable y analiza la titularidad con fundamento legal (20) | Detecta un solo conflicto o la titularidad está poco fundamentada (14) | Lista licencias sin analizar compatibilidad (8) | Sin auditoría o con conclusiones legales erradas (0-4) | /20 |
| **6. Soporte y garantía (apartado 8)** | Resuelve la contradicción de 6 meses frente a 1 año con un supuesto declarado; define cobertura, tiempos por severidad y política de versiones (5) | Completo pero sin tiempos por severidad (4) | Solo menciona el periodo (2) | Vacío (0) | /5 |
| **7. Tabla de supuestos** | 6 o más vacíos o contradicciones bien identificados, con supuesto y pregunta al cliente; supuestos marcados [S#] en la ficha (15) | De 4 a 5 vacíos bien tratados (11) | De 2 a 3 vacíos (6) | Ninguno o inventados (0-3) | /15 |
| **8. Preguntas de análisis y presentación** | Respuestas argumentadas con normas citadas correctamente; documento ordenado y sin errores de ortografía (10) | Argumentadas, con alguna norma mal citada (7) | Respuestas superficiales (4) | Sin responder o copiadas (0-2) | /10 |
| | | | | | **/100** |

---

## 7. Solucionario para el instructor

> Esta sección es solo para el instructor. Retírela antes de compartir la guía con los aprendices.

### 7.1 Vacíos y contradicciones sembrados en el caso

| # | Vacío o contradicción | Dónde | Supuesto razonable esperado |
|---|---|---|---|
| S1 | **Usuarios concurrentes:** 46 socios frente a "hasta 300 personas mirando" | Entrevista | Diseñar para 300 usuarios concurrentes en temporada alta (escenario pesimista) y confirmar con el cliente. |
| S2 | **Servidor no definido** ("el sobrino sabe") | Notas técnicas | VPS Linux en la nube con 2 vCPU, 4 GB de RAM y 40 GB SSD. Se descarta el PC de la oficina por la conectividad y la disponibilidad. |
| S3 | **Garantía:** 6 meses (gerente y contadora) frente a 1 año (Jhon) | Correo y notas | Se asumen 6 meses porque lo dicen dos fuentes del cliente; debe quedar en el contrato. |
| S4 | **Resolución de pantalla** de la oficina desconocida | Entrevista | Mínimo 1366×768 (común en equipos de ese rango). |
| S5 | **iOS:** hay usuarios con iPhone, pero el APK es solo Android | Entrevista y notas | iOS no se soporta como app nativa en la v1.0.0; los usuarios de iPhone usan la PWA desde Safari, sin lectura de balanza. |
| S6 | **Factura electrónica DIAN** por definir | Correo | Fuera del alcance de la v1.0.0: el sistema emite un "comprobante interno de compra" que no es factura. |
| S7 | **Wayuunaiki** pendiente | Notas | Solo español en la v1.0.0; la arquitectura queda preparada para varios idiomas (i18n). |
| S8 | **Titularidad:** no hay contrato; el acta no menciona derechos | Notas y entrevista | Ver la respuesta de la pregunta 2. Es el vacío más riesgoso. |
| S9 | **Integración con la Autoridad de Pesca** ("¿eso se puede conectar?") | Audio | Fuera del alcance: solo se exporta el reporte de zonas en PDF o CSV. |
| S10 | **Versión:** hubo una versión de prueba antes | Notas | La versión de prueba fue `0.x` (por ejemplo, `0.9.0`); la entrega del 30 de noviembre es la `1.0.0`. |

### 7.2 Ficha técnica resuelta (resumen)

| Código | Versión del documento | Estado | Fecha de emisión |
|---|---|---|---|
| FT-ADSO-2026-07 | 1.0 | En revisión | 30/11/2026 |

**1. Identificación y Control del Producto**
- **Nombre:** MAREA – Manejo Administrativo de Registros, Entregas y Abonos.
- **Versión:** 1.0.0. Es la primera versión estable con API pública; la versión de prueba fue 0.9.0 [S10].
- **Tipo:** PWA (Vue 3) + app Android con Capacitor + API REST (Node.js/Express) + PostgreSQL.
- **Autores:** Dayana Ipuana Gómez, Jhon Fredy Bermúdez Uriana y Luis Ángel Fince Ortiz. Ficha ADSO 2901457. Instructora: Ing. Martha Cotes. Centro Industrial y de Energías Alternativas, SENA Regional Guajira.
- **Fechas:** inicio el 12/08/2026; emisión el 30/11/2026.
- **Cliente:** COOPEBRISAS, Cabo de la Vela, Uribia (La Guajira). Contacto: Efraín Epieyú (gerente).

**2. Descripción General y Alcance**
- **Resumen:** sistema para registrar pesajes de pesca artesanal con o sin conexión, liquidar pagos mensuales a los socios, controlar abonos y anticipos, y generar reportes estadísticos y de zonas de pesca.
- **Objetivo general:** sistematizar el registro de entregas y la liquidación de pagos de COOPEBRISAS para dar trazabilidad y transparencia a socios y compradores.
- **Objetivos específicos:** (1) registrar pesajes leyendo la balanza Bluetooth, también sin conexión; (2) liquidar pagos mensuales descontando abonos y anticipos; (3) permitir que cada socio consulte su historial desde el celular; (4) generar reportes PDF y gráficas por especie; (5) georreferenciar las zonas de pesca.
- **Usuarios y roles:** gerente (consulta todo), contadora (finanzas y liquidación), operaria de acopio (solo pesajes), socio (solo consulta lo suyo) y administrador técnico.
- **Exclusiones:** facturación electrónica DIAN [S6], integración directa con la Autoridad de Pesca [S9], app nativa iOS [S5], idioma wayuunaiki [S7] y despliegue multi-cooperativa.

**3. Requerimientos de Hardware**

| Componente | Mínimo | Recomendado |
|---|---|---|
| Celular | ARM64, 2 GB de RAM, 200 MB libres, pantalla de 5", Bluetooth 4.0 y GPS | 3 GB de RAM y 500 MB libres |
| PC de oficina | x64, 4 GB de RAM, 500 MB libres, 1366×768 [S4] | 8 GB de RAM y 1920×1080 |
| Servidor [S2] | 2 vCPU, 4 GB de RAM y 40 GB SSD | 4 vCPU, 8 GB de RAM y 80 GB SSD |
| Red | 3G intermitente (modo sin conexión); sincronización con 1 Mbps o más | 4G o banda ancha en la oficina |

**4. Requerimientos de Software y Plataforma**
- **Sistemas operativos:** Android 9 o superior (APK); Windows 10 o superior en la oficina (navegador); servidor Linux (Ubuntu 24.04 LTS).
- **Navegadores:** Chrome 110+, Edge 110+, Firefox 115+ y Safari 16+ (este último solo como PWA, sin balanza) [S5].
- **Backend:** Node.js 20 LTS y Express. **Base de datos:** PostgreSQL 16. **Base de datos local en el celular:** IndexedDB a través de Dexie.js.
- **Librerías:** Capacitor 6 (MIT), Dexie.js (Apache 2.0), Express (MIT), bcrypt (MIT), Chart.js (MIT), jsPDF (MIT), Leaflet (BSD-2-Clause) y `balanza-bt-link` (GPL v3, ver apartado 7).
- **No soportado:** iOS nativo, Windows 7 e Internet Explorer.

**5. Módulos Funcionales**
1. **Autenticación y roles:** inicio de sesión con JWT, 5 roles y bloqueo tras 5 intentos fallidos.
2. **Socios y beneficiarios:** registro de socios con datos personales y autorización de tratamiento.
3. **Pesajes:** captura desde la balanza Bluetooth, especie, kilos, precio y zona GPS. Los registros se anulan, nunca se borran.
4. **Sincronización sin conexión:** cola local en Dexie que se sincroniza al volver la señal y resuelve conflictos.
5. **Finanzas:** abonos, anticipos y liquidación mensual.
6. **Reportes:** liquidación en PDF, gráficas por especie, comprobante interno de compra y exportación CSV.
7. **Mapa de zonas:** visualización con Leaflet de las zonas de pesca por lancha.
8. **Auditoría:** bitácora de quién hizo qué y cuándo.

**6. Calidad y Requisitos No Funcionales**

| Código | Requisito | ISO/IEC 25010 |
|---|---|---|
| RNF-01 | Guardar un pesaje en menos de 3 s en un celular de 2 GB de RAM, aun sin conexión | Eficiencia de desempeño |
| RNF-02 | Generar la liquidación mensual en PDF en menos de 10 s | Eficiencia de desempeño |
| RNF-03 | Soportar 300 usuarios concurrentes con un tiempo de respuesta p95 menor de 2 s [S1] | Eficiencia de desempeño (capacidad) |
| RNF-04 | HTTPS (TLS 1.2 o superior), contraseñas con bcrypt, bloqueo tras 5 intentos y control de acceso por rol | Seguridad |
| RNF-05 | Ningún pesaje se elimina; las anulaciones quedan en la bitácora | Seguridad (no repudio y responsabilidad) |
| RNF-06 | 0 % de pérdida de pesajes registrados sin conexión al sincronizar; respaldo nocturno con retención de 30 días | Fiabilidad (tolerancia a fallos y recuperabilidad) |
| RNF-07 | Texto base de 18 px o más, botones de 48×48 px o más y contraste WCAG 2.1 AA | Usabilidad (accesibilidad) |

- **Ley 1581 de 2012:** COOPEBRISAS es la responsable del tratamiento y el equipo o proveedor del servidor es el encargado. Se requiere autorización previa, expresa e informada de cada socio, política de tratamiento publicada y medidas de seguridad. Los datos bancarios se cifran. Los datos de menores de edad solo se tratan si responden al interés superior del menor y con autorización de su representante legal. Se recomienda minimizarlos: guardar solo el nombre y el parentesco del beneficiario y eliminar el colegio y el registro civil, salvo que el fondo los exija por estatuto.

**7. Licenciamiento y Propiedad Intelectual (respuesta esperada)**
- **Licencia recomendada:** licencia propietaria de uso para COOPEBRISAS, **siempre que** se reemplace `balanza-bt-link` (ver la pregunta 1) y los íconos CC BY-NC.
- **Derechos morales:** pertenecen a los tres aprendices. Son irrenunciables e inalienables (Ley 23 de 1982 y art. 11 de la Decisión Andina 351).
- **Derechos patrimoniales:** sin contrato escrito de cesión u obra por encargo, **no se puede presumir** que pertenecen a la cooperativa. Hay que firmar un documento antes de la entrega (pregunta 2).
- **Registro:** se recomienda registrar el soporte lógico ante la DNDA (Decreto 1360 de 1989). El registro es declarativo, no constitutivo, pero sirve como prueba.

| Recurso | Licencia | ¿Compatible con propietario? | Acción |
|---|---|---|---|
| Vue, Vite, Capacitor, Express, bcrypt, Chart.js, jsPDF | MIT | Sí | Conservar los avisos de copyright |
| Dexie.js | Apache 2.0 | Sí | Conservar el archivo NOTICE |
| Leaflet | BSD-2-Clause | Sí | Conservar el aviso |
| PostgreSQL | PostgreSQL License | Sí | Ninguna |
| `balanza-bt-link` | GPL v3 | **No**, porque se distribuye dentro del APK | Reemplazar o aislar (ver la pregunta 1) |
| Iconos Marinos Pro | CC BY-NC 4.0 | **No** es apto para uso comercial o redistribución pagada | Reemplazar por íconos con licencia permisiva o propios |

**8. Soporte y Garantía**
- **Garantía:** 6 meses desde la entrega [S3]. Cubre defectos de funcionamiento frente a esta ficha. No cubre cambios de alcance, daños del servidor de terceros ni modificaciones hechas por otras personas.
- **Canales:** formulario de incidentes dentro del sistema, correo y WhatsApp del equipo.
- **Severidad:** crítica (no se puede pesar ni liquidar), respuesta en 24 h; media, 72 h; baja, en la siguiente versión de mantenimiento.
- **Versiones:** PARCHE (1.0.x) para correcciones, MENOR (1.x.0) para funciones compatibles y MAYOR (2.0.0) para cambios incompatibles, como la versión multi-cooperativa.
- **Manuales:** manual de usuario por rol (con capturas, en lenguaje sencillo), manual técnico de instalación y despliegue, y documentación de la API.
- **Recomendación:** como los aprendices terminan su etapa formativa, hay que dejar definido quién da el soporte después (cooperativa, SENA o un tercero) y entregar el código fuente con la documentación.

### 7.3 Respuestas esperadas a las preguntas de análisis

**Pregunta 1. Dilema GPL.**
La GPL v3 es una licencia *copyleft*: si se **distribuye** una obra que incorpora o enlaza código GPL, la obra completa debe distribuirse bajo GPL v3 (o compatible), con acceso al código fuente para quien la reciba. Aquí el APK se instala en los celulares de los socios, que son personas distintas de la cooperativa, así que hay distribución. Por lo tanto, **no se puede** distribuir MAREA como software propietario cerrado mientras la librería vaya dentro del APK. Alternativas válidas:
- **a)** Reemplazar `balanza-bt-link` por una librería con licencia permisiva (MIT, Apache o BSD) o LGPL usada como enlace dinámico. Si no existe, se escribe un módulo propio usando el protocolo de la balanza, que se obtiene de la documentación del fabricante.
- **b)** Separar las apps: un APK exclusivo del acopio con la librería, de uso interno de la cooperativa, y la app de socios sin ella. *Ojo:* el APK interno sigue siendo GPL si alguna vez se entrega a terceros. Es una solución frágil.
- **c)** Pedir al autor de la librería una **licencia comercial** (licenciamiento dual), si la ofrece.
- **d)** Aceptar el modelo libre: publicar MAREA bajo GPL v3. Esto choca con el deseo del cliente, pero es coherente con la idea de llevarlo a otras once cooperativas.

*Respuesta recomendada:* la **a**, por ser la más limpia jurídicamente, o la **d** si el cliente acepta. Se valora que el aprendiz note que el argumento de "es de uso interno" no aplica cuando el APK llega a los socios.

**Pregunta 2. Titularidad.**
- Los **derechos morales** (paternidad e integridad) pertenecen siempre a los autores, que son personas naturales: los tres aprendices. Son irrenunciables (Ley 23 de 1982; Decisión Andina 351, art. 11).
- Los **derechos patrimoniales** (reproducción, distribución, transformación) se pueden transferir, pero la transferencia debe constar **por escrito** (Decisión Andina 351, arts. 30-31; Ley 23 de 1982, art. 20, modificado por la Ley 1450 de 2011, art. 28, que presume la transferencia al encargante en la obra por encargo **siempre que haya contrato escrito**). Aquí no hay contrato y el acta no menciona derechos, por lo que **no hay base para afirmar que COOPEBRISAS es la titular**.
- Además, como es un proyecto formativo, se debe revisar el reglamento de propiedad intelectual **vigente del SENA**, que puede reconocer derechos a la institución.
- **Recomendación:** antes de la entrega, firmar un contrato o acuerdo de cesión de derechos patrimoniales (o una licencia de uso exclusiva) entre los aprendices, el SENA (si aplica) y COOPEBRISAS. Debe definir el alcance, el territorio, el tiempo, la remuneración (puede ser gratuita), el reconocimiento de autoría y quién puede licenciarlo a las otras cooperativas.

**Pregunta 3. Íconos CC BY-NC 4.0.**
La cláusula NC prohíbe usos "principalmente orientados a obtener ventaja comercial o compensación monetaria". Usar los íconos en una herramienta interna de una cooperativa es zona gris. Pero venderle o licenciarle el sistema a la Gobernación o a otras cooperativas **sí** es uso comercial. *Solución esperada:* reemplazarlos por íconos con licencia permisiva o diseñar íconos propios; otra opción es pedir permiso o una licencia comercial al autor. También se debe cumplir la atribución (BY) mientras se usen.

**Pregunta 4. Datos de menores (Ley 1581 de 2012).**
El art. 7 prohíbe tratar datos de niños, niñas y adolescentes, salvo los de naturaleza pública. La Corte Constitucional (Sentencia C-748 de 2011) y el Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015) lo matizaron: se permite si responde al interés superior del menor, asegura sus derechos fundamentales y cuenta con autorización del representante legal. También aplican los principios de **finalidad y necesidad**: el colegio y el registro civil no son necesarios para liquidar pagos de pesca. *Respuesta esperada:* guardar solo el mínimo (nombre y parentesco) para el fondo de solidaridad, con autorización expresa del padre o madre, acceso restringido a la contadora y una política de tratamiento. Eliminar los demás campos o justificarlos con el estatuto del fondo.

**Pregunta 5. Calidad medible.** Respuestas válidas (cualquiera de estas, bien justificada):
- **Fiabilidad:** 0 pesajes perdidos al sincronizar 100 registros hechos sin conexión. Se prueba en modo avión y luego se restablece la red.
- **Eficiencia de desempeño:** registro de un pesaje en menos de 3 s en un equipo de 2 GB de RAM y liquidación en menos de 10 s. Se prueba con cronómetro, Lighthouse o pruebas de carga.
- **Usabilidad:** un socio mayor de 60 años consulta su saldo en 3 toques o menos sin ayuda; contraste WCAG AA. Se prueba con usuarios reales y con un validador de contraste.
- **Seguridad:** una operaria de acopio no puede ver los datos financieros. Se prueba con un caso de prueba por rol.

**Pregunta 6. Supuesto más riesgoso.**
Respuesta más fuerte: **la titularidad (S8)**. Si se asume que el código es de la cooperativa y no lo es, pueden surgir conflictos legales al licenciarlo a la Gobernación, y la cooperativa podría perder la posibilidad de venderlo. Otras respuestas aceptables, si están bien argumentadas: **S1** (si son 300 usuarios y no 46, cambia el dimensionamiento del servidor y el costo) o **S6** (si la DIAN exige factura electrónica, se agrega un módulo grande con un proveedor tecnológico). Se califica la calidad del argumento sobre impacto en costo, tiempo y aspecto legal, no la elección en sí.

### 7.4 Errores frecuentes a vigilar

- Poner "Licencia MIT" para todo el producto porque "casi todas las librerías son MIT", sin notar el conflicto GPL.
- Afirmar que la cooperativa es la dueña "porque lo pidió", sin contrato escrito.
- Escribir requisitos no funcionales sin número ("rápido", "seguro", "fácil de usar").
- Copiar los requerimientos de hardware de la ficha de ejemplo FT-ADSO-2026-01, que corresponde a otro producto.
- Olvidar el servidor en el apartado 3 o dejar iOS como "soportado" sin aclarar las limitaciones.
- Tratar los datos de los menores igual que los de los adultos.

> **Nota legal para el instructor:** las referencias normativas de este solucionario sirven como orientación pedagógica. Antes de usar la guía, verifique la vigencia de las normas y del reglamento interno de propiedad intelectual del SENA.
