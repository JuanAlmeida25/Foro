<template>
  <div class="caso-view">
    <header class="caso-header-card">
      <div class="caso-header-badge">
        <span class="badge-info-pill">🧩 Actividad de aprendizaje</span>
        <span class="badge-role-pill">SENA • ADSO</span>
      </div>
      <h2 class="caso-header-title">Caso MAREA: la cooperativa que quería dejar el cuaderno</h2>
      <p class="caso-header-desc">
        Lean el caso, encuentren los datos regados en los cuatro documentos y elaboren la ficha técnica del software
        con los 8 apartados de la pestaña «Ficha Técnica y Normas». Lo que escriban queda guardado en este navegador.
      </p>
    </header>

    <nav class="caso-nav-bar" aria-label="Partes de la actividad">
      <button
        v-for="tab in tabsVisibles"
        :key="tab.id"
        :class="['caso-subtab', { active: seccionActiva === tab.id }]"
        type="button"
        @click="seccionActiva = tab.id"
      >
        <span>{{ tab.icono }}</span>
        <span>{{ tab.titulo }}</span>
      </button>
    </nav>

    <!-- EL CASO -->
    <section v-if="seccionActiva === 'caso'" class="caso-card-block">
      <div class="info-grid">
        <div v-for="item in INFO_ACTIVIDAD" :key="item.campo" class="info-row">
          <div class="info-key">{{ item.campo }}</div>
          <div class="info-val">{{ item.detalle }}</div>
        </div>
      </div>

      <div class="card-section-head">
        <div class="section-tag">Propósito</div>
        <p v-for="(p, i) in PROPOSITO" :key="i">{{ p }}</p>
      </div>

      <div class="callout-box">
        <div class="callout-icon">🎭</div>
        <p>{{ NOTA_FICCION }}</p>
      </div>

      <div class="card-section-head">
        <div class="section-tag">Contexto</div>
        <h3>COOPEBRISAS, Cabo de la Vela</h3>
        <p v-for="(p, i) in CONTEXTO" :key="i">{{ p }}</p>
      </div>

      <article v-for="doc in DOCUMENTOS" :key="doc.id" class="doc-card">
        <div class="doc-head">
          <span class="doc-icon">{{ doc.icono }}</span>
          <div>
            <h4>{{ doc.titulo }}</h4>
            <span class="doc-fecha">{{ doc.fecha }}</span>
          </div>
        </div>

        <dl v-if="doc.encabezado" class="mail-head">
          <div><dt>De:</dt><dd>{{ doc.encabezado.de }}</dd></div>
          <div><dt>Para:</dt><dd>{{ doc.encabezado.para }}</dd></div>
          <div><dt>Asunto:</dt><dd>{{ doc.encabezado.asunto }}</dd></div>
        </dl>

        <div v-if="doc.dialogo" class="dialogo">
          <p v-for="(linea, i) in doc.dialogo" :key="i">
            <b>{{ linea.quien }}:</b> {{ linea.texto }}
          </p>
        </div>

        <p v-for="(p, i) in doc.parrafos || []" :key="'p' + i" class="doc-texto">{{ p }}</p>
        <ul v-if="doc.lista" class="doc-lista">
          <li v-for="(item, i) in doc.lista" :key="i">{{ item }}</li>
        </ul>
        <p v-for="(p, i) in doc.cierre || []" :key="'c' + i" class="doc-texto">{{ p }}</p>
      </article>

      <div class="card-section-head">
        <div class="section-tag">Equipo de desarrollo</div>
      </div>
      <div class="info-grid">
        <div v-for="item in EQUIPO" :key="item.campo" class="info-row">
          <label v-if="item.editable" :for="'caso-' + item.id" class="info-key">{{ item.campo }}</label>
          <div v-else class="info-key">{{ item.campo }}</div>
          <input
            v-if="item.editable"
            :id="'caso-' + item.id"
            class="caso-input info-val"
            type="text"
            :value="respuestas[item.id] ?? item.detalle"
            @input="setRespuesta(item.id, $event.target.value)"
          />
          <div v-else class="info-val">{{ item.detalle }}</div>
        </div>
      </div>
    </section>

    <!-- INSTRUCCIONES -->
    <section v-else-if="seccionActiva === 'instrucciones'" class="caso-card-block">
      <div class="card-section-head">
        <div class="section-tag">Paso a paso</div>
        <h3>Instrucciones para el aprendiz</h3>
        <p>Sigan los pasos en orden.</p>
      </div>
      <ol class="pasos">
        <li v-for="(paso, i) in INSTRUCCIONES" :key="i" class="paso">
          <span class="paso-n">{{ i + 1 }}</span>
          <div>
            <h4>{{ paso.titulo }} <span class="paso-tiempo">{{ paso.tiempo }}</span></h4>
            <p>{{ paso.texto }}</p>
          </div>
        </li>
      </ol>
    </section>

    <!-- PLANTILLA -->
    <section v-else-if="seccionActiva === 'plantilla'" class="caso-card-block">
      <div class="card-section-head">
        <div class="section-tag">Para diligenciar</div>
        <h3>Plantilla de la ficha técnica</h3>
        <p>Todo requisito no funcional debe ser medible. Donde usen un supuesto, márquenlo con [S#].</p>
      </div>

      <div class="progreso" role="status">
        <div class="progreso-barra"><span :style="{ width: progreso.porcentaje + '%' }"></span></div>
        <span>{{ progreso.llenos }} de {{ progreso.total }} campos diligenciados</span>
      </div>

      <fieldset v-for="a in APARTADOS_PLANTILLA" :key="a.id" class="apartado">
        <legend>{{ a.titulo }}</legend>
        <div v-for="c in a.campos" :key="c.id" class="campo">
          <label :for="'caso-' + c.id">{{ c.label }}</label>
          <small v-if="c.ayuda" class="campo-ayuda">{{ c.ayuda }}</small>
          <textarea
            v-if="c.largo"
            :id="'caso-' + c.id"
            class="caso-input"
            rows="4"
            :value="respuestas[c.id] || ''"
            @input="setRespuesta(c.id, $event.target.value)"
          ></textarea>
          <input
            v-else
            :id="'caso-' + c.id"
            class="caso-input"
            type="text"
            :value="respuestas[c.id] || ''"
            @input="setRespuesta(c.id, $event.target.value)"
          />
        </div>
      </fieldset>

      <div class="acciones">
        <button class="btn primary" type="button" :disabled="generandoPdf" @click="descargarPdf">
          {{ generandoPdf ? 'Generando documento…' : 'Descargar PDF de mi ficha' }}
        </button>
        <button class="btn ghost sm" type="button" @click="limpiarRespuestas">Limpiar todo</button>
      </div>
    </section>

    <!-- PREGUNTAS -->
    <section v-else-if="seccionActiva === 'preguntas'" class="caso-card-block">
      <div class="card-section-head">
        <div class="section-tag">Análisis</div>
        <h3>Preguntas de análisis</h3>
        <p>Máximo 10 líneas por pregunta, con argumentos y citando la norma que aplica. Las respuestas salen en el PDF.</p>
      </div>
      <article v-for="(p, idx) in PREGUNTAS_CASO" :key="p.id" class="pregunta-card">
        <h4><span class="paso-n">{{ idx + 1 }}</span> {{ p.titulo }}</h4>
        <p>{{ p.pregunta }}</p>
        <label :for="'caso-' + p.id" class="sr-only">Respuesta a {{ p.titulo }}</label>
        <textarea
          :id="'caso-' + p.id"
          class="caso-input"
          rows="5"
          placeholder="Escribe aquí tu respuesta y argumentación..."
          :value="respuestas[p.id] || ''"
          @input="setRespuesta(p.id, $event.target.value)"
        ></textarea>
      </article>
      <div class="acciones">
        <button class="btn primary" type="button" :disabled="generandoPdf" @click="descargarPdf">
          {{ generandoPdf ? 'Generando documento…' : 'Descargar PDF de mi ficha' }}
        </button>
      </div>
    </section>

    <!-- RÚBRICA -->
    <section v-else-if="seccionActiva === 'rubrica'" class="caso-card-block">
      <div class="card-section-head">
        <div class="section-tag">Evaluación</div>
        <h3>Rúbrica de evaluación</h3>
        <p>Puntaje total: <b>{{ totalRubrica }} puntos</b>. Aprobado: <b>{{ NOTA_APROBACION }} puntos o más</b>.</p>
      </div>
      <div class="tabla-scroll">
        <table class="rubrica">
          <thead>
            <tr>
              <th>Criterio</th>
              <th>Excelente</th>
              <th>Bueno</th>
              <th>Básico</th>
              <th>Insuficiente</th>
              <th>Puntos</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in RUBRICA_CASO" :key="r.criterio">
              <th scope="row">{{ r.criterio }}</th>
              <td>{{ r.excelente }}</td>
              <td>{{ r.bueno }}</td>
              <td>{{ r.basico }}</td>
              <td>{{ r.insuficiente }}</td>
              <td class="puntos">{{ r.puntos }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- SOLUCIONARIO (solo profe) -->
    <section v-else-if="seccionActiva === 'solucionario' && isAdmin" class="caso-card-block">
      <div class="callout-box warning-box">
        <div class="callout-icon">🔒</div>
        <p>
          Solo lo ves porque tienes el modo admin activo. Antes de usarlo, verifica la vigencia de las normas
          y del reglamento de propiedad intelectual del SENA.
        </p>
      </div>

      <p v-if="!solucionario">Cargando solucionario…</p>
      <template v-else>
        <div class="card-section-head">
          <div class="section-tag">Vacíos sembrados</div>
          <h3>Supuestos esperados</h3>
        </div>
        <div class="tabla-scroll">
          <table class="rubrica">
            <thead>
              <tr><th>#</th><th>Vacío o contradicción</th><th>Dónde</th><th>Supuesto razonable</th></tr>
            </thead>
            <tbody>
              <tr v-for="v in solucionario.VACIOS" :key="v.id">
                <th scope="row">{{ v.id }}</th>
                <td>{{ v.vacio }}</td>
                <td>{{ v.donde }}</td>
                <td>{{ v.supuesto }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card-section-head">
          <div class="section-tag">FT-ADSO-2026-07</div>
          <h3>Ficha resuelta (resumen)</h3>
        </div>
        <article v-for="a in solucionario.FICHA_RESUELTA" :key="a.titulo" class="doc-card">
          <h4>{{ a.titulo }}</h4>
          <ul class="doc-lista">
            <li v-for="(p, i) in a.puntos" :key="i">{{ p }}</li>
          </ul>
        </article>

        <div class="card-section-head">
          <div class="section-tag">Preguntas</div>
          <h3>Respuestas esperadas</h3>
        </div>
        <article v-for="(r, idx) in solucionario.RESPUESTAS_ESPERADAS" :key="r.id" class="pregunta-card">
          <h4><span class="paso-n">{{ idx + 1 }}</span> {{ tituloPregunta(r.id) }}</h4>
          <p>{{ r.respuesta }}</p>
        </article>

        <div class="card-section-head">
          <div class="section-tag">Ojo con esto</div>
          <h3>Errores frecuentes</h3>
        </div>
        <ul class="doc-lista">
          <li v-for="(e, i) in solucionario.ERRORES_FRECUENTES" :key="i">{{ e }}</li>
        </ul>
      </template>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import {
  LS_CASO_FICHA_KEY,
  INFO_ACTIVIDAD,
  PROPOSITO,
  NOTA_FICCION,
  CONTEXTO,
  DOCUMENTOS,
  EQUIPO,
  INSTRUCCIONES,
  APARTADOS_PLANTILLA,
  PREGUNTAS_CASO,
  NOTA_APROBACION,
  RUBRICA_CASO
} from '../data/casoFicha.js'
import { progresoFicha, puntajeRubrica } from '../utils/casoFicha.js'
import { buildPdfFichaCaso, downloadFile } from '../utils/exporter.js'

const props = defineProps({
  isAdmin: { type: Boolean, default: false }
})

const seccionTabs = [
  { id: 'caso', icono: '🐟', titulo: 'El Caso' },
  { id: 'instrucciones', icono: '🧭', titulo: 'Instrucciones' },
  { id: 'plantilla', icono: '📝', titulo: 'Plantilla' },
  { id: 'preguntas', icono: '❓', titulo: 'Preguntas' },
  { id: 'rubrica', icono: '📊', titulo: 'Rúbrica' },
  { id: 'solucionario', icono: '🔑', titulo: 'Solucionario', soloAdmin: true }
]

const seccionActiva = ref('caso')
const tabsVisibles = computed(() => seccionTabs.filter(t => !t.soloAdmin || props.isAdmin))
const totalRubrica = puntajeRubrica(RUBRICA_CASO)

// El solucionario se pide solo cuando entra el profe; así no viaja en el paquete de la pestaña
const solucionario = ref(null)
watch(() => props.isAdmin, async esAdmin => {
  if (!esAdmin) {
    if (seccionActiva.value === 'solucionario') seccionActiva.value = 'caso'
    return
  }
  if (!solucionario.value) solucionario.value = await import('../data/casoFichaSolucionario.js')
}, { immediate: true })

function tituloPregunta(id) {
  return PREGUNTAS_CASO.find(p => p.id === id)?.titulo || id
}

/* ----- Respuestas guardadas en el navegador ----- */
const respuestas = reactive({})
const generandoPdf = ref(false)
const progreso = computed(() => progresoFicha(APARTADOS_PLANTILLA, respuestas))

onMounted(() => {
  try {
    Object.assign(respuestas, JSON.parse(localStorage.getItem(LS_CASO_FICHA_KEY) || '{}'))
  } catch (e) {
    console.warn('No se pudieron cargar las respuestas del caso', e)
  }
})

function setRespuesta(id, valor) {
  respuestas[id] = valor
  try {
    localStorage.setItem(LS_CASO_FICHA_KEY, JSON.stringify(respuestas))
  } catch (e) {
    // Modo incógnito o almacenamiento lleno: se pierde al recargar, pero la página sigue andando
    console.warn('No se pudo guardar la respuesta del caso', e)
  }
}

function limpiarRespuestas() {
  if (!confirm('¿Deseas vaciar toda la ficha y las respuestas? No hay vuelta atrás.')) return
  Object.keys(respuestas).forEach(k => delete respuestas[k])
  try {
    localStorage.removeItem(LS_CASO_FICHA_KEY)
  } catch (e) {
    console.warn('No se pudo limpiar el almacenamiento del caso', e)
  }
}

async function descargarPdf() {
  generandoPdf.value = true
  try {
    const blob = await buildPdfFichaCaso(APARTADOS_PLANTILLA, PREGUNTAS_CASO, respuestas)
    const codigo = (respuestas['enc-codigo'] || '').trim().replace(/[^\w-]+/g, '_')
    await downloadFile('Ficha_Tecnica_MAREA' + (codigo ? '_' + codigo : '') + '.pdf', blob)
  } catch (e) {
    console.error(e)
    alert('No se pudo generar el PDF de la ficha.')
  } finally {
    generandoPdf.value = false
  }
}
</script>

<style scoped>
.caso-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.caso-header-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-left: 6px solid var(--accent-2);
  border-radius: 12px;
  padding: 24px 28px;
  box-shadow: var(--shadow);
}

.caso-header-badge {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.badge-info-pill,
.badge-role-pill {
  font-size: 11.5px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
}

.badge-info-pill {
  color: var(--accent);
  background: var(--accent-soft);
  text-transform: uppercase;
  letter-spacing: .05em;
}

.badge-role-pill {
  color: var(--ok);
  background: color-mix(in srgb, var(--ok) 12%, var(--surface));
}

.caso-header-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--fg);
  font-family: var(--f-display);
  margin: 0 0 8px 0;
}

.caso-header-desc {
  font-size: 15px;
  color: var(--muted);
  line-height: 1.6;
  margin: 0;
  max-width: 820px;
}

.caso-nav-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  border-bottom: 2px solid var(--line);
  padding-bottom: 10px;
}

.caso-subtab {
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

.caso-subtab:hover {
  border-color: var(--accent);
  color: var(--fg);
}

.caso-subtab.active {
  background: var(--accent);
  color: var(--accent-ink);
  border-color: var(--accent);
}

.caso-card-block {
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
  margin: 0 0 10px 0;
}

.info-grid {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--line);
  border-radius: 10px;
  overflow: hidden;
}

.info-row {
  display: grid;
  grid-template-columns: 220px 1fr;
  border-bottom: 1px solid var(--line);
}

.info-row:last-child {
  border-bottom: 0;
}

.info-key {
  background: var(--sunk);
  font-weight: 700;
  font-size: 13.5px;
  color: var(--fg);
  padding: 10px 14px;
}

.info-val {
  font-size: 14px;
  color: var(--fg);
  line-height: 1.55;
  padding: 10px 14px;
}

/* El input se mete en la celda sin bordes propios, para que la tabla no quede con doble raya */
input.info-val {
  border: 0;
  border-radius: 0;
  min-width: 0;
}

.callout-box {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: color-mix(in srgb, var(--accent) 7%, var(--surface));
  border: 1px solid color-mix(in srgb, var(--accent) 25%, var(--line));
  border-radius: 10px;
  padding: 14px 16px;
}

.callout-box.warning-box {
  background: color-mix(in srgb, var(--warn) 9%, var(--surface));
  border-color: color-mix(in srgb, var(--warn) 30%, var(--line));
}

.callout-icon {
  font-size: 20px;
}

.callout-box p {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  color: var(--fg);
}

.doc-card {
  background: var(--sunk);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 18px 20px;
}

.doc-card h4 {
  font-size: 16px;
  font-weight: 700;
  color: var(--fg);
  margin: 0 0 8px 0;
}

.doc-head {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.doc-head h4 {
  margin: 0;
}

.doc-icon {
  font-size: 24px;
}

.doc-fecha {
  font-size: 12.5px;
  color: var(--muted);
}

.mail-head {
  margin: 0 0 12px 0;
  font-size: 13.5px;
  border-bottom: 1px dashed var(--line);
  padding-bottom: 10px;
}

.mail-head div {
  display: flex;
  gap: 6px;
}

.mail-head dt {
  font-weight: 700;
  color: var(--muted);
}

.mail-head dd {
  margin: 0;
  color: var(--fg);
}

.dialogo p,
.doc-texto {
  font-size: 14.5px;
  line-height: 1.6;
  color: var(--fg);
  margin: 0 0 8px 0;
}

.doc-lista {
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14.5px;
  line-height: 1.55;
  color: var(--fg);
}

.pasos {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.paso {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  background: var(--sunk);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 16px 18px;
}

.paso h4 {
  margin: 0 0 6px 0;
  font-size: 15.5px;
  color: var(--fg);
}

.paso p {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  color: var(--fg);
}

.paso-n {
  flex: none;
  display: inline-grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--accent);
  color: var(--accent-ink);
  font-weight: 700;
  font-size: 13px;
}

.paso-tiempo {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-2);
  margin-left: 6px;
}

.progreso {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13.5px;
  color: var(--muted);
  flex-wrap: wrap;
}

.progreso-barra {
  flex: 1;
  min-width: 160px;
  height: 8px;
  background: var(--sunk);
  border-radius: 999px;
  overflow: hidden;
}

.progreso-barra span {
  display: block;
  height: 100%;
  background: var(--accent-2);
  transition: width .3s ease;
}

.apartado {
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 16px 18px 6px;
  margin: 0;
  min-width: 0;
}

.apartado legend {
  font-weight: 700;
  font-size: 15px;
  color: var(--accent);
  padding: 0 6px;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 14px;
}

.campo label {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--fg);
}

.campo-ayuda {
  font-size: 12.5px;
  color: var(--muted);
}

.caso-input {
  width: 100%;
  box-sizing: border-box;
  background: var(--surface);
  color: var(--fg);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 9px 12px;
  font: inherit;
  font-size: 14px;
  resize: vertical;
}

.caso-input:focus {
  outline: 2px solid color-mix(in srgb, var(--accent) 45%, transparent);
  border-color: var(--accent);
}

.pregunta-card {
  background: var(--sunk);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 18px 20px;
}

.pregunta-card h4 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 8px 0;
  font-size: 16px;
  color: var(--fg);
}

.pregunta-card p {
  margin: 0 0 12px 0;
  font-size: 14.5px;
  line-height: 1.55;
  color: var(--fg);
}

.acciones {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.tabla-scroll {
  overflow-x: auto;
}

.rubrica {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
  font-size: 13.5px;
  color: var(--fg);
}

.rubrica th,
.rubrica td {
  border: 1px solid var(--line);
  padding: 10px 12px;
  text-align: left;
  vertical-align: top;
  line-height: 1.5;
}

.rubrica thead th {
  background: var(--sunk);
  font-weight: 700;
}

.rubrica tbody th {
  font-weight: 700;
  width: 18%;
}

.rubrica .puntos {
  text-align: center;
  font-weight: 700;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (max-width: 640px) {
  .caso-header-card,
  .caso-card-block {
    padding: 18px 16px;
  }

  .info-row {
    grid-template-columns: 1fr;
  }
}
</style>
