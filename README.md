# Foro: Licenciamiento de Software

Aplicación web colaborativa desarrollada en **Vue 3**, **Vite**, **Express** y **PostgreSQL / SQLite** que permite a aprendices e instructores redactar, publicar, calificar y debatir aportes y réplicas en el foro temático de *Licenciamiento de Software* (SENA - ADSO).

---

## 🌟 Control de Usuarios, Autorización y Calificación

### 1. Control de Autor (Aprendices)
- **Clave / PIN de Autor (obligatoria)**: Al redactar un aporte, cada aprendiz define una clave personal de al menos 4 caracteres. Se guarda cifrada: ni siquiera el administrador puede verla.
- **Edición Protegida**: Un usuario puede ingresar a su aporte publicado, pulsar **"✏️ Editar mi aporte"**, ingresar su clave personal y cargar su publicación en el editor para actualizarla.
- **Eliminación por el Autor**: El autor puede eliminar su propio aporte validando su clave personal.
- **Protección contra adivinanzas**: Tras 8 claves incorrectas, esa persona queda bloqueada 15 minutos para ese aporte.

### 2. Modo Administrador / Instructor
- **Acceso Directo**: En la barra superior, haz clic en **"🔐 Acceso Admin"** e ingresa la clave de administrador.
- **Clave**: `CLAVE-VIEJA` por defecto, en local y en Vercel. Solo la conoce el servidor: nunca aparece en el código que descarga el navegador. Al ingresar, el navegador recibe una sesión temporal de 8 horas, no la clave.
- **Cambiar la clave**: define la variable de entorno `ADMIN_KEY` en Vercel (*Settings → Environment Variables*) y vuelve a desplegar. No hace falta tocar el código.
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

### 4. Orden por Fecha y Hora
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
- **Clave de Administrador**: `CLAVE-VIEJA` (o la que definas en `ADMIN_KEY`)

En local, si no hay `DATABASE_URL`, el servidor usa SQLite (`server/foro.db`) como siempre. Para trabajar en local con la misma base de datos de Vercel, ejecuta `vercel env pull .env.local` y reinicia `npm run dev`.

---

## ☁️ Despliegue en Vercel con base de datos

En Vercel el disco no guarda cambios, así que el foro usa **PostgreSQL** cuando se despliega allí. Las tablas y la guía oficial del instructor se crean solas la primera vez que alguien entra.

1. **Sube el proyecto** a GitHub e impórtalo en Vercel (o usa `vercel` desde la terminal). Vercel detecta Vite automáticamente; no cambies el comando de build (`npm run build`) ni la carpeta de salida (`dist`).
2. **Crea la base de datos**: en tu proyecto de Vercel abre la pestaña **Storage** → **Create Database** → elige **Neon** (Postgres, tiene plan gratuito) → elige la región de Washington D.C. / US East (`iad1`), que es donde Vercel ejecuta la API por defecto → **Create**.
3. **Conéctala al proyecto**: deja marcados los entornos *Production*, *Preview* y *Development* y pulsa **Connect**. Vercel crea la variable `DATABASE_URL` automáticamente.
4. *(Opcional)* **Cambia la clave de administrador**: si no quieres usar `CLAVE-VIEJA`, ve a **Settings → Environment Variables** y agrega `ADMIN_KEY` con la clave que prefieras.
5. **Vuelve a desplegar**: pestaña **Deployments** → los tres puntos del último despliegue → **Redeploy**. Las variables nuevas solo se aplican en despliegues nuevos.
6. **Comprueba**: abre `https://TU-PROYECTO.vercel.app/api/health`. Debe responder `{"ok":true,"baseDeDatos":"postgres"}`.

También funciona con Supabase o Prisma Postgres del Marketplace: el servidor usa `DATABASE_URL` o, si no existe, `POSTGRES_URL`.

Si `/api/health` responde *"No hay base de datos conectada"*, la base no está conectada al proyecto o falta el paso 5.
