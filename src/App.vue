<template>
  <div>
    <!-- Encabezado principal -->
    <header class="top">
      <div class="wrap">
        <h1>Foro: Licenciamiento de software</h1>
      </div>
    </header>

    <!-- Barra de estado, navegación y control de roles -->
    <div class="bar">
      <div class="wrap">
        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <button
            :class="['nav-tab', { active: currentTab === 'foro' }]"
            type="button"
            @click="currentTab = 'foro'"
          >
            Explorar Foro
            <span class="counter-badge">{{ aportesList.length }}</span>
          </button>
          <button
            :class="['nav-tab', { active: currentTab === 'editor' }]"
            type="button"
            @click="irAEditorNuevo"
          >
            {{ state.aporteIdPublicado ? 'Editar Aporte en Curso' : 'Redactar Mi Aporte' }}
          </button>
        </div>

        <div class="actions" style="align-items: center;">
          <!-- Estado de Administrador -->
          <div v-if="isAdmin" style="display: flex; gap: 6px; align-items: center;">
            <span class="admin-pill" title="Permisos totales de calificación y eliminación activos">
              🛡️ Administrador Activo
            </span>
            <button class="btn sm" type="button" @click="cerrarSesionAdmin">
              Salir de Admin
            </button>
          </div>
          <button
            v-else
            class="btn ghost sm"
            type="button"
            @click="abrirLoginAdmin"
          >
            🔐 Acceso Admin
          </button>

          <span class="pill" role="status" :data-tone="pillTone">
            <span class="dot"></span>
            <span>{{ pillText }}</span>
          </span>

          <button
            v-if="currentTab === 'editor'"
            class="btn primary"
            type="button"
            :disabled="publicando"
            @click="publicarAporteEnForo"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
              <path d="M3 2.5h8l2.5 2.5v8.5h-10.5z" />
              <path d="M5.5 2.5v3.5h5v-3.5M5 13.5v-4h6v4" />
            </svg>
            {{ state.aporteIdPublicado ? 'Guardar Cambios' : 'Publicar en el Foro' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <main class="wrap" style="padding-block: 28px 60px;">
      <!-- VISTA 1: EXPLORAR FORO -->
      <section v-if="currentTab === 'foro'">
        <ForoList
          :aportes="aportesList"
          :loading="cargandoAportes"
          @ver-aporte="abrirDetalleAporte"
          @nuevo-aporte="irAEditorNuevo"
        />
      </section>

      <!-- VISTA 2: DETALLE Y COMENTARIOS DE UN APORTE -->
      <section v-else-if="currentTab === 'detalle' && aporteSeleccionado">
        <AporteDetalle
          :aporte="aporteSeleccionado"
          :is-admin="isAdmin"
          :admin-clave="adminClave"
          @volver="currentTab = 'foro'"
          @comentario-agregado="handleNuevoComentario"
          @eliminar-comentario="handleEliminarComentario"
          @eliminar-aporte="handleEliminarAporte"
          @iniciar-edicion="handleIniciarEdicion"
          @calificar-aporte="handleCalificarAporte"
          @toast="toast"
        />
      </section>

      <!-- VISTA 3: EDITOR DE MI APORTE -->
      <section v-else-if="currentTab === 'editor'" class="layout" style="padding-block: 0;">
        <div class="main">
          <!-- Hoja del aporte -->
          <section id="aporte" class="sheet" aria-labelledby="aporteTitle">
            <div class="sheet-head">
              <div>
                <h2 id="aporteTitle">
                  {{ state.aporteIdPublicado ? 'Editar Mi Aporte Publicado' : 'Redactar Mi Aporte' }}
                </h2>
                <p>
                  {{ state.aporteIdPublicado
                    ? 'Modifica tu pregunta orientadora o respuesta. Al pulsar Guardar Cambios se actualizará para todos.'
                    : 'Escribe tu pregunta orientadora, tu respuesta y define una clave de autor para proteger futuras ediciones.' }}
                </p>
              </div>
              <div v-if="state.aporteIdPublicado">
                <button class="btn sm" type="button" @click="cancelarEdicionYLimpiar">
                  + Redactar Nuevo Aporte
                </button>
              </div>
            </div>

            <div class="sheet-body">
              <!-- Datos del aprendiz -->
              <div class="who">
                <div>
                  <label class="lbl" for="f-autor">Nombre del Aprendiz</label>
                  <input
                    id="f-autor"
                    class="inp"
                    autocomplete="name"
                    placeholder="Tu nombre completo"
                    :value="state.aporte.autor"
                    @input="setField('autor', $event.target.value)"
                  />
                </div>
                <div>
                  <label class="lbl" for="f-ficha">Número de Ficha</label>
                  <input
                    id="f-ficha"
                    class="inp"
                    inputmode="numeric"
                    placeholder="Ej. 2977456"
                    :value="state.aporte.ficha"
                    @input="setField('ficha', $event.target.value)"
                  />
                </div>
              </div>

              <!-- Clave personal de autor -->
              <div style="padding-top: 10px; max-width: 320px;">
                <label class="lbl" for="f-clave">
                  Clave o PIN de Autor (para editar en el futuro)
                </label>
                <input
                  id="f-clave"
                  class="inp"
                  type="password"
                  placeholder="Ej. 1234"
                  :value="state.aporte.clave_edicion"
                  @input="setField('clave_edicion', $event.target.value)"
                />
              </div>

              <!-- Único espacio para la pregunta orientadora -->
              <div class="field" style="border-top: none; padding-top: 16px;">
                <div class="field-head">
                  <h3>
                    <span class="q">PREGUNTA ORIENTADORA</span>
                    <label for="f-pregunta">Pregunta o tema a debatir</label>
                  </h3>
                  <button
                    v-if="state.aporte.pregunta !== PREGUNTAS_DEFECTO"
                    class="btn ghost sm"
                    type="button"
                    style="font-size: 11px; padding: 2px 8px;"
                    title="Restablecer las 4 preguntas orientadoras oficiales"
                    @click="restaurarPreguntasOficiales"
                  >
                    ↺ Restaurar preguntas oficiales
                  </button>
                </div>
                <textarea
                  id="f-pregunta"
                  class="inp-pregunta"
                  rows="4"
                  placeholder="1. ¿Qué es un software?&#10;2. ¿Qué es una licencia de software?&#10;3. Tipos de licencias de software&#10;4. ¿Cuáles son las más adecuadas y por qué?"
                  :value="state.aporte.pregunta"
                  @input="setField('pregunta', $event.target.value)"
                ></textarea>
              </div>

              <!-- Único espacio para la respuesta -->
              <div class="field">
                <div class="field-head">
                  <h3>
                    <span class="q">TU APORTE</span>
                    <label for="f-respuesta">Respuesta y argumentación</label>
                  </h3>
                  <span class="count" :data-ok="totalWords >= 40 ? '1' : '0'">
                    {{ totalWords }} {{ totalWords === 1 ? 'palabra' : 'palabras' }}
                  </span>
                </div>
                <textarea
                  id="f-respuesta"
                  class="doc"
                  rows="14"
                  style="min-height: 240px;"
                  placeholder="Escribe aquí tu respuesta y análisis reflexivo..."
                  :value="state.aporte.respuesta"
                  @input="setField('respuesta', $event.target.value)"
                ></textarea>
              </div>
            </div>

            <!-- Pie del aporte -->
            <div class="sheet-foot">
              <span>{{ savedAtText }}</span>
              <span>
                <button class="btn ghost sm" type="button" @click="startBlank">
                  Limpiar campos
                </button>
              </span>
            </div>
          </section>

          <!-- Sección de metodología formativa para réplicas -->
          <section id="replicas" aria-labelledby="repTitle">
            <div class="section-title">
              <div>
                <h2 id="repTitle">Estructura para comentar y replicar</h2>
                <p>Al comentar los aportes de tus compañeros en el foro, sigue esta metodología pedagógica recomendada por el SENA:</p>
              </div>
            </div>

            <div class="recipe" aria-label="Estructura sugerida para una réplica">
              <div v-for="p in PASOS" :key="p.t">
                <b>{{ p.t }}</b>
                {{ p.d }}
              </div>
            </div>
          </section>
        </div>

        <!-- Panel lateral: Progreso y Exportación -->
        <aside class="side" aria-label="Estado del aporte">
          <div class="panel">
            <h2>Progreso de tu Aporte</h2>
            <div class="stats" style="grid-template-columns: 1fr 1fr;">
              <div class="stat">
                <b>{{ totalWords.toLocaleString('es-CO') }}</b>
                <span>palabras</span>
              </div>
              <div class="stat">
                <b :style="{ color: totalWords >= 40 ? 'var(--ok)' : 'var(--warn)' }">
                  {{ totalWords >= 40 ? 'Completado' : 'Mínimo 40' }}
                </b>
                <span>criterio extensión</span>
              </div>
            </div>
            <p class="where">
              {{ state.aporteIdPublicado
                ? 'Estás editando un aporte ya publicado. Al guardar cambios se actualizará en la base de datos.'
                : 'Tus avances se autoguardan localmente. Cuando estés listo, pulsa "Publicar en el Foro".' }}
            </p>
          </div>

          <div class="panel">
            <h2>Exportar Aporte</h2>
            <div class="exports">
              <button class="btn primary wide" type="button" @click="copyAporte">
                Copiar para el foro
              </button>
              <button class="btn sm" type="button" :disabled="state.pdfBusy" @click="downloadPdf">
                {{ state.pdfBusy ? 'Preparando…' : 'Descargar PDF' }}
              </button>
              <button class="btn sm" type="button" @click="downloadTxt">
                Descargar .txt
              </button>
              <button class="btn sm wide" type="button" @click="downloadMd">
                Descargar Markdown
              </button>
            </div>
          </div>
        </aside>
      </section>
    </main>

    <!-- MODAL: Iniciar Sesión como Administrador -->
    <div v-if="mostrarModalLoginAdmin" class="modal-backdrop" @click.self="mostrarModalLoginAdmin = false">
      <div class="modal-box">
        <h3>Acceso Docente / Administrador</h3>
        <p style="font-size: 14px; color: var(--muted);">
          Ingresa la clave de administrador para calificar aportes y moderar el foro:
        </p>
        <div>
          <label class="lbl" for="admin-clave-inp">Clave de Administrador</label>
          <input
            id="admin-clave-inp"
            v-model="inputClaveAdmin"
            class="inp"
            type="password"
            placeholder="Clave..."
            @keyup.enter="verificarAdminLogin"
          />
        </div>
        <div class="actions" style="justify-content: flex-end; margin-top: 10px;">
          <button class="btn sm" type="button" @click="mostrarModalLoginAdmin = false">Cancelar</button>
          <button class="btn primary sm" type="button" @click="verificarAdminLogin">Ingresar como Admin</button>
        </div>
      </div>
    </div>

    <!-- Modal de respaldo para copiar manualmente -->
    <div v-if="state.fallbackText !== null" class="fallback">
      <p>
        <b>Tu navegador no dejó copiar automáticamente.</b>
        El texto ya está seleccionado: cópialo con Ctrl+C.
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
import { reactive, ref, computed, nextTick, onMounted } from 'vue'
import ForoList from './components/ForoList.vue'
import AporteDetalle from './components/AporteDetalle.vue'
import { LS_KEY, PASOS, PREGUNTAS_DEFECTO } from './data/constants.js'
import { words, blank, fmtTime } from './utils/text.js'
import {
  getAporteText,
  getMarkdown,
  getFileBase,
  downloadFile,
  buildPdf
} from './utils/exporter.js'
import {
  fetchAportes,
  fetchAporteById,
  saveAporte,
  deleteAporte,
  verifyAdmin,
  verifyClaveAporte,
  calificarAporte,
  addComentario,
  deleteComentario
} from './services/api.js'

// Estado de navegación y administración
const currentTab = ref('foro') // 'foro' | 'detalle' | 'editor'
const aportesList = ref([])
const aporteSeleccionado = ref(null)
const cargandoAportes = ref(false)
const publicando = ref(false)

// Autenticación de Administrador (Clave 2501)
const isAdmin = ref(false)
const adminClave = ref('')
const mostrarModalLoginAdmin = ref(false)
const inputClaveAdmin = ref('')

// Estado del editor
const state = reactive({
  aporteIdPublicado: null,
  claveActiva: '',
  aporte: blank(),
  lastSavedAt: null,
  pdfBusy: false,
  fallbackText: null,
  toast: ''
})

const fallbackEl = ref(null)
let toastTimer = null

/* ----- Valores derivados ----- */
const totalWords = computed(() => words(state.aporte.respuesta))

const savedAtText = computed(() =>
  state.lastSavedAt ? 'Último guardado local: ' + fmtTime(state.lastSavedAt) : 'Sin guardar todavía'
)

const pillTone = computed(() => {
  if (publicando.value) return 'busy'
  if (state.aporteIdPublicado) return 'ok'
  return 'warn'
})

const pillText = computed(() => {
  if (publicando.value) return 'Sincronizando con el servidor…'
  if (state.aporteIdPublicado) return 'Modo Edición / Publicado'
  return 'Borrador local'
})

/* ----- Notificaciones Toast ----- */
function toast(msg) {
  state.toast = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    state.toast = ''
  }, 2800)
}

/* ----- LocalStorage ----- */
function lsWrite() {
  try {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({
        aporte: state.aporte,
        aporteIdPublicado: state.aporteIdPublicado,
        claveActiva: state.claveActiva
      })
    )
    state.lastSavedAt = new Date()
  } catch (e) {
    console.error(e)
  }
}

function lsRead() {
  try {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || 'null')
    if (saved && saved.aporte) {
      Object.assign(state.aporte, saved.aporte)
      if (saved.aporteIdPublicado) {
        state.aporteIdPublicado = saved.aporteIdPublicado
      }
      if (saved.claveActiva) {
        state.claveActiva = saved.claveActiva
      }
    }
  } catch (e) {
    // Mantener vacíos
  }
  // Si la pregunta está vacía (por guardado anterior de pruebas), asegurar que aparezcan las preguntas oficiales
  if (!state.aporte.pregunta || !state.aporte.pregunta.trim()) {
    state.aporte.pregunta = PREGUNTAS_DEFECTO
  }
}

function setField(k, v) {
  state.aporte[k] = v
  lsWrite()
}

function restaurarPreguntasOficiales() {
  state.aporte.pregunta = PREGUNTAS_DEFECTO
  lsWrite()
  toast('Preguntas orientadoras oficiales restablecidas')
}

function startBlank() {
  state.aporte.pregunta = PREGUNTAS_DEFECTO
  state.aporte.respuesta = ''
  lsWrite()
  toast('Respuesta limpiada')
  nextTick(() => {
    const f = document.getElementById('f-respuesta')
    if (f) f.focus()
  })
}

function irAEditorNuevo() {
  if (!state.aporte.pregunta || !state.aporte.pregunta.trim()) {
    state.aporte.pregunta = PREGUNTAS_DEFECTO
    lsWrite()
  }
  currentTab.value = 'editor'
}

function cancelarEdicionYLimpiar() {
  state.aporteIdPublicado = null
  state.claveActiva = ''
  state.aporte.pregunta = PREGUNTAS_DEFECTO
  state.aporte.respuesta = ''
  state.aporte.clave_edicion = ''
  lsWrite()
  toast('Listo para redactar un nuevo aporte')
}

/* ----- Manejo de Administrador (Clave 2501) ----- */
function abrirLoginAdmin() {
  inputClaveAdmin.value = ''
  mostrarModalLoginAdmin.value = true
}

async function verificarAdminLogin() {
  try {
    const res = await verifyAdmin(inputClaveAdmin.value.trim())
    if (res.ok) {
      isAdmin.value = true
      adminClave.value = inputClaveAdmin.value.trim()
      sessionStorage.setItem('admin_session', adminClave.value)
      mostrarModalLoginAdmin.value = false
      toast('¡Sesión de Administrador iniciada!')
    }
  } catch (err) {
    alert(err.message || 'Clave de administrador incorrecta')
  }
}

function cerrarSesionAdmin() {
  isAdmin.value = false
  adminClave.value = ''
  sessionStorage.removeItem('admin_session')
  toast('Sesión de Administrador cerrada')
}

/* ----- Carga de datos de la API ----- */
async function cargarForo() {
  cargandoAportes.value = true
  try {
    const data = await fetchAportes()
    aportesList.value = data
  } catch (error) {
    console.warn('API no disponible, usando modo local:', error)
  } finally {
    cargandoAportes.value = false
  }
}

async function abrirDetalleAporte(id) {
  try {
    const aporte = await fetchAporteById(id)
    aporteSeleccionado.value = aporte
    currentTab.value = 'detalle'
  } catch (error) {
    toast('No se pudo cargar el aporte')
  }
}

/* ----- Edición con Clave de Autor / Admin ----- */
async function handleIniciarEdicion({ aporte, clave }) {
  try {
    await verifyClaveAporte(aporte.id, clave)
    // Clave correcta: cargar datos en el editor
    state.aporteIdPublicado = aporte.id
    state.claveActiva = clave
    state.aporte.autor = aporte.autor
    state.aporte.ficha = aporte.ficha
    state.aporte.pregunta = aporte.pregunta
    state.aporte.respuesta = aporte.respuesta
    state.aporte.clave_edicion = clave
    lsWrite()
    currentTab.value = 'editor'
    toast('Aporte cargado en el editor para modificación')
  } catch (err) {
    alert(err.message || 'Clave incorrecta')
  }
}

/* ----- Calificación Docente (Admin) ----- */
async function handleCalificarAporte({ aporteId, calificacion, retroalimentacion }) {
  try {
    const aporteActualizado = await calificarAporte(aporteId, {
      claveAdmin: adminClave.value || '2501',
      calificacion,
      retroalimentacion
    })
    aporteSeleccionado.value = {
      ...aporteSeleccionado.value,
      ...aporteActualizado
    }
    await cargarForo()
    toast('¡Calificación y retroalimentación guardadas!')
  } catch (err) {
    alert(err.message || 'Error al calificar el aporte')
  }
}

/* ----- Comentarios y Eliminación ----- */
async function handleNuevoComentario(datosComentario) {
  try {
    const nuevo = await addComentario(datosComentario.aporteId, {
      autor: datosComentario.autor,
      comentario_citado: datosComentario.comentario_citado,
      contenido: datosComentario.contenido
    })

    if (!aporteSeleccionado.value.comentarios) {
      aporteSeleccionado.value.comentarios = []
    }
    aporteSeleccionado.value.comentarios.push(nuevo)
    toast('¡Comentario publicado en el foro!')
    cargarForo()
  } catch (error) {
    toast('Error al publicar comentario en el servidor')
  }
}

async function handleEliminarComentario(id) {
  if (!confirm('¿Deseas eliminar este comentario?')) return
  try {
    await deleteComentario(id)
    if (aporteSeleccionado.value && aporteSeleccionado.value.comentarios) {
      aporteSeleccionado.value.comentarios = aporteSeleccionado.value.comentarios.filter(
        c => c.id !== id
      )
    }
    toast('Comentario eliminado')
    cargarForo()
  } catch (error) {
    toast('Error al eliminar comentario')
  }
}

async function handleEliminarAporte({ id, clave }) {
  try {
    await deleteAporte(id, clave || (isAdmin.value ? adminClave.value || '2501' : ''))
    if (state.aporteIdPublicado === id) {
      state.aporteIdPublicado = null
      state.claveActiva = ''
      lsWrite()
    }
    toast('Aporte eliminado del foro')
    currentTab.value = 'foro'
    cargarForo()
  } catch (error) {
    alert(error.message || 'Error al eliminar aporte')
  }
}

async function publicarAporteEnForo() {
  if (!state.aporte.autor.trim()) {
    toast('Por favor escribe tu nombre como autor')
    currentTab.value = 'editor'
    nextTick(() => {
      const f = document.getElementById('f-autor')
      if (f) f.focus()
    })
    return
  }
  if (!state.aporte.pregunta.trim()) {
    toast('Por favor escribe la pregunta o tema')
    currentTab.value = 'editor'
    nextTick(() => {
      const f = document.getElementById('f-pregunta')
      if (f) f.focus()
    })
    return
  }
  if (!state.aporte.respuesta.trim()) {
    toast('Por favor escribe tu respuesta')
    currentTab.value = 'editor'
    nextTick(() => {
      const f = document.getElementById('f-respuesta')
      if (f) f.focus()
    })
    return
  }

  const claveParaGuardar = state.claveActiva || state.aporte.clave_edicion || (isAdmin.value ? '2501' : '')

  publicando.value = true
  try {
    const resultado = await saveAporte(state.aporte, state.aporteIdPublicado, claveParaGuardar)
    state.aporteIdPublicado = resultado.id
    lsWrite()
    await cargarForo()
    toast(state.aporteIdPublicado ? '¡Aporte actualizado exitosamente!' : '¡Aporte publicado en el Foro!')
    currentTab.value = 'foro'
  } catch (error) {
    alert(error.message || 'Error al conectar con la base de datos')
  } finally {
    publicando.value = false
  }
}

/* ----- Exportar y Copiar ----- */
function copyText(text, label) {
  if (!text.trim()) {
    toast('No hay texto para copiar')
    return
  }
  navigator.clipboard.writeText(text).then(
    () => toast(label || 'Copiado'),
    () => {
      state.fallbackText = text
    }
  )
}

function copyAporte() {
  copyText(getAporteText(state.aporte), 'Aporte copiado para el foro')
}

async function downloadTxt() {
  try {
    const name = getFileBase(state.aporte) + '.txt'
    const content = getAporteText(state.aporte)
    await downloadFile(name, content)
  } catch (e) {
    toast('No se pudo preparar el archivo.')
  }
}

async function downloadMd() {
  try {
    const name = getFileBase(state.aporte) + '.md'
    const content = getMarkdown(state.aporte, [])
    await downloadFile(name, content)
  } catch (e) {
    toast('No se pudo preparar el archivo.')
  }
}

async function downloadPdf() {
  state.pdfBusy = true
  try {
    const blob = await buildPdf(state.aporte, [])
    await downloadFile(getFileBase(state.aporte) + '.pdf', blob)
  } catch (e) {
    toast('No se pudo generar el PDF.')
  } finally {
    state.pdfBusy = false
  }
}

onMounted(() => {
  lsRead()
  // Restaurar sesión de admin si ya estaba abierta en la pestaña
  const savedAdmin = sessionStorage.getItem('admin_session')
  if (savedAdmin === '2501') {
    isAdmin.value = true
    adminClave.value = savedAdmin
  }
  cargarForo()
})
</script>
