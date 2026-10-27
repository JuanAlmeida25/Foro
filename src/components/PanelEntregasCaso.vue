<template>
  <section>
    <div class="section-title" style="margin-bottom: 16px;">
      <div>
        <h2>📤 Entregas del Caso MAREA</h2>
        <p>Cada grupo entrega su SRS y su ficha desde la pestaña del caso. Califícalas criterio por criterio con la rúbrica.</p>
      </div>
      <div class="actions">
        <button class="btn sm" type="button" :disabled="cargando" @click="cargar">
          {{ cargando ? 'Actualizando…' : '↻ Actualizar' }}
        </button>
        <button class="btn primary sm" type="button" :disabled="!entregas.length" @click="exportarCsv">⬇️ Exportar notas CSV</button>
      </div>
    </div>

    <p v-if="error" class="ojo" role="alert">⚠️ {{ error }}</p>

    <!-- Lista de entregas -->
    <template v-if="!abierta">
      <p v-if="cargando" class="nota">Cargando entregas…</p>
      <p v-else-if="!entregas.length" class="nota">Todavía ningún grupo ha entregado.</p>
      <div v-else class="tabla-scroll">
        <table class="tabla">
          <thead>
            <tr>
              <th scope="col">Grupo</th>
              <th scope="col">Última entrega</th>
              <th scope="col">Nota</th>
              <th scope="col"><span class="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in entregas" :key="e.id">
              <td>{{ e.integrantes.join(', ') }}</td>
              <td>{{ fmtDate(e.updatedAt) }}</td>
              <td>
                <span :class="['nota-pill', { pendiente: e.nota === null }]">{{ e.nota === null ? 'Sin calificar' : `${e.nota}/100` }}</span>
              </td>
              <td class="derecha">
                <button class="btn sm" type="button" @click="abrir(e.id)">{{ e.nota === null ? '✍️ Calificar' : '👁️ Ver o corregir' }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Una entrega abierta: lo que escribieron y la rúbrica al lado -->
    <template v-else>
      <button class="btn ghost sm" type="button" @click="cerrar">← Volver a la lista</button>
      <h3 class="grupo">Grupo: {{ abierta.integrantes.join(', ') }}</h3>
      <p class="nota">Entregado el {{ fmtDate(abierta.updatedAt) }}</p>

      <div class="revision">
        <div class="documento">
          <details v-for="bloque in bloques" :key="bloque.titulo" open>
            <summary>{{ bloque.titulo }}</summary>
            <div v-for="a in bloque.apartados" :key="a.id" class="apartado">
              <h4>{{ a.titulo }}</h4>
              <div v-for="c in a.campos" :key="c.id" class="campo">
                <span class="campo-label">{{ c.label }}</span>
                <p :class="{ vacio: !abierta.respuestas[c.id] }">{{ abierta.respuestas[c.id] || '(Sin diligenciar)' }}</p>
              </div>
            </div>
          </details>
        </div>

        <form class="calificar" @submit.prevent="guardar">
          <h4>Rúbrica · <span class="total">{{ total }}/100</span></h4>
          <div v-for="(c, i) in RUBRICA_CASO" :key="c.criterio" class="criterio">
            <label :for="`pts-${i}`">{{ c.criterio }}</label>
            <details class="niveles">
              <summary>Ver niveles</summary>
              <p><b>Excelente:</b> {{ c.excelente }}</p>
              <p><b>Bueno:</b> {{ c.bueno }}</p>
              <p><b>Básico:</b> {{ c.basico }}</p>
              <p><b>Insuficiente:</b> {{ c.insuficiente }}</p>
            </details>
            <div class="fila">
              <input :id="`pts-${i}`" v-model.number="criterios[i].puntos" class="inp puntos" type="number" min="0" :max="c.puntos" step="1" />
              <span class="maximo">/ {{ c.puntos }}</span>
            </div>
            <label :for="`retro-${i}`" class="sr-only">Retroalimentación de {{ c.criterio }}</label>
            <textarea :id="`retro-${i}`" v-model="criterios[i].retro" class="inp" rows="2" placeholder="Retroalimentación (opcional)"></textarea>
          </div>
          <label for="retro-general" class="lbl">Retroalimentación general</label>
          <textarea id="retro-general" v-model="retroGeneral" class="inp" rows="3"></textarea>
          <button class="btn primary" type="submit" :disabled="guardando">
            {{ guardando ? 'Guardando…' : `💾 Guardar nota (${total}/100)` }}
          </button>
        </form>
      </div>
    </template>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchEntregasCaso, fetchEntregaCaso, calificarEntregaCaso } from '../services/api.js'
import { APARTADOS_SRS, APARTADOS_PLANTILLA, PREGUNTAS_CASO, RUBRICA_CASO } from '../data/casoFicha.js'
import { generarCsv } from '../utils/panel.js'
import { downloadFile } from '../utils/exporter.js'
import { fmtDate } from '../utils/text.js'

const emit = defineEmits(['toast'])

// Las preguntas se muestran como un apartado más, para leer todo con el mismo molde
const bloques = [
  { titulo: '📄 SRS', apartados: APARTADOS_SRS },
  { titulo: '📝 Ficha técnica', apartados: APARTADOS_PLANTILLA },
  {
    titulo: '❓ Preguntas y participantes',
    apartados: [{
      id: 'preguntas',
      titulo: 'Preguntas de análisis',
      campos: [...PREGUNTAS_CASO.map(p => ({ id: p.id, label: p.titulo })), { id: 'participantes', label: 'Participantes' }]
    }]
  }
]

const entregas = ref([])
const cargando = ref(false)
const error = ref('')
const abierta = ref(null)
const criterios = ref([])
const retroGeneral = ref('')
const guardando = ref(false)

const total = computed(() => criterios.value.reduce((suma, c) => suma + (Number(c.puntos) || 0), 0))

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    entregas.value = (await fetchEntregasCaso()).entregas
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
}

async function abrir(id) {
  error.value = ''
  try {
    const { entrega } = await fetchEntregaCaso(id)
    abierta.value = entrega
    // Si ya estaba calificada se carga lo que había; si no, todo arranca en cero
    criterios.value = RUBRICA_CASO.map((c, i) => ({
      puntos: entrega.calificacion?.criterios[i]?.puntos ?? 0,
      retro: entrega.calificacion?.criterios[i]?.retro ?? ''
    }))
    retroGeneral.value = entrega.calificacion?.retroGeneral ?? ''
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e) {
    error.value = e.message
  }
}

function cerrar() {
  abierta.value = null
  cargar()
}

async function guardar() {
  guardando.value = true
  error.value = ''
  try {
    const { nota } = await calificarEntregaCaso(abierta.value.id, criterios.value, retroGeneral.value)
    emit('toast', `Nota guardada: ${nota}/100`)
    cerrar()
  } catch (e) {
    error.value = e.message
  } finally {
    guardando.value = false
  }
}

function exportarCsv() {
  const csv = generarCsv(entregas.value, [
    { titulo: 'Integrantes', valor: e => e.integrantes.join(', ') },
    { titulo: 'Nota', valor: e => e.nota ?? '' },
    { titulo: 'Última entrega', valor: e => fmtDate(e.updatedAt) },
    { titulo: 'Calificado', valor: e => (e.calificadoAt ? fmtDate(e.calificadoAt) : '') }
  ])
  const hoy = new Date().toISOString().slice(0, 10)
  downloadFile(`entregas-caso-marea-${hoy}.csv`, new Blob([csv], { type: 'text/csv;charset=utf-8' }))
}

onMounted(cargar)
</script>

<style scoped>
.nota {
  color: var(--muted);
  font-size: 14px;
  margin: 8px 0;
}

.ojo {
  color: var(--bad);
  font-weight: 600;
}

.tabla-scroll {
  overflow-x: auto;
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: var(--surface);
}

.tabla {
  width: 100%;
  min-width: 560px;
  border-collapse: collapse;
}

.tabla th,
.tabla td {
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid var(--line);
}

.tabla thead th {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--muted);
}

.derecha {
  text-align: right;
}

.nota-pill {
  font-size: 12px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--ok) 15%, transparent);
  color: var(--ok);
}

.nota-pill.pendiente {
  background: var(--sunk);
  color: var(--muted);
}

.grupo {
  margin: 14px 0 0;
}

.revision {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(280px, 2fr);
  gap: 18px;
  align-items: start;
  margin-top: 12px;
}

.documento details {
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: var(--surface);
  padding: 10px 16px;
  margin-bottom: 12px;
}

.documento summary {
  cursor: pointer;
  font-weight: 800;
}

.apartado h4 {
  margin: 14px 0 6px;
  color: var(--accent);
}

.campo {
  margin-bottom: 8px;
}

.campo-label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
}

.campo p {
  margin: 2px 0 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-size: 14px;
}

.campo p.vacio {
  color: var(--bad);
  font-style: italic;
}

/* La rúbrica se queda pegada mientras el profe baja leyendo la entrega */
.calificar {
  position: sticky;
  top: 140px;
  max-height: calc(100vh - 160px);
  overflow-y: auto;
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: var(--surface);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.calificar h4 {
  margin: 0;
}

.total {
  color: var(--accent);
}

.criterio {
  border-bottom: 1px solid var(--line);
  padding-bottom: 10px;
}

.criterio > label {
  font-weight: 700;
  font-size: 14px;
}

.niveles {
  font-size: 13px;
  color: var(--muted);
  margin: 4px 0;
}

.niveles p {
  margin: 4px 0;
}

.fila {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 6px 0;
}

.puntos {
  max-width: 90px;
}

.maximo {
  color: var(--muted);
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

@media (max-width: 900px) {
  .revision {
    grid-template-columns: 1fr;
  }

  .calificar {
    position: static;
    max-height: none;
  }
}
</style>
