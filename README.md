# Foro: Licenciamiento de Software

Aplicación web colaborativa desarrollada en **Vue 3**, **Vite**, **Express** y **PostgreSQL / SQLite** que permite a aprendices e instructores redactar, publicar, calificar y debatir aportes y réplicas en el foro temático de *Licenciamiento de Software* (SENA - ADSO).

---

## 🌟 Control de Usuarios, Autorización y Calificación

### 1. Control de Autor (Aprendices)
- **Clave / PIN de Autor**: Al redactar un aporte, cada usuario puede definir una clave personal (ej. `1234`).
- **Edición Protegida**: Un usuario puede ingresar a su aporte publicado, pulsar **"✏️ Editar mi aporte"**, ingresar su clave personal y cargar su publicación en el editor para actualizarla.
- **Eliminación por el Autor**: El autor puede eliminar su propio aporte validando su clave personal.

### 2. Modo Administrador / Instructor (Clave: `2501`)
- **Acceso Directo**: En la barra superior, haz clic en **"🔐 Acceso Admin"** e ingresa la clave **`2501`**.
- **Calificación y Retroalimentación**:
  - Al abrir cualquier aporte, el Administrador tiene el botón **"⭐ Calificar Aporte"**.
  - Permite ingresar una calificación cuantitativa (de 0 a 100) y retroalimentación pedagógica.
  - La calificación queda visible para todos los aprendices con una insignia de estado (*Aprobado* / *No aprobado*).
- **Moderación Total**:
  - El Administrador puede **eliminar cualquier aporte** del foro sin restricciones.
  - El Administrador puede **eliminar cualquier comentario o réplica**.
- **Cierre de Sesión**: Botón en la barra superior para salir del modo Administrador en cualquier momento.

---

## 📁 Estructura del Proyecto

```text
Foro/
├── api/
│   └── index.js             # Entrada de la API en Vercel (usa la misma app de server/app.js)
├── server/
│   ├── app.js               # API REST con Express (auth admin 2501, calificar, aportes, comentarios)
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
│   │   └── AporteDetalle.vue# Detalle, modal para calificar (admin) y validación de clave de autor
│   ├── services/
│   │   └── api.js           # Cliente fetch con métodos de auth, calificación y CRUD
│   ├── data/
│   │   └── constants.js     # Metodología de réplicas y constantes
│   └── utils/
│       ├── exporter.js      # Exportación a PDF, MD y TXT
│       └── text.js          # Formateo de fechas y utilidades de texto
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
- **Clave de Administrador**: `2501`

En local, si no hay `DATABASE_URL`, el servidor usa SQLite (`server/foro.db`) como siempre. Para trabajar en local con la misma base de datos de Vercel, ejecuta `vercel env pull .env.local` y reinicia `npm run dev`.

---

## ☁️ Despliegue en Vercel con base de datos

En Vercel el disco no guarda cambios, así que el foro usa **PostgreSQL** cuando se despliega allí. Las tablas y la guía oficial del instructor se crean solas la primera vez que alguien entra.

1. **Sube el proyecto** a GitHub e impórtalo en Vercel (o usa `vercel` desde la terminal). Vercel detecta Vite automáticamente; no cambies el comando de build (`npm run build`) ni la carpeta de salida (`dist`).
2. **Crea la base de datos**: en tu proyecto de Vercel abre la pestaña **Storage** → **Create Database** → elige **Neon** (Postgres, tiene plan gratuito) → elige la región de Washington D.C. / US East (`iad1`), que es donde Vercel ejecuta la API por defecto → **Create**.
3. **Conéctala al proyecto**: deja marcados los entornos *Production*, *Preview* y *Development* y pulsa **Connect**. Vercel crea la variable `DATABASE_URL` automáticamente.
4. **Vuelve a desplegar**: pestaña **Deployments** → los tres puntos del último despliegue → **Redeploy**. Las variables nuevas solo se aplican en despliegues nuevos.
5. **Comprueba**: abre `https://TU-PROYECTO.vercel.app/api/health`. Debe responder `{"ok":true,"baseDeDatos":"postgres"}`.

También funciona con Supabase o Prisma Postgres del Marketplace: el servidor usa `DATABASE_URL` o, si no existe, `POSTGRES_URL`.

Si `/api/health` responde *"No hay base de datos conectada"*, la base no está conectada al proyecto o falta el paso 4.
