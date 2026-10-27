<template>
  <section class="caso-card-block">
    <div class="card-section-head">
      <div class="section-tag">Entrega</div>
      <h3>Entregar el SRS y la ficha al profe</h3>
      <p>
        Un solo integrante entrega por todo el grupo y escoge a sus compañeros. Se manda lo que tienen en este
        navegador; pueden corregir y volver a entregar hasta que el profe califique.
      </p>
    </div>

    <div v-if="!aprendiz" class="aviso">
      <p>👤 Para entregar entra con tu cuenta de aprendiz.</p>
      <button class="btn primary sm" type="button" @click="emit('ir-a-cuenta')">Entrar o registrarme</button>
    </div>

    <template v-else>
      <p v-if="error" class="ojo" role="alert">⚠️ {{ error }}</p>
      <p v-if="cargando" class="nota">Cargando tu entrega…</p>

      <template v-else>
        <!-- Ya calificada: la nota y la retroalimentación por criterio -->
        <div v-if="entrega?.calificada" class="calificada">
          <p class="nota-grande">{{ entrega.nota }}<span>/100</span></p>
          <p class="nota">Grupo: {{ entrega.integrantes.map(i => i.nombre).join(', ') }}</p>
          <p v-if="entrega.calificacion.retroGeneral" class="retro-general">🗣️ {{ entrega.calificacion.retroGeneral }}</p>
          <div class="tabla-scroll">
            <table class="rubrica">
              <thead>
                <tr><th scope="col">Criterio</th><th scope="col">Puntos</th><th scope="col">Retroalimentación</th></tr>
              </thead>
              <tbody>
                <tr v-for="c in entrega.calificacion.criterios" :key="c.criterio">
                  <th scope="row">{{ c.criterio }}</th>
                  <td class="puntos">{{ c.puntos }}/{{ c.maximo }}</td>
                  <td>{{ c.retro || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <template v-else>
          <p v-if="entrega" class="estado">
            ✅ Entregado el {{ fmtDate(entrega.updatedAt) }} por el grupo de
            <strong>{{ entrega.integrantes.map(i => i.nombre).join(', ') }}</strong>. Si cambiaron algo, vuelvan a entregar.
          </p>

          <div class="progresos">
            <div><span>📄 SRS</span><strong>{{ progresoSrs.porcentaje }}%</strong></div>
            <div><span>📝 Ficha</span><strong>{{ progresoFicha.porcentaje }}%</strong></div>
          </div>

          <fieldset class="grupo">
            <legend>Compañeros de grupo (máximo {{ MAX_COMPANEROS }})</legend>
            <label for="buscar-companero" class="sr-only">Buscar compañero</label>
            <input id="buscar-companero" v-model="busqueda" class="inp" placeholder="🔎 Buscar por nombre" />
            <div class="lista-companeros">
              <label v-for="c in companerosFiltrados" :key="c.ref" class="companero">
                <input
                  type="checkbox"
                  :checked="escogidos.includes(c.ref)"
                  :disabled="!escogidos.includes(c.ref) && escogidos.length >= MAX_COMPANEROS"
                  @change="alternar(c.ref)"
                />
                {{ c.nombre }}
              </label>
              <p v-if="!companerosFiltrados.length" class="nota">Nadie coincide. ¿Ya creó su cuenta?</p>
            </div>
            <p class="nota">Si trabajas solo, no escojas a nadie.</p>
          </fieldset>

          <div class="acciones">
            <button class="btn primary" type="button" :disabled="enviando || !progresoSrs.llenos" @click="entregar">
              {{ enviando ? 'Entregando…' : entrega ? '📤 Volver a entregar' : '📤 Entregar al profe' }}
            </button>
            <span v-if="!progresoSrs.llenos" class="nota">Primero llena el SRS.</span>
          </div>
        </template>
      </template>
    </template>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { fetchMiEntregaCaso, fetchCompaneros, entregarCaso } from '../services/api.js'
import { aprendiz } from '../services/sesionAprendiz.js'
import { fmtDate } from '../utils/text.js'

const props = defineProps({
  respuestas: { type: Object, required: true },
  progresoSrs: { type: Object, required: true },
  progresoFicha: { type: Object, required: true }
})
const emit = defineEmits(['ir-a-cuenta'])

// Grupos de 2 a 3: quien entrega más 2 compañeros
const MAX_COMPANEROS = 2

const entrega = ref(null)
const companeros = ref([])
const escogidos = ref([])
const busqueda = ref('')
const cargando = ref(false)
const enviando = ref(false)
const error = ref('')

const companerosFiltrados = computed(() => {
  const texto = busqueda.value.trim().toLowerCase()
  return companeros.value.filter(c => !texto || c.nombre.toLowerCase().includes(texto) || escogidos.value.includes(c.ref))
})

function alternar(ref) {
  escogidos.value = escogidos.value.includes(ref)
    ? escogidos.value.filter(r => r !== ref)
    : [...escogidos.value, ref].slice(0, MAX_COMPANEROS)
}

async function cargar() {
  if (!aprendiz.value) return
  cargando.value = true
  error.value = ''
  try {
    const [{ entrega: actual }, lista] = await Promise.all([fetchMiEntregaCaso(), fetchCompaneros()])
    entrega.value = actual
    companeros.value = lista.companeros
    // Si ya entregaron, se marcan los mismos compañeros (menos uno mismo, que no sale en la lista)
    if (actual) {
      const refs = new Set(lista.companeros.map(c => c.ref))
      escogidos.value = actual.integrantes.map(i => i.ref).filter(r => refs.has(r))
    }
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
}

async function entregar() {
  const nombres = companeros.value.filter(c => escogidos.value.includes(c.ref)).map(c => c.nombre)
  const quienes = nombres.length ? `con ${nombres.join(' y ')}` : 'tú solo'
  if (!confirm(`¿Entregar el SRS y la ficha ${quienes}? Pueden volver a entregar hasta que el profe califique.`)) return
  enviando.value = true
  error.value = ''
  try {
    entrega.value = (await entregarCaso({ ...props.respuestas }, escogidos.value)).entrega
  } catch (e) {
    error.value = e.message
  } finally {
    enviando.value = false
  }
}

// Si entra o sale de la cuenta con la pestaña abierta, se vuelve a cargar
watch(() => aprendiz.value?.documento, () => {
  entrega.value = null
  escogidos.value = []
  cargar()
})
onMounted(cargar)
</script>

<style scoped>
/* Los mismos de las otras tarjetas del caso: los estilos scoped del padre no le llegan a este hijo */
.caso-card-block {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 28px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 18px;
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
  margin: 0 0 10px 0;
}

.card-section-head p {
  font-size: 15px;
  line-height: 1.65;
  margin: 0;
}

.aviso {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  border-left: 5px solid var(--warn);
  background: color-mix(in srgb, var(--warn) 10%, transparent);
  border-radius: var(--r);
  padding: 12px 16px;
}

.aviso p {
  margin: 0;
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

.estado {
  border-left: 5px solid var(--ok);
  background: color-mix(in srgb, var(--ok) 8%, transparent);
  border-radius: var(--r);
  padding: 10px 14px;
}

.progresos {
  display: flex;
  gap: 10px;
  margin: 12px 0;
}

.progresos div {
  background: var(--sunk);
  border-radius: var(--r);
  padding: 8px 14px;
}

.progresos span {
  display: block;
  font-size: 12px;
  color: var(--muted);
}

.progresos strong {
  font-family: var(--f-display);
  font-size: 1.3rem;
}

.grupo {
  border: 1px solid var(--line);
  border-radius: var(--r);
  padding: 12px 16px;
  margin: 12px 0;
}

.grupo legend {
  font-weight: 700;
  padding: 0 6px;
}

.grupo .inp {
  max-width: 360px;
  margin-bottom: 8px;
}

.lista-companeros {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 4px 12px;
  max-height: 240px;
  overflow-y: auto;
}

.companero {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  cursor: pointer;
}

.acciones {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.calificada {
  text-align: left;
}

.nota-grande {
  font-family: var(--f-display);
  font-size: 3rem;
  font-weight: 800;
  color: var(--accent);
  margin: 0;
}

.nota-grande span {
  font-size: 1.2rem;
  color: var(--muted);
}

.retro-general {
  font-size: 15px;
}

.tabla-scroll {
  overflow-x: auto;
}

.rubrica {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.rubrica th,
.rubrica td {
  text-align: left;
  vertical-align: top;
  padding: 8px 10px;
  border-bottom: 1px solid var(--line);
}

.puntos {
  font-weight: 700;
  white-space: nowrap;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
