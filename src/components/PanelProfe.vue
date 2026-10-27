<template>
  <div class="panel-profe">
    <!-- Pestañas del Panel del Profe -->
    <div class="profe-tabs-bar" role="tablist">
      <button
        :class="['profe-tab', { active: subPestana === 'foro' }]"
        type="button"
        role="tab"
        :aria-selected="subPestana === 'foro'"
        @click="subPestana = 'foro'"
      >
        💬 Resumen del Foro
        <span class="profe-tab-badge">{{ filas.length }}</span>
      </button>
      <button
        :class="['profe-tab', { active: subPestana === 'evaluaciones' }]"
        type="button"
        role="tab"
        :aria-selected="subPestana === 'evaluaciones'"
        @click="cambiarAEvaluaciones"
      >
        📝 Evaluaciones de Conocimientos
        <span class="profe-tab-badge highlight">{{ evaluaciones.length }}</span>
      </button>
      <button
        :class="['profe-tab', { active: subPestana === 'asistencia' }]"
        type="button"
        role="tab"
        :aria-selected="subPestana === 'asistencia'"
        @click="subPestana = 'asistencia'"
      >
        ✅ Asistencia
      </button>
      <button
        :class="['profe-tab', { active: subPestana === 'aprendices' }]"
        type="button"
        role="tab"
        :aria-selected="subPestana === 'aprendices'"
        @click="subPestana = 'aprendices'"
      >
        👥 Aprendices
      </button>
      <button
        :class="['profe-tab', { active: subPestana === 'entregas' }]"
        type="button"
        role="tab"
        :aria-selected="subPestana === 'entregas'"
        @click="subPestana = 'entregas'"
      >
        📤 Entregas MAREA
      </button>
    </div>

    <!-- ================= SUB-PESTAÑAS 3 Y 4: ASISTENCIA Y CUENTAS DE APRENDIZ ================= -->
    <PanelAsistencia v-if="subPestana === 'asistencia'" @toast="$emit('toast', $event)" />
    <PanelAprendices v-else-if="subPestana === 'aprendices'" @toast="$emit('toast', $event)" />
    <PanelEntregasCaso v-else-if="subPestana === 'entregas'" @toast="$emit('toast', $event)" />

    <!-- ================= SUB-PESTAÑA 1: RESUMEN DEL FORO ================= -->
    <section v-else-if="subPestana === 'foro'">
      <div class="section-title" style="margin-bottom: 20px;">
        <div>
          <h2>👨‍🏫 Panel del Profe • Aportes y Réplicas</h2>
          <p>Quién ya publicó, quién falta por calificar y cuántas réplicas hizo cada aprendiz a sus compañeros.</p>
        </div>
        <div class="actions">
          <button class="btn sm" type="button" :disabled="cargando" @click="cargar">
            {{ cargando ? 'Actualizando…' : '↻ Actualizar' }}
          </button>
          <button class="btn primary sm" type="button" :disabled="!filas.length" @click="exportarCsv">
            ⬇️ Exportar notas a CSV
          </button>
        </div>
      </div>

      <div v-if="error" class="none">{{ error }}</div>
      <div v-else-if="cargando && !filas.length" class="none">Cargando el resumen del foro…</div>
      <div v-else-if="!filas.length" class="none">Todavía ningún aprendiz ha publicado ni replicado.</div>

      <template v-else>
        <div class="panel-stats">
          <div v-for="e in ESTADOS" :key="e.id" :class="['panel-stat', e.id]">
            <b>{{ conteo[e.id] }}</b>
            <span>{{ e.nombre }}</span>
          </div>
          <div class="panel-stat">
            <b>{{ promedio ?? '—' }}</b>
            <span>Promedio de notas</span>
          </div>
        </div>

        <div class="panel-filtros" role="group" aria-label="Filtrar por estado">
          <button
            v-for="f in filtros"
            :key="f.id"
            :class="['panel-chip', { active: filtro === f.id }]"
            type="button"
            :aria-pressed="filtro === f.id"
            @click="filtro = f.id"
          >
            {{ f.nombre }}
          </button>
        </div>

        <div class="panel-tabla-wrap">
          <table class="panel-tabla">
            <thead>
              <tr>
                <th scope="col">Aprendiz</th>
                <th scope="col">Ficha</th>
                <th scope="col">Nota</th>
                <th scope="col">Estado</th>
                <th scope="col" title="Réplicas en aportes de compañeros">Réplicas</th>
                <th scope="col">Publicó</th>
                <th scope="col"><span class="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="f in filasFiltradas" :key="f.autor">
                <td>{{ f.autor }}</td>
                <td>{{ f.ficha || '—' }}</td>
                <td class="num">{{ f.nota ?? '—' }}</td>
                <td><span :class="['estado-tag', f.estado]">{{ nombreEstado(f.estado) }}</span></td>
                <td class="num">{{ f.replicas }}</td>
                <td>{{ f.primerAporte ? fmtDate(f.primerAporte) : '—' }}</td>
                <td>
                  <button
                    v-if="f.aportes.length"
                    class="btn ghost sm"
                    type="button"
                    @click="$emit('ver-aporte', f.aportes[0])"
                  >
                    Ver aporte{{ f.aportes.length > 1 ? ` (${f.aportes.length})` : '' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="!filasFiltradas.length" class="none">Nadie en este estado. ¡Ojalá siempre fuera así de fácil!</div>
        </div>
      </template>
    </section>

    <!-- ================= SUB-PESTAÑA 2: EVALUACIONES DE CONOCIMIENTOS (EXCLUSIVO DEL INSTRUCTOR) ================= -->
    <section v-else-if="subPestana === 'evaluaciones'">
      <div class="section-title" style="margin-bottom: 20px;">
        <div>
          <h2>📝 Evaluaciones de Conocimientos • Resultados Oficiales</h2>
          <p>Resultados confidenciales del examen autónomo de 20 preguntas (1 hora y bloqueo anti-cambio de ventana).</p>
        </div>
        <div class="actions">
          <button class="btn sm" type="button" :disabled="cargandoEvaluaciones" @click="cargarEvaluaciones">
            {{ cargandoEvaluaciones ? 'Actualizando…' : '↻ Actualizar' }}
          </button>
          <button class="btn primary sm" type="button" :disabled="!evaluaciones.length" @click="exportarCsvEvaluaciones">
            ⬇️ Exportar Evaluaciones a CSV
          </button>
        </div>
      </div>

      <div v-if="errorEvaluaciones" class="none">{{ errorEvaluaciones }}</div>
      <div v-else-if="cargandoEvaluaciones && !evaluaciones.length" class="none">Cargando las evaluaciones recibidas…</div>
      <div v-else-if="!evaluaciones.length" class="none">
        Aún ningún aprendiz ha enviado su evaluación. Cuando los aprendices culminen su examen, sus calificaciones y detalles aparecerán exclusivamente aquí.
      </div>

      <template v-else>
        <!-- Estadísticas de la Evaluación -->
        <div class="panel-stats">
          <div class="panel-stat">
            <b>{{ evaluaciones.length }}</b>
            <span>Total Evaluaciones</span>
          </div>
          <div class="panel-stat aprobado">
            <b>{{ totalAprobados }}</b>
            <span>Aprobados (≥70%)</span>
          </div>
          <div class="panel-stat no-aprobado">
            <b>{{ totalNoAprobados }}</b>
            <span>No Aprobados (&lt;70%)</span>
          </div>
          <div class="panel-stat">
            <b>{{ promedioEvaluaciones ?? '—' }} pts</b>
            <span>Promedio del Grupo</span>
          </div>
        </div>

        <!-- Filtros de Evaluación -->
        <div class="panel-filtros" role="group" aria-label="Filtrar evaluaciones">
          <button
            v-for="f in filtrosEvaluaciones"
            :key="f.id"
            :class="['panel-chip', { active: filtroEval === f.id }]"
            type="button"
            @click="filtroEval = f.id"
          >
            {{ f.nombre }} ({{ conteoEval(f.id) }})
          </button>
        </div>

        <!-- Tabla de Evaluaciones -->
        <div class="panel-tabla-wrap">
          <table class="panel-tabla">
            <thead>
              <tr>
                <th scope="col">Aprendiz</th>
                <th scope="col">Ficha</th>
                <th scope="col">Calificación</th>
                <th scope="col">Estado</th>
                <th scope="col">Aciertos</th>
                <th scope="col">Tiempo</th>
                <th scope="col" title="Advertencias por cambio de ventana">Advertencias</th>
                <th scope="col">Cierre</th>
                <th scope="col">Entregado</th>
                <th scope="col"><span class="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ev in evaluacionesFiltradas" :key="ev.id">
                <td><strong>{{ ev.aprendiz }}</strong></td>
                <td>{{ ev.ficha || '—' }}</td>
                <td class="num">
                  <span :class="['eval-score-pill', ev.aprobado ? 'ok' : 'bad']">
                    {{ ev.porcentaje }} / 100
                  </span>
                </td>
                <td>
                  <span :class="['estado-tag', ev.aprobado ? 'aprobado' : 'no-aprobado']">
                    {{ ev.aprobado ? 'Aprobado' : 'No Aprobado' }}
                  </span>
                </td>
                <td class="num">{{ ev.aciertos }} / {{ ev.total }}</td>
                <td>{{ formatearTiempo(ev.tiempo_empleado) }}</td>
                <td>
                  <span :class="['warn-chip', { alert: ev.infracciones > 0 }]">
                    {{ ev.infracciones > 0 ? (ev.infracciones > 1 ? '🚫 2do intento' : '⚠️ 1 advertencia') : '0 / 1' }}
                  </span>
                </td>
                <td>
                  <span class="motivo-tag">{{ etiquetaMotivo(ev.motivo_finalizacion) }}</span>
                </td>
                <td>{{ ev.created_at ? fmtDate(ev.created_at) : '—' }}</td>
                <td>
                  <div class="table-actions-inline">
                    <button
                      class="btn ghost sm"
                      type="button"
                      title="Ver respuestas del aprendiz"
                      @click="abrirDetalleEvaluacion(ev)"
                    >
                      👁️ Ver Respuestas
                    </button>
                    <button
                      class="btn ghost sm delete-btn"
                      type="button"
                      title="Eliminar intento de la base de datos"
                      @click="eliminarEvaluacion(ev.id, ev.aprendiz)"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="!evaluacionesFiltradas.length" class="none">No hay evaluaciones en esta categoría.</div>
        </div>
      </template>
    </section>

    <!-- MODAL DE DETALLE DE RESPUESTAS DEL APRENDIZ -->
    <div v-if="evaluacionSeleccionada" class="modal-backdrop" @click.self="evaluacionSeleccionada = null">
      <div class="modal-box modal-eval-detail">
        <div class="modal-eval-header">
          <div>
            <h3>Respuestas de: {{ evaluacionSeleccionada.aprendiz }}</h3>
            <p class="modal-eval-sub">
              Ficha: <strong>{{ evaluacionSeleccionada.ficha || 'No especificada' }}</strong> •
              Calificación: <strong :class="evaluacionSeleccionada.aprobado ? 'color-ok' : 'color-bad'">{{ evaluacionSeleccionada.porcentaje }} pts</strong> •
              Aciertos: <strong>{{ evaluacionSeleccionada.aciertos }} de {{ evaluacionSeleccionada.total }}</strong>
            </p>
          </div>
          <button class="btn sm" type="button" @click="evaluacionSeleccionada = null">Cerrar</button>
        </div>

        <div class="modal-eval-body">
          <div
            v-for="(item, idx) in detallePreguntasSeleccionadas"
            :key="item.preguntaId || idx"
            :class="['eval-item-card', item.acerto ? 'item-correct' : 'item-wrong']"
          >
            <div class="eval-item-head">
              <span class="eval-status-badge" :data-status="item.acerto ? 'ok' : 'bad'">
                {{ item.acerto ? '✓ Correcta' : '✗ Incorrecta' }}
              </span>
              <span class="eval-norma-text">{{ item.norma }}</span>
            </div>

            <h4 class="eval-item-q">
              <span class="eval-q-num">#{{ idx + 1 }}.</span> {{ item.enunciado }}
            </h4>

            <div class="eval-options-list">
              <div
                v-for="opc in item.opciones"
                :key="opc.id"
                :class="[
                  'eval-option-row',
                  {
                    'is-ok': opc.ok,
                    'is-chosen-wrong': !opc.ok && item.seleccionId === opc.id
                  }
                ]"
              >
                <span class="eval-opt-badge">
                  {{ opc.ok ? '✓ Correcta' : (item.seleccionId === opc.id ? '✗ Marcada por aprendiz' : '—') }}
                </span>
                <span class="eval-opt-text">{{ opc.texto }}</span>
              </div>
            </div>

            <div class="eval-explanation-box">
              <strong>Fundamento técnico:</strong>
              <p>{{ item.explicacion }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import {
  fetchResumenProfe,
  fetchEvaluacionesAdmin,
  deleteEvaluacionAdmin
} from '../services/api.js'
import { resumenPorAprendiz, generarCsv, ESTADOS } from '../utils/panel.js'
import { downloadFile } from '../utils/exporter.js'
import { fmtDate } from '../utils/text.js'
import { formatearCuentaRegresiva } from '../utils/evaluacion.js'

defineEmits(['ver-aporte', 'toast'])

// Se cargan solo cuando el profe abre su pestaña
const PanelAsistencia = defineAsyncComponent(() => import('./PanelAsistencia.vue'))
const PanelAprendices = defineAsyncComponent(() => import('./PanelAprendices.vue'))
const PanelEntregasCaso = defineAsyncComponent(() => import('./PanelEntregasCaso.vue'))

// Pestañas principales del Panel del Profe
const subPestana = ref('foro') // 'foro' | 'evaluaciones' | 'asistencia' | 'aprendices' | 'entregas'

// Datos Foro
const filas = ref([])
const cargando = ref(false)
const error = ref('')
const filtro = ref('todos')

const filtros = [{ id: 'todos', nombre: 'Todos' }, ...ESTADOS]
const nombreEstado = id => ESTADOS.find(e => e.id === id)?.nombre || id

const filasFiltradas = computed(() =>
  filtro.value === 'todos' ? filas.value : filas.value.filter(f => f.estado === filtro.value)
)

const conteo = computed(() => {
  const c = Object.fromEntries(ESTADOS.map(e => [e.id, 0]))
  for (const f of filas.value) c[f.estado]++
  return c
})

const promedio = computed(() => {
  const notas = filas.value.filter(f => f.nota !== null).map(f => f.nota)
  if (!notas.length) return null
  return Math.round(notas.reduce((a, b) => a + b, 0) / notas.length)
})

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    const { aportes, replicas } = await fetchResumenProfe()
    filas.value = resumenPorAprendiz(aportes, replicas)
  } catch (e) {
    error.value = e.message || 'No se pudo cargar el panel'
  } finally {
    cargando.value = false
  }
}

function exportarCsv() {
  const csv = generarCsv(filas.value, [
    { titulo: 'Aprendiz', valor: f => f.autor },
    { titulo: 'Documento', valor: f => f.documento },
    { titulo: 'Ficha', valor: f => f.ficha },
    { titulo: 'Nota', valor: f => f.nota },
    { titulo: 'Estado', valor: f => nombreEstado(f.estado) },
    { titulo: 'Réplicas a compañeros', valor: f => f.replicas },
    { titulo: 'Aportes publicados', valor: f => f.aportes.length },
    { titulo: 'Fecha del primer aporte', valor: f => (f.primerAporte ? fmtDate(f.primerAporte) : '') }
  ])
  const hoy = new Date().toISOString().slice(0, 10)
  downloadFile(`notas-foro-licenciamiento-${hoy}.csv`, new Blob([csv], { type: 'text/csv;charset=utf-8' }))
}

// ================= EVALUACIONES DE CONOCIMIENTOS =================
const evaluaciones = ref([])
const cargandoEvaluaciones = ref(false)
const errorEvaluaciones = ref('')
const filtroEval = ref('todos')
const evaluacionSeleccionada = ref(null)

const filtrosEvaluaciones = [
  { id: 'todos', nombre: 'Todas' },
  { id: 'aprobados', nombre: 'Aprobados' },
  { id: 'no-aprobados', nombre: 'No Aprobados' }
]

function cambiarAEvaluaciones() {
  subPestana.value = 'evaluaciones'
  cargarEvaluaciones()
}

async function cargarEvaluaciones() {
  cargandoEvaluaciones.value = true
  errorEvaluaciones.value = ''
  try {
    let remotas = []
    try {
      remotas = await fetchEvaluacionesAdmin()
    } catch (e) {
      // Fallback a localStorage si la petición remota falla
    }

    // Combinar con localStorage de respaldo sin duplicar
    let locales = []
    try {
      const raw = localStorage.getItem('foro-evaluaciones-instructor-v1')
      if (raw) locales = JSON.parse(raw)
    } catch (e) {}

    const mapa = new Map()
    remotas.forEach(item => mapa.set(item.id, item))
    locales.forEach(item => {
      if (!mapa.has(item.id)) mapa.set(item.id, item)
    })

    evaluaciones.value = Array.from(mapa.values()).sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    )
  } catch (err) {
    errorEvaluaciones.value = err.message || 'No se pudieron cargar las evaluaciones'
  } finally {
    cargandoEvaluaciones.value = false
  }
}

const evaluacionesFiltradas = computed(() => {
  if (filtroEval.value === 'aprobados') {
    return evaluaciones.value.filter(ev => Boolean(ev.aprobado))
  }
  if (filtroEval.value === 'no-aprobados') {
    return evaluaciones.value.filter(ev => !ev.aprobado)
  }
  return evaluaciones.value
})

const totalAprobados = computed(() => evaluaciones.value.filter(e => Boolean(e.aprobado)).length)
const totalNoAprobados = computed(() => evaluaciones.value.filter(e => !e.aprobado).length)

const promedioEvaluaciones = computed(() => {
  if (!evaluaciones.value.length) return null
  const suma = evaluaciones.value.reduce((acc, cur) => acc + (cur.porcentaje || 0), 0)
  return Math.round(suma / evaluaciones.value.length)
})

function conteoEval(id) {
  if (id === 'aprobados') return totalAprobados.value
  if (id === 'no-aprobados') return totalNoAprobados.value
  return evaluaciones.value.length
}

function formatearTiempo(segundos) {
  return formatearCuentaRegresiva(segundos || 0)
}

function etiquetaMotivo(m) {
  if (m === 'tiempo_agotado') return '⏰ Tiempo Agotado'
  if (m === 'infracciones_excedidas') return '🚫 2do Intento Ventana'
  return '✓ Entrega Normal'
}

function abrirDetalleEvaluacion(ev) {
  evaluacionSeleccionada.value = ev
}

const detallePreguntasSeleccionadas = computed(() => {
  if (!evaluacionSeleccionada.value) return []
  try {
    const raw = evaluacionSeleccionada.value.detalle_json
    if (typeof raw === 'string') return JSON.parse(raw)
    if (Array.isArray(raw)) return raw
  } catch (e) {}
  return []
})

async function eliminarEvaluacion(id, aprendizNombre) {
  if (!confirm(`¿Eliminar la evaluación de "${aprendizNombre}"? El aprendiz podrá realizar un nuevo intento.`)) {
    return
  }
  try {
    await deleteEvaluacionAdmin(id)
  } catch (e) {}

  // Quitar también de localStorage
  try {
    const raw = localStorage.getItem('foro-evaluaciones-instructor-v1')
    if (raw) {
      const arr = JSON.parse(raw).filter(item => item.id !== id)
      localStorage.setItem('foro-evaluaciones-instructor-v1', JSON.stringify(arr))
    }
  } catch (e) {}

  evaluaciones.value = evaluaciones.value.filter(item => item.id !== id)
}

function exportarCsvEvaluaciones() {
  const csv = generarCsv(evaluaciones.value, [
    { titulo: 'Aprendiz', valor: e => e.aprendiz },
    { titulo: 'Ficha', valor: e => e.ficha },
    { titulo: 'Calificación (pts)', valor: e => e.porcentaje },
    { titulo: 'Estado', valor: e => (e.aprobado ? 'Aprobado' : 'No Aprobado') },
    { titulo: 'Aciertos', valor: e => e.aciertos },
    { titulo: 'Total Preguntas', valor: e => e.total },
    { titulo: 'Tiempo Empleado', valor: e => formatearTiempo(e.tiempo_empleado) },
    { titulo: 'Infracciones de Ventana', valor: e => e.infracciones },
    { titulo: 'Motivo de Cierre', valor: e => etiquetaMotivo(e.motivo_finalizacion) },
    { titulo: 'Fecha de Entrega', valor: e => (e.created_at ? fmtDate(e.created_at) : '') }
  ])
  const hoy = new Date().toISOString().slice(0, 10)
  downloadFile(`evaluaciones-conocimientos-${hoy}.csv`, new Blob([csv], { type: 'text/csv;charset=utf-8' }))
}

onMounted(() => {
  cargar()
  cargarEvaluaciones()
})
</script>

<style scoped>
.profe-tabs-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--line);
  padding-bottom: 2px;
}

.profe-tab {
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  padding: 10px 18px;
  font-size: 15px;
  font-weight: 700;
  color: var(--muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.15s;
}

.profe-tab:hover {
  color: var(--fg);
}

.profe-tab.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.profe-tab-badge {
  font-size: 11px;
  background: var(--sunk);
  padding: 2px 7px;
  border-radius: 99px;
  color: var(--muted);
}

.profe-tab-badge.highlight {
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 800;
}

.panel-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.panel-stat {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 12px 14px;
}

.panel-stat.aprobado b { color: var(--ok); }
.panel-stat.no-aprobado b { color: var(--bad); }

.panel-stat b {
  display: block;
  font-family: var(--f-display);
  font-size: 26px;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.panel-stat span {
  font-size: 12px;
  color: var(--muted);
}

.panel-filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.panel-chip {
  background: var(--sunk);
  border: 1px solid var(--line);
  color: var(--muted);
  font-size: 12.5px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 999px;
  cursor: pointer;
}

.panel-chip.active {
  background: var(--accent-soft);
  border-color: var(--accent);
  color: var(--accent);
}

.eval-score-pill {
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
}
.eval-score-pill.ok {
  background: rgba(19, 138, 85, 0.12);
  color: var(--ok);
}
.eval-score-pill.bad {
  background: rgba(194, 38, 63, 0.12);
  color: var(--bad);
}

.warn-chip {
  font-size: 12px;
  color: var(--muted);
}
.warn-chip.alert {
  color: var(--bad);
  font-weight: 700;
}

.motivo-tag {
  font-size: 11px;
  color: var(--muted);
}

.table-actions-inline {
  display: flex;
  gap: 6px;
  align-items: center;
}

.delete-btn {
  color: var(--bad);
}

/* MODAL DETALLE DE RESPUESTAS */
.modal-eval-detail {
  max-width: 760px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.modal-eval-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--line);
  padding-bottom: 12px;
}

.modal-eval-header h3 {
  margin: 0 0 4px;
  font-size: 18px;
  color: var(--fg);
}

.modal-eval-sub {
  margin: 0;
  font-size: 13px;
  color: var(--muted);
}

.color-ok { color: var(--ok); }
.color-bad { color: var(--bad); }

.modal-eval-body {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-right: 4px;
}

.eval-item-card {
  background: var(--sunk);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 16px;
}

.eval-item-card.item-correct {
  border-left: 4px solid var(--ok);
}

.eval-item-card.item-wrong {
  border-left: 4px solid var(--bad);
}

.eval-item-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.eval-status-badge {
  font-size: 11.5px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
}
.eval-status-badge[data-status="ok"] {
  background: rgba(19, 138, 85, 0.15);
  color: var(--ok);
}
.eval-status-badge[data-status="bad"] {
  background: rgba(194, 38, 63, 0.15);
  color: var(--bad);
}

.eval-norma-text {
  font-size: 11px;
  color: var(--muted);
  font-family: var(--f-mono);
}

.eval-item-q {
  margin: 0 0 12px;
  font-size: 14.5px;
  color: var(--fg);
  line-height: 1.4;
}

.eval-q-num {
  color: var(--accent);
  font-weight: 800;
}

.eval-options-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.eval-option-row {
  display: flex;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  background: var(--surface);
  border: 1px solid var(--line);
}

.eval-option-row.is-ok {
  border-color: var(--ok);
  background: rgba(19, 138, 85, 0.08);
}

.eval-option-row.is-chosen-wrong {
  border-color: var(--bad);
  background: rgba(194, 38, 63, 0.08);
}

.eval-opt-badge {
  font-weight: 700;
  font-size: 11.5px;
  flex-shrink: 0;
  width: 140px;
}

.is-ok .eval-opt-badge { color: var(--ok); }
.is-chosen-wrong .eval-opt-badge { color: var(--bad); }

.eval-explanation-box {
  background: var(--surface);
  border-left: 3px solid var(--accent);
  padding: 8px 12px;
  border-radius: 0 6px 6px 0;
  font-size: 12.5px;
  color: var(--fg);
}

.eval-explanation-box strong {
  display: block;
  margin-bottom: 2px;
  color: var(--accent);
}

.eval-explanation-box p {
  margin: 0;
  line-height: 1.4;
}
</style>
