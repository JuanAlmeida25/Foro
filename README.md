# Foro: Licenciamiento de Software

Aplicación web colaborativa desarrollada en **Vue 3**, **Vite**, **Express** y **SQLite** que permite a aprendices e instructores redactar, publicar, calificar y debatir aportes y réplicas en el foro temático de *Licenciamiento de Software* (SENA - ADSO).

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
├── server/
│   ├── index.js             # API REST con Express (auth admin 2501, calificar, aportes, comentarios)
│   ├── db.js                # SQLite (columnas: clave_edicion, calificacion, retroalimentacion)
│   └── foro.db              # Base de datos SQLite
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
└── vite.config.js           # Proxy /api hacia localhost:3000
```

---

## 🚀 Inicio Rápido

Para iniciar tanto el Backend como el Frontend juntos:
```bash
npm run dev
```

- **Frontend (Vite)**: `http://localhost:5173`
- **Backend API (Express)**: `http://localhost:3000`
- **Clave de Administrador**: `2501`
