<template>
  <div>
    <!-- Encabezado principal -->
    <header class="top">
      <div class="wrap">
        <h1>Licenciamiento de software</h1>
      </div>
    </header>

    <!-- Barra de estado y acciones rápidas -->
    <div class="bar">
      <div class="wrap">
        <span class="pill" role="status" :data-tone="pill.tone">
          <span class="dot"></span>
          <span>{{ pill.text }}</span>
        </span>
        <div class="actions">
          <button
            class="btn"
            type="button"
            :disabled="!canSaveTop"
            @click="saveClick"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
              <path d="M3 2.5h8l2.5 2.5v8.5h-10.5z" />
              <path d="M5.5 2.5v3.5h5v-3.5M5 13.5v-4h6v4" />
            </svg>
            Guardar
          </button>
          <button class="btn primary" type="button" @click="copyAporte">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
              <rect x="5" y="5" width="8.5" height="8.5" rx="1.5" />
              <path d="M3 10.5V3.5A1 1 0 0 1 4 2.5h6.5" />
            </svg>
            Copiar aporte
          </button>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <main class="wrap layout">
      <div class="main">
        <!-- Banner solo lectura -->
        <div v-if="state.readOnly" class="ro-banner">
          Estás viendo el aporte en modo lectura. Solo el autor de esta página puede editarlo y guardarlo.
        </div>

        <!-- Sección del aporte -->
        <section id="aporte" class="sheet" aria-labelledby="aporteTitle">
          <div class="sheet-head">
            <div>
              <h2 id="aporteTitle">Mi aporte</h2>
              <p>Responde las cuatro preguntas orientadoras del foro. Cada cambio se guarda solo unos segundos después de que dejas de escribir.</p>
            </div>
          </div>

          <div class="sheet-body">
            <!-- Bloque de bienvenida / borrador si está vacío -->
            <div v-if="showEmpty" class="empty">
              <h3>Todavía no hay un aporte guardado</h3>
              <p>Puedes empezar con el borrador sugerido, que ya responde las cuatro preguntas con normas colombianas y datos de 2025, o escribir el tuyo desde cero.</p>
              <div class="actions">
                <button class="btn primary sm" type="button" @click="useDraft">Usar el borrador sugerido</button>
                <button class="btn sm" type="button" @click="startBlank">Empezar en blanco</button>
              </div>
            </div>

            <!-- Datos del aprendiz -->
            <div class="who">
              <div>
                <label class="lbl" for="f-autor">Aprendiz</label>
                <input
                  id="f-autor"
                  class="inp"
                  autocomplete="name"
                  placeholder="Tu nombre completo"
                  :disabled="!editable"
                  :value="state.aporte.autor"
                  @input="setField('autor', $event.target.value)"
                  @blur="flush"
                />
              </div>
              <div>
                <label class="lbl" for="f-ficha">Número de ficha</label>
                <input
                  id="f-ficha"
                  class="inp"
                  inputmode="numeric"
                  placeholder="Ej. 2977xxx"
                  :disabled="!editable"
                  :value="state.aporte.ficha"
                  @input="setField('ficha', $event.target.value)"
                  @blur="flush"
                />
              </div>
            </div>

            <!-- Campos de texto -->
            <CampoTexto
              v-for="c in CAMPOS"
              :id="'f-' + c.key"
              :key="c.key"
              :label="c.label"
              :q="c.q"
              :pregunta="!!c.q"
              :rows="c.rows"
              :placeholder="c.placeholder"
              :disabled="!editable"
              :model-value="state.aporte[c.key]"
              @update:model-value="v => setField(c.key, v)"
              @blur="flush"
            />
          </div>

          <!-- Pie del aporte -->
          <div class="sheet-foot">
            <span>{{ savedAtText }}</span>
            <span v-if="!state.readOnly">
              <span v-if="state.restoreConfirm" class="confirm">
                Se reemplazará lo que escribiste en las preguntas.
                <button class="btn danger sm" type="button" @click="restoreDraft">Reemplazar</button>
                <button class="btn sm" type="button" @click="state.restoreConfirm = false">Cancelar</button>
              </span>
              <button
                v-else
                class="btn ghost sm"
                type="button"
                :disabled="!state.loaded"
                @click="state.restoreConfirm = true"
              >
                Restaurar borrador sugerido
              </button>
            </span>
          </div>
        </section>

        <!-- Sección de réplicas -->
        <section id="replicas" aria-labelledby="repTitle">
          <div class="section-title">
            <div>
              <h2 id="repTitle">Réplicas a compañeros</h2>
              <p>La guía pide responder al menos un comentario de forma crítico-reflexiva. Pega aquí lo que escribió tu compañero y prepara tu respuesta.</p>
            </div>
          </div>

          <div class="recipe" aria-label="Estructura sugerida para una réplica">
            <div v-for="p in PASOS" :key="p.t">
              <b>{{ p.t }}</b>
              {{ p.d }}
            </div>
          </div>

          <!-- Formulario de réplica -->
          <form
            v-if="!state.readOnly"
            ref="formEl"
            class="sheet form"
            autocomplete="off"
            @submit.prevent="saveReply"
          >
            <div class="row2">
              <div>
                <label class="lbl" for="r-compa">Nombre del compañero</label>
                <input
                  id="r-compa"
                  v-model="state.form.companero"
                  class="inp"
                  placeholder="Ej. Laura Gómez"
                />
              </div>
              <div>
                <label class="lbl" for="r-comentario">Su comentario en el foro</label>
                <textarea
                  id="r-comentario"
                  v-model="state.form.comentario"
                  class="inp"
                  rows="3"
                  placeholder="Pega aquí el texto que publicó tu compañero."
                ></textarea>
              </div>
              <div>
                <label class="lbl" for="r-respuesta">Mi réplica</label>
                <textarea
                  id="r-respuesta"
                  ref="respuestaEl"
                  v-model="state.form.respuesta"
                  class="inp"
                  rows="5"
                  placeholder="Escribe tu respuesta siguiendo la estructura de arriba."
                ></textarea>
              </div>
            </div>

            <!-- Propuesta con IA -->
            <div v-if="state.suggest.visible" class="suggest">
              <span class="eyebrow">Propuesta con IA</span>
              <div class="suggest-text" :data-wait="state.suggest.waiting ? '1' : '0'">
                {{ state.suggest.waiting ? 'Pensando…' : state.suggest.text }}
              </div>
              <div class="form-foot">
                <span class="msg">{{ state.suggest.msg }}</span>
                <div class="actions">
                  <button
                    v-if="state.suggest.running"
                    class="btn sm"
                    type="button"
                    @click="stopSuggest"
                  >
                    Detener
                  </button>
                  <button class="btn sm" type="button" @click="discardSuggest">Descartar</button>
                  <button
                    class="btn primary sm"
                    type="button"
                    :disabled="!state.suggest.text || state.suggest.running"
                    @click="useSuggest"
                  >
                    Usar en mi réplica
                  </button>
                </div>
              </div>
            </div>

            <div class="form-foot">
              <span :class="['msg', { ok: state.formMsg.ok }]" role="status">
                {{ state.formMsg.text }}
              </span>
              <div class="actions">
                <button
                  v-if="state.editingId"
                  class="btn sm"
                  type="button"
                  @click="cancelEdit"
                >
                  Cancelar edición
                </button>
                <button
                  v-if="state.canSuggest"
                  class="btn sm"
                  type="button"
                  :disabled="state.suggest.running"
                  @click="suggestReply"
                >
                  Proponer réplica con IA
                </button>
                <button class="btn primary sm" type="submit" :disabled="state.savingReply">
                  {{ state.editingId ? 'Guardar cambios' : 'Guardar réplica' }}
                </button>
              </div>
            </div>
          </form>

          <!-- Lista de réplicas guardadas -->
          <div class="list">
            <div v-if="!state.loaded" class="none">Cargando réplicas…</div>
            <div v-else-if="!state.replicas.length" class="none">
              Aún no hay réplicas. Cuando un compañero publique su aporte en el foro, pega su comentario arriba y escribe tu respuesta.
            </div>
            <TarjetaReplica
              v-for="r in state.replicas"
              v-else
              :key="r.id"
              :r="r"
              :read-only="state.readOnly"
              :confirming="state.confirmDeleteId === r.id"
              @copy="copyText(r.respuesta || '', 'Réplica copiada')"
              @edit="startEdit(r)"
              @ask-delete="state.confirmDeleteId = r.id"
              @cancel-delete="state.confirmDeleteId = null"
              @delete="deleteReply(r.id)"
            />
          </div>
        </section>
      </div>

      <!-- Barra lateral de estadísticas y exportación -->
      <aside class="side" aria-label="Estado de la evidencia">
        <div class="panel">
          <h2>Progreso</h2>
          <div class="stats">
            <div class="stat">
              <b>{{ totalWords.toLocaleString('es-CO') }}</b>
              <span>palabras</span>
            </div>
            <div class="stat">
              <b>{{ qListas }}/4</b>
              <span>preguntas</span>
            </div>
            <div class="stat">
              <b>{{ realReplicas.length }}</b>
              <span>réplicas</span>
            </div>
          </div>
          <div class="qs" aria-label="Estado de cada pregunta">
            <div
              v-for="(s, i) in qEstado"
              :key="i"
              :data-s="s"
              :title="'Pregunta ' + (i + 1)"
            >
              P{{ i + 1 }}
            </div>
          </div>
          <p class="where">{{ whereText }}</p>
        </div>

        <div class="panel">
          <h2>Exportar</h2>
          <div class="exports">
            <button class="btn primary wide" type="button" @click="copyAporte">
              Copiar aporte para el foro
            </button>
            <button class="btn wide" type="button" @click="copyAll">
              Copiar aporte y réplicas
            </button>
            <template v-if="state.canDownload">
              <button class="btn sm" type="button" :disabled="state.pdfBusy" @click="downloadPdf">
                {{ state.pdfBusy ? 'Preparando…' : 'Descargar PDF' }}
              </button>
              <button class="btn sm" type="button" @click="downloadTxt">
                Descargar .txt
              </button>
              <button class="btn sm wide" type="button" @click="downloadMd">
                Descargar Markdown
              </button>
            </template>
          </div>
          <p v-if="!state.canDownload" class="note">
            Las descargas directas no están disponibles en este entorno. Usa los botones de copiar.
          </p>
        </div>
      </aside>
    </main>

    <!-- Modal de respaldo si el clipboard falla -->
    <div v-if="state.fallbackText !== null" class="fallback">
      <p>
        <b>Tu navegador no dejó copiar automáticamente.</b>
        El texto ya está seleccionado: cópialo con Ctrl+C, o mantén presionado en el celular.
      </p>
      <textarea ref="fallbackEl" readonly :value="state.fallbackText"></textarea>
      <div class="actions">
        <button class="btn sm" type="button" @click="state.fallbackText = null">Cerrar</button>
      </div>
    </div>

    <!-- Toast global -->
    <div v-if="state.toast" class="toast" role="status">
      {{ state.toast }}
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import CampoTexto from './components/CampoTexto.vue'
import TarjetaReplica from './components/TarjetaReplica.vue'
import {
  LS_KEY,
  TEXT_KEYS,
  ALL_KEYS,
  Q_KEYS,
  MIN_WORDS,
  CAMPOS,
  PASOS,
  DRAFT
} from './data/constants.js'
import { words, blank, fmtTime } from './utils/text.js'
import {
  getAporteText,
  getRepliesText,
  getMarkdown,
  getFileBase,
  downloadFile,
  buildPdf
} from './utils/exporter.js'

const state = reactive({
  mode: 'loading', // 'db' | 'local'
  loaded: false,
  readOnly: false,
  aporte: blank(),
  hasAporte: false,
  emptyDismissed: false,
  dirty: false,
  saving: false,
  lastSavedAt: null,
  status: { kind: 'loading', extra: '' },
  restoreConfirm: false,
  replicas: [],
  form: { companero: '', comentario: '', respuesta: '' },
  formMsg: { text: '', ok: false },
  editingId: null,
  confirmDeleteId: null,
  savingReply: false,
  canSuggest: false,
  suggest: { visible: false, text: '', waiting: false, running: false, msg: '' },
  canDownload: true,
  pdfBusy: false,
  fallbackText: null,
  toast: ''
})

const formEl = ref(null)
const respuestaEl = ref(null)
const fallbackEl = ref(null)

let db = null
let sampleFn = null
let downloads = null
let saveTimer = null
let pendingSave = false
let ctl = null
let toastTimer = null

/* ----- Valores derivados ----- */
const editable = computed(() => state.loaded && !state.readOnly)
const totalWords = computed(() => TEXT_KEYS.reduce((s, k) => s + words(state.aporte[k]), 0))
const qEstado = computed(() =>
  Q_KEYS.map(k => {
    const n = words(state.aporte[k])
    return n >= MIN_WORDS ? 'done' : n > 0 ? 'part' : ''
  })
)
const qListas = computed(() => qEstado.value.filter(s => s === 'done').length)
const realReplicas = computed(() => state.replicas.filter(r => !r.ejemplo))
const showEmpty = computed(
  () =>
    state.loaded &&
    !state.readOnly &&
    !state.hasAporte &&
    !state.emptyDismissed &&
    TEXT_KEYS.every(k => !(state.aporte[k] || '').trim())
)
const canSaveTop = computed(
  () => !state.readOnly && state.loaded && (state.dirty || state.status.kind === 'error')
)
const savedAtText = computed(() =>
  state.lastSavedAt ? 'Último guardado: ' + fmtTime(state.lastSavedAt) : 'Sin guardar todavía'
)
const whereText = computed(() => {
  if (state.mode === 'db') return 'Se guarda en tu almacenamiento en la nube y lo ves desde cualquier dispositivo.'
  if (state.mode === 'local') return 'Se guarda automáticamente en tu navegador. Puedes descargarlo o copiarlo al terminar.'
  return 'Conectando con el almacenamiento…'
})

const pill = computed(() => {
  const k = state.status.kind
  if (k === 'loading') return { tone: 'busy', text: 'Cargando tu aporte…' }
  if (k === 'saving') return { tone: 'busy', text: 'Guardando…' }
  if (k === 'dirty') return { tone: 'warn', text: 'Cambios sin guardar' }
  if (k === 'saved')
    return {
      tone: 'ok',
      text:
        (state.mode === 'db' ? 'Guardado' : 'Guardado en este navegador') +
        (state.lastSavedAt ? ' · ' + fmtTime(state.lastSavedAt) : '')
    }
  if (k === 'readonly') return { tone: '', text: 'Solo lectura' }
  if (k === 'error') return { tone: 'bad', text: state.status.extra || 'No se pudo guardar' }
  return { tone: 'ok', text: state.mode === 'db' ? 'Todo guardado' : 'Listo para escribir' }
})

/* ----- Avisos ----- */
function setStatus(kind, extra) {
  state.status = { kind, extra: extra || '' }
}

function toast(msg) {
  state.toast = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    state.toast = ''
  }, 2600)
}

function formMsg(text, ok) {
  state.formMsg = { text: text || '', ok: !!ok }
}

/* ----- Respaldo local ----- */
function plainAporte() {
  const o = {}
  ALL_KEYS.forEach(k => {
    o[k] = state.aporte[k] || ''
  })
  return o
}

function lsRead() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || 'null')
  } catch (e) {
    return null
  }
}

function lsWrite() {
  try {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({ aporte: plainAporte(), replicas: state.replicas })
    )
    return true
  } catch (e) {
    return false
  }
}

/* ----- Aporte ----- */
function applyAporte(d) {
  ALL_KEYS.forEach(k => {
    state.aporte[k] = typeof d[k] === 'string' ? d[k] : ''
  })
  if (d.updatedAt) {
    const t = new Date(d.updatedAt)
    if (!isNaN(t)) state.lastSavedAt = t
  }
}

function editingNow() {
  const a = document.activeElement
  return !!(a && a.id && a.id.indexOf('f-') === 0)
}

function setField(k, v) {
  if (state.readOnly) return
  state.aporte[k] = v
  state.dirty = true
  setStatus('dirty')
  clearTimeout(saveTimer)
  saveTimer = setTimeout(saveNow, 1200)
}

function flush() {
  if (state.dirty) saveNow()
}

function saveClick() {
  state.dirty = true
  saveNow()
}

async function saveNow() {
  clearTimeout(saveTimer)
  if (state.readOnly || !state.loaded) return
  if (state.saving) {
    pendingSave = true
    return
  }
  if (!state.dirty) return
  state.saving = true
  state.dirty = false
  setStatus('saving')
  const body = plainAporte()
  body.updatedAt = new Date().toISOString()
  try {
    if (state.mode === 'db' && db) await db.doc('foro/aporte').set(body)
    const okLocal = lsWrite()
    if (state.mode === 'local' && !okLocal) throw { code: 'local_failed' }
    state.hasAporte = true
    state.lastSavedAt = new Date()
    setStatus(state.dirty ? 'dirty' : 'saved')
  } catch (e) {
    state.dirty = true
    handleWriteError(e)
  } finally {
    state.saving = false
    if (pendingSave) {
      pendingSave = false
      saveNow()
    }
  }
}

function handleWriteError(e) {
  const code = e && e.code
  if ((code === 'invalid_argument' && state.mode === 'db') || code === 'revoked') {
    setReadOnly(true)
    return
  }
  if (code === 'quota_exceeded') {
    setStatus('error', 'Se llenó el espacio de almacenamiento. Borra réplicas que no uses.')
    return
  }
  if (code === 'local_failed') {
    setStatus('error', 'Este navegador no permite guardar. Copia o descarga tu aporte.')
    return
  }
  setStatus('error', 'No se pudo guardar. Revisa tu conexión y pulsa Guardar.')
}

function setReadOnly(v) {
  state.readOnly = v
  if (v) {
    state.canSuggest = false
    setStatus('readonly')
  }
}

function fillDraft() {
  applyAporte(Object.assign({}, DRAFT, { autor: state.aporte.autor, ficha: state.aporte.ficha }))
  state.dirty = true
  saveNow()
}

function useDraft() {
  state.emptyDismissed = true
  fillDraft()
}

function startBlank() {
  state.emptyDismissed = true
  nextTick(() => {
    const f = document.getElementById('f-autor')
    if (f) f.focus()
  })
}

function restoreDraft() {
  state.restoreConfirm = false
  fillDraft()
  toast('Borrador sugerido restaurado')
}

/* ----- Réplicas ----- */
function resetForm() {
  state.editingId = null
  state.form = { companero: '', comentario: '', respuesta: '' }
}

function startEdit(r) {
  state.editingId = r.id
  state.form = {
    companero: r.companero || '',
    comentario: r.comentario || '',
    respuesta: r.respuesta || ''
  }
  formMsg('')
  nextTick(() => {
    if (formEl.value) formEl.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (respuestaEl.value) respuestaEl.value.focus({ preventScroll: true })
  })
}

function cancelEdit() {
  resetForm()
  formMsg('')
}

async function saveReply() {
  if (state.readOnly) return
  if (!state.loaded) {
    formMsg('Espera un momento: todavía se está cargando el almacenamiento.')
    return
  }
  const companero = state.form.companero.trim()
  const comentario = state.form.comentario.trim()
  const respuesta = state.form.respuesta.trim()
  if (!comentario || !respuesta) {
    formMsg('Pega el comentario de tu compañero y escribe tu réplica antes de guardar.')
    return
  }
  const now = new Date().toISOString()
  state.savingReply = true
  try {
    if (state.mode === 'db' && db) {
      if (state.editingId) {
        await db.doc('replicas/' + state.editingId).update({
          companero,
          comentario,
          respuesta,
          ejemplo: false,
          updatedAt: now
        })
      } else {
        await db.collection('replicas').add({
          companero,
          comentario,
          respuesta,
          ejemplo: false,
          createdAt: now,
          updatedAt: now
        })
      }
    } else {
      if (state.editingId) {
        const r = state.replicas.find(x => x.id === state.editingId)
        if (r) {
          Object.assign(r, {
            companero,
            comentario,
            respuesta,
            ejemplo: false,
            updatedAt: now
          })
        }
      } else {
        state.replicas.unshift({
          id: 'r' + Date.now(),
          companero,
          comentario,
          respuesta,
          ejemplo: false,
          createdAt: now,
          updatedAt: now
        })
      }
      if (!lsWrite()) throw { code: 'local_failed' }
    }
    resetForm()
    formMsg('Réplica guardada.', true)
  } catch (err) {
    handleWriteError(err)
    formMsg('No se pudo guardar la réplica. Tu texto sigue en el formulario.')
  } finally {
    state.savingReply = false
  }
}

async function deleteReply(id) {
  state.confirmDeleteId = null
  try {
    if (state.mode === 'db' && db) {
      await db.doc('replicas/' + id).delete()
    } else {
      state.replicas = state.replicas.filter(r => r.id !== id)
      lsWrite()
    }
    if (state.editingId === id) resetForm()
    toast('Réplica eliminada')
  } catch (err) {
    handleWriteError(err)
  }
}

/* ----- Propuesta de réplica con IA ----- */
const HIDE_CODES = [
  'not_granted',
  'sampling_disabled',
  'not_declared',
  'capability_disabled',
  'capability_removed'
]

function sampleMessage(code) {
  switch (code) {
    case 'rate_limited':
      return 'Hay demasiadas solicitudes en este momento. Intenta de nuevo en un rato.'
    case 'session_expired':
      return 'Tu sesión expiró. Vuelve a iniciar sesión e intenta otra vez.'
    case 'refused':
      return 'No se pudo responder a este comentario. Revisa el texto e intenta con otro.'
    case 'empty_completion':
      return 'No llegó ninguna respuesta. Prueba con un comentario más corto.'
    case 'prompt_too_large':
      return 'El comentario es demasiado largo. Pega solo la parte que quieres responder.'
    default:
      return 'Se interrumpió la conexión. Puedes intentarlo de nuevo.'
  }
}

function buildPrompt(companero, comentario) {
  const contexto =
    (state.aporte.q4 || '').slice(0, 1800) ||
    'Defiendo elegir la licencia según el proyecto, el cliente y los costos de licenciamiento.'
  return (
    'Eres aprendiz del SENA en el programa Análisis y desarrollo de software y participas en el foro temático "Licenciamiento de software". ' +
    'Escribe en español de Colombia una réplica crítico-reflexiva de 120 a 180 palabras al comentario de un compañero.\n\n' +
    'Estructura, en prosa continua y sin títulos ni viñetas:\n' +
    '1. Saluda al compañero' +
    (companero ? ' por su nombre (' + companero + ')' : '') +
    ' y reconoce un acierto concreto de su comentario.\n' +
    '2. Complementa o corrige con un argumento técnico, económico o legal. Menciona normas colombianas (Ley 23 de 1982, Decisión Andina 351 de 1993, Decreto 1360 de 1989) solo si vienen al caso, y no inventes cifras ni artículos.\n' +
    '3. Matiza con respeto una idea con la que no estés del todo de acuerdo, si la hay.\n' +
    '4. Cierra con una pregunta que invite a seguir el debate.\n\n' +
    'Usa primera persona y un tono respetuoso. Devuelve solo el texto de la réplica.\n\n' +
    'Mi postura en el foro (resumen, solo como contexto):\n' +
    contexto +
    '\n\n' +
    'Comentario del compañero:\n' +
    comentario
  )
}

async function suggestReply() {
  if (!sampleFn) return
  const comentario = state.form.comentario.trim()
  if (!comentario) {
    formMsg('Primero pega el comentario de tu compañero.')
    return
  }
  formMsg('')
  ctl = new AbortController()
  state.suggest = { visible: true, text: '', waiting: true, running: true, msg: '' }
  try {
    const res = await sampleFn(buildPrompt(state.form.companero.trim(), comentario), {
      signal: ctl.signal,
      modelTier: 'default',
      onText: ({ text }) => {
        state.suggest.waiting = false
        state.suggest.text = text
      }
    })
    state.suggest.waiting = false
    state.suggest.text = res.text
    if (res.truncated) state.suggest.msg = 'La propuesta quedó incompleta. Revísala antes de usarla.'
  } catch (err) {
    const code = err && err.code
    state.suggest.waiting = false
    state.suggest.text = (err && err.text) || ''
    if (HIDE_CODES.includes(code)) {
      state.suggest.visible = false
      state.canSuggest = false
      sampleFn = null
      formMsg('La ayuda asistida no está disponible en este entorno. Puedes escribir tu réplica a mano.')
    } else if (code === 'cancelled') {
      if (!state.suggest.text) state.suggest.visible = false
    } else {
      state.suggest.msg = sampleMessage(code)
    }
  } finally {
    state.suggest.running = false
    ctl = null
  }
}

function stopSuggest() {
  if (ctl) ctl.abort()
}

function discardSuggest() {
  if (ctl) ctl.abort()
  state.suggest.visible = false
  state.suggest.text = ''
}

function useSuggest() {
  if (!state.suggest.text) return
  state.form.respuesta = state.suggest.text
  state.suggest.visible = false
  formMsg('Revisa la propuesta, ajústala con tus palabras y guárdala.', true)
  nextTick(() => {
    if (respuestaEl.value) respuestaEl.value.focus()
  })
}

/* ----- Exportar y Copiar ----- */
function showFallback(text) {
  state.fallbackText = text
  nextTick(() => {
    const ta = fallbackEl.value
    if (ta) {
      ta.focus()
      ta.select()
    }
  })
}

function copyText(text, label) {
  if (!text.trim()) {
    toast('No hay texto para copiar todavía')
    return
  }
  let p = null
  try {
    p = navigator.clipboard && navigator.clipboard.writeText(text)
  } catch (e) {
    p = null
  }
  if (!p) {
    showFallback(text)
    return
  }
  p.then(
    () => toast(label || 'Copiado'),
    () => showFallback(text)
  )
}

function copyAporte() {
  copyText(getAporteText(plainAporte()), 'Aporte copiado. Pégalo en el foro.')
}

function copyAll() {
  copyText(
    getAporteText(plainAporte()) + getRepliesText(state.replicas),
    'Aporte y réplicas copiados'
  )
}

async function downloadTxt() {
  try {
    const name = getFileBase(state.aporte) + '.txt'
    const content = getAporteText(plainAporte()) + getRepliesText(state.replicas)
    await downloadFile(name, content, downloads)
  } catch (e) {
    toast('No se pudo preparar el archivo.')
  }
}

async function downloadMd() {
  try {
    const name = getFileBase(state.aporte) + '.md'
    const content = getMarkdown(plainAporte(), state.replicas)
    await downloadFile(name, content, downloads)
  } catch (e) {
    toast('No se pudo preparar el archivo.')
  }
}

async function downloadPdf() {
  state.pdfBusy = true
  try {
    const blob = await buildPdf(plainAporte(), state.replicas)
    await downloadFile(getFileBase(state.aporte) + '.pdf', blob, downloads)
  } catch (e) {
    toast('No se pudo generar el PDF. Usa .txt o Markdown.')
  } finally {
    state.pdfBusy = false
  }
}

/* ----- Carga de datos inicial ----- */
function finishLoad() {
  state.loaded = true
  if (!state.readOnly) setStatus(state.lastSavedAt ? 'saved' : 'idle')
}

function useLocal() {
  if (state.mode !== 'loading') return
  state.mode = 'local'
  const saved = lsRead()
  if (saved && saved.aporte) {
    applyAporte(saved.aporte)
    state.hasAporte = TEXT_KEYS.some(k => (state.aporte[k] || '').trim())
  }
  if (saved && Array.isArray(saved.replicas)) {
    state.replicas = saved.replicas
  }
  finishLoad()
}

function handleDbError(err) {
  const code = err && err.code
  if (!state.loaded) {
    state.mode = 'loading'
    db = null
    useLocal()
    if (code === 'revoked') setReadOnly(true)
    return
  }
  if (code === 'revoked') {
    setReadOnly(true)
    return
  }
  setStatus('error', 'Se perdió la conexión con el almacenamiento. Recarga la página.')
}

function useDb(store) {
  db = store
  state.mode = 'db'
  let gotAporte = false
  let gotReps = false
  const maybeFinish = () => {
    if (!state.loaded && gotAporte && gotReps) finishLoad()
  }

  db.doc('foro/aporte').onSnapshot(snap => {
    if (state.mode !== 'db') return
    if (snap.exists) {
      state.hasAporte = true
      if (!state.loaded || (!state.dirty && !state.saving && !editingNow())) {
        applyAporte(snap.data() || {})
      }
    }
    gotAporte = true
    maybeFinish()
  }, handleDbError)

  db.collection('replicas')
    .orderBy('createdAt', 'desc')
    .onSnapshot(qs => {
      if (state.mode !== 'db') return
      state.replicas = qs.docs.map(d => Object.assign({ id: d.id }, d.data()))
      if (state.confirmDeleteId && !state.replicas.some(r => r.id === state.confirmDeleteId)) {
        state.confirmDeleteId = null
      }
      gotReps = true
      maybeFinish()
    }, handleDbError)
}

async function start() {
  const c = typeof window !== 'undefined' ? window.claude : null
  if (!c || typeof c.use !== 'function') {
    useLocal()
    return
  }

  c.use('sample')
    .then(s => {
      if (s) {
        sampleFn = s
        state.canSuggest = !state.readOnly
      }
    })
    .catch(() => {})

  c.use('downloads')
    .then(d => {
      if (d) downloads = d
    })
    .catch(() => {})

  c.use('user')
    .then(async u => {
      if (!u) return
      try {
        if ((await u.isOwner()) === false) setReadOnly(true)
      } catch (e) {
        /* sin dato */
      }
    })
    .catch(() => {})

  let store = null
  try {
    store = await c.use('db')
  } catch (e) {
    store = null
  }
  if (store) useDb(store)
  else useLocal()
}

function beforeUnload(e) {
  if (state.dirty || state.saving) {
    saveNow()
    e.preventDefault()
    e.returnValue = ''
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', beforeUnload)
  start()
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', beforeUnload)
})
</script>
