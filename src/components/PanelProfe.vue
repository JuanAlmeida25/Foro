<template>
  <div class="panel-profe">
    <div class="section-title" style="margin-bottom: 20px;">
      <div>
        <h2>👨‍🏫 Panel del Profe</h2>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchResumenProfe } from '../services/api.js'
import { resumenPorAprendiz, generarCsv, ESTADOS } from '../utils/panel.js'
import { downloadFile } from '../utils/exporter.js'
import { fmtDate } from '../utils/text.js'

defineEmits(['ver-aporte', 'toast'])

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

onMounted(cargar)
</script>

<style scoped>
.panel-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.panel-stat {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 12px 14px;
}

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

/* La tabla se desplaza por dentro en el celular, sin empujar la página hacia los lados */
.panel-tabla-wrap {
  overflow-x: auto;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
}

.panel-tabla {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.panel-tabla th,
.panel-tabla td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid var(--line);
  white-space: nowrap;
}

.panel-tabla th {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: var(--muted);
  background: var(--sunk);
}

.panel-tabla tbody tr:last-child td {
  border-bottom: 0;
}

.panel-tabla .num {
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.estado-tag {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 9px;
  border-radius: 999px;
  border: 1px solid currentColor;
}

.aprobado { color: var(--ok); }
.no-aprobado { color: var(--bad); }
.sin-calificar { color: var(--warn); }
.sin-aporte { color: var(--muted); }

.panel-stat.aprobado b { color: var(--ok); }
.panel-stat.no-aprobado b { color: var(--bad); }
.panel-stat.sin-calificar b { color: var(--warn); }
.panel-stat span,
.panel-stat.sin-aporte b { color: var(--muted); }

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
