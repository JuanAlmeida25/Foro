<template>
  <div class="lic-view">
    <!-- Encabezado del módulo informativo -->
    <header class="lic-header-card">
      <div class="lic-header-badge">
        <span class="badge-info-pill">⚖️ Guía de Licenciamiento</span>
        <span class="badge-role-pill">SENA • ADSO</span>
      </div>
      <h2 class="lic-header-title">Licencias más usadas en el desarrollo de software</h2>
      <p class="lic-header-desc">
        Una licencia de software es el instrumento jurídico con el que el titular de los derechos de autor
        define qué puede hacer un tercero con el programa: usarlo, copiarlo, modificarlo o redistribuirlo, y bajo
        qué condiciones. Elegir bien la licencia (y respetar las de las librerías que usamos) es parte del trabajo del desarrollador.
      </p>
    </header>

    <!-- Barra de navegación interna -->
    <nav class="lic-nav-bar" aria-label="Secciones de licencias">
      <button
        v-for="tab in seccionTabs"
        :key="tab.id"
        :class="['lic-subtab', { active: seccionActiva === tab.id }]"
        type="button"
        @click="seccionActiva = tab.id"
      >
        <span>{{ tab.icono }}</span>
        <span>{{ tab.titulo }}</span>
      </button>
    </nav>

    <!-- SECCIÓN 1: CATEGORÍAS -->
    <section v-if="seccionActiva === 'categorias'" class="lic-card-block">
      <div class="card-section-head">
        <div class="section-tag">Conceptos base</div>
        <h3>Familias de licencias</h3>
        <p>
          Casi todas las licencias se pueden ubicar en un espectro que va desde «haz lo que quieras» hasta
          «no puedes ver ni modificar el código». La diferencia clave entre ellas es qué obligaciones
          heredas cuando <strong>redistribuyes</strong> el software o una obra derivada.
        </p>
      </div>

      <div class="spectrum" aria-hidden="true">
        <span>Más libertad para quien reutiliza</span>
        <div class="spectrum-bar"></div>
        <span>Más control para el autor</span>
      </div>

      <div class="concept-grid">
        <article
          v-for="cat in categorias"
          :key="cat.id"
          class="concept-box"
          :style="{ '--tone': `var(${cat.tono})` }"
        >
          <div class="concept-icon">{{ cat.icono }}</div>
          <h4>{{ cat.nombre }}</h4>
          <p>{{ cat.descripcion }}</p>
          <div class="concept-examples">
            <b>Ejemplos:</b> {{ cat.ejemplos }}
          </div>
        </article>
      </div>

      <div class="callout-box">
        <div class="callout-icon">💡</div>
        <div>
          <b>Software libre, código abierto y gratis no son lo mismo</b>
          <p>
            «Código abierto» se refiere a licencias aprobadas por la Open Source Initiative (OSI); «software libre» a las
            cuatro libertades de la Free Software Foundation (usar, estudiar, distribuir y mejorar). Un programa gratuito
            (freeware) puede ser totalmente propietario, y un software libre puede venderse.
          </p>
        </div>
      </div>
    </section>

    <!-- SECCIÓN 2: LICENCIAS UNA A UNA -->
    <section v-if="seccionActiva === 'licencias'" class="lic-card-block">
      <div class="card-section-head">
        <div class="section-tag">Detalle por licencia</div>
        <h3>Las licencias que más vas a encontrar</h3>
        <p>Filtra por familia para comparar licencias del mismo tipo.</p>
      </div>

      <div class="filter-row" role="group" aria-label="Filtrar por familia">
        <button
          v-for="f in filtros"
          :key="f.id"
          :class="['chip', { active: filtro === f.id }]"
          type="button"
          @click="filtro = f.id"
        >
          {{ f.nombre }}
        </button>
      </div>

      <div class="lic-list">
        <article
          v-for="lic in licenciasFiltradas"
          :key="lic.id"
          class="lic-item"
          :style="{ '--tone': `var(${tonoDe(lic.categoria)})` }"
        >
          <div class="lic-item-head">
            <div style="flex: 1;">
              <h4 class="lic-title">{{ lic.nombre }}</h4>
              <span class="lic-spdx">SPDX: {{ lic.spdx }}</span>
            </div>
            <span class="lic-pill">{{ nombreCategoria(lic.categoria) }}</span>
          </div>

          <p class="lic-resumen">{{ lic.resumen }}</p>

          <button
            class="btn ghost sm abuela-btn"
            type="button"
            :aria-expanded="abuelaAbierta.has(lic.id)"
            @click="alternarAbuela(lic.id)"
          >
            👵 {{ abuelaAbierta.has(lic.id) ? 'Ya entendí, mija' : 'Explícamelo como si tuviera 80 años' }}
          </button>
          <Transition name="abuela">
            <p v-if="abuelaAbierta.has(lic.id)" class="lic-abuela">{{ lic.abuela }}</p>
          </Transition>

          <div class="lic-columns">
            <div>
              <b class="col-title ok">Permite</b>
              <ul><li v-for="p in lic.permite" :key="p">{{ p }}</li></ul>
            </div>
            <div>
              <b class="col-title warn">Exige</b>
              <ul><li v-for="c in lic.exige" :key="c">{{ c }}</li></ul>
            </div>
            <div>
              <b class="col-title bad">Limita</b>
              <ul><li v-for="l in lic.limita" :key="l">{{ l }}</li></ul>
            </div>
          </div>

          <div class="lic-foot">
            <span><b>Proyectos que la usan:</b> {{ lic.proyectos }}</span>
            <span><b>Ideal para:</b> {{ lic.ideal }}</span>
          </div>
        </article>
      </div>
    </section>

    <!-- SECCIÓN 3: TABLA COMPARATIVA -->
    <section v-if="seccionActiva === 'comparativa'" class="lic-card-block">
      <div class="card-section-head">
        <div class="section-tag">Vista rápida</div>
        <h3>Tabla comparativa</h3>
        <p>
          <span class="mark yes">✓</span> permitido / no exigido &nbsp;
          <span class="mark cond">◐</span> con condiciones &nbsp;
          <span class="mark no">✗</span> no permitido / obligatorio
        </p>
      </div>

      <div class="table-scroll">
        <table class="cmp-table">
          <thead>
            <tr>
              <th scope="col">Licencia</th>
              <th v-for="col in columnasTabla" :key="col.id" scope="col">{{ col.nombre }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lic in licencias" :key="lic.id">
              <th scope="row">{{ lic.corto }}</th>
              <td v-for="col in columnasTabla" :key="col.id">
                <span :class="['mark', lic.tabla[col.id]]" :title="textoMarca(lic.tabla[col.id])">
                  {{ simbolo(lic.tabla[col.id]) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="table-note">
        «Revelar código», «Misma licencia» y «Uso en red» indican si la licencia te <em>obliga</em> a algo:
        ✓ significa que no hay esa obligación. Las obligaciones de las licencias copyleft se activan al
        <strong>distribuir</strong> el software (o, en AGPL, al ofrecerlo por red), no al usarlo internamente.
      </p>
    </section>

    <!-- SECCIÓN 4: COMPATIBILIDAD -->
    <section v-if="seccionActiva === 'compatibilidad'" class="lic-card-block">
      <div class="card-section-head">
        <div class="section-tag">Combinar dependencias</div>
        <h3>Compatibilidad entre licencias</h3>
        <p>
          Un proyecto real usa decenas de librerías, cada una con su licencia. La licencia final que puedes
          declarar tiene que respetar <strong>todas</strong> las condiciones al mismo tiempo. Como regla general,
          el código puede «fluir» de licencias permisivas hacia copyleft, pero no al revés.
        </p>
      </div>

      <div class="flow-row" aria-label="Dirección de compatibilidad">
        <span class="flow-step">Dominio público</span>
        <span class="flow-arrow">→</span>
        <span class="flow-step">MIT / BSD</span>
        <span class="flow-arrow">→</span>
        <span class="flow-step">Apache 2.0</span>
        <span class="flow-arrow">→</span>
        <span class="flow-step">LGPL / MPL</span>
        <span class="flow-arrow">→</span>
        <span class="flow-step">GPL v3</span>
        <span class="flow-arrow">→</span>
        <span class="flow-step">AGPL v3</span>
      </div>

      <div class="parts-list">
        <article v-for="(r, idx) in reglasCompatibilidad" :key="idx" class="rule-item">
          <span :class="['rule-mark', r.tipo]">{{ simbolo(r.tipo) }}</span>
          <div>
            <h4>{{ r.titulo }}</h4>
            <p>{{ r.detalle }}</p>
          </div>
        </article>
      </div>

      <div class="callout-box warning-box">
        <div class="callout-icon">⚠️</div>
        <div>
          <b>Licencias «source-available»: parecen abiertas, pero no lo son</b>
          <p>
            Licencias como la Business Source License (BSL) o la Server Side Public License (SSPL) permiten ver el código,
            pero restringen ciertos usos comerciales (por ejemplo, ofrecerlo como servicio). No están aprobadas por la OSI,
            así que revísalas con cuidado antes de incluirlas en un proyecto.
          </p>
        </div>
      </div>
    </section>

    <!-- SECCIÓN 5: CÓMO ELEGIR -->
    <section v-if="seccionActiva === 'elegir'" class="lic-card-block">
      <div class="card-section-head">
        <div class="section-tag">Asistente</div>
        <h3>¿Qué licencia le conviene a mi proyecto?</h3>
        <p>Responde tres preguntas y obtén una recomendación orientativa.</p>
      </div>

      <div class="wizard">
        <fieldset v-for="q in preguntasAsistente" :key="q.id" class="wizard-q">
          <legend>{{ q.texto }}</legend>
          <div class="wizard-opts">
            <label
              v-for="op in q.opciones"
              :key="op.valor"
              :class="['wizard-opt', { active: respuestas[q.id] === op.valor }]"
            >
              <input v-model="respuestas[q.id]" type="radio" :name="q.id" :value="op.valor" />
              {{ op.texto }}
            </label>
          </div>
        </fieldset>
      </div>

      <div v-if="recomendacion" class="callout-box result-box">
        <div class="callout-icon">✅</div>
        <div>
          <b>Recomendación: {{ recomendacion.licencia }}</b>
          <p>{{ recomendacion.motivo }}</p>
        </div>
      </div>
      <p v-else class="table-note">Responde todas las preguntas para ver la recomendación.</p>

      <div class="callout-box">
        <div class="callout-icon">📌</div>
        <div>
          <b>Cómo aplicar la licencia en tu repositorio</b>
          <p>
            1) Agrega un archivo <code>LICENSE</code> en la raíz con el texto completo de la licencia.
            2) Declárala en el gestor de paquetes (por ejemplo, <code>"license": "MIT"</code> en <code>package.json</code>).
            3) Revisa las licencias de tus dependencias (<code>npx license-checker --summary</code>).
            4) Regístrala en la ficha técnica del producto.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import {
  CATEGORIAS_LICENCIA as categorias,
  LICENCIAS as licencias,
  COLUMNAS_TABLA as columnasTabla,
  REGLAS_COMPATIBILIDAD as reglasCompatibilidad
} from '../data/licencias.js'

const seccionActiva = ref('categorias')

const seccionTabs = [
  { id: 'categorias', icono: '🧭', titulo: 'Familias de licencias' },
  { id: 'licencias', icono: '📜', titulo: 'Licencias más usadas' },
  { id: 'comparativa', icono: '📊', titulo: 'Tabla comparativa' },
  { id: 'compatibilidad', icono: '🔗', titulo: 'Compatibilidad' },
  { id: 'elegir', icono: '🧩', titulo: '¿Cuál elegir?' }
]

const filtros = [
  { id: 'todas', nombre: 'Todas' },
  ...categorias.map(c => ({ id: c.id, nombre: c.nombre }))
]

const filtro = ref('todas')

// Licencias con la explicación de la abuela abierta (cada tarjeta se abre por su cuenta)
const abuelaAbierta = reactive(new Set())

function alternarAbuela(id) {
  if (abuelaAbierta.has(id)) abuelaAbierta.delete(id)
  else abuelaAbierta.add(id)
}

const preguntasAsistente = [
  {
    id: 'compartir',
    texto: '1. Si alguien mejora tu código y lo distribuye, ¿debe publicar esas mejoras?',
    opciones: [
      { valor: 'no', texto: 'No, que lo use como quiera' },
      { valor: 'libreria', texto: 'Solo los cambios a mi código, no su aplicación' },
      { valor: 'si', texto: 'Sí, todo el proyecto derivado' }
    ]
  },
  {
    id: 'patentes',
    texto: '2. ¿Te preocupa la protección frente a demandas de patentes?',
    opciones: [
      { valor: 'si', texto: 'Sí' },
      { valor: 'no', texto: 'No especialmente' }
    ]
  },
  {
    id: 'red',
    texto: '3. ¿Tu software se usará principalmente como servicio web?',
    opciones: [
      { valor: 'si', texto: 'Sí' },
      { valor: 'no', texto: 'No' }
    ]
  }
]

const respuestas = reactive({ compartir: null, patentes: null, red: null })

const recomendacion = computed(() => {
  const { compartir, patentes, red } = respuestas
  if (!compartir || !patentes || !red) return null

  if (compartir === 'no') {
    return patentes === 'si'
      ? { licencia: 'Apache License 2.0', motivo: 'Es permisiva, favorece la adopción y además incluye una licencia explícita de patentes con cláusula de represalia.' }
      : { licencia: 'MIT License', motivo: 'Es la licencia más simple y conocida: máxima libertad para quien reutiliza y solo exige conservar el aviso de copyright.' }
  }
  if (compartir === 'libreria') {
    return patentes === 'si'
      ? { licencia: 'Mozilla Public License 2.0', motivo: 'Protege tus archivos con copyleft, permite combinarlos con código propietario y concede licencia de patentes.' }
      : { licencia: 'GNU LGPL v3', motivo: 'Cualquier aplicación puede enlazar tu librería, pero las mejoras a la librería deben volver a la comunidad.' }
  }
  return red === 'si'
    ? { licencia: 'GNU AGPL v3', motivo: 'Asegura que incluso quien ofrezca tu software modificado como servicio web tenga que publicar su código.' }
    : { licencia: 'GNU GPL v3', motivo: 'Garantiza que toda obra derivada que se distribuya siga siendo software libre, con licencia de patentes incluida.' }
})

const licenciasFiltradas = computed(() =>
  filtro.value === 'todas' ? licencias : licencias.filter(l => l.categoria === filtro.value)
)

function nombreCategoria(id) {
  return categorias.find(c => c.id === id)?.nombre ?? id
}

function tonoDe(id) {
  return categorias.find(c => c.id === id)?.tono ?? '--accent'
}

function simbolo(tipo) {
  return { yes: '✓', cond: '◐', no: '✗' }[tipo] ?? '–'
}

function textoMarca(tipo) {
  return { yes: 'Permitido / sin obligación', cond: 'Con condiciones', no: 'No permitido / obligatorio' }[tipo] ?? ''
}
</script>

<style scoped>
.lic-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.lic-header-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-left: 6px solid var(--accent);
  border-radius: 12px;
  padding: 24px 28px;
  box-shadow: var(--shadow);
}

.lic-header-badge {
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

.lic-header-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--fg);
  font-family: var(--f-display);
  margin: 0 0 8px 0;
}

.lic-header-desc {
  font-size: 15px;
  color: var(--muted);
  line-height: 1.6;
  margin: 0;
  max-width: 820px;
}

/* Sub-navegación */
.lic-nav-bar {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  border-bottom: 2px solid var(--line);
  padding-bottom: 10px;
}

.lic-subtab {
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

.lic-subtab:hover {
  border-color: var(--accent);
  color: var(--fg);
}

.lic-subtab.active {
  background: var(--accent);
  color: var(--accent-ink);
  border-color: var(--accent);
}

/* Bloque de contenido */
.lic-card-block {
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

/* Espectro */
.spectrum {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12.5px;
  color: var(--muted);
}

.spectrum-bar {
  flex: 1;
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--ok), var(--warn), var(--bad), var(--muted));
}

/* Categorías */
.concept-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.concept-box {
  background: var(--sunk);
  border: 1px solid var(--line);
  border-top: 4px solid var(--tone, var(--accent));
  border-radius: 10px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.concept-icon {
  font-size: 24px;
}

.concept-box h4 {
  font-size: 16px;
  font-weight: 700;
  color: var(--fg);
  margin: 0;
}

.concept-box p {
  font-size: 13.5px;
  color: var(--muted);
  line-height: 1.5;
  margin: 0;
  flex: 1;
}

.concept-examples {
  font-size: 12.5px;
  color: var(--fg);
}

/* Callouts */
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

.callout-box code {
  font-family: var(--f-mono);
  font-size: 12.5px;
  background: var(--sunk);
  padding: 1px 5px;
  border-radius: 4px;
}

.warning-box {
  background: color-mix(in srgb, var(--warn) 9%, var(--surface));
  border-color: color-mix(in srgb, var(--warn) 35%, var(--surface));
}

.result-box {
  background: color-mix(in srgb, var(--ok) 9%, var(--surface));
  border-color: color-mix(in srgb, var(--ok) 35%, var(--surface));
}

/* Filtros */
.filter-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.chip {
  background: var(--sunk);
  border: 1px solid var(--line);
  color: var(--muted);
  font-size: 12.5px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 999px;
  cursor: pointer;
}

.chip.active {
  background: var(--accent-soft);
  border-color: var(--accent);
  color: var(--accent);
}

/* Licencias */
.lic-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.lic-item {
  background: var(--sunk);
  border: 1px solid var(--line);
  border-left: 4px solid var(--tone, var(--accent));
  border-radius: 10px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lic-item-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.lic-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--fg);
  margin: 0;
}

.lic-spdx {
  font-family: var(--f-mono);
  font-size: 12px;
  color: var(--muted);
}

.lic-pill {
  font-size: 11px;
  font-weight: 600;
  background: var(--surface);
  border: 1px solid var(--line);
  padding: 3px 8px;
  border-radius: 999px;
  color: var(--muted);
  white-space: nowrap;
}

.lic-resumen {
  font-size: 14px;
  color: var(--fg);
  line-height: 1.55;
  margin: 0;
}

.abuela-btn {
  align-self: flex-start;
}

.lic-abuela {
  margin: 0;
  padding: 10px 14px;
  font-size: 14px;
  line-height: 1.55;
  color: var(--fg);
  background: var(--accent-soft);
  border-left: 3px solid var(--accent);
  border-radius: 8px;
}

.abuela-enter-active,
.abuela-leave-active {
  transition: opacity .2s ease, transform .2s ease;
}

.abuela-enter-from,
.abuela-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .abuela-enter-active,
  .abuela-leave-active {
    transition: none;
  }
}

.lic-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.lic-columns ul {
  margin: 4px 0 0 0;
  padding-left: 18px;
  font-size: 13.5px;
  color: var(--fg);
  line-height: 1.5;
}

.col-title {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: .05em;
}

.col-title.ok { color: var(--ok); }
.col-title.warn { color: var(--warn); }
.col-title.bad { color: var(--bad); }

.lic-foot {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: var(--muted);
  border-top: 1px dashed var(--line);
  padding-top: 10px;
}

.lic-foot b {
  color: var(--fg);
}

/* Tabla comparativa */
.table-scroll {
  overflow-x: auto;
  border: 1px solid var(--line);
  border-radius: 10px;
}

.cmp-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
  min-width: 640px;
}

.cmp-table th,
.cmp-table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--line);
  text-align: center;
}

.cmp-table thead th {
  background: var(--sunk);
  color: var(--muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: .04em;
}

.cmp-table tbody th {
  text-align: left;
  color: var(--fg);
  white-space: nowrap;
}

.cmp-table tbody tr:last-child th,
.cmp-table tbody tr:last-child td {
  border-bottom: none;
}

.mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-weight: 700;
  font-size: 13px;
}

.mark.yes { color: var(--ok); background: color-mix(in srgb, var(--ok) 14%, var(--surface)); }
.mark.cond { color: var(--warn); background: color-mix(in srgb, var(--warn) 14%, var(--surface)); }
.mark.no { color: var(--bad); background: color-mix(in srgb, var(--bad) 14%, var(--surface)); }

.table-note {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.55;
  margin: 0;
}

/* Compatibilidad */
.flow-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.flow-step {
  background: var(--sunk);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--fg);
}

.flow-arrow {
  color: var(--accent);
  font-weight: 700;
}

.parts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rule-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  background: var(--sunk);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 14px 18px;
}

.rule-item h4 {
  font-size: 15px;
  font-weight: 700;
  color: var(--fg);
  margin: 0 0 4px 0;
}

.rule-item p {
  font-size: 13.5px;
  color: var(--muted);
  line-height: 1.5;
  margin: 0;
}

.rule-mark {
  flex: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.rule-mark.yes { color: var(--ok); background: color-mix(in srgb, var(--ok) 14%, var(--surface)); }
.rule-mark.cond { color: var(--warn); background: color-mix(in srgb, var(--warn) 14%, var(--surface)); }
.rule-mark.no { color: var(--bad); background: color-mix(in srgb, var(--bad) 14%, var(--surface)); }

/* Asistente */
.wizard {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wizard-q {
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 14px 18px;
  margin: 0;
  background: var(--sunk);
}

.wizard-q legend {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--fg);
  padding: 0 6px;
}

.wizard-opts {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 6px;
}

.wizard-opt {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13.5px;
  color: var(--fg);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 7px 12px;
  cursor: pointer;
}

.wizard-opt.active {
  border-color: var(--accent);
  background: var(--accent-soft);
}

.wizard-opt input {
  accent-color: var(--accent);
}

@media (max-width: 640px) {
  .lic-header-card,
  .lic-card-block {
    padding: 18px;
  }

  .spectrum {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
}
</style>
