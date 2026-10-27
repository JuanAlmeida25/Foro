<template>
  <section>
    <div class="section-title" style="margin-bottom: 16px;">
      <div>
        <h2>✅ Asistencia</h2>
        <p>
          Cada aprendiz firma <strong>una sola vez</strong> desde 👤 Mi cuenta. Tú marcas con el checkbox quién vino
          y, al imprimir, su firma cae sola en la casilla de ese día del formato del SENA.
        </p>
      </div>
      <div class="actions">
        <button class="btn sm" type="button" :disabled="cargando" @click="cargar">
          {{ cargando ? 'Actualizando…' : '↻ Actualizar' }}
        </button>
      </div>
    </div>

    <p v-if="error" class="ojo" role="alert">⚠️ {{ error }}</p>

    <!-- Asistencia de hoy con código: el profe la abre y la proyecta; los aprendices se marcan desde Mi cuenta -->
    <div ref="tableroEl" :class="['hoy-card', { abierta: codigoHoy }]">
      <template v-if="codigoHoy">
        <p class="hoy-etiqueta">Código de asistencia · entra a 👤 Mi cuenta y escríbelo</p>
        <p class="hoy-codigo" aria-live="polite">{{ codigoHoy.codigo }}</p>
        <p class="hoy-meta">
          Cambia en <strong>{{ cuentaRegresiva(codigoHoy.cambiaEn) }}</strong> ·
          se cierra en <strong>{{ cuentaRegresiva(codigoHoy.abiertaHasta) }}</strong> ·
          <strong>{{ presentesHoy }}</strong> de {{ aprendices.length }} marcados
        </p>
        <div class="acciones hoy-acciones">
          <button class="btn sm" type="button" @click="proyectar">🖥️ Pantalla completa</button>
          <button class="btn danger sm" type="button" :disabled="trabajandoHoy" @click="cerrarHoy">⏹️ Cerrar asistencia</button>
        </div>
      </template>
      <template v-else>
        <div>
          <strong>📲 Asistencia de hoy con código</strong>
          <p class="nota">
            Se abre por 15 minutos con un código que cambia cada 3. Cada aprendiz se marca desde su cuenta;
            al que llegue tarde lo marcas tú con el checkbox.
          </p>
        </div>
        <button class="btn primary" type="button" :disabled="trabajandoHoy || !hojas.length" @click="abrirHoy">
          {{ trabajandoHoy ? 'Abriendo…' : '▶️ Abrir asistencia de hoy' }}
        </button>
      </template>
    </div>

    <details class="encabezado" :open="!hojas.length">
      <summary>🗂️ Datos del encabezado y fechas de la ficha</summary>
      <form class="campos" @submit.prevent="guardarEncabezado">
        <div>
          <label class="lbl" for="enc-ficha">Número de ficha</label>
          <input id="enc-ficha" v-model="encabezado.ficha" class="inp" inputmode="numeric" maxlength="12" placeholder="Ej: 2977456" />
        </div>
        <div class="ancho">
          <label class="lbl" for="enc-programa">Programa de formación</label>
          <input id="enc-programa" v-model="encabezado.programa" class="inp" maxlength="120" placeholder="Ej: Análisis y Desarrollo de Software" />
        </div>
        <div>
          <label class="lbl" for="enc-centro">Código del centro</label>
          <input id="enc-centro" v-model="encabezado.codigoCentro" class="inp" inputmode="numeric" maxlength="10" placeholder="Ej: 9227" />
        </div>
        <div>
          <label class="lbl" for="enc-inicio">Inicio de la ficha</label>
          <input id="enc-inicio" v-model="encabezado.inicio" class="inp" type="date" />
        </div>
        <div>
          <label class="lbl" for="enc-fin">Fin de la ficha</label>
          <input id="enc-fin" v-model="encabezado.fin" class="inp" type="date" :min="encabezado.inicio || undefined" />
        </div>
        <div class="boton-guardar">
          <button class="btn primary" type="submit" :disabled="guardandoEncabezado">
            {{ guardandoEncabezado ? 'Guardando…' : '💾 Guardar' }}
          </button>
        </div>
      </form>
      <p class="nota">Regional Guajira (44), Centro Agroempresarial y Acuícola y Fonseca ya vienen puestos, como en el formato.</p>
    </details>

    <p v-if="cargando" class="nota">Cargando asistencia…</p>
    <p v-else-if="!hojas.length" class="nota">
      📅 Primero pon la fecha de inicio y de fin de la ficha en el encabezado y dale Guardar. Con eso salen las hojas de la planilla.
    </p>
    <p v-else-if="!aprendices.length" class="nota">
      Todavía no hay aprendices registrados. Cuando creen su cuenta en 👤 Mi cuenta, salen aquí.
    </p>

    <template v-else>
      <div class="hojas" role="tablist" aria-label="Hojas de la planilla">
        <button
          v-for="(h, i) in hojas"
          :key="h.desde"
          type="button"
          role="tab"
          :aria-selected="hojaActiva === i"
          :class="['panel-chip', { active: hojaActiva === i }]"
          @click="hojaActiva = i"
        >
          Hoja {{ i + 1 }}: {{ fechaCorta(h.desde) }} al {{ fechaCorta(h.hasta) }}
        </button>
      </div>

      <div class="tabla-scroll">
        <table class="asistencia">
          <thead>
            <tr>
              <th class="quien" scope="col">Aprendiz</th>
              <th
                v-for="d in hoja.dias"
                :key="d.fecha"
                scope="col"
                :class="{ hoy: d.fecha === hoy, fuera: !d.dentroDeLaFicha }"
              >
                <span class="dia">{{ d.nombre.slice(0, 3) }}</span>
                <span class="fecha">{{ fechaCorta(d.fecha) }}</span>
                <label v-if="d.dentroDeLaFicha" class="todos" :title="`Marcar a todos el ${d.nombre} ${fechaCorta(d.fecha)}`">
                  <input type="checkbox" :checked="todosVinieron(d.fecha)" @change="marcarTodos(d.fecha)" />
                  <span>{{ presentes(d.fecha) }}/{{ aprendices.length }}</span>
                </label>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in aprendices" :key="a.documento">
              <th class="quien" scope="row">
                {{ a.nombre }}
                <small>{{ a.tipoDocumento || '¿?' }} {{ a.documento }} · {{ a.tieneFirma ? '✍️ firmó' : 'sin firma' }}</small>
              </th>
              <td v-for="d in hoja.dias" :key="d.fecha" :class="{ hoy: d.fecha === hoy, fuera: !d.dentroDeLaFicha }">
                <input
                  v-if="d.dentroDeLaFicha"
                  type="checkbox"
                  :checked="vino(d.fecha, a.documento)"
                  :aria-label="`${a.nombre} vino el ${d.nombre} ${fechaCorta(d.fecha)}`"
                  @change="marcar(d.fecha, [a.documento], $event.target.checked)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="marcadosSinFirma.length" class="ojo">
        ✍️ {{ marcadosSinFirma.length === 1 ? 'Este aprendiz está marcado' : 'Estos aprendices están marcados' }} pero
        no ha{{ marcadosSinFirma.length === 1 ? '' : 'n' }} hecho su firma:
        <strong>{{ marcadosSinFirma.map(a => a.nombre).join(', ') }}</strong>. En la planilla su casilla sale vacía para que firmen a mano.
      </p>

      <div class="acciones">
        <button class="btn primary" type="button" :disabled="imprimiendo" @click="imprimir(false)">
          {{ imprimiendo ? 'Preparando…' : `🖨️ Planilla de la hoja ${hojaActiva + 1} (PDF)` }}
        </button>
        <button class="btn" type="button" :disabled="imprimiendo" @click="imprimir(true)">
          🖨️ Toda la ficha ({{ hojas.length }} {{ hojas.length === 1 ? 'hoja' : 'hojas' }})
        </button>
      </div>
      <p class="nota">En el cuadro de imprimir escoge <strong>«Guardar como PDF»</strong>, tamaño carta y horizontal.</p>
    </template>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import {
  abrirAsistenciaHoy,
  fetchCodigoAsistencia,
  cerrarAsistenciaHoy,
  fetchAsistencia,
  fetchAprendicesAdmin,
  fetchPlanillaAsistencia,
  marcarAsistencia,
  guardarEncabezadoAsistencia
} from '../services/api.js'
import { hojasDeAsistencia, textoFecha } from '../utils/fichaAsistencia.js'
import { imprimirPlanilla } from '../utils/planillaAsistencia.js'

const emit = defineEmits(['toast'])

const hoy = textoFecha(new Date())
const cargando = ref(true)
const error = ref('')
const aprendices = ref([])
const asistencia = ref({})
const encabezado = ref({ ficha: '', programa: '', codigoCentro: '', inicio: '', fin: '' })
// Las hojas salen de las fechas GUARDADAS, no de las que se están escribiendo en el formulario
const fechasGuardadas = ref({ inicio: '', fin: '' })
const guardandoEncabezado = ref(false)
const imprimiendo = ref(false)

const hojas = computed(() => hojasDeAsistencia(fechasGuardadas.value.inicio, fechasGuardadas.value.fin))
const hojaActiva = ref(0)
const hoja = computed(() => hojas.value[hojaActiva.value] || hojas.value[0])

// Arranca en la hoja de esta semana; si la ficha no ha empezado o ya terminó, en la primera
watch(hojas, lista => {
  hojaActiva.value = Math.max(0, lista.findIndex(h => h.desde <= hoy && hoy <= h.hasta))
})

const fechaCorta = texto => texto.split('-').reverse().join('/').slice(0, 5)
const vino = (fecha, documento) => (asistencia.value[fecha] || []).includes(documento)
const presentes = fecha => aprendices.value.filter(a => vino(fecha, a.documento)).length
const todosVinieron = fecha => aprendices.value.length > 0 && presentes(fecha) === aprendices.value.length

// Marcados que no tienen firma: su casilla sale vacía en la planilla y toca que firmen a mano
const marcadosSinFirma = computed(() =>
  hoja.value ? aprendices.value.filter(a => !a.tieneFirma && hoja.value.dias.some(d => vino(d.fecha, a.documento))) : []
)

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    const [datos, lista] = await Promise.all([fetchAsistencia(), fetchAprendicesAdmin()])
    asistencia.value = datos.asistencia
    encabezado.value = datos.encabezado
    fechasGuardadas.value = { inicio: datos.encabezado.inicio, fin: datos.encabezado.fin }
    aprendices.value = lista.aprendices
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
}

// Se marca de una vez en pantalla y, si el servidor dice que no, se devuelve
async function marcar(fecha, documentos, presente) {
  const antes = asistencia.value[fecha] || []
  asistencia.value = {
    ...asistencia.value,
    [fecha]: presente ? [...new Set([...antes, ...documentos])] : antes.filter(d => !documentos.includes(d))
  }
  error.value = ''
  try {
    const { presentes: confirmados } = await marcarAsistencia(fecha, documentos, presente)
    asistencia.value = { ...asistencia.value, [fecha]: confirmados }
  } catch (e) {
    asistencia.value = { ...asistencia.value, [fecha]: antes }
    error.value = e.message
  }
}

const marcarTodos = fecha => marcar(fecha, aprendices.value.map(a => a.documento), !todosVinieron(fecha))

async function guardarEncabezado() {
  guardandoEncabezado.value = true
  error.value = ''
  try {
    const { encabezado: guardado } = await guardarEncabezadoAsistencia(encabezado.value)
    encabezado.value = guardado
    fechasGuardadas.value = { inicio: guardado.inicio, fin: guardado.fin }
    emit('toast', 'Encabezado de la planilla guardado')
  } catch (e) {
    error.value = e.message
  } finally {
    guardandoEncabezado.value = false
  }
}

/* ----- Asistencia de hoy con código ----- */
const codigoHoy = ref(null)
const presentesHoy = ref(0)
const trabajandoHoy = ref(false)
const tableroEl = ref(null)
const ahora = ref(Date.now())
let relojId = null
let consultaId = null

function cuentaRegresiva(hasta) {
  const s = Math.max(0, Math.ceil((hasta - ahora.value) / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// Lo que dice el servidor: el código vigente y quién ya se marcó (eso también se pinta en la tabla)
function aplicarEstado(estado) {
  codigoHoy.value = estado.abierta === false ? null : estado
  if (estado.presentes) {
    presentesHoy.value = estado.presentes.length
    if (estado.fecha || codigoHoy.value) {
      asistencia.value = { ...asistencia.value, [estado.fecha || hoy]: estado.presentes }
    }
  }
  if (!codigoHoy.value) pararConsultas()
}

// Mientras está abierta se le pregunta al servidor cada 4 s; el reloj de la pantalla corre cada segundo
function arrancarConsultas() {
  pararConsultas()
  relojId = setInterval(() => {
    ahora.value = Date.now()
  }, 1000)
  consultaId = setInterval(async () => {
    try {
      aplicarEstado(await fetchCodigoAsistencia())
    } catch (e) {
      error.value = e.message
    }
  }, 4000)
}

function pararConsultas() {
  clearInterval(relojId)
  clearInterval(consultaId)
  relojId = consultaId = null
}

async function abrirHoy() {
  trabajandoHoy.value = true
  error.value = ''
  try {
    aplicarEstado(await abrirAsistenciaHoy())
    ahora.value = Date.now()
    arrancarConsultas()
  } catch (e) {
    error.value = e.message
  } finally {
    trabajandoHoy.value = false
  }
}

async function cerrarHoy() {
  trabajandoHoy.value = true
  try {
    await cerrarAsistenciaHoy()
    codigoHoy.value = null
    pararConsultas()
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
  } catch (e) {
    error.value = e.message
  } finally {
    trabajandoHoy.value = false
  }
}

function proyectar() {
  tableroEl.value?.requestFullscreen?.().catch(() => {})
}

// Si el profe recarga la página con la asistencia abierta, se retoma donde iba
async function revisarSiEstaAbierta() {
  try {
    const estado = await fetchCodigoAsistencia()
    if (estado.abierta) {
      aplicarEstado(estado)
      arrancarConsultas()
    }
  } catch (e) {
    // Si falla, el profe la abre con el botón y ya
  }
}

onBeforeUnmount(pararConsultas)

// Las firmas se piden solo al imprimir: son imágenes y no hace falta cargarlas para marcar
async function imprimir(todas) {
  imprimiendo.value = true
  error.value = ''
  try {
    const datos = await fetchPlanillaAsistencia()
    imprimirPlanilla(todas ? hojas.value : [hoja.value], datos)
  } catch (e) {
    error.value = e.message
  } finally {
    imprimiendo.value = false
  }
}

onMounted(async () => {
  await cargar()
  revisarSiEstaAbierta()
})
</script>

<style scoped>
.nota {
  color: var(--muted);
  font-size: 14px;
  margin: 10px 0;
}

.ojo {
  color: var(--bad);
  font-weight: 600;
  margin: 10px 0;
}

.encabezado {
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: var(--surface);
  padding: 12px 16px;
  margin: 0 0 16px;
}

.encabezado summary {
  cursor: pointer;
  font-weight: 700;
}

.campos {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  align-items: end;
  margin-top: 12px;
}

.campos .ancho {
  grid-column: span 2;
}

.hojas {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.panel-chip {
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--fg);
  border-radius: 99px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.panel-chip.active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--accent-ink);
}

.tabla-scroll {
  overflow-x: auto;
  margin-bottom: 12px;
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: var(--surface);
}

.asistencia {
  border-collapse: collapse;
  min-width: 760px;
  width: 100%;
}

.asistencia th,
.asistencia td {
  text-align: center;
  padding: 8px 4px;
  border-bottom: 1px solid var(--line);
}

.asistencia .quien {
  text-align: left;
  min-width: 200px;
  padding-left: 12px;
  position: sticky;
  left: 0;
  background: var(--surface);
  z-index: 1;
}

.quien small {
  display: block;
  font-weight: 400;
  color: var(--muted);
  font-size: 12px;
}

thead .dia,
thead .fecha {
  display: block;
}

thead .dia {
  font-weight: 800;
}

thead .fecha {
  font-size: 12px;
  color: var(--muted);
}

.todos {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  margin-top: 4px;
  cursor: pointer;
}

.asistencia input[type='checkbox'] {
  width: 20px;
  height: 20px;
  margin: 0;
  accent-color: var(--ok);
  cursor: pointer;
}

.hoy {
  background: var(--accent-soft);
}

.fuera {
  background: repeating-linear-gradient(-45deg, var(--sunk) 0 6px, var(--bg) 6px 12px);
}

.fuera .fecha,
.fuera .dia {
  opacity: 0.5;
}

.acciones {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.hoy-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  border: 1px solid var(--line);
  border-left: 5px solid var(--accent-2);
  border-radius: var(--r);
  background: var(--surface);
  padding: 14px 18px;
  margin-bottom: 16px;
}

.hoy-card .nota {
  margin: 4px 0 0;
}

.hoy-card.abierta {
  flex-direction: column;
  align-items: center;
  text-align: center;
  border-left-color: var(--ok);
}

.hoy-etiqueta {
  margin: 0;
  font-weight: 700;
  color: var(--muted);
}

/* Grande para que se lea desde el fondo del salón */
.hoy-codigo {
  margin: 4px 0;
  font-family: var(--f-mono);
  font-size: clamp(3rem, 12vw, 6rem);
  font-weight: 800;
  letter-spacing: .25em;
  color: var(--accent);
  line-height: 1.1;
}

.hoy-meta {
  margin: 0;
  color: var(--muted);
}

.hoy-acciones {
  justify-content: center;
  margin-top: 10px;
}

/* En pantalla completa (video beam) el código ocupa casi toda la pantalla */
.hoy-card:fullscreen {
  justify-content: center;
  background: var(--surface);
}

.hoy-card:fullscreen .hoy-codigo {
  font-size: 22vw;
}

.hoy-card:fullscreen .hoy-etiqueta,
.hoy-card:fullscreen .hoy-meta {
  font-size: 2rem;
}

@media (max-width: 720px) {
  .campos {
    grid-template-columns: 1fr;
  }

  .campos .ancho {
    grid-column: auto;
  }
}
</style>
