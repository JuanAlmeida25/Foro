<template>
  <section class="boletin" aria-labelledby="boletin-titulo">
    <div class="boletin-head">
      <h3 id="boletin-titulo">📒 Mi boletín</h3>
      <button class="btn ghost sm" type="button" :disabled="cargando" @click="cargar">
        {{ cargando ? 'Cargando…' : '↻ Actualizar' }}
      </button>
    </div>

    <p v-if="error" class="ojo" role="alert">⚠️ {{ error }}</p>
    <p v-else-if="!boletin" class="nota">Cargando tu boletín…</p>

    <template v-else>
      <div :class="['semaforo', boletin.semaforo.color]" role="status">
        <span class="luz" aria-hidden="true"></span>
        <div>
          <strong>{{ TEXTO_SEMAFORO[boletin.semaforo.color] }}</strong>
          <ul v-if="boletin.semaforo.motivos.length">
            <li v-for="m in boletin.semaforo.motivos" :key="m">{{ m }}</li>
          </ul>
        </div>
      </div>

      <div class="cifras">
        <div><span>Asistencias</span><strong>{{ boletin.asistencia.asistencias }}</strong></div>
        <div><span>Fallas</span><strong>{{ boletin.asistencia.fallas }}</strong></div>
        <div><span>Aportes</span><strong>{{ boletin.aportes.length }}</strong></div>
        <div><span>Réplicas a compañeros</span><strong>{{ boletin.replicasHechas }}</strong></div>
        <div><span>«Útil» recibidos</span><strong>{{ utilesTotales }}</strong></div>
      </div>

      <h4>💬 Mis aportes en el foro</h4>
      <p v-if="!boletin.aportes.length" class="nota">Todavía no has publicado aporte.</p>
      <article v-for="a in boletin.aportes" :key="a.id" class="item">
        <div class="item-top">
          <span class="item-titulo">{{ resumen(a.pregunta) }}</span>
          <span :class="['nota-pill', { pendiente: a.calificacion === null }]">
            {{ a.calificacion === null ? 'Sin calificar' : `${a.calificacion}/100` }}
          </span>
        </div>
        <p v-if="a.retroalimentacion" class="retro">🗣️ {{ a.retroalimentacion }}</p>
        <p class="meta">{{ fmtDate(a.createdAt) }} · 👍 {{ a.utiles }} · 💬 {{ a.replicasRecibidas }} réplicas</p>
      </article>

      <h4>🧩 Caso MAREA</h4>
      <p v-if="!boletin.casoMarea" class="nota">Tu grupo todavía no ha entregado el SRS y la ficha.</p>
      <article v-else class="item">
        <div class="item-top">
          <span class="item-titulo">Grupo: {{ boletin.casoMarea.integrantes.join(', ') }}</span>
          <span :class="['nota-pill', { pendiente: boletin.casoMarea.nota === null }]">
            {{ boletin.casoMarea.nota === null ? 'Entregado, sin calificar' : `${boletin.casoMarea.nota}/100` }}
          </span>
        </div>
        <p v-if="boletin.casoMarea.calificacion?.retroGeneral" class="retro">🗣️ {{ boletin.casoMarea.calificacion.retroGeneral }}</p>
        <p class="meta">Última entrega: {{ fmtDate(boletin.casoMarea.updatedAt) }}. El detalle por criterio está en la pestaña 📤 Entrega del caso.</p>
      </article>

      <h4>📝 Evaluación de conocimientos</h4>
      <p v-if="!boletin.evaluaciones.length" class="nota">No has presentado la evaluación.</p>
      <article v-for="(e, i) in boletin.evaluaciones" :key="i" class="item">
        <div class="item-top">
          <span class="item-titulo">{{ fmtDate(e.createdAt) }}</span>
          <span :class="['nota-pill', { mal: !e.aprobado }]">{{ e.porcentaje }}/100 · {{ e.aprobado ? 'Aprobada' : 'No aprobada' }}</span>
        </div>
      </article>
    </template>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchMiBoletin } from '../services/api.js'
import { fmtDate } from '../utils/text.js'

const TEXTO_SEMAFORO = {
  verde: '🟢 Vas bien, sigue así',
  amarillo: '🟡 Ojo con esto',
  rojo: '🔴 Estás en riesgo: habla con tu instructor'
}

const boletin = ref(null)
const cargando = ref(false)
const error = ref('')

const utilesTotales = computed(() =>
  (boletin.value?.aportes || []).reduce((suma, a) => suma + a.utiles, 0) + (boletin.value?.utilesEnReplicas || 0)
)

const resumen = texto => {
  const limpio = String(texto || '').replace(/\s+/g, ' ').trim()
  return limpio.length > 90 ? limpio.slice(0, 90) + '…' : limpio
}

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    boletin.value = await fetchMiBoletin()
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
}

defineExpose({ cargar })
onMounted(cargar)
</script>

<style scoped>
.boletin {
  margin: 0 0 16px;
}

.boletin-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.boletin h3 {
  margin: 0;
}

.boletin h4 {
  margin: 20px 0 8px;
}

.nota {
  color: var(--muted);
  font-size: 14px;
  margin: 6px 0;
}

.ojo {
  color: var(--bad);
  font-weight: 600;
}

.semaforo {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  border-radius: var(--r);
  padding: 12px 16px;
  margin: 12px 0;
  border: 1px solid var(--line);
}

.semaforo ul {
  margin: 4px 0 0;
  padding-left: 18px;
  font-size: 14px;
  color: var(--muted);
}

.luz {
  flex: none;
  width: 16px;
  height: 16px;
  margin-top: 3px;
  border-radius: 50%;
}

.semaforo.verde .luz { background: var(--ok); }
.semaforo.amarillo .luz { background: var(--warn); }
.semaforo.rojo .luz { background: var(--bad); }
.semaforo.verde { background: color-mix(in srgb, var(--ok) 8%, transparent); }
.semaforo.amarillo { background: color-mix(in srgb, var(--warn) 10%, transparent); }
.semaforo.rojo { background: color-mix(in srgb, var(--bad) 10%, transparent); }

.cifras {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 8px;
}

.cifras div {
  background: var(--sunk);
  border-radius: var(--r);
  padding: 8px 12px;
}

.cifras span {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--muted);
}

.cifras strong {
  font-family: var(--f-display);
  font-size: 1.4rem;
}

.item {
  border: 1px solid var(--line);
  border-radius: var(--r);
  padding: 10px 14px;
  margin-bottom: 8px;
}

.item-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.item-titulo {
  font-weight: 600;
}

.nota-pill {
  flex: none;
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

.nota-pill.mal {
  background: color-mix(in srgb, var(--bad) 15%, transparent);
  color: var(--bad);
}

.retro {
  margin: 6px 0 0;
  font-size: 14px;
}

.meta {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--muted);
}
</style>
