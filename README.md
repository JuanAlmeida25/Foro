# Foro: Licenciamiento de Software

Proyecto interactivo desarrollado en **Vue 3** y **Vite** para la redacción, gestión y estructuración de aportes y réplicas para el foro temático de *Licenciamiento de Software* (SENA - ADSO).

## 🚀 Características

- **Editor en tiempo real**: Formulario por bloques para cada una de las 4 preguntas orientadoras con conteo de palabras automático por pregunta.
- **Autoguardado**: Guarda automáticamente en `localStorage` (y almacenamiento sincronizado si está en entorno compatible).
- **Gestión de réplicas**: Módulo para redactar y guardar réplicas a aportes de compañeros siguiendo una estructura crítico-reflexiva (Reconoce, Complementa, Cuestiona, Invita).
- **Exportación en múltiples formatos**:
  - Copia rápida al portapapeles (texto plano para el foro).
  - Descarga en `.txt`.
  - Descarga en `.md` (Markdown).
  - Descarga en `.pdf` (formato carta generado con `jsPDF`).
- **Tema responsivo**: Compatible con tema claro y oscuro, adaptable a dispositivos móviles.

---

## 🛠️ Tecnologías

- [Vue 3](https://vuejs.org/) (Composition API con `<script setup>`)
- [Vite](https://vitejs.dev/)
- [jsPDF](https://github.com/parallax/jsPDF)

---

## 💻 Instalación y desarrollo

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Iniciar servidor de desarrollo**:
   ```bash
   npm run dev
   ```

3. **Construir para producción**:
   ```bash
   npm run build
   ```

4. **Previsualizar compilación de producción**:
   ```bash
   npm run preview
   ```
