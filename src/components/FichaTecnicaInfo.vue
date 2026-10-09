<template>
  <div class="ficha-view">
    <!-- Encabezado del Módulo Informativo -->
    <header class="ficha-header-card">
      <div class="ficha-header-badge">
        <span class="badge-info-pill">📘 Guía Técnica y Normativa Oficial</span>
        <span class="badge-role-pill">SENA • ADSO</span>
      </div>
      <h2 class="ficha-header-title">Ficha Técnica de Software y Marco Normativo</h2>
      <p class="ficha-header-desc">
        Módulo informativo sobre la conceptualización, estructura estándar y el marco normativo nacional e internacional 
        que respalda la creación de fichas técnicas para productos de software en el proceso formativo.
      </p>
    </header>

    <!-- Barra de navegación interna por secciones -->
    <nav class="ficha-nav-bar" aria-label="Navegación de temas">
      <button
        v-for="tab in seccionTabs"
        :key="tab.id"
        :class="['ficha-subtab', { active: seccionActiva === tab.id }]"
        type="button"
        @click="seccionActiva = tab.id"
      >
        <span>{{ tab.icono }}</span>
        <span>{{ tab.titulo }}</span>
      </button>
    </nav>

    <!-- SECCIÓN 1: ¿QUÉ ES UNA FICHA TÉCNICA? -->
    <section v-if="seccionActiva === 'concepto'" class="ficha-card-block">
      <div class="card-section-head">
        <div class="section-tag">Fundamento de Ingeniería</div>
        <h3>¿Qué es una Ficha Técnica de Software?</h3>
        <p>
          Una <strong>Ficha Técnica de Software</strong> (también conocida como hoja de especificación técnica de producto) 
          es un documento formal estandarizado que sintetiza de manera precisa las características funcionales, no funcionales, 
          arquitectónicas, requerimientos operativos, entorno de ejecución y régimen legal de licenciamiento de un sistema informático.
        </p>
      </div>

      <div class="concept-grid">
        <div class="concept-box">
          <div class="concept-icon">🎯</div>
          <h4>Objetivo Principal</h4>
          <p>
            Garantizar la trazabilidad entre los requerimientos del cliente y el producto entregado, 
            definiendo claramente qué hace el sistema y bajo qué condiciones técnicas opera óptimamente.
          </p>
        </div>

        <div class="concept-box">
          <div class="concept-icon">🤝</div>
          <h4>Instrumento Contractual</h4>
          <p>
            Actúa como un anexo técnico en contratos de desarrollo, estableciendo las garantías de compatibilidad, 
            límites de responsabilidad y el alcance entregado al cliente o usuario final.
          </p>
        </div>

        <div class="concept-box">
          <div class="concept-icon">🔍</div>
          <h4>Base para la Auditoría y QA</h4>
          <p>
            Proporciona la línea base para que los equipos de Aseguramiento de Calidad (QA) ejecuten pruebas de 
            conformidad, rendimiento, seguridad e interoperabilidad según métricas formales.
          </p>
        </div>

        <div class="concept-box">
          <div class="concept-icon">🛡️</div>
          <h4>Soporte Legal y Registro</h4>
          <p>
            Constituye el documento descriptivo obligatorio para registrar el software («soporte lógico») 
            ante la Dirección Nacional de Derecho de Autor (DNDA) en Colombia.
          </p>
        </div>
      </div>

      <!-- Importancia en el rol del desarrollador ADSO -->
      <div class="callout-box">
        <div class="callout-icon">💡</div>
        <div>
          <b>Importancia en la formación ADSO:</b>
          <p>
            En la industria del software, un desarrollo sin ficha técnica se considera incompleto y riesgoso. 
            El tecnólogo ADSO debe saber redactar fichas técnicas precisas para evitar ambigüedades técnicas, 
            garantizar la portabilidad en servidores de producción y cumplir con las auditorías de calidad de software.
          </p>
        </div>
      </div>
    </section>

    <!-- SECCIÓN 2: ESTRUCTURA ESTÁNDAR DE UNA FICHA TÉCNICA -->
    <section v-if="seccionActiva === 'estructura'" class="ficha-card-block">
      <div class="card-section-head">
        <div class="section-tag">Anatomía Documental</div>
        <h3>Estructura Estándar de una Ficha Técnica de Software</h3>
        <p>
          Basada en los lineamientos pedagógicos del SENA y las directrices de la norma ISO/IEC/IEEE 29148, 
          una ficha técnica profesional debe contemplar los siguientes 8 apartados esenciales:
        </p>
      </div>

      <div class="parts-accordion">
        <article
          v-for="(parte, idx) in estructuraPartes"
          :key="parte.id"
          class="part-item"
        >
          <div class="part-item-head">
            <span class="part-number">{{ idx + 1 }}</span>
            <div style="flex: 1;">
              <h4 class="part-title">{{ parte.titulo }}</h4>
              <span class="part-sub">{{ parte.subtitulo }}</span>
            </div>
            <span class="part-pill">{{ parte.badge }}</span>
          </div>
          <div class="part-item-body">
            <p>{{ parte.descripcion }}</p>
            <div class="part-elements">
              <b>Campos indispensables:</b>
              <ul>
                <li v-for="elem in parte.campos" :key="elem">{{ elem }}</li>
              </ul>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- SECCIÓN 3: NORMAS Y ESTÁNDARES INTERNACIONALES -->
    <section v-if="seccionActiva === 'normas-internacionales'" class="ficha-card-block">
      <div class="card-section-head">
        <div class="section-tag">Marco Internacional de Calidad</div>
        <h3>Normas y Estándares Internacionales que la Soportan</h3>
        <p>
          La elaboración y validación de una ficha técnica no es arbitraria; responde a modelos de calidad, 
          ingeniería de requisitos y procesos del ciclo de vida reconocidos globalmente:
        </p>
      </div>

      <div class="standards-grid">
        <article
          v-for="std in normasInternacionales"
          :key="std.codigo"
          class="std-card"
        >
          <div class="std-badge-row">
            <span class="std-code">{{ std.codigo }}</span>
            <span class="std-org">{{ std.organismo }}</span>
          </div>
          <h4 class="std-name">{{ std.nombre }}</h4>
          <p class="std-desc">{{ std.descripcion }}</p>
          <div class="std-application">
            <b>Aplicación en la Ficha Técnica:</b>
            <p>{{ std.aplicacion }}</p>
          </div>
        </article>
      </div>

      <!-- Resumen del Modelo ISO 25010 -->
      <div class="iso25010-box">
        <div class="iso-title">
          <span>🌟</span>
          <h4>Los 8 Pilares de Calidad de la Norma ISO/IEC 25010 (SQRe)</h4>
        </div>
        <p>
          Cualquier ficha técnica debe evaluar y declarar cómo el software responde a estas 8 características de calidad:
        </p>
        <div class="iso-pillars-grid">
          <div v-for="p in pilaresIso" :key="p.nombre" class="pillar-card">
            <b>{{ p.nombre }}</b>
            <span>{{ p.detalle }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- SECCIÓN 4: MARCO LEGAL Y NORMATIVA COLOMBIANA -->
    <section v-if="seccionActiva === 'normas-colombianas'" class="ficha-card-block">
      <div class="card-section-head">
        <div class="section-tag">Legislación Nacional e ICONTEC</div>
        <h3>Marco Jurídico y Normativo en Colombia</h3>
        <p>
          En Colombia, el desarrollo, licenciamiento y registro de software se encuentra fuertemente 
          reglamentado por la legislación de derechos de autor, delitos informáticos y normas técnicas ICONTEC:
        </p>
      </div>

      <div class="laws-list">
        <article
          v-for="ley in normasColombianas"
          :key="ley.codigo"
          class="law-card"
        >
          <div class="law-card-top">
            <span class="law-badge">{{ ley.tipo }}</span>
            <span class="law-year">{{ ley.anio }}</span>
          </div>
          <h4 class="law-title">{{ ley.codigo }}: {{ ley.nombre }}</h4>
          <p class="law-desc">{{ ley.descripcion }}</p>
          <div class="law-impact">
            <span class="impact-label">Soporte para la Ficha Técnica:</span>
            <p>{{ ley.impacto }}</p>
          </div>
        </article>
      </div>

      <div class="callout-box warning-box" style="margin-top: 24px;">
        <div class="callout-icon">⚖️</div>
        <div>
          <b>Régimen de Titularidad y Licenciamiento en Colombia (Art. 20 Ley 23 de 1982 / Ley 1450 de 2011):</b>
          <p>
            En Colombia, cuando un software se desarrolla por encargo o en una relación laboral, se presume que los 
            derechos patrimoniales se transfieren a quien contrató la obra, salvo pacto expreso en contrario. 
            Por esta razón, la ficha técnica debe estipular taxativamente la licencia aplicable (MIT, Apache, Propietaria) 
            y los límites concedidos al cliente.
          </p>
        </div>
      </div>
    </section>

    <!-- SECCIÓN 5: EJEMPLO DE FICHA TÉCNICA (PLANTILLA MODELO) -->
    <section v-if="seccionActiva === 'ejemplo'" class="ficha-card-block">
      <div class="card-section-head">
        <div class="section-tag">Plantilla Modelo Aplicada</div>
        <h3>Ejemplo Práctico: Ficha Técnica de este Aplicativo de Foro</h3>
        <p>
          A continuación se presenta la ficha técnica real correspondiente a este sistema de foro formativo, 
          diseñada siguiendo las especificaciones ISO 25010 y la normatividad colombiana:
        </p>
      </div>

      <div class="sample-sheet">
        <div class="sample-sheet-header">
          <div>
            <span class="sample-org">SERVICIO NACIONAL DE APRENDIZAJE - SENA</span>
            <h4 class="sample-title">FICHA TÉCNICA DE PRODUCTO DE SOFTWARE</h4>
            <span class="sample-sub">Programa ADSO • Evidencia Foro de Licenciamiento</span>
          </div>
          <div class="sample-code-box">
            <b>CÓDIGO: FT-ADSO-2026-01</b>
            <span>VERSIÓN: 2.1.0</span>
            <span>ESTADO: LIBERADO</span>
          </div>
        </div>

        <div class="sample-table-grid">
          <!-- 1. Identificación -->
          <div class="sample-row full">
            <div class="row-label">Nombre del Software:</div>
            <div class="row-val">Plataforma Web para Foro de Licenciamiento y Calidad de Software</div>
          </div>
          <div class="sample-row half">
            <div class="row-label">Tipo de Aplicativo:</div>
            <div class="row-val">Single Page Application (SPA) Web + API REST</div>
          </div>
          <div class="sample-row half">
            <div class="row-label">Licencia de Distribución:</div>
            <div class="row-val">Licencia Abierta Permisiva MIT (Código Abierto)</div>
          </div>

          <!-- 2. Requerimientos -->
          <div class="sample-row half">
            <div class="row-label">Requerimientos de Hardware (Cliente):</div>
            <div class="row-val">
              • CPU: 1.5 GHz o superior dual-core.<br>
              • RAM: 2 GB mínimo (4 GB recomendado).<br>
              • Almacenamiento: 100 MB de espacio libre.<br>
              • Conectividad: Acceso a Internet o red LAN.
            </div>
          </div>
          <div class="sample-row half">
            <div class="row-label">Requerimientos de Software (Cliente):</div>
            <div class="row-val">
              • Navegador Web Moderno (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+).<br>
              • Soporte para JavaScript ECMAScript 2022.<br>
              • Compatibilidad con dispositivos móviles y escritorio.
            </div>
          </div>

          <!-- 3. Entorno de Servidor y Tecnologías -->
          <div class="sample-row half">
            <div class="row-label">Stack Tecnológico Front-End:</div>
            <div class="row-val">Vue 3 (Composition API), Vite 5, CSS3 Variables, jsPDF, DOMPurify.</div>
          </div>
          <div class="sample-row half">
            <div class="row-label">Stack Tecnológico Back-End / BD:</div>
            <div class="row-val">Node.js (v18+), Express API REST, SQLite3 (modo WAL) / Fallback LocalStorage para Vercel.</div>
          </div>

          <!-- 4. Normas de Soporte -->
          <div class="sample-row full">
            <div class="row-label">Estándares y Normas Aplicadas:</div>
            <div class="row-val">
              ISO/IEC 25010 (Modelo de Calidad de Software), ISO/IEC/IEEE 29148 (Ingeniería de Requisitos), 
              Ley 23 de 1982 (Derechos de Autor Colombia), Decisión Andina 351 de 1993 y Ley 1581 de 2012 (Protección de Datos).
            </div>
          </div>

          <!-- 5. Módulos y Funcionalidades -->
          <div class="sample-row full">
            <div class="row-label">Módulos Funcionales Principales:</div>
            <div class="row-val">
              1. <strong>Módulo de Foro General:</strong> Exploración cronológica de aportes estudiantiles.<br>
              2. <strong>Módulo de Redacción y Autoría:</strong> Formulación guiada con preguntas orientadoras fijas y clave de autor.<br>
              3. <strong>Módulo de Evaluación Docente:</strong> Panel de control administrativo protegido con PIN para asignación de notas (0-100) y retroalimentación.<br>
              4. <strong>Módulo de Exportación:</strong> Generación en tiempo real de reportes en formatos PDF, Markdown y TXT.<br>
              5. <strong>Módulo Normativo:</strong> Ficha técnica interactiva y compendio de estándares de calidad.
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECCIÓN 6: PREGUNTAS PARA SOCIALIZAR (DEBATE PEDAGÓGICO) -->
    <section v-if="seccionActiva === 'preguntas-socializar'" class="ficha-card-block">
      <div class="card-section-head">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
          <div>
            <div class="section-tag">Dinámica Formativa y Debate</div>
            <h3>Preguntas Orientadoras para Socializar</h3>
            <p>
              Cuestionario reflexivo para debatir en mesas redondas, sesiones sincrónicas o talleres de formación ADSO. 
              Estas preguntas vinculan la teoría técnica y legal con dilemas reales del desarrollo de software.
            </p>
          </div>
          <div>
            <button
              class="btn sm"
              type="button"
              @click="copiarPreguntasSocializacion"
            >
              📋 Copiar todas las preguntas
            </button>
          </div>
        </div>
      </div>

      <!-- Pautas pedagógicas para la socialización -->
      <div class="callout-box" style="margin-bottom: 8px;">
        <div class="callout-icon">👥</div>
        <div>
          <b>Metodología para la socialización en el ambiente de aprendizaje:</b>
          <p>
            Al responder y debatir estas preguntas con tu instructor y compañeros, sustenta tus argumentos 
            mencionando normas específicas (ej. <em>ISO/IEC 25010</em>, <em>Ley 23 de 1982</em>, <em>Decreto 1360 de 1989</em>) 
            y contrasta con casos reales experimentados en tu proyecto formativo.
          </p>
        </div>
      </div>

      <!-- Tarjetas de preguntas estructuradas -->
      <div class="questions-socialize-grid">
        <article
          v-for="(item, idx) in preguntasSocializar"
          :key="item.id"
          class="question-soc-card"
        >
          <div class="soc-card-header">
            <span class="soc-num">{{ idx + 1 }}</span>
            <div style="flex: 1;">
              <span class="soc-axis">{{ item.eje }}</span>
              <h4 class="soc-title">{{ item.pregunta }}</h4>
            </div>
          </div>

          <div class="soc-context">
            <b>🎯 Contexto y dilema técnico:</b>
            <p>{{ item.contexto }}</p>
          </div>

          <div class="soc-points">
            <b>🔍 Puntos clave para orientar el debate:</b>
            <ul>
              <li v-for="pto in item.puntosClave" :key="pto">{{ pto }}</li>
            </ul>
          </div>

          <div class="soc-norm-ref">
            <span class="soc-norm-tag">⚖️ Soporte normativo:</span>
            <span>{{ item.normas }}</span>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const seccionActiva = ref('concepto')

const seccionTabs = [
  { id: 'concepto', icono: '💡', titulo: '¿Qué es una Ficha Técnica?' },
  { id: 'estructura', icono: '📑', titulo: 'Estructura Estándar' },
  { id: 'normas-internacionales', icono: '🌐', titulo: 'Normas Internacionales' },
  { id: 'normas-colombianas', icono: '🇨🇴', titulo: 'Normatividad Colombiana' },
  { id: 'ejemplo', icono: '📋', titulo: 'Plantilla de Ejemplo' },
  { id: 'preguntas-socializar', icono: '🗣️', titulo: 'Preguntas para Socializar' }
]

const estructuraPartes = [
  {
    id: 'p1',
    titulo: '1. Identificación y Control del Producto',
    subtitulo: 'Datos de encabezado y trazabilidad institucional',
    badge: 'Obligatorio',
    descripcion: 'Determina de forma inequívoca el nombre del software, versión, autoría, fecha de creación y estado de liberación.',
    campos: [
      'Nombre del software y acrónimo',
      'Número de versión (ej. Semantic Versioning 1.0.0)',
      'Nombres de autores o aprendices y número de ficha ADSO',
      'Fecha de emisión y última modificación',
      'Organización destinataria o cliente'
    ]
  },
  {
    id: 'p2',
    titulo: '2. Descripción General y Alcance',
    subtitulo: 'Propósito técnico y funcional del software',
    badge: 'Obligatorio',
    descripcion: 'Explica de forma clara y concisa el problema que soluciona la aplicación y a qué usuarios o procesos beneficia.',
    campos: [
      'Resumen descriptivo del sistema',
      'Objetivo general y objetivos específicos',
      'Población o perfil de usuario objetivo',
      'Límites y exclusiones explícitas del alcance'
    ]
  },
  {
    id: 'p3',
    titulo: '3. Requerimientos de Hardware (Mínimos y Recomendados)',
    subtitulo: 'Especificaciones físicas para cliente y servidor',
    badge: 'Técnico',
    descripcion: 'Especifica la infraestructura física que debe poseer el equipo para que el software se ejecute sin degradación.',
    campos: [
      'Arquitectura de procesamiento (x86, x64, ARM)',
      'Memoria RAM mínima (ej. 2 GB) y recomendada (ej. 4 GB)',
      'Espacio en disco duro / almacenamiento disponible',
      'Resolución de pantalla mínima para interfaz de usuario',
      'Velocidad de conexión a red requerida'
    ]
  },
  {
    id: 'p4',
    titulo: '4. Requerimientos de Software y Plataforma',
    subtitulo: 'Ecosistema operativo y dependencias requeridas',
    badge: 'Técnico',
    descripcion: 'Indica los sistemas operativos, navegadores, entornos de ejecución y librerías de terceros indispensables.',
    campos: [
      'Sistemas operativos soportados (Windows, Linux, macOS, Android)',
      'Navegadores web compatibles y versiones mínimas',
      'Entornos de ejecución (Node.js, JRE, Python, .NET Core)',
      'Motores de base de datos compatibles (PostgreSQL, MySQL, SQLite)'
    ]
  },
  {
    id: 'p5',
    titulo: '5. Módulos y Características Funcionales',
    subtitulo: 'Desglose modular de capacidades del sistema',
    badge: 'Funcional',
    descripcion: 'Lista ordenada de las funcionalidades y flujos de trabajo que el sistema pone a disposición del usuario.',
    campos: [
      'Módulo de autenticación y gestión de roles',
      'Módulos de gestión transaccional (CRUD)',
      'Generación de reportes y exportación de archivos',
      'Integraciones y consumo de APIs externas'
    ]
  },
  {
    id: 'p6',
    titulo: '6. Criterios de Calidad y Requisitos No Funcionales',
    subtitulo: 'Desempeño, seguridad, usabilidad y disponibilidad',
    badge: 'Calidad ISO 25010',
    descripcion: 'Parámetros técnicos de rendimiento y seguridad que aseguran un funcionamiento robusto y confiable.',
    campos: [
      'Tiempos máximos de respuesta (ej. < 2 segundos por petición)',
      'Seguridad: Cifrado de credenciales (bcrypt), protección contra inyecciones y HTTPS',
      'Usabilidad y accesibilidad (diseño responsive, estándares WCAG)',
      'Tolerancia a fallos y mecanismos de respaldo de información'
    ]
  },
  {
    id: 'p7',
    titulo: '7. Modelo de Licenciamiento y Propiedad Intelectual',
    subtitulo: 'Régimen legal de derechos de autor y distribución',
    badge: 'Legal',
    descripcion: 'Define con precisión qué permisos se otorgan a terceros sobre el uso, modificación y distribución del código.',
    campos: [
      'Tipo de licencia (MIT, Apache 2.0, GPL v3, Licencia Propietaria Comercial)',
      'Titularidad de derechos morales y patrimoniales',
      'Permiso o prohibición de redistribución con fines comerciales',
      'Auditoría y compatibilidad de licencias de librerías utilizadas'
    ]
  },
  {
    id: 'p8',
    titulo: '8. Soporte, Mantenimiento y Garantía',
    subtitulo: 'Ciclo de vida post-entrega y canales de asistencia',
    badge: 'Operativo',
    descripcion: 'Condiciones pactadas para la corrección de errores, actualizaciones y asistencia técnica a los usuarios.',
    campos: [
      'Canales de soporte técnico y reporte de incidentes',
      'Periodo de vigencia de la garantía técnica',
      'Política de entrega de parches y versiones evolutivas',
      'Manuales técnicos y de usuario disponibles'
    ]
  }
]

const normasInternacionales = [
  {
    codigo: 'ISO/IEC 25010:2011',
    organismo: 'ISO / IEC (SQRe)',
    nombre: 'Modelo de Calidad del Producto de Software',
    descripcion: 'Estándar internacional que sustituyó a la ISO 9126. Define el modelo universal para evaluar y especificar la calidad de un producto de software a través de 8 características principales.',
    aplicacion: 'Proporciona la estructura exacta para definir los requisitos no funcionales y los criterios de aceptación en la ficha técnica.'
  },
  {
    codigo: 'ISO/IEC/IEEE 29148:2018',
    organismo: 'ISO / IEC / IEEE',
    nombre: 'Ingeniería de Requisitos del Software',
    descripcion: 'Estándar moderno que reemplazó a la tradicional norma IEEE 830. Establece directrices para la especificación, validación y gestión de los requisitos en el ciclo de vida del software.',
    aplicacion: 'Dicta las pautas para redactar requerimientos precisos, verificables y sin ambigüedades dentro de la ficha técnica.'
  },
  {
    codigo: 'IEEE 830-1998',
    organismo: 'IEEE',
    nombre: 'Práctica Recomendada para la ERS (Software Requirements Specification)',
    descripcion: 'Referente histórico fundamental en la formación técnica del SENA. Estructura la Especificación de Requisitos de Software detallando requerimientos funcionales y no funcionales.',
    aplicacion: 'Sirve de guía pedagógica para estructurar las secciones de alcance y módulos funcionales en las fichas técnicas del proyecto formativo.'
  },
  {
    codigo: 'ISO/IEC/IEEE 12207:2017',
    organismo: 'ISO / IEC / IEEE',
    nombre: 'Procesos del Ciclo de Vida del Software',
    descripcion: 'Marco de trabajo integral que define los procesos que se llevan a cabo desde la concepción hasta el retiro del software, incluyendo los procesos de soporte y documentación técnica.',
    aplicacion: 'Justifica formalmente la ficha técnica como un entregable obligatorio del proceso de documentación y aseguramiento de la configuración.'
  },
  {
    codigo: 'ISO/IEC 25040:2011',
    organismo: 'ISO / IEC (SQRe)',
    nombre: 'Proceso de Evaluación de la Calidad del Software',
    descripcion: 'Define el proceso paso a paso para evaluar si un producto cumple con los criterios de calidad y especificaciones pactadas.',
    aplicacion: 'Orienta a los evaluadores e instructores sobre cómo verificar si el software en ejecución satisface lo declarado en la ficha técnica.'
  }
]

const pilaresIso = [
  { nombre: '1. Adecuación Funcional', detalle: 'Completitud, corrección y pertinencia de las funciones frente a las tareas del usuario.' },
  { nombre: '2. Eficiencia de Desempeño', detalle: 'Comportamiento temporal (velocidad), uso óptimo de memoria y capacidad de carga.' },
  { nombre: '3. Compatibilidad', detalle: 'Capacidad de coexistir con otros sistemas e intercambiar información (interoperabilidad).' },
  { nombre: '4. Usabilidad', detalle: 'Facilidad de aprendizaje, operatividad intuitiva, accesibilidad y protección contra errores del usuario.' },
  { nombre: '5. Fiabilidad', detalle: 'Madurez del sistema, tolerancia a fallos y capacidad de recuperación tras incidentes.' },
  { nombre: '6. Seguridad', detalle: 'Confidencialidad, integridad de datos, autenticidad y no repudio de transacciones.' },
  { nombre: '7. Mantenibilidad', detalle: 'Modularidad, reusabilidad de código, facilidad de análisis y modificación sin causar regresiones.' },
  { nombre: '8. Portabilidad', detalle: 'Capacidad de adaptarse e instalarse en diversos entornos de hardware, SO y navegadores.' }
]

const normasColombianas = [
  {
    tipo: 'Ley de la República',
    anio: '1982',
    codigo: 'Ley 23 de 1982',
    nombre: 'Ley sobre Derechos de Autor en Colombia',
    descripcion: 'Régimen marco que protege las creaciones intelectuales. Otorga al desarrollador los derechos morales (paternidad e integridad de la obra, inalienables) y patrimoniales (facultad de explotar económicamente o licenciar el software).',
    impacto: 'Obliga a que la ficha técnica consigne de manera clara la titularidad del software y el alcance de la cesión o licenciamiento.'
  },
  {
    tipo: 'Decreto Reglamentario',
    anio: '1989',
    codigo: 'Decreto 1360 de 1989',
    nombre: 'Reglamentación de Inscripción del Software en la DNDA',
    descripcion: 'Reglamenta formalmente la inscripción del «soporte lógico» (software) en el Registro Nacional de Derecho de Autor en Colombia, definiéndolo como programa de computador, descripción de programa y material auxiliar.',
    impacto: 'La ficha técnica actúa como el documento técnico oficial requerido por la Dirección Nacional de Derecho de Autor (DNDA) para tramitar el registro del software.'
  },
  {
    tipo: 'Tratado Internacional CAN',
    anio: '1993',
    codigo: 'Decisión Andina 351 de 1993',
    nombre: 'Régimen Común sobre Derecho de Autor y Derechos Conexos',
    descripcion: 'Norma supranacional aplicable directamente en Colombia y países de la Comunidad Andina. Establece que los programas de ordenador se protegen en los mismos términos que las obras literarias.',
    impacto: 'Brinda respaldo jurídico internacional a la ficha técnica y protege el código fuente contra copias no autorizadas en toda la región andina.'
  },
  {
    tipo: 'Ley de la República',
    anio: '1999',
    codigo: 'Ley 527 de 1999',
    nombre: 'Ley de Comercio Electrónico y Firmas Digitales',
    descripcion: 'Reconoce la validez jurídica y probatoria de los mensajes de datos, contratos informáticos y acuerdos comerciales celebrados por medios electrónicos.',
    impacto: 'Valida legalmente las licencias digitales (EULA / clickwrap) y la aceptación telemática de las condiciones descritas en la ficha técnica.'
  },
  {
    tipo: 'Ley de la República',
    anio: '2009',
    codigo: 'Ley 1273 de 2009',
    nombre: 'Ley de Delitos Informáticos y Protección de la Información',
    descripcion: 'Modificó el Código Penal para tipificar delitos como el acceso abusivo a un sistema informático, obstaculización ilegítima, daño informático y uso de software malicioso.',
    impacto: 'Sustenta la necesidad de especificar en la ficha técnica las medidas de seguridad del sistema y el uso exclusivo autorizado.'
  },
  {
    tipo: 'Ley Estatutaria',
    anio: '2012',
    codigo: 'Ley 1581 de 2012',
    nombre: 'Régimen General de Protección de Datos Personales (Habeas Data)',
    descripcion: 'Regula la recolección, almacenamiento, uso y circulación de datos personales en bases de datos o sistemas de información en territorio colombiano.',
    impacto: 'Exige que la ficha técnica declare cómo el sistema almacena, cifra y salvaguarda los datos de los usuarios conforme a la ley.'
  },
  {
    tipo: 'Norma Técnica Colombiana',
    anio: 'ICONTEC',
    codigo: 'NTC-ISO/IEC 25010',
    nombre: 'Adopción Colombiana del Modelo de Calidad del Software',
    descripcion: 'Norma técnica oficial homologada por ICONTEC en Colombia. Integra las mejores prácticas mundiales de calidad de software adaptadas al contexto productivo nacional.',
    impacto: 'Es el estándar oficial que rige las licitaciones públicas y auditorías técnicas de calidad de software ante entidades del Estado colombiano.'
  }
]

const preguntasSocializar = [
  {
    id: 'ps1',
    eje: 'Eje 1: Validez Contractual y Riesgos Técnicos',
    pregunta: '¿Por qué la ficha técnica se considera la «partida de nacimiento» y el contrato técnico de un software? ¿Qué riesgos legales, económicos y reputacionales asume un equipo de desarrollo al entregar un producto sin este documento?',
    contexto: 'Muchos clientes reclaman por lentitud, incompatibilidad en sus equipos o fallos no contemplados tras la entrega. Sin una ficha técnica firmada, no existe una línea base objetiva para definir responsabilidades.',
    puntosClave: [
      'Límites entre un defecto de software y una deficiencia de hardware del cliente.',
      'Validez de la ficha técnica como anexo técnico en disputas legales o arbitramentos comerciales.',
      'Cómo la falta de especificaciones genera sobrecostos en garantías y horas de soporte no remuneradas.'
    ],
    normas: 'ISO/IEC/IEEE 12207 (Procesos de documentación), Ley 527 de 1999 (Comercio electrónico y contratos).'
  },
  {
    id: 'ps2',
    eje: 'Eje 2: Priorización en el Modelo ISO/IEC 25010',
    pregunta: 'Entre las 8 características de calidad de la norma ISO/IEC 25010 (Adecuación funcional, Rendimiento, Compatibilidad, Usabilidad, Fiabilidad, Seguridad, Mantenibilidad y Portabilidad), ¿cuáles dos consideran más críticas en su proyecto formativo y por qué?',
    contexto: 'No es viable maximizar al 100% todas las características simultáneamente debido a restricciones de tiempo y presupuesto (ej. mayor cifrado y seguridad puede reducir la velocidad de respuesta).',
    puntosClave: [
      'Compromisos de diseño (trade-offs) entre seguridad, usabilidad y rendimiento.',
      'Diferencias de prioridad según el tipo de software (ej. e-commerce financiero vs. aplicativo educativo).',
      'Métricas objetivas para declarar en la ficha técnica si el requisito se cumplió satisfactoriamente.'
    ],
    normas: 'ISO/IEC 25010:2011 (Modelo SQRe), NTC-ISO/IEC 25010 (ICONTEC).'
  },
  {
    id: 'ps3',
    eje: 'Eje 3: Calibración de Requerimientos de Hardware y Software',
    pregunta: '¿Qué método o criterio técnico debe utilizar un equipo de ingenieros para calcular los «requerimientos mínimos» y «requerimientos recomendados» sin inflar los costos de adquisición para el usuario ni provocar colapsos del sistema?',
    contexto: 'Si declaras requerimientos excesivos, los usuarios no podrán instalar la aplicación; si declaras requerimientos muy bajos, el software se bloqueará por falta de memoria RAM o CPU.',
    puntosClave: [
      'Diferencia entre entorno de desarrollo (localhost) y entorno de producción real.',
      'Uso de herramientas de profiling y pruebas de estrés (Apache JMeter, Lighthouse, Artillery).',
      'Criterios para declarar compatibilidad con versiones antiguas de sistemas operativos y navegadores.'
    ],
    normas: 'ISO/IEC/IEEE 29148:2018 (Ingeniería de Requisitos), IEEE 830-1998 (Especificación de Requerimientos).'
  },
  {
    id: 'ps4',
    eje: 'Eje 4: Derechos de Autor y Titularidad en Colombia',
    pregunta: 'Si un aprendiz o desarrollador crea un software como empleado o por contrato de prestación de servicios en Colombia: ¿Quién conserva los derechos morales y quién los patrimoniales según el Artículo 20 de la Ley 23 de 1982? ¿Cómo debe quedar estipulado en la ficha técnica?',
    contexto: 'Existe una confusión habitual entre ser el autor del código y ser el dueño comercial del producto final. En Colombia, la ley establece presunciones legales que todo tecnólogo ADSO debe conocer.',
    puntosClave: [
      'Los derechos morales (paternidad e integridad de la obra) son irrenunciables e inalienables del programador.',
      'Los derechos patrimoniales (comercialización, reproducción, lucro) se presumen transferidos a quien encarga la obra, salvo pacto en contrario por escrito.',
      'Importancia de estipular en la ficha técnica el titular de la propiedad intelectual y el tipo de cesión.'
    ],
    normas: 'Ley 23 de 1982 (Art. 20), Ley 1450 de 2011 (Art. 28), Decisión Andina 351 de 1993, Decreto 1360 de 1989.'
  },
  {
    id: 'ps5',
    eje: 'Eje 5: Auditoría y Conflicto de Licencias (Copyleft vs. Permisivas)',
    pregunta: 'Si en el desarrollo de su proyecto integran librerías con licencia GPL v3 (copyleft fuerte) y módulos con licencias permisivas (MIT o Apache 2.0), ¿qué consecuencias jurídicas tiene esto sobre la licencia final que pueden declarar en la ficha técnica?',
    contexto: 'La cláusula viral del copyleft exige que cualquier obra derivada distribuida de un software GPL deba ser liberada bajo esa misma licencia, impidiendo comercializarlo como código cerrado.',
    puntosClave: [
      'El fenómeno de «infección de licencias» o incompatibilidad entre librerías.',
      'Auditoría preventiva de dependencias (npm audit, licencias en package.json o pom.xml).',
      'Cómo asesorar a un cliente si desea vender el software como propietario pero su equipo utilizó paquetes GPL.'
    ],
    normas: 'Decisión Andina 351 de 1993, Modelos de licenciamiento Open Source Initiative (OSI) y FSF.'
  },
  {
    id: 'ps6',
    eje: 'Eje 6: Versionamiento Semántico (SemVer) y Mantenimiento',
    pregunta: '¿En qué momentos del ciclo de vida debe actualizarse la ficha técnica de un sistema? Ante la corrección de un bug menor (PATCH) frente a un cambio de arquitectura o motor de base de datos (MAJOR), ¿cómo se gestiona la versión de la ficha frente al cliente?',
    contexto: 'Un error común es actualizar el código en el repositorio pero dejar la ficha técnica con la versión inicial desactualizada, provocando fallas operativas en futuras instalaciones.',
    puntosClave: [
      'Estructura de versionamiento semántico: MAJOR (incompatibilidades), MINOR (nuevas funciones), PATCH (corrección de errores).',
      'Mantenimiento adaptativo (ej. nuevo sistema operativo) y su impacto en los requerimientos mínimos de la ficha.',
      'El histórico de cambios o registro de versiones como garantía de calidad y transparencia técnica.'
    ],
    normas: 'ISO/IEC/IEEE 12207:2017 (Gestión de la configuración), Estándar Semantic Versioning 2.0.0.'
  }
]

function copiarPreguntasSocializacion() {
  const texto = preguntasSocializar.map((p, i) => {
    return `${i + 1}. [${p.eje}]\nPregunta: ${p.pregunta}\nContexto: ${p.contexto}\nNormas: ${p.normas}\n`
  }).join('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n')

  navigator.clipboard.writeText(`PREGUNTAS ORIENTADORAS PARA SOCIALIZACIÓN Y DEBATE - FICHA TÉCNICA Y NORMATIVA DE SOFTWARE (ADSO - SENA)\n\n${texto}`)
    .then(() => alert('¡Preguntas copiadas al portapapeles con éxito!'))
    .catch(() => alert('No se pudo copiar automáticamente. Puedes seleccionar el texto directamente.'))
}
</script>

<style scoped>
.ficha-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.ficha-header-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-left: 6px solid var(--accent);
  border-radius: 12px;
  padding: 24px 28px;
  box-shadow: var(--shadow);
}

.ficha-header-badge {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.badge-info-pill {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--accent);
  background: var(--accent-soft);
  padding: 4px 10px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: .05em;
}

.badge-role-pill {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--ok);
  background: color-mix(in srgb, var(--ok) 12%, var(--surface));
  padding: 4px 10px;
  border-radius: 999px;
}

.ficha-header-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--fg);
  font-family: var(--f-display);
  margin: 0 0 8px 0;
}

.ficha-header-desc {
  font-size: 15px;
  color: var(--muted);
  line-height: 1.6;
  margin: 0;
  max-width: 820px;
}

/* Barra de Sub-Navegación */
.ficha-nav-bar {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  border-bottom: 2px solid var(--line);
  padding-bottom: 10px;
}

.ficha-subtab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--surface);
  color: var(--muted);
  border: 1px solid var(--line);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all .15s ease;
}

.ficha-subtab:hover {
  border-color: var(--accent);
  color: var(--fg);
}

.ficha-subtab.active {
  background: var(--accent);
  color: var(--accent-ink);
  border-color: var(--accent);
}

/* Bloque de Contenido */
.ficha-card-block {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 28px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.card-section-head .section-tag {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: .06em;
  margin-bottom: 6px;
}

.card-section-head h3 {
  font-size: 22px;
  font-weight: 700;
  color: var(--fg);
  margin: 0 0 10px 0;
}

.card-section-head p {
  font-size: 15px;
  color: var(--fg);
  line-height: 1.65;
  margin: 0;
}

/* Grid de Conceptos */
.concept-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.concept-box {
  background: var(--sunk);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 18px;
}

.concept-icon {
  font-size: 24px;
  margin-bottom: 10px;
}

.concept-box h4 {
  font-size: 16px;
  font-weight: 700;
  color: var(--fg);
  margin: 0 0 6px 0;
}

.concept-box p {
  font-size: 13.5px;
  color: var(--muted);
  line-height: 1.5;
  margin: 0;
}

/* Callout Box */
.callout-box {
  background: color-mix(in srgb, var(--accent) 7%, var(--surface));
  border: 1px solid color-mix(in srgb, var(--accent) 30%, var(--surface));
  border-radius: 10px;
  padding: 16px 20px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.callout-icon {
  font-size: 22px;
  line-height: 1;
}

.callout-box b {
  display: block;
  font-size: 14.5px;
  color: var(--fg);
  margin-bottom: 4px;
}

.callout-box p {
  font-size: 14px;
  color: var(--muted);
  line-height: 1.55;
  margin: 0;
}

.warning-box {
  background: color-mix(in srgb, var(--warn) 9%, var(--surface));
  border-color: color-mix(in srgb, var(--warn) 35%, var(--surface));
}

/* Acordeón de Partes */
.parts-accordion {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.part-item {
  background: var(--sunk);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 18px 20px;
}

.part-item-head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 10px;
}

.part-number {
  background: var(--accent);
  color: var(--accent-ink);
  font-weight: 700;
  font-size: 14px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.part-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--fg);
  margin: 0;
}

.part-sub {
  font-size: 12.5px;
  color: var(--muted);
}

.part-pill {
  font-size: 11px;
  font-weight: 600;
  background: var(--surface);
  border: 1px solid var(--line);
  padding: 3px 8px;
  border-radius: 999px;
  color: var(--muted);
}

.part-item-body p {
  font-size: 14px;
  color: var(--fg);
  line-height: 1.5;
  margin: 0 0 10px 0;
}

.part-elements {
  background: var(--surface);
  border: 1px dashed var(--line);
  border-radius: 8px;
  padding: 12px 16px;
}

.part-elements b {
  font-size: 12.5px;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: .05em;
  display: block;
  margin-bottom: 6px;
}

.part-elements ul {
  margin: 0;
  padding-left: 20px;
  font-size: 13.5px;
  color: var(--muted);
  line-height: 1.5;
}

/* Grid de Normas Internacionales */
.standards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.std-card {
  background: var(--sunk);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.std-badge-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.std-code {
  font-size: 13px;
  font-weight: 700;
  color: var(--accent);
  font-family: var(--f-mono);
}

.std-org {
  font-size: 11px;
  font-weight: 600;
  background: var(--surface);
  border: 1px solid var(--line);
  padding: 2px 7px;
  border-radius: 999px;
  color: var(--muted);
}

.std-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--fg);
  margin: 0;
}

.std-desc {
  font-size: 13.5px;
  color: var(--muted);
  line-height: 1.5;
  margin: 0;
}

.std-application {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 10px 14px;
  margin-top: auto;
}

.std-application b {
  font-size: 12px;
  color: var(--ok);
  text-transform: uppercase;
  display: block;
  margin-bottom: 4px;
}

.std-application p {
  font-size: 13px;
  color: var(--fg);
  line-height: 1.45;
  margin: 0;
}

/* Caja ISO 25010 Pilares */
.iso25010-box {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 20px;
}

.iso-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.iso-title h4 {
  font-size: 17px;
  font-weight: 700;
  color: var(--fg);
  margin: 0;
}

.iso25010-box p {
  font-size: 14px;
  color: var(--muted);
  margin: 0 0 16px 0;
}

.iso-pillars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.pillar-card {
  background: var(--sunk);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 12px 14px;
}

.pillar-card b {
  display: block;
  font-size: 13.5px;
  color: var(--accent);
  margin-bottom: 4px;
}

.pillar-card span {
  font-size: 12.5px;
  color: var(--muted);
  line-height: 1.4;
  display: block;
}

/* Leyes Colombianas */
.laws-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.law-card {
  background: var(--sunk);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.law-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.law-badge {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--accent);
  background: var(--accent-soft);
  padding: 3px 8px;
  border-radius: 999px;
}

.law-year {
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
}

.law-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--fg);
  margin: 0;
}

.law-desc {
  font-size: 13.5px;
  color: var(--muted);
  line-height: 1.5;
  margin: 0;
}

.law-impact {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 10px 14px;
  margin-top: auto;
}

.impact-label {
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--warn);
  display: block;
  margin-bottom: 4px;
}

.law-impact p {
  font-size: 13px;
  color: var(--fg);
  line-height: 1.45;
  margin: 0;
}

/* Plantilla de Ejemplo */
.sample-sheet {
  background: var(--sunk);
  border: 2px solid var(--line);
  border-radius: 10px;
  padding: 24px;
  font-family: var(--f-body);
}

.sample-sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  border-bottom: 2px solid var(--line);
  padding-bottom: 18px;
  margin-bottom: 18px;
}

.sample-org {
  font-size: 12px;
  font-weight: 700;
  color: var(--ok);
  letter-spacing: .06em;
  display: block;
}

.sample-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--fg);
  margin: 4px 0;
}

.sample-sub {
  font-size: 13px;
  color: var(--muted);
}

.sample-code-box {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 10px 14px;
  text-align: right;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.sample-code-box b {
  color: var(--accent);
}

.sample-table-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.sample-row {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 12px 16px;
}

.sample-row.full {
  grid-column: 1 / -1;
}

.sample-row.half {
  grid-column: span 1;
}

@media (max-width: 768px) {
  .sample-row.half {
    grid-column: 1 / -1;
  }
}

.row-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: .05em;
  margin-bottom: 6px;
}

.row-val {
  font-size: 13.5px;
  color: var(--fg);
  line-height: 1.55;
}

/* Estilos de la Pestaña de Preguntas para Socializar */
.questions-socialize-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 20px;
}

.question-soc-card {
  background: var(--sunk);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  transition: transform .15s ease, border-color .15s ease;
}

.question-soc-card:hover {
  border-color: color-mix(in srgb, var(--accent) 40%, var(--line));
}

.soc-card-header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.soc-num {
  background: var(--accent);
  color: var(--accent-ink);
  font-weight: 700;
  font-size: 14px;
  min-width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.soc-axis {
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--accent);
  letter-spacing: .05em;
  display: block;
  margin-bottom: 4px;
}

.soc-title {
  font-size: 15.5px;
  font-weight: 700;
  color: var(--fg);
  line-height: 1.45;
  margin: 0;
}

.soc-context {
  background: var(--surface);
  border-left: 3px solid var(--warn);
  border-radius: 6px;
  padding: 10px 14px;
}

.soc-context b {
  font-size: 11.5px;
  color: var(--warn);
  display: block;
  margin-bottom: 3px;
  text-transform: uppercase;
  letter-spacing: .04em;
}

.soc-context p {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.5;
  margin: 0;
}

.soc-points {
  background: var(--surface);
  border: 1px dashed var(--line);
  border-radius: 8px;
  padding: 12px 14px;
}

.soc-points b {
  font-size: 11.5px;
  color: var(--accent);
  display: block;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: .04em;
}

.soc-points ul {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  color: var(--fg);
  line-height: 1.45;
}

.soc-points li {
  margin-bottom: 4px;
}

.soc-norm-ref {
  background: color-mix(in srgb, var(--ok) 8%, var(--surface));
  border: 1px solid color-mix(in srgb, var(--ok) 25%, var(--line));
  border-radius: 6px;
  padding: 9px 12px;
  font-size: 12.5px;
  color: var(--fg);
  margin-top: auto;
  line-height: 1.4;
}

.soc-norm-tag {
  font-weight: 700;
  color: var(--ok);
  display: inline-block;
  margin-right: 4px;
}
</style>
