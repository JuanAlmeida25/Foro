<template>
  <div>
    <!-- Encabezado principal (oculto en evaluación para total aislamiento e independencia) -->
    <header v-if="currentTab !== 'evaluacion'" class="top">
      <div class="wrap">
        <span class="top-eyebrow">⚖️ SENA • ADSO</span>
        <h1>Foro: <span class="hl">Licenciamiento de software</span></h1>
        <p class="top-sub">
          Comparte tu análisis, revisa los aportes de tus compañeros y aprende a elegir la licencia correcta para cada proyecto.
        </p>
      </div>
    </header>

    <!-- Barra fija en dos pisos: arriba el estado y las acciones, abajo las secciones -->
    <div class="bar">
      <div class="wrap bar-inner">
        <div v-if="currentTab !== 'evaluacion'" class="bar-top">
          <span class="pill" role="status" :data-tone="pillTone">
            <span class="dot"></span>
            <span>{{ pillText }}</span>
          </span>

          <div class="bar-acciones">
            <button
              :class="['cuenta-chip', { active: currentTab === 'cuenta', 'con-sesion': aprendiz }]"
              type="button"
              :title="aprendiz ? `Sesión de ${aprendiz.nombre}` : 'Entrar o registrarme'"
              @click="currentTab = 'cuenta'"
            >
              <span class="cuenta-avatar" aria-hidden="true">{{ aprendiz ? aprendiz.nombre.charAt(0) : '👤' }}</span>
              <span>{{ aprendiz ? aprendiz.nombre.split(' ')[0] : 'Mi cuenta' }}</span>
            </button>

            <template v-if="isAdmin">
              <span class="admin-pill" title="Permisos totales de calificación y eliminación activos">🛡️ Admin</span>
              <button class="btn ghost sm" type="button" @click="cerrarSesionAdmin">Salir</button>
            </template>
            <button v-else class="btn ghost sm" type="button" @click="abrirLoginAdmin">🔐 Admin</button>

            <button
              v-if="currentTab === 'editor'"
              class="btn primary sm"
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

        <!-- En pantallas angostas las secciones se deslizan de lado en vez de amontonarse -->
        <nav ref="navEl" class="nav-scroll" aria-label="Secciones">
          <template v-for="(grupo, i) in gruposNav" :key="i">
            <span v-if="i" class="nav-sep" aria-hidden="true"></span>
            <button
              v-for="t in grupo"
              :key="t.id"
              :class="['nav-tab', { active: t.activa }]"
              type="button"
              :aria-current="t.activa ? 'page' : undefined"
              @click="t.ir ? t.ir() : (currentTab = t.id)"
            >
              <span aria-hidden="true">{{ t.icono }}</span>
              {{ t.nombre }}
              <span v-if="t.contador !== undefined" class="counter-badge">{{ t.contador }}</span>
            </button>
          </template>
        </nav>
      </div>
    </div>

    <!-- Contenido principal -->
    <main class="wrap" style="padding-block: 28px 60px;">
      <Transition name="vista" mode="out-in">
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
          @volver="currentTab = 'foro'"
          @comentario-agregado="handleNuevoComentario"
          @eliminar-comentario="handleEliminarComentario"
          @reaccionar="handleReaccion"
          @eliminar-aporte="handleEliminarAporte"
          @iniciar-edicion="handleIniciarEdicion"
          @calificar-aporte="handleCalificarAporte"
          @fijar-juicio="handleFijarJuicio"
          @dictar-sentencia="handleDictarSentencia"
          @ir-a-cuenta="currentTab = 'cuenta'"
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
                    : 'Escribe tu respuesta a la pregunta orientadora. Se publica con el nombre de tu cuenta de aprendiz.' }}
                </p>
              </div>
              <div v-if="state.aporteIdPublicado">
                <button class="btn sm" type="button" @click="cancelarEdicionYLimpiar">
                  + Redactar Nuevo Aporte
                </button>
              </div>
            </div>

            <div class="sheet-body">
              <!-- Sin cuenta se puede ir redactando (queda en este navegador), pero para publicar hay que entrar -->
              <div v-if="necesitaCuenta" class="aviso-cuenta" role="note">
                <span>👤 Para publicar en el foro entra con tu cuenta de aprendiz. Lo que escribas aquí no se pierde mientras tanto.</span>
                <button class="btn primary sm" type="button" @click="currentTab = 'cuenta'">Entrar o registrarme</button>
              </div>

              <!-- Con cuenta, el nombre y la ficha salen de ella: nadie publica con el nombre de otro -->
              <div v-if="autorDesdeCuenta" class="who">
                <div>
                  <span class="lbl">Nombre del Aprendiz</span>
                  <div class="inp inp-cuenta">{{ aprendiz.nombre }}</div>
                </div>
                <div>
                  <span class="lbl">Número de Ficha</span>
                  <div class="inp inp-cuenta">{{ aprendiz.ficha || '—' }}</div>
                </div>
              </div>

              <!-- Datos del aprendiz (admin, o aporte viejo que se edita con su clave de autor) -->
              <div v-else-if="!necesitaCuenta" class="who">
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

              <!-- Pregunta orientadora oficial (No editable de ninguna forma) -->
              <div class="field" style="border-top: none; padding-top: 16px;">
                <div class="field-head">
                  <h3>
                    <span class="q">PREGUNTA ORIENTADORA</span>
                    <span>Preguntas oficiales del foro</span>
                  </h3>
                  <span class="badge-locked" title="Pregunta fija oficial: no se puede editar">
                    🔒 Fija (No editable)
                  </span>
                </div>
                <div class="pregunta-fija-box">
                  <div
                    v-if="state.aporteIdPublicado && state.aporte.pregunta && state.aporte.pregunta !== PREGUNTAS_DEFECTO"
                    style="font-size: 15px; font-weight: 600; color: var(--fg); line-height: 1.45;"
                  >
                    {{ state.aporte.pregunta }}
                  </div>
                  <ol v-else class="pregunta-fija-list">
                    <li><span class="num">1.</span> ¿Qué es un software?</li>
                    <li><span class="num">2.</span> ¿Qué es una licencia de software?</li>
                    <li><span class="num">3.</span> Tipos de licencias de software</li>
                    <li><span class="num">4.</span> ¿Cuáles son las más adecuadas y por qué?</li>
                  </ol>
                </div>
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

      <!-- VISTA: QUÉ ES EL SRS Y LAS NORMAS Y LEYES QUE LO RIGEN (SOLO INFORMATIVA) -->
      <section v-else-if="currentTab === 'srs'">
        <SrsInfo />
      </section>

      <!-- VISTA 4: FICHA TÉCNICA Y MARCO NORMATIVO (SOLO INFORMATIVA) -->
      <section v-else-if="currentTab === 'ficha-tecnica'">
        <FichaTecnicaInfo />
      </section>

      <!-- VISTA: ACTIVIDAD CASO MAREA (elaborar una ficha técnica a partir de un caso) -->
      <section v-else-if="currentTab === 'caso-ficha'">
        <ActividadFichaCaso :is-admin="isAdmin" @ir-a-cuenta="currentTab = 'cuenta'" />
      </section>

      <!-- VISTA: LICENCIAS MÁS USADAS EN EL DESARROLLO DE SOFTWARE (SOLO INFORMATIVA) -->
      <section v-else-if="currentTab === 'licencias'">
        <LicenciasInfo />
      </section>

      <!-- VISTA: GLOSARIO CON BÚSQUEDA EN VIVO -->
      <section v-else-if="currentTab === 'glosario'">
        <GlosarioInfo />
      </section>

      <!-- VISTA 5: ACTIVIDAD DE REPASO (clasificar licencias y resolver casos) -->
      <section v-else-if="currentTab === 'repaso'">
        <ActividadRepaso />
      </section>

      <!-- VISTA: CUENTA DEL APRENDIZ (registro, entrada y firma) -->
      <section v-else-if="currentTab === 'cuenta'">
        <MiCuenta @ir-a="irA" @toast="toast" />
      </section>

      <!-- VISTA: PANEL DEL PROFE (solo administrador) -->
      <section v-else-if="currentTab === 'panel' && isAdmin">
        <PanelProfe @ver-aporte="abrirDetalleAporte" @toast="toast" />
      </section>

      <!-- VISTA: EVALUACIÓN (INDIVIDUAL, AISLADA SIN CONTENIDO DEL FORO) -->
      <section v-else-if="currentTab === 'evaluacion'">
        <EvaluacionApp />
      </section>
      </Transition>
    </main>

    <!-- MODAL: Iniciar Sesión como Administrador -->
    <Transition name="modal">
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
            autocomplete="current-password"
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
    </Transition>

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
    <Transition name="toast">
      <div v-if="state.toast" :key="state.toast" class="toast" role="status">
        {{ state.toast }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch, nextTick, onMounted, onBeforeUnmount, defineAsyncComponent } from 'vue'
import ForoList from './components/ForoList.vue'
import AporteDetalle from './components/AporteDetalle.vue'
import FichaTecnicaInfo from './components/FichaTecnicaInfo.vue'
import { LS_KEY, PASOS, PREGUNTAS_DEFECTO } from './data/constants.js'
import { yaReaccione, marcarReaccion } from './services/reacciones.js'
import { aprendiz, salirAprendiz, revisarSesionAprendiz } from './services/sesionAprendiz.js'
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
  loginAdmin,
  verifyAdminSession,
  clearAdminToken,
  EVENTO_SESION_VENCIDA,
  EVENTO_SESION_APRENDIZ_VENCIDA,
  verifyClaveAporte,
  calificarAporte,
  fijarJuicio,
  dictarSentencia,
  fijarReaccion,
  addComentario,
  deleteComentario
} from './services/api.js'

// La actividad de repaso se carga solo al abrir su pestaña, para no agrandar el paquete inicial
const ActividadRepaso = defineAsyncComponent(() => import('./components/ActividadRepaso.vue'))
const ActividadFichaCaso = defineAsyncComponent(() => import('./components/ActividadFichaCaso.vue'))
const LicenciasInfo = defineAsyncComponent(() => import('./components/LicenciasInfo.vue'))
const GlosarioInfo = defineAsyncComponent(() => import('./components/GlosarioInfo.vue'))
const PanelProfe = defineAsyncComponent(() => import('./components/PanelProfe.vue'))
const MiCuenta = defineAsyncComponent(() => import('./components/MiCuenta.vue'))
const SrsInfo = defineAsyncComponent(() => import('./components/SrsInfo.vue'))
const EvaluacionApp = defineAsyncComponent(() => import('./evaluacion/EvaluacionApp.vue'))

// Estado de navegación y administración
const currentTab = ref('foro') // 'foro' | 'detalle' | 'editor' | 'ficha-tecnica' | 'srs' | 'caso-ficha' | 'licencias' | 'glosario' | 'repaso' | 'cuenta' | 'panel' | 'evaluacion'
const aportesList = ref([])
const aporteSeleccionado = ref(null)
const cargandoAportes = ref(false)
const publicando = ref(false)

// Autenticación de Administrador
const isAdmin = ref(false)
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

// Pestañas agrupadas: el foro, lo de estudiar y lo de evaluar. "activa" también cubre el detalle de un aporte
const gruposNav = computed(() => {
  const pestana = (id, icono, nombre, extra = {}) => ({ id, icono, nombre, activa: currentTab.value === id, ...extra })
  return [
    [
      pestana('foro', '💬', 'Foro', { contador: aportesList.value.length, activa: ['foro', 'detalle'].includes(currentTab.value) }),
      pestana('editor', '✍️', state.aporteIdPublicado ? 'Editando aporte' : 'Mi aporte', { ir: irAEditorNuevo })
    ],
    [
      // Primero el SRS y luego la ficha: en un proyecto real se hacen en ese orden
      pestana('srs', '📄', 'SRS'),
      pestana('ficha-tecnica', '📘', 'Ficha técnica'),
      pestana('caso-ficha', '🧩', 'Caso MAREA'),
      pestana('licencias', '⚖️', 'Licencias'),
      pestana('glosario', '📖', 'Glosario'),
      pestana('repaso', '🎯', 'Repaso')
    ],
    [
      pestana('evaluacion', '📝', 'Evaluación'),
      ...(isAdmin.value ? [pestana('panel', '👨‍🏫', 'Panel del profe')] : [])
    ]
  ]
})

// Si la pestaña activa quedó escondida a un lado de la barra (en el celular), se trae a la vista
const navEl = ref(null)
watch(currentTab, () => {
  nextTick(() => {
    navEl.value?.querySelector('.nav-tab.active')?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
  })
})

// Un aporte viejo que se está editando con su clave de autor no necesita cuenta
const editandoConClave = computed(() => Boolean(state.aporteIdPublicado && state.claveActiva))
const autorDesdeCuenta = computed(() => !isAdmin.value && Boolean(aprendiz.value) && !editandoConClave.value)
const necesitaCuenta = computed(() => !isAdmin.value && !aprendiz.value && !editandoConClave.value)

const savedAtText = computed(() =>
  state.lastSavedAt ? 'Último guardado local: ' + fmtTime(state.lastSavedAt) : 'Sin guardar todavía'
)

const pillTone = computed(() => {
  if (currentTab.value === 'ficha-tecnica') return 'ok'
  if (currentTab.value === 'srs') return 'ok'
  if (currentTab.value === 'caso-ficha') return 'ok'
  if (currentTab.value === 'licencias') return 'ok'
  if (currentTab.value === 'glosario') return 'ok'
  if (currentTab.value === 'repaso') return 'ok'
  if (currentTab.value === 'panel') return 'ok'
  if (currentTab.value === 'cuenta') return aprendiz.value ? 'ok' : 'warn'
  if (publicando.value) return 'busy'
  if (state.aporteIdPublicado) return 'ok'
  return 'warn'
})

const pillText = computed(() => {
  if (currentTab.value === 'ficha-tecnica') return 'Guía Informativa'
  if (currentTab.value === 'srs') return 'Guía de requisitos'
  if (currentTab.value === 'caso-ficha') return 'Caso práctico'
  if (currentTab.value === 'licencias') return 'Guía de licencias'
  if (currentTab.value === 'glosario') return 'Glosario'
  if (currentTab.value === 'repaso') return 'Práctica de repaso'
  if (currentTab.value === 'panel') return 'Panel del Profe'
  if (currentTab.value === 'cuenta') return aprendiz.value ? 'Sesión abierta' : 'Sin sesión'
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
  if (k === 'pregunta') return // La pregunta orientadora es fija y no se puede editar
  state.aporte[k] = v
  lsWrite()
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

// Desde "Mi cuenta" se puede saltar al editor o al foro
function irA(pestana) {
  if (pestana === 'editor') irAEditorNuevo()
  else currentTab.value = pestana
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

/* ----- Manejo de Administrador ----- */
function abrirLoginAdmin() {
  inputClaveAdmin.value = ''
  mostrarModalLoginAdmin.value = true
}

async function verificarAdminLogin() {
  const clave = inputClaveAdmin.value.trim()
  if (!clave) {
    alert('Escribe la clave de administrador')
    return
  }
  try {
    await loginAdmin(clave)
    isAdmin.value = true
    inputClaveAdmin.value = ''
    mostrarModalLoginAdmin.value = false
    toast('¡Sesión de Administrador iniciada!')
  } catch (err) {
    alert(err.message || 'Clave de administrador incorrecta')
  }
}

function cerrarSesionAdmin() {
  isAdmin.value = false
  if (currentTab.value === 'panel') currentTab.value = 'foro'
  clearAdminToken()
  toast('Sesión de Administrador cerrada')
}

// El servidor avisó que el token de administrador venció
function onSesionVencida() {
  if (isAdmin.value) {
    isAdmin.value = false
    if (currentTab.value === 'panel') currentTab.value = 'foro'
    toast('Tu sesión de administrador venció. Vuelve a ingresar.')
  }
}

// El servidor avisó que la sesión del aprendiz ya no vale (venció o le reiniciaron el PIN)
function onSesionAprendizVencida() {
  salirAprendiz()
  toast('Tu sesión de aprendiz venció. Entra otra vez con tu documento y PIN.')
}

/* ----- Carga de datos de la API ----- */
async function cargarForo() {
  cargandoAportes.value = true
  try {
    const data = await fetchAportes()
    aportesList.value = data
  } catch (error) {
    console.error('No se pudieron cargar los aportes:', error)
    toast(error.message || 'No se pudieron cargar los aportes')
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

/* ----- El Juicio de Macondo (Admin) ----- */
async function handleFijarJuicio({ aporteId, abierto }) {
  if (!abierto && !confirm('¿Archivar el juicio? El aporte vuelve a ser normal y se oculta la sentencia.')) return
  try {
    const { juicio } = await fijarJuicio(aporteId, abierto)
    aporteSeleccionado.value = { ...aporteSeleccionado.value, juicio }
    await cargarForo()
    toast(abierto ? '⚖️ ¡Se abre la audiencia! Que pasen las partes.' : 'Juicio archivado')
  } catch (err) {
    alert(err.message || 'No se pudo cambiar el juicio')
  }
}

async function handleDictarSentencia({ aporteId, veredicto, sentencia }) {
  try {
    const { juicio } = await dictarSentencia(aporteId, { veredicto, sentencia })
    aporteSeleccionado.value = { ...aporteSeleccionado.value, juicio }
    await cargarForo()
    toast('🔨 Sentencia dictada. ¡Se levanta la sesión!')
  } catch (err) {
    alert(err.message || 'No se pudo dictar la sentencia')
  }
}

/* ----- Comentarios y Eliminación ----- */
async function handleNuevoComentario(datosComentario) {
  try {
    const nuevo = await addComentario(datosComentario.aporteId, {
      autor: datosComentario.autor,
      comentario_citado: datosComentario.comentario_citado,
      contenido: datosComentario.contenido,
      bando: datosComentario.bando
    })

    if (!aporteSeleccionado.value.comentarios) {
      aporteSeleccionado.value.comentarios = []
    }
    aporteSeleccionado.value.comentarios.push(nuevo)
    toast('¡Comentario publicado en el foro!')
    cargarForo()
  } catch (error) {
    toast(error.message || 'Error al publicar comentario en el servidor')
    if (error.datos?.necesitaCuenta) currentTab.value = 'cuenta'
  }
}

/* ----- Reacciones "Útil" ----- */

// Cambia el total en todas las copias del aporte o comentario que tiene la app
function fijarTotalReacciones(tipo, id, calcular) {
  const detalle = aporteSeleccionado.value
  if (tipo === 'aporte') {
    if (detalle && detalle.id === id) detalle.total_reacciones = calcular(detalle.total_reacciones)
    const enLista = aportesList.value.find(a => a.id === id)
    if (enLista) enLista.total_reacciones = calcular(enLista.total_reacciones)
  } else {
    const comentario = detalle?.comentarios?.find(c => c.id === id)
    if (comentario) comentario.total_reacciones = calcular(comentario.total_reacciones)
  }
}

const reaccionesEnCurso = new Set()

async function handleReaccion({ tipo, id }) {
  const k = `${tipo}:${id}`
  if (reaccionesEnCurso.has(k)) return
  reaccionesEnCurso.add(k)

  // Se muestra el cambio de inmediato y se corrige con la respuesta del servidor
  const previo = yaReaccione(tipo, id)
  marcarReaccion(tipo, id, !previo)
  fijarTotalReacciones(tipo, id, t => Math.max(0, (Number(t) || 0) + (previo ? -1 : 1)))

  try {
    const { reaccionado, total } = await fijarReaccion(tipo, id, !previo)
    marcarReaccion(tipo, id, reaccionado)
    fijarTotalReacciones(tipo, id, () => total)
  } catch (error) {
    marcarReaccion(tipo, id, previo)
    fijarTotalReacciones(tipo, id, t => Math.max(0, (Number(t) || 0) + (previo ? 1 : -1)))
    toast(error.message || 'No se pudo registrar la reacción')
  } finally {
    reaccionesEnCurso.delete(k)
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
    toast(error.message || 'Error al eliminar comentario')
  }
}

async function handleEliminarAporte({ id, clave }) {
  try {
    await deleteAporte(id, clave || '')
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
  if (necesitaCuenta.value) {
    toast('Entra con tu cuenta de aprendiz para publicar')
    currentTab.value = 'cuenta'
    return
  }
  // Con cuenta, el nombre y la ficha del borrador (y de los PDF que se descarguen) son los de la cuenta
  if (autorDesdeCuenta.value) {
    state.aporte.autor = aprendiz.value.nombre
    state.aporte.ficha = aprendiz.value.ficha
  }
  if (!state.aporte.autor.trim()) {
    toast('Por favor escribe tu nombre como autor')
    currentTab.value = 'editor'
    nextTick(() => {
      const f = document.getElementById('f-autor')
      if (f) f.focus()
    })
    return
  }
  if (!state.aporte.pregunta || !state.aporte.pregunta.trim()) {
    state.aporte.pregunta = PREGUNTAS_DEFECTO
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

  // Solo los aportes de antes de las cuentas se editan con clave de autor
  const claveParaGuardar = (state.claveActiva || '').trim()

  publicando.value = true
  const eraEdicion = !!state.aporteIdPublicado
  try {
    const resultado = await saveAporte(state.aporte, state.aporteIdPublicado, claveParaGuardar)
    state.aporteIdPublicado = resultado.id
    lsWrite()
    await cargarForo()
    toast(eraEdicion ? '¡Aporte actualizado exitosamente!' : '¡Aporte publicado en el Foro!')
    currentTab.value = 'foro'
  } catch (error) {
    alert(error.message || 'Error al conectar con la base de datos')
    if (error.datos?.necesitaCuenta) currentTab.value = 'cuenta'
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

onMounted(async () => {
  lsRead()
  window.addEventListener(EVENTO_SESION_VENCIDA, onSesionVencida)
  window.addEventListener(EVENTO_SESION_APRENDIZ_VENCIDA, onSesionAprendizVencida)
  try {
    sessionStorage.removeItem('admin_session') // sesión del sistema anterior
  } catch (e) {
    // Sin almacenamiento disponible
  }
  cargarForo()
  revisarSesionAprendiz()
  // Restaurar la sesión de administrador si el token guardado sigue siendo válido
  isAdmin.value = await verifyAdminSession()
})

// Al entrar o salir cambia cuáles aportes son "míos", así que se recarga el foro
watch(() => aprendiz.value?.documento, (ahora, antes) => {
  if (ahora !== antes) cargarForo()
})

onBeforeUnmount(() => {
  window.removeEventListener(EVENTO_SESION_VENCIDA, onSesionVencida)
  window.removeEventListener(EVENTO_SESION_APRENDIZ_VENCIDA, onSesionAprendizVencida)
})
</script>
