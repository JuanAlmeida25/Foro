<template>
  <div class="layout repaso-layout">
    <div class="main">
      <section ref="raiz" class="repaso" aria-labelledby="repasoTitle">
        <div class="section-title">
          <div>
            <h2 id="repasoTitle">Actividad de repaso</h2>
            <p>
              Pon a prueba lo que sabes antes de publicar en el foro. Primero clasificas licencias según su familia
              y luego resuelves casos como los que vas a encontrar en un proyecto real. Cada respuesta trae su explicación.
            </p>
          </div>
        </div>

        <div class="sheet act">
          <ol class="steps-bar">
            <li
              v-for="(p, i) in PASOS_ETAPA"
              :key="p.id"
              :data-s="estadoPaso(i)"
              :aria-current="etapa === p.id ? 'step' : null"
            >
              <span class="n">{{ i + 1 }}</span><span>{{ p.label }}</span>
            </li>
          </ol>

          <!-- Etapa 1: clasificar licencias -->
          <div v-if="etapa === 'clasificar'" class="act-body">
            <div class="act-head">
              <p class="act-lead" tabindex="-1">
                Toca una licencia y después la familia a la que pertenece. En el computador también puedes arrastrarla.
                Si te equivocas de familia, toca la licencia otra vez para moverla.
              </p>
              <p class="live" aria-live="polite">{{ anuncio }}</p>
            </div>

            <div
              v-if="!revisado"
              class="pool"
              :data-target="selUbicada ? '1' : '0'"
              aria-label="Licencias por clasificar"
              @dragover.prevent
              @drop.prevent="soltarEnLista"
            >
              <button
                v-for="t in pool"
                :key="t.id"
                type="button"
                class="chip"
                draggable="true"
                :data-s="sel === t.id ? 'sel' : ''"
                :aria-pressed="sel === t.id ? 'true' : 'false'"
                @dragstart="arrastrar(t.id, $event)"
                @click="elegir(t.id)"
              >{{ t.nombre }}</button>
              <p v-if="!pool.length" class="pool-empty">Ya ubicaste todas las licencias. Revisa y pulsa «Comprobar».</p>
              <button v-if="selUbicada" type="button" class="btn ghost sm" @click="devolver">Devolver a la lista</button>
            </div>

            <div class="bins">
              <div
                v-for="f in FAMILIAS"
                :key="f.id"
                class="bin"
                :data-target="sel && !revisado ? '1' : '0'"
                @dragover.prevent
                @drop.prevent="ubicar(f.id)"
              >
                <button type="button" class="bin-head" :disabled="!sel || revisado" @click="ubicar(f.id)">
                  <span class="bin-name">{{ f.nombre }}</span>
                  <span class="bin-def">{{ f.def }}</span>
                  <span v-if="sel && !revisado" class="bin-cta">Ubicar aquí</span>
                </button>
                <div class="bin-items">
                  <button
                    v-for="t in enFamilia(f.id)"
                    :key="t.id"
                    type="button"
                    class="chip"
                    :draggable="revisado ? 'false' : 'true'"
                    :data-s="estadoChip(t)"
                    :aria-pressed="sel === t.id ? 'true' : 'false'"
                    :disabled="revisado"
                    @dragstart="arrastrar(t.id, $event)"
                    @click="elegir(t.id)"
                  >
                    <span v-if="revisado" class="mark" aria-hidden="true">{{ t.familia === ubicacion[t.id] ? '✓' : '✕' }}</span>{{ t.nombre }}
                  </button>
                </div>
              </div>
            </div>

            <div v-if="revisado" class="review">
              <h3>Acertaste {{ resultado.clasificacion }} de {{ TARJETAS.length }}</h3>
              <ul>
                <li v-for="t in revision" :key="t.id" :data-ok="t.familia === ubicacion[t.id] ? '1' : '0'">
                  <b><span class="mark">{{ t.familia === ubicacion[t.id] ? '✓' : '✕' }}</span>{{ t.nombre }}: {{ nombreFamilia(t.familia) }}</b>
                  <span v-if="t.familia !== ubicacion[t.id]" class="moved"> (la ubicaste en {{ nombreFamilia(ubicacion[t.id]) }})</span>
                  <p>{{ t.porque }}</p>
                </li>
              </ul>
            </div>

            <div class="act-foot">
              <span class="count">{{ TARJETAS.length - pool.length }} de {{ TARJETAS.length }} ubicadas</span>
              <button v-if="!revisado" type="button" class="btn primary" :disabled="pool.length > 0" @click="comprobar">
                Comprobar
              </button>
              <button v-else type="button" class="btn primary" @click="irACasos">Continuar con los casos</button>
            </div>
          </div>

          <!-- Etapa 2: casos prácticos -->
          <div v-else-if="etapa === 'casos'" class="act-body">
            <div class="case-meta">
              <span class="eyebrow">Caso {{ idx + 1 }} de {{ casos.length }}</span>
              <span class="dots" aria-hidden="true">
                <span v-for="(c, i) in casos" :key="c.id" :data-s="estadoPunto(c, i)"></span>
              </span>
            </div>
            <PreguntaCaso :key="casoActual.id" :caso="casoActual" :elegida="elegidaActual" @elegir="responder" />
            <div class="act-foot">
              <span class="count">{{ resultado.casos }} correctas hasta ahora</span>
              <button type="button" class="btn primary" :disabled="elegidaActual === null" @click="siguiente">
                {{ idx === casos.length - 1 ? 'Ver resultado' : 'Siguiente caso' }}
              </button>
            </div>
          </div>

          <!-- Etapa 3: resultado -->
          <div v-else class="act-body">
            <div class="score">
              <div class="score-num"><b>{{ resultado.total }}</b><span>/ {{ resultado.maximo }}</span></div>
              <div class="score-text">
                <h3 tabindex="-1">{{ mensaje.titulo }}</h3>
                <p>{{ mensaje.texto }}</p>
                <div class="split">
                  <span>Clasificación {{ resultado.clasificacion }}/{{ TARJETAS.length }}</span>
                  <span>Casos {{ resultado.casos }}/{{ casos.length }}</span>
                  <span v-if="registro.mejor !== null">Tu mejor puntaje: {{ registro.mejor }}/{{ resultado.maximo }}</span>
                </div>
              </div>
            </div>

            <div v-if="errores.length" class="review">
              <h3>Para repasar</h3>
              <ul>
                <li v-for="e in errores" :key="e.id" data-ok="0">
                  <b>{{ e.titulo }}</b>
                  <p>{{ e.detalle }}</p>
                </li>
              </ul>
            </div>

            <div class="act-foot">
              <span class="msg" :class="{ ok: aviso.ok }" role="status">{{ aviso.texto }}</span>
              <button type="button" class="btn primary" @click="reiniciar">Volver a intentar</button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Panel lateral: progreso del repaso -->
    <aside class="side" aria-label="Progreso del repaso">
      <div class="panel">
        <h2>Tu progreso</h2>
        <p v-if="registro.mejor !== null" class="best">
          <b>{{ registro.mejor }}<small>/{{ MAXIMO }}</small></b>
          <span>mejor puntaje · {{ registro.intentos }} {{ registro.intentos === 1 ? 'intento' : 'intentos' }}</span>
        </p>
        <p v-else class="note side-lead">
          Aún no has terminado la actividad. Son {{ MAXIMO }} preguntas cortas y tu mejor puntaje se guarda en este navegador.
        </p>
        <p v-if="registro.ultimo" class="where">
          Último intento: {{ registro.ultimo.total }}/{{ MAXIMO }}
          (clasificación {{ registro.ultimo.clasificacion }}, casos {{ registro.ultimo.casos }}).
        </p>
      </div>

      <div class="panel">
        <h2>Qué vas a repasar</h2>
        <ul class="temas">
          <li>Familias de licencias: permisivas, copyleft, propietarias y dominio público</li>
          <li v-for="c in CASOS" :key="c.id">{{ c.tema }}</li>
        </ul>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { reactive, ref, computed, nextTick, onMounted } from 'vue'
import PreguntaCaso from './PreguntaCaso.vue'
import { FAMILIAS, TARJETAS, CASOS, LS_REPASO_KEY } from '../data/repaso.js'
import {
  barajar,
  prepararCasos,
  acertoCaso,
  calificar,
  mensajeResultado,
  actualizarRegistro
} from '../utils/repaso.js'

const PASOS_ETAPA = [
  { id: 'clasificar', label: 'Clasifica' },
  { id: 'casos', label: 'Resuelve casos' },
  { id: 'resultado', label: 'Resultado' }
]
const MAXIMO = TARJETAS.length + CASOS.length

const raiz = ref(null)
const etapa = ref('clasificar')
const orden = ref(barajar(TARJETAS.map(t => t.id)))
const ubicacion = reactive({}) // idTarjeta -> idFamilia
const sel = ref(null)
const revisado = ref(false)
const anuncio = ref('')
const casos = ref(prepararCasos(CASOS))
const idx = ref(0)
const respuestas = reactive({}) // idCaso -> índice de la opción elegida
const registro = reactive({ mejor: null, intentos: 0, ultimo: null })
const aviso = reactive({ texto: '', ok: false })

const porId = id => TARJETAS.find(t => t.id === id)
const nombreFamilia = id => {
  const f = FAMILIAS.find(x => x.id === id)
  return f ? f.nombre : 'ninguna'
}
const estadoPaso = i => {
  const actual = PASOS_ETAPA.findIndex(p => p.id === etapa.value)
  return i < actual ? 'done' : i === actual ? 'now' : ''
}

/* ----- Etapa 1: clasificar ----- */
const pool = computed(() => orden.value.filter(id => !ubicacion[id]).map(porId))
const enFamilia = fid => orden.value.filter(id => ubicacion[id] === fid).map(porId)
const selUbicada = computed(() => !!(sel.value && ubicacion[sel.value]))
const revision = computed(() => {
  const mal = TARJETAS.filter(t => ubicacion[t.id] !== t.familia)
  const bien = TARJETAS.filter(t => ubicacion[t.id] === t.familia)
  return mal.concat(bien)
})

function estadoChip(t) {
  if (revisado.value) return ubicacion[t.id] === t.familia ? 'ok' : 'bad'
  return sel.value === t.id ? 'sel' : ''
}

function elegir(id) {
  if (revisado.value) return
  sel.value = sel.value === id ? null : id
  anuncio.value = sel.value ? 'Elegiste ' + porId(id).nombre + '. Ahora toca su familia.' : ''
}

function ubicar(fid) {
  if (!sel.value || revisado.value) return
  const t = porId(sel.value)
  ubicacion[t.id] = fid
  anuncio.value = t.nombre + ' quedó en ' + nombreFamilia(fid) + '.'
  sel.value = null
}

function devolver() {
  if (!sel.value) return
  const t = porId(sel.value)
  delete ubicacion[t.id]
  anuncio.value = t.nombre + ' volvió a la lista.'
  sel.value = null
}

function arrastrar(id, e) {
  if (revisado.value) return
  sel.value = id
  try {
    e.dataTransfer.setData('text/plain', id)
    e.dataTransfer.effectAllowed = 'move'
  } catch (err) {
    // Algunos navegadores no permiten datos de arrastre; basta con la selección
  }
}

function soltarEnLista() {
  if (selUbicada.value) devolver()
}

function comprobar() {
  if (pool.value.length) return
  revisado.value = true
  sel.value = null
  anuncio.value = 'Acertaste ' + resultado.value.clasificacion + ' de ' + TARJETAS.length + '.'
}

/* ----- Etapa 2: casos ----- */
const casoActual = computed(() => casos.value[idx.value])
const elegidaActual = computed(() => {
  const v = respuestas[casoActual.value.id]
  return v === undefined ? null : v
})

function estadoPunto(c, i) {
  if (respuestas[c.id] !== undefined) return acertoCaso(c, respuestas) ? 'ok' : 'bad'
  return i === idx.value ? 'now' : ''
}

function responder(k) {
  const id = casoActual.value.id
  if (respuestas[id] === undefined) respuestas[id] = k
}

// Lleva la vista al inicio de la actividad y mueve el foco al título de la etapa
function subir() {
  nextTick(() => {
    const el = raiz.value
    if (!el) return
    if (el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: 'start' })
    const h = el.querySelector('.case-q, .score h3, .act-lead')
    if (h) h.focus({ preventScroll: true })
  })
}

function irACasos() {
  etapa.value = 'casos'
  idx.value = 0
  subir()
}

function siguiente() {
  if (elegidaActual.value === null) return
  if (idx.value < casos.value.length - 1) {
    idx.value++
    subir()
    return
  }
  etapa.value = 'resultado'
  guardarResultado()
  subir()
}

/* ----- Etapa 3: resultado ----- */
const resultado = computed(() =>
  calificar({ tarjetas: TARJETAS, ubicacion, casos: casos.value, respuestas })
)
const mensaje = computed(() => mensajeResultado(resultado.value.total, resultado.value.maximo))
const errores = computed(() => {
  const out = []
  TARJETAS.forEach(t => {
    if (ubicacion[t.id] !== t.familia) {
      out.push({
        id: 'c-' + t.id,
        titulo: t.nombre + ' es ' + nombreFamilia(t.familia).toLowerCase() + ', no ' + nombreFamilia(ubicacion[t.id]).toLowerCase(),
        detalle: t.porque
      })
    }
  })
  casos.value.forEach(c => {
    if (!acertoCaso(c, respuestas)) {
      const ok = c.opciones.find(o => o.ok)
      out.push({ id: 'k-' + c.id, titulo: c.tema + ': ' + ok.texto, detalle: c.explicacion })
    }
  })
  return out
})

function guardarResultado() {
  const nuevo = actualizarRegistro(registro, resultado.value)
  registro.mejor = nuevo.mejor
  registro.intentos = nuevo.intentos
  registro.ultimo = nuevo.ultimo
  try {
    localStorage.setItem(
      LS_REPASO_KEY,
      JSON.stringify({ mejor: nuevo.mejor, intentos: nuevo.intentos, maximo: nuevo.maximo, ultimo: nuevo.ultimo })
    )
    aviso.texto = nuevo.esRecord ? 'Nuevo mejor puntaje guardado en este navegador.' : 'Resultado guardado en este navegador.'
    aviso.ok = true
  } catch (e) {
    aviso.texto = 'No se pudo guardar el resultado en este navegador, pero puedes seguir practicando.'
    aviso.ok = false
  }
}

function reiniciar() {
  Object.keys(ubicacion).forEach(k => delete ubicacion[k])
  Object.keys(respuestas).forEach(k => delete respuestas[k])
  orden.value = barajar(TARJETAS.map(t => t.id))
  casos.value = prepararCasos(CASOS)
  sel.value = null
  revisado.value = false
  anuncio.value = ''
  aviso.texto = ''
  idx.value = 0
  etapa.value = 'clasificar'
  subir()
}

onMounted(() => {
  try {
    const d = JSON.parse(localStorage.getItem(LS_REPASO_KEY) || 'null')
    if (d && typeof d === 'object') {
      registro.mejor = typeof d.mejor === 'number' ? d.mejor : null
      registro.intentos = typeof d.intentos === 'number' ? d.intentos : 0
      registro.ultimo = d.ultimo && typeof d.ultimo === 'object' ? d.ultimo : null
    }
  } catch (e) {
    // Sin registro previo o almacenamiento bloqueado
  }
})
</script>
