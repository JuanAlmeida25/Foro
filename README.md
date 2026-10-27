# Foro: Licenciamiento de Software

Aplicación web colaborativa desarrollada en **Vue 3**, **Vite**, **Express** y **PostgreSQL / SQLite** que permite a aprendices e instructores redactar, publicar, calificar y debatir aportes y réplicas en el foro temático de *Licenciamiento de Software* (SENA - ADSO).

---

## 🌟 Control de Usuarios, Autorización y Calificación

### 1. Cuenta de Aprendiz (traída del proyecto Razonar)
- **Registro una sola vez** en **👤 Mi cuenta**: nombre, tipo y número de documento, ficha y un PIN de 4 números. El PIN se guarda cifrado: ni el administrador lo puede ver.
- **Obligatoria para publicar y replicar**: el aporte y la réplica salen con el nombre y la ficha de la cuenta, así nadie publica con el nombre de otro. Leer el foro no pide cuenta.
- **Editar y eliminar lo propio** con la sesión abierta, sin clave. Los aportes de antes de las cuentas se siguen editando con su clave de autor.
- **Firma**: el aprendiz se firma una sola vez con el dedo o el mouse; esa firma sale en la planilla de asistencia.
- **Bloqueo**: 3 PIN malos y la cuenta queda bloqueada 15 minutos. Si se le olvidó, el profe le da un **PIN nuevo** desde el Panel del Profe → 👥 Aprendices.
- **Sesión**: dura 6 horas y se cierra al cerrar la pestaña (pensado para el PC del salón). Si el profe le reinicia el PIN, sus sesiones abiertas se cierran solas.

### Asistencia (Panel del Profe → ✅ Asistencia)
- El profe llena el encabezado (ficha, programa, código del centro y **fechas de inicio y fin de la ficha**) y marca con checkboxes quién vino cada día, de lunes a viernes.
- **🖨️ Planilla**: sale con el formato de asistencia del SENA (2 semanas por hoja) y la firma de cada aprendiz en los días que vino. En el cuadro de imprimir se escoge «Guardar como PDF».
- Regional Guajira (44), Centro Agroempresarial y Acuícola y Fonseca vienen fijos en `src/utils/planillaAsistencia.js`.
- **📲 Asistencia con código del día**: el profe pulsa *Abrir asistencia de hoy* y proyecta un código de 4 letras que cambia cada 3 minutos (se acepta también el anterior). Queda abierta 15 minutos. Cada aprendiz lo escribe en 👤 Mi cuenta y queda marcado en la misma planilla; a los 5 códigos malos se frena. Al que llegue tarde lo marca el profe con el checkbox.

### Seguimiento del aprendiz
- **📒 Mi boletín** (en 👤 Mi cuenta): sus aportes con nota y retroalimentación, réplicas a compañeros, «Útil» recibidos, asistencias y fallas, la evaluación y la nota del Caso MAREA.
- **Semáforo de riesgo** (boletín y Panel del Profe → 👥 Aprendices): 🔴 con 3 o más fallas (se cambia en `FALLAS_ROJO`, `src/utils/semaforo.js`); 🟡 con alguna falla, sin aporte o si salió de la ventana en la evaluación.
- **Evaluación amarrada a la cuenta**: para presentarla hay que entrar con documento y PIN; el nombre y la ficha salen de la cuenta.

### Entrega del Caso MAREA
- En la pestaña **📤 Entrega** del caso, un integrante entrega el SRS y la ficha por todo el grupo (máximo 3) y escoge a sus compañeros por nombre (sus documentos nunca se muestran). Se puede volver a entregar hasta que el profe califique.
- El profe califica en **Panel del Profe → 📤 Entregas MAREA**, criterio por criterio con la rúbrica, y la nota le llega al boletín de todos los integrantes.

### 2. Modo Administrador / Instructor
- **Acceso Directo**: En la barra superior, haz clic en **"🔐 Acceso Admin"** e ingresa la clave de administrador.
- **Clave**: se define con la variable de entorno `ADMIN_KEY` (mínimo 6 caracteres). No hay clave por defecto: si falta o es muy corta, el ingreso de administrador queda cerrado. Solo la conoce el servidor; al ingresar, el navegador recibe una sesión temporal de 8 horas, no la clave.
- **Cambiar la clave**: cambia `ADMIN_KEY` en Vercel (*Settings → Environment Variables*) y vuelve a desplegar. Opcionalmente define `SESSION_SECRET` (un texto largo al azar) para firmar las sesiones; cambiarlo cierra todas las sesiones abiertas.
- **Solucionario del Caso MAREA**: vive en el servidor y solo se entrega con sesión de administrador; ya no viaja en el código del navegador.
- **Edición de cualquier aporte**: Con la sesión activa aparece **"✏️ Editar (Admin)"**. La guía oficial del instructor solo la puede editar el administrador.
- **Calificación y Retroalimentación**:
  - Al abrir cualquier aporte, el Administrador tiene el botón **"⭐ Calificar Aporte"**.
  - Permite ingresar una calificación cuantitativa (de 0 a 100) y retroalimentación pedagógica.
  - La calificación queda visible para todos los aprendices con una insignia de estado (*Aprobado* / *No aprobado*).
- **Moderación Total**:
  - El Administrador puede **eliminar cualquier aporte** del foro sin restricciones.
  - Solo el Administrador puede **eliminar comentarios o réplicas**.
- **Cierre de Sesión**: Botón en la barra superior para salir del modo Administrador en cualquier momento.

### 3. Actividad de Repaso
- Pestaña **"🎯 Actividad de Repaso"** para afianzar los conocimientos antes de publicar en el foro.
- **Etapa 1, Clasifica**: ubicar 10 licencias (MIT, Apache-2.0, GPL-3.0, LGPL-2.1, EULA de Windows, CC0, entre otras) en su familia: permisiva, copyleft fuerte, copyleft débil, propietaria o dominio público. Se puede tocar o arrastrar.
- **Etapa 2, Resuelve casos**: 6 casos prácticos (GPL en un producto cerrado, código sin licencia, software por encargo, instalaciones de más, entre otros). Cada respuesta trae su explicación y, cuando aplica, la norma colombiana: Ley 23 de 1982 (arts. 9 y 20) y art. 271 del Código Penal.
- **Etapa 3, Resultado**: puntaje sobre 16 y lista de lo que conviene repasar. El mejor puntaje se guarda en el navegador (`localStorage`); la actividad no usa la API ni la base de datos.
- Pruebas: `tests/repaso.test.js` valida los datos (una sola respuesta correcta por caso) y la lógica de calificación.

### 4. Página Independiente de Evaluación de Conocimientos (`/evaluacion.html`)
- **Aislamiento Total**: Página completamente desacoplada del foro. No realiza consultas a la API de aportes ni comentarios, no muestra publicaciones, réplicas ni claves de autor.
- **Instrumento Oficial ADSO**: Banco de 20 preguntas ponderadas que abarcan los 5 dominios del proyecto:
  1. *Licenciamiento de Software* (MIT, Apache-2.0, GPL-3.0, AGPL-3.0, LGPL, EULA Propietarias y Dominio Público).
  2. *Marco Jurídico Colombiano* (Ley 23 de 1982, Ley 1450 de 2011, Art. 271 del Código Penal y Ley 1273 de 2009).
  3. *Derechos Morales y Patrimoniales* (Inalienabilidad, paternidad, cesión en obras por encargo y Ley 1581 de 2012).
  4. *Ficha Técnica y Calidad ISO* (Los 8 apartados de la FT-ADSO, RF vs RNF, normas ISO/IEC 25010 e ISO/IEC 12207).
  5. *Casos Prácticos y Arquitectura* (Compatibilidad, código sin licencia en GitHub, arquitectura offline-first en MAREA).
- **Mecánica de Evaluación y Supervisión**:
  - **Examen de 20 Preguntas**: Límite estricto de 1 hora (60:00 min) con cuenta regresiva en vivo.
  - **Bloqueo Anti-cambio de Ventana**: Modo pantalla completa obligatorio y detección de foco/pestaña con advertencias de seguridad (máximo 3 advertencias antes de entrega forzada).
  - **Entrega Confidencial**: El aprendiz no ve la calificación ni las respuestas correctas; al culminar recibe únicamente un comprobante de entrega digital.
  - **Resultados Exclusivos para el Instructor**: Las notas, aciertos, tiempo empleado, advertencias y el desglose pregunta por pregunta se envían al servidor y se consultan exclusivamente desde el **Panel del Profe** (subpestaña *📝 Evaluaciones de Conocimientos*), con opción de exportación a CSV.
- **Ruta de Acceso**: `/evaluacion.html` o desde la pestaña final **"Evaluación"** en la barra superior.

### 5. Orden por Fecha y Hora
- En **"Explorar Foro"**, el selector **"Ordenar por"** organiza los aportes por **más recientes primero** (por defecto), **más antiguos primero** o **editados recientemente**.
- Usa la fecha y hora de publicación (`created_at`) y la de la última edición (`updated_at`). Al pasar el cursor por la fecha de una tarjeta se ve la fecha completa con el año.
- El orden elegido se recuerda en el navegador. Pruebas: `tests/orden.test.js`.

---

## 📁 Estructura del Proyecto

```text
Foro/
├── api/
│   └── index.js             # Entrada de la API en Vercel (usa la misma app de server/app.js)
├── server/
│   ├── app.js               # API REST con Express (sesión admin, calificar, aportes, comentarios)
│   ├── seguridad.js         # Clave de admin, sesión, claves cifradas y límite de intentos
│   ├── index.js             # Arranque local del servidor (puerto 3000)
│   ├── database.js          # Elige Postgres (si hay DATABASE_URL) o SQLite (local)
│   ├── seed.js              # Guía oficial del instructor que se carga en una base vacía
│   ├── db.js                # SQLite (columnas: clave_edicion, calificacion, retroalimentacion)
│   └── foro.db              # Base de datos SQLite local
├── src/
│   ├── main.js              # Punto de entrada de Vue 3
│   ├── App.vue              # Barra superior con login admin, navegación y editor
│   ├── assets/
│   │   └── main.css         # Estilos responsivos, tarjetas de calificación y modales
│   ├── components/
│   │   ├── ForoList.vue     # Cuadrícula con preguntas completas e insignias de calificación
│   │   ├── AporteDetalle.vue# Detalle, modal para calificar (admin) y validación de clave de autor
│   │   ├── ActividadRepaso.vue # Actividad de repaso: clasificar licencias y resolver casos
│   │   └── PreguntaCaso.vue # Un caso de opción múltiple con su explicación
│   ├── services/
│   │   └── api.js           # Cliente fetch con métodos de auth, calificación y CRUD
│   ├── data/
│   │   ├── constants.js     # Metodología de réplicas y constantes
│   │   └── repaso.js        # Familias, licencias y casos de la actividad de repaso
│   └── utils/
│       ├── exporter.js      # Exportación a PDF, MD y TXT
│       ├── text.js          # Formateo de fechas y utilidades de texto
│       ├── repaso.js        # Barajado, calificación y mejor puntaje del repaso
│       └── orden.js         # Orden de los aportes por fecha y hora
├── index.html
├── package.json
├── vercel.json              # Envía /api/* a la API y el resto a la app Vue
├── .env.example             # Variable DATABASE_URL (opcional en local)
└── vite.config.js           # Proxy /api hacia localhost:3000
```

---

## 🚀 Inicio Rápido

Para iniciar tanto el Backend como el Frontend juntos:
```bash
npm install
npm run dev
```

- **Frontend (Vite)**: `http://localhost:5173`
- **Backend API (Express)**: `http://localhost:3000`
- **Clave de Administrador**: la que pongas en `.env.local` como `ADMIN_KEY=...` (mínimo 6 caracteres). Sin ella el modo admin queda cerrado.

En local, si no hay `DATABASE_URL`, el servidor usa SQLite (`server/foro.db`) como siempre. Para trabajar en local con la misma base de datos de Vercel, ejecuta `vercel env pull .env.local` y reinicia `npm run dev`.

---

## ☁️ Despliegue en Vercel con base de datos

En Vercel el disco no guarda cambios, así que el foro usa **PostgreSQL** cuando se despliega allí. Las tablas y la guía oficial del instructor se crean solas la primera vez que alguien entra.

1. **Sube el proyecto** a GitHub e impórtalo en Vercel (o usa `vercel` desde la terminal). Vercel detecta Vite automáticamente; no cambies el comando de build (`npm run build`) ni la carpeta de salida (`dist`).
2. **Crea la base de datos**: en tu proyecto de Vercel abre la pestaña **Storage** → **Create Database** → elige **Neon** (Postgres, tiene plan gratuito) → elige la región de Washington D.C. / US East (`iad1`), que es donde Vercel ejecuta la API por defecto → **Create**.
3. **Conéctala al proyecto**: deja marcados los entornos *Production*, *Preview* y *Development* y pulsa **Connect**. Vercel crea la variable `DATABASE_URL` automáticamente.
4. **Define la clave de administrador** (obligatorio para entrar como instructor): ve a **Settings → Environment Variables** y agrega `ADMIN_KEY` con una clave de al menos 6 caracteres. Recomendado: agrega también `SESSION_SECRET` con un texto largo al azar (por ejemplo, la salida de `openssl rand -hex 32`); firma las sesiones del admin y de los aprendices. Sin `ADMIN_KEY` ni `SESSION_SECRET`, las sesiones de los aprendices se caen a cada rato en Vercel.
5. **Vuelve a desplegar**: pestaña **Deployments** → los tres puntos del último despliegue → **Redeploy**. Las variables nuevas solo se aplican en despliegues nuevos.
6. **Comprueba**: abre `https://TU-PROYECTO.vercel.app/api/health`. Debe responder `{"ok":true,"baseDeDatos":"postgres"}`.

También funciona con Supabase o Prisma Postgres del Marketplace: el servidor usa `DATABASE_URL` o, si no existe, `POSTGRES_URL`.

Si `/api/health` responde *"No hay base de datos conectada"*, la base no está conectada al proyecto o falta el paso 5.
