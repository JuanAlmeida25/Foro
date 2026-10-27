<template>
  <div class="eval-layout" :class="{ 'in-exam': estadoExamen === 'en_curso' }">
    <!-- Encabezado independiente de la evaluación (oculto durante el examen activo para máxima concentración) -->
    <header v-if="estadoExamen !== 'en_curso'" class="eval-top">
      <div class="eval-wrap">
        <div class="top-row">
          <div class="brand-group">
            <span class="eval-tag">⚖️ SENA • ADSO | Evaluación Autónoma</span>
            <h1 class="eval-title">Evaluación de <span class="hl">Conocimientos</span></h1>
            <p class="eval-desc">
              Plataforma institucional de valoración técnica en Licenciamiento de Software, Marco Jurídico Colombiano (Ley 23/1982, Código Penal, Ley 1273, Ley 1581) y Ficha Técnica de Software.
            </p>
          </div>
          <div class="top-controls">
            <button
              class="theme-toggle"
              type="button"
              :title="modoOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
              @click="toggleModoOscuro"
            >
              {{ modoOscuro ? '☀️ Modo Claro' : '🌙 Modo Oscuro' }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- CUERPO PRINCIPAL -->
    <main class="eval-wrap eval-content">

      <!-- ================= PANTALLA 1: INICIO DEL EXAMEN ================= -->
      <section v-if="estadoExamen === 'inicio'" class="eval-section">
        <div class="card intro-card">
          <div class="intro-badge">🎓 Instrumento Oficial de Evaluación Técnica</div>
          <h2 class="intro-title">Examen de Competencias: Licenciamiento y Normativa</h2>
          <p class="intro-sub">
            Esta evaluación consta de <strong>20 preguntas de selección múltiple con única respuesta</strong>. Al terminar la prueba podrás consultar inmediatamente tu <strong>calificación final</strong> y el resultado quedará registrado en la ventana del instructor.
          </p>

          <!-- Reglas de Seguridad y Tiempo Límite -->
          <div class="rules-card-box">
            <div class="rules-header">
              <span class="rules-icon">🛡️</span>
              <div>
                <strong>Condiciones Obligatorias de la Evaluación</strong>
                <p>Lee atentamente las normas de integridad antes de iniciar:</p>
              </div>
            </div>
            <ul class="rules-list">
              <li>
                <strong>⏱️ Límite estricto de 1 hora (60:00 minutos):</strong> La evaluación se cerrará y entregará automáticamente al llegar a cero.
              </li>
              <li>
                <strong>🔒 Prohibido cambiar de ventana o pestaña:</strong> Se activará el modo de pantalla completa y la supervisión de foco.
              </li>
              <li>
                <strong>⚠️ Una sola advertencia permitida:</strong> Si sales de la ventana de la evaluación por primera vez, verás una advertencia que te permitirá regresar al formulario. Si lo vuelves a intentar (segundo intento), el examen se cerrará y entregará inmediatamente.
              </li>
              <li>
                <strong>📊 Visualización de nota al terminar:</strong> Al finalizar o entregar la prueba, verás tu calificación sobre 100 puntos y estado de aprobación.
              </li>
            </ul>
          </div>

          <!-- Datos del Aprendiz -->
          <!-- La evaluación queda amarrada a la cuenta: así nadie la presenta con el nombre de otro -->
          <div class="learner-box">
            <h3>Identificación del Aprendiz</h3>
            <template v-if="cuenta">
              <p>Vas a presentar la evaluación con tu cuenta:</p>
              <div class="form-row">
                <div class="form-field">
                  <span class="dato-label">Nombres y Apellidos</span>
                  <span class="dato-cuenta">{{ cuenta.nombre }}</span>
                </div>
                <div class="form-field">
                  <span class="dato-label">Número de Ficha ADSO</span>
                  <span class="dato-cuenta">{{ cuenta.ficha || 'Sin ficha' }}</span>
                </div>
              </div>
              <p class="no-soy">¿No eres tú? <button class="link-btn" type="button" @click="salirAprendiz">Salir de esta cuenta</button></p>
            </template>
            <template v-else>
              <p>Entra con tu documento y el PIN de tu cuenta del foro. Si no tienes cuenta, créala en <a href="/">el foro → 👤 Mi cuenta</a>.</p>
              <form class="form-row" @submit.prevent="entrarConCuenta">
                <div class="form-field">
                  <label for="doc-aprendiz">Número de documento:</label>
                  <input
                    id="doc-aprendiz"
                    v-model="documentoLogin"
                    type="text"
                    inputmode="numeric"
                    autocomplete="username"
                    placeholder="Solo números"
                  />
                </div>
                <div class="form-field">
                  <label for="pin-aprendiz">PIN:</label>
                  <input
                    id="pin-aprendiz"
                    v-model="pinLogin"
                    type="password"
                    inputmode="numeric"
                    maxlength="4"
                    autocomplete="current-password"
                    placeholder="••••"
                  />
                </div>
                <button class="btn-primary-lg entrar-btn" type="submit" :disabled="entrando">
                  {{ entrando ? 'Entrando…' : '🔑 Entrar' }}
                </button>
              </form>
            </template>
            <p v-if="errorCuenta" class="error-cuenta" role="alert">⚠️ {{ errorCuenta }}</p>
          </div>

          <div class="intro-actions">
            <button class="btn-primary-lg" type="button" :disabled="!cuenta" @click="iniciarExamen">
              🚀 Iniciar Evaluación (1 Hora • Pantalla Completa)
            </button>
          </div>
        </div>
      </section>

      <!-- ================= PANTALLA 2: EXAMEN EN CURSO ================= -->
      <section v-else-if="estadoExamen === 'en_curso'" class="eval-section" @contextmenu.prevent>
        <div class="exam-active-layout">
          <!-- Barra flotante de progreso, tiempo límite de 1 hora y estado de seguridad -->
          <div class="exam-progress-bar-card">
            <div class="progress-info">
              <div class="progress-left-info">
                <span class="progress-step">Pregunta {{ indiceActual + 1 }} de {{ preguntasExamen.length }}</span>
                <span class="progress-answered">{{ totalRespondidas }} de {{ preguntasExamen.length }} respondidas</span>
              </div>

              <!-- Indicador de Tiempo Límite de 1 hora -->
              <div
                class="progress-timer-box"
                :class="{
                  'timer-warning': tiempoRestanteSegundos <= 300 && tiempoRestanteSegundos > 60,
                  'timer-danger': tiempoRestanteSegundos <= 60
                }"
              >
                <span class="timer-icon">⏱️</span>
                <div class="timer-details">
                  <span class="timer-label">Límite 1 hora:</span>
                  <span class="timer-value">{{ textoTiempoRestante }}</span>
                </div>
              </div>

              <!-- Indicador de Seguridad Anti-cambio de ventana -->
              <div class="security-status-badge" :class="{ 'has-warnings': infracciones > 0 }">
                <span class="security-dot"></span>
                <span v-if="infracciones === 0">Bloqueo de ventana activo (máx. 1 advertencia)</span>
                <span v-else>⚠️ 1 advertencia consumida (si vuelves a salir se cierra)</span>
              </div>
            </div>

            <div class="progress-track">
              <div
                class="progress-fill"
                :style="{ width: ((totalRespondidas / preguntasExamen.length) * 100) + '%' }"
              ></div>
            </div>
          </div>

          <div class="exam-main-cols">
            <!-- Columna Pregunta Actual -->
            <div class="exam-question-column">
              <div class="card question-card">
                <div class="question-header">
                  <span class="cat-pill">
                    {{ categoriaActual?.icono }} {{ categoriaActual?.nombre }}
                  </span>
                  <span class="diff-pill" :data-diff="preguntaActual.dificultad">
                    Nivel: {{ preguntaActual.dificultad }}
                  </span>
                  <button
                    :class="['flag-btn', { flagged: marcadasParaRevision.has(preguntaActual.id) }]"
                    type="button"
                    :title="marcadasParaRevision.has(preguntaActual.id) ? 'Desmarcar pregunta' : 'Marcar para revisar luego'"
                    @click="toggleMarcarRevision(preguntaActual.id)"
                  >
                    {{ marcadasParaRevision.has(preguntaActual.id) ? '🚩 Marcada' : '🏳️ Marcar' }}
                  </button>
                </div>

                <h3 class="question-title">{{ preguntaActual.enunciado }}</h3>

                <!-- Lista de Opciones -->
                <div class="options-list" role="radiogroup" :aria-label="preguntaActual.enunciado">
                  <button
                    v-for="(opcion, opcIdx) in preguntaActual.opciones"
                    :key="opcion.id"
                    :class="[
                      'option-btn',
                      { selected: respuestasExamen[preguntaActual.id] === opcion.id }
                    ]"
                    type="button"
                    role="radio"
                    :aria-checked="respuestasExamen[preguntaActual.id] === opcion.id"
                    @click="seleccionarOpcion(preguntaActual.id, opcion.id)"
                  >
                    <span class="option-letter">{{ ['A', 'B', 'C', 'D'][opcIdx] }}</span>
                    <span class="option-text">{{ opcion.texto }}</span>
                  </button>
                </div>

                <!-- Barra de Navegación entre preguntas -->
                <div class="question-nav-actions">
                  <button
                    class="btn-nav"
                    type="button"
                    :disabled="indiceActual === 0"
                    @click="indiceActual--"
                  >
                    ← Anterior
                  </button>

                  <div class="nav-middle-status">
                    <span v-if="respuestasExamen[preguntaActual.id]" class="answered-badge">
                      ✓ Respondida
                    </span>
                    <span v-else class="unanswered-badge">
                      Sin responder
                    </span>
                  </div>

                  <button
                    v-if="indiceActual < preguntasExamen.length - 1"
                    class="btn-nav primary"
                    type="button"
                    @click="indiceActual++"
                  >
                    Siguiente →
                  </button>
                  <button
                    v-else
                    class="btn-finish"
                    type="button"
                    @click="solicitarFinalizacion"
                  >
                    🏁 Finalizar y Entregar
                  </button>
                </div>
              </div>
            </div>

            <!-- Columna Lateral: Mapa de Preguntas 1 a 20 -->
            <aside class="exam-sidebar-column">
              <div class="card sidebar-card">
                <h4 class="sidebar-title">Mapa de Preguntas</h4>
                <div class="nav-grid">
                  <button
                    v-for="(p, idx) in preguntasExamen"
                    :key="p.id"
                    :class="[
                      'grid-btn',
                      {
                        active: idx === indiceActual,
                        answered: Boolean(respuestasExamen[p.id]),
                        flagged: marcadasParaRevision.has(p.id)
                      }
                    ]"
                    type="button"
                    :title="'Ir a pregunta ' + (idx + 1)"
                    @click="indiceActual = idx"
                  >
                    {{ idx + 1 }}
                    <span v-if="marcadasParaRevision.has(p.id)" class="grid-flag">🚩</span>
                  </button>
                </div>

                <div class="nav-legend">
                  <div class="legend-item"><span class="legend-dot answered"></span> Respondida</div>
                  <div class="legend-item"><span class="legend-dot unanswered"></span> Sin responder</div>
                  <div class="legend-item"><span class="legend-dot flagged"></span> Marcada para revisión</div>
                </div>

                <div class="sidebar-finish-box">
                  <button class="btn-finish-sidebar" type="button" @click="solicitarFinalizacion">
                    Entregar Examen
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <!-- ================= PANTALLA 3: RESULTADOS Y NOTA DEL APRENDIZ ================= -->
      <section v-else-if="estadoExamen === 'resultado'" class="eval-section">
        <div class="results-layout">
          
          <div v-if="errorEnvio" class="submitted-notice-banner danger" role="alert">
            📡 <strong>Tu evaluación no llegó al servidor:</strong> {{ errorEnvio }} Avísale al instructor ya mismo;
            quedó una copia guardada en este navegador.
          </div>

          <!-- Banner si se cerró por tiempo o por segundo intento de cambio de ventana -->
          <div v-if="motivoFinalizacion === 'tiempo_agotado'" class="submitted-notice-banner warning">
            ⏰ <strong>Tiempo límite de 1 hora alcanzado:</strong> La prueba se cerró y entregó automáticamente al completarse el tiempo reglamentario.
          </div>
          <div v-else-if="motivoFinalizacion === 'infracciones_excedidas'" class="submitted-notice-banner danger">
            🚫 <strong>Cierre por seguridad:</strong> Se detectó un segundo intento de salir de la ventana. El examen se cerró automáticamente conforme al protocolo de evaluación.
          </div>

          <!-- Tarjeta Principal con la NOTA del Aprendiz -->
          <div class="card result-score-card" :data-status="resultadoCalculado?.aprobado ? 'ok' : 'bad'">
            <div class="result-score-circle">
              <span class="score-number">{{ resultadoCalculado?.porcentaje ?? 0 }}</span>
              <span class="score-unit">/ 100 pts</span>
            </div>

            <div class="result-hero-text">
              <div class="result-status-pill" :data-status="resultadoCalculado?.aprobado ? 'ok' : 'bad'">
                {{ resultadoCalculado?.aprobado ? '🏆 APROBADO • COMPETENTE' : '⚠️ NO APROBADO' }}
              </div>
              <h2 class="result-hero-title">{{ dictamenHero.titulo }}</h2>
              <p class="result-hero-desc">{{ dictamenHero.resumen }}</p>

              <div class="result-meta-row">
                <span>👤 Aprendiz: <strong>{{ aprendiz.nombre || 'Aprendiz ADSO' }}</strong></span>
                <span>📋 Ficha: <strong>{{ aprendiz.ficha || 'No especificada' }}</strong></span>
                <span>🎯 Aciertos: <strong>{{ resultadoCalculado?.aciertos ?? 0 }} de {{ resultadoCalculado?.total ?? 20 }} preguntas</strong></span>
                <span>⏱️ Tiempo Empleado: <strong>{{ tiempoEmpleadoFormateado }}</strong></span>
              </div>
            </div>
          </div>

          <!-- Aviso de registro en la ventana del instructor -->
          <div class="restricted-info-box">
            <div class="restricted-header">
              <span class="restricted-icon">👨‍🏫</span>
              <div>
                <strong>Registro Confirmado en la Ventana del Instructor</strong>
                <p>
                  Tu calificación final de <strong>{{ resultadoCalculado?.porcentaje }} puntos</strong> ha sido enviada y registrada con éxito en el <strong>Panel del Instructor</strong> junto con la auditoría de tiempo y advertencias.
                </p>
              </div>
            </div>
          </div>

          <div class="submitted-actions">
            <button class="btn-return-home" type="button" @click="estadoExamen = 'inicio'">
              Volver al Inicio de Evaluación
            </button>
          </div>
        </div>
      </section>

    </main>

    <!-- MODAL DE BLOQUEO POR CAMBIO DE VENTANA (UNA SOLA ADVERTENCIA QUE PERMITE REGRESAR) -->
    <div v-if="modalInfraccionActivo" class="security-lock-overlay" role="alertdialog" aria-modal="true">
      <div class="security-lock-card">
        <div class="security-lock-icon">⚠️</div>
        <h3 class="security-lock-title">¡ÚNICA ADVERTENCIA DE SEGURIDAD!</h3>
        <div class="security-strike-badge">
          Advertencia 1 de 1 (Única oportunidad)
        </div>
        <p class="security-lock-msg">
          Se detectó que <strong>saliste de la ventana de la evaluación o cambiaste de pestaña</strong>.
        </p>
        <p class="security-lock-sub">
          Esta es tu <strong>única advertencia</strong> permitida. Puedes pulsar el botón inferior para <strong>regresar al formulario</strong> y continuar. 
          <br><br>
          <strong style="color: var(--bad);">Si vuelves a intentar salir de la ventana, el examen se cerrará inmediatamente y se entregará de forma automática.</strong>
        </p>
        <button class="btn-resume-fullscreen" type="button" @click="reanudarDesdeInfraccion">
          ↩️ Regresar al Formulario (Reanudar Examen)
        </button>
      </div>
    </div>

    <!-- MODAL DE CONFIRMACIÓN DE ENTREGA VOLUNTARIA -->
    <div v-if="mostrarModalEntrega" class="modal-overlay">
      <div class="card modal-card" role="dialog" aria-modal="true">
        <h3 class="modal-title">¿Deseas entregar y calificar la evaluación?</h3>
        
        <div v-if="preguntasSinResponderCount > 0" class="modal-warning-box">
          ⚠️ Tienes <strong>{{ preguntasSinResponderCount }}</strong> pregunta(s) sin responder de 20. Las preguntas no respondidas contarán como incorrectas al calificar.
        </div>
        <div v-else class="modal-success-box">
          ✓ Has respondido las 20 preguntas del examen.
        </div>

        <p style="font-size: 13px; color: var(--muted); margin-bottom: 20px;">
          Al confirmar, podrás ver tu nota final en pantalla y tus resultados se remitirán al panel del instructor.
        </p>

        <div class="modal-actions">
          <button class="btn-modal-cancel" type="button" @click="mostrarModalEntrega = false">
            Continuar Revisando
          </button>
          <button class="btn-modal-confirm" type="button" @click="confirmarEntrega('entrega_manual')">
            Sí, Entregar y Ver Nota
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  CATEGORIAS_EVALUACION,
  PREGUNTAS_EVALUACION
} from '../data/evaluacion.js'
import {
  prepararEvaluacion,
  calificarEvaluacion,
  mensajeDictamen,
  formatearCuentaRegresiva,
  DURACION_EXAMEN_SEGUNDOS,
  MAX_INFRACCIONES_CAMBIO_VENTANA
} from '../utils/evaluacion.js'
import { enviarEvaluacionAlServidor } from '../services/api.js'
import { aprendiz as cuenta, entrarAprendiz, salirAprendiz, revisarSesionAprendiz } from '../services/sesionAprendiz.js'

// Modo Oscuro
const modoOscuro = ref(false)
function toggleModoOscuro() {
  modoOscuro.value = !modoOscuro.value
  if (modoOscuro.value) {
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
}

// Datos del Aprendiz
const aprendiz = ref({
  nombre: '',
  ficha: ''
})

// Estado del Examen
const estadoExamen = ref('inicio') // 'inicio' | 'en_curso' | 'resultado'
const preguntasExamen = ref([])
const respuestasExamen = ref({})
const marcadasParaRevision = ref(new Set())
const indiceActual = ref(0)
const fechaEntrega = ref(null)
const resultadoCalculado = ref(null)
const dictamenHero = ref({})

// Límite de Tiempo: 1 Hora (3600 segundos)
const tiempoRestanteSegundos = ref(DURACION_EXAMEN_SEGUNDOS)
let timerId = null
const motivoFinalizacion = ref('')

// Seguridad Anti-cambio de ventana: 1 advertencia; al segundo intento cierra el examen
const infracciones = ref(0)
const modalInfraccionActivo = ref(false)
const mostrarModalEntrega = ref(false)

/* ----- Cuenta del aprendiz ----- */
const documentoLogin = ref('')
const pinLogin = ref('')
const entrando = ref(false)
const errorCuenta = ref('')
const errorEnvio = ref('')

async function entrarConCuenta() {
  errorCuenta.value = ''
  entrando.value = true
  try {
    await entrarAprendiz(documentoLogin.value.replace(/\D/g, ''), pinLogin.value.trim())
    documentoLogin.value = ''
  } catch (e) {
    errorCuenta.value = e.message
  } finally {
    pinLogin.value = ''
    entrando.value = false
  }
}

onMounted(() => {
  // Si le reiniciaron el PIN o se le venció la sesión, que lo sepa antes de empezar y no al entregar
  revisarSesionAprendiz()
  try {
    const guardado = localStorage.getItem('foro-aprendiz-identificacion')
    if (guardado) {
      const p = JSON.parse(guardado)
      aprendiz.value.nombre = p.nombre || ''
      aprendiz.value.ficha = p.ficha || ''
    }
  } catch (e) {}

  document.addEventListener('visibilitychange', manejarCambioVisibilidad)
  window.addEventListener('blur', manejarPerdidaFoco)
  window.addEventListener('beforeunload', manejarSalidaPagina)
  document.addEventListener('fullscreenchange', manejarCambioPantallaCompleta)
})

onUnmounted(() => {
  limpiarTemporizadoresYEventos()
})

function limpiarTemporizadoresYEventos() {
  if (timerId) {
    clearInterval(timerId)
    timerId = null
  }
  document.removeEventListener('visibilitychange', manejarCambioVisibilidad)
  window.removeEventListener('blur', manejarPerdidaFoco)
  window.removeEventListener('beforeunload', manejarSalidaPagina)
  document.removeEventListener('fullscreenchange', manejarCambioPantallaCompleta)
}

function iniciarExamen() {
  if (!cuenta.value) {
    errorCuenta.value = 'Primero entra con tu cuenta.'
    return
  }
  // El nombre y la ficha son los de la cuenta; el servidor igual los saca de ella
  aprendiz.value.nombre = cuenta.value.nombre
  aprendiz.value.ficha = cuenta.value.ficha
  try {
    localStorage.setItem('foro-aprendiz-identificacion', JSON.stringify({
      nombre: aprendiz.value.nombre,
      ficha: aprendiz.value.ficha
    }))
  } catch (e) {}

  preguntasExamen.value = prepararEvaluacion(PREGUNTAS_EVALUACION, false)
  respuestasExamen.value = {}
  marcadasParaRevision.value = new Set()
  indiceActual.value = 0
  tiempoRestanteSegundos.value = DURACION_EXAMEN_SEGUNDOS
  infracciones.value = 0
  modalInfraccionActivo.value = false
  motivoFinalizacion.value = ''
  resultadoCalculado.value = null
  estadoExamen.value = 'en_curso'

  solicitarPantallaCompleta()

  if (timerId) clearInterval(timerId)
  timerId = setInterval(() => {
    tiempoRestanteSegundos.value--
    if (tiempoRestanteSegundos.value <= 0) {
      tiempoRestanteSegundos.value = 0
      clearInterval(timerId)
      timerId = null
      confirmarEntrega('tiempo_agotado')
    }
  }, 1000)
}

function solicitarPantallaCompleta() {
  try {
    const elem = document.documentElement
    if (elem.requestFullscreen && !document.fullscreenElement) {
      elem.requestFullscreen().catch(() => {})
    }
  } catch (e) {}
}

function salirPantallaCompleta() {
  try {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {})
    }
  } catch (e) {}
}

function registrarInfraccion(tipo) {
  if (estadoExamen.value !== 'en_curso') return

  infracciones.value++
  if (infracciones.value > 1) {
    // Si lo vuelve a intentar (2do intento): se cierra el examen automáticamente
    modalInfraccionActivo.value = false
    confirmarEntrega('infracciones_excedidas')
  } else {
    // 1er intento: la advertencia aparece una sola vez y le permite regresar al formulario
    modalInfraccionActivo.value = true
  }
}

function manejarCambioVisibilidad() {
  if (estadoExamen.value === 'en_curso' && document.visibilityState === 'hidden') {
    registrarInfraccion('cambio_pestana')
  }
}

function manejarPerdidaFoco() {
  if (estadoExamen.value === 'en_curso') {
    registrarInfraccion('perdida_foco')
  }
}

function manejarCambioPantallaCompleta() {
  if (estadoExamen.value === 'en_curso' && !document.fullscreenElement) {
    registrarInfraccion('salida_fullscreen')
  }
}

function manejarSalidaPagina(e) {
  if (estadoExamen.value === 'en_curso') {
    e.preventDefault()
    e.returnValue = 'La evaluación está en curso. Si recargas o sales se considerará abandono de la prueba.'
    return e.returnValue
  }
}

function reanudarDesdeInfraccion() {
  modalInfraccionActivo.value = false
  solicitarPantallaCompleta()
}

const textoTiempoRestante = computed(() => {
  return formatearCuentaRegresiva(tiempoRestanteSegundos.value)
})

const tiempoEmpleadoFormateado = computed(() => {
  const empleado = DURACION_EXAMEN_SEGUNDOS - tiempoRestanteSegundos.value
  return formatearCuentaRegresiva(empleado)
})

const preguntaActual = computed(() => {
  return preguntasExamen.value[indiceActual.value] || {}
})

const categoriaActual = computed(() => {
  if (!preguntaActual.value.categoria) return null
  return CATEGORIAS_EVALUACION.find(c => c.id === preguntaActual.value.categoria)
})

const totalRespondidas = computed(() => {
  return Object.keys(respuestasExamen.value).length
})

const preguntasSinResponderCount = computed(() => {
  return preguntasExamen.value.length - totalRespondidas.value
})

function seleccionarOpcion(preguntaId, opcionId) {
  respuestasExamen.value = {
    ...respuestasExamen.value,
    [preguntaId]: opcionId
  }
}

function toggleMarcarRevision(preguntaId) {
  const conjunto = new Set(marcadasParaRevision.value)
  if (conjunto.has(preguntaId)) {
    conjunto.delete(preguntaId)
  } else {
    conjunto.add(preguntaId)
  }
  marcadasParaRevision.value = conjunto
}

function solicitarFinalizacion() {
  mostrarModalEntrega.value = true
}

async function confirmarEntrega(motivo = 'entrega_manual') {
  mostrarModalEntrega.value = false
  modalInfraccionActivo.value = false
  motivoFinalizacion.value = motivo
  fechaEntrega.value = new Date().toISOString()

  if (timerId) {
    clearInterval(timerId)
    timerId = null
  }

  salirPantallaCompleta()

  // Calcular la nota para el aprendiz y para el instructor
  resultadoCalculado.value = calificarEvaluacion(preguntasExamen.value, respuestasExamen.value)
  dictamenHero.value = mensajeDictamen(resultadoCalculado.value.porcentaje)
  const tiempoEmpleado = DURACION_EXAMEN_SEGUNDOS - tiempoRestanteSegundos.value

  const payloadEvaluacion = {
    aprendiz: (aprendiz.value.nombre || 'Aprendiz ADSO').trim(),
    ficha: (aprendiz.value.ficha || '').trim(),
    aciertos: resultadoCalculado.value.aciertos,
    total: resultadoCalculado.value.total,
    porcentaje: resultadoCalculado.value.porcentaje,
    aprobado: resultadoCalculado.value.aprobado ? 1 : 0,
    tiempo_empleado: tiempoEmpleado,
    infracciones: infracciones.value,
    motivo_finalizacion: motivo,
    detalle_json: JSON.stringify(resultadoCalculado.value.detallePreguntas)
  }

  // 1. Enviar al servidor para que el instructor vea la evaluación
  errorEnvio.value = ''
  try {
    await enviarEvaluacionAlServidor(payloadEvaluacion)
  } catch (err) {
    console.warn('No se pudo enviar la evaluación a la API de inmediato:', err)
    errorEnvio.value = err.message || 'Error de conexión.'
  }

  // 2. Guardar también en localStorage como respaldo para el instructor
  try {
    const LS_INSTRUCTOR = 'foro-evaluaciones-instructor-v1'
    const prev = JSON.parse(localStorage.getItem(LS_INSTRUCTOR) || '[]')
    prev.unshift({
      id: 'eval-' + Date.now(),
      created_at: fechaEntrega.value,
      ...payloadEvaluacion
    })
    localStorage.setItem(LS_INSTRUCTOR, JSON.stringify(prev.slice(0, 50)))
  } catch (e) {}

  estadoExamen.value = 'resultado'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
.eval-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.eval-layout.in-exam {
  user-select: none;
  -webkit-user-select: none;
}

.eval-wrap {
  max-width: 1180px;
  margin: 0 auto;
  padding-inline: 20px;
  width: 100%;
}

.eval-top {
  background: var(--surface);
  border-bottom: 1px solid var(--line);
  padding: 24px 0;
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
}

.eval-tag {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent);
  background: var(--accent-soft);
  padding: 4px 10px;
  border-radius: 99px;
  margin-bottom: 10px;
}

.eval-title {
  margin: 0 0 8px;
  font-family: var(--f-display);
  font-size: clamp(24px, 4vw, 34px);
  font-weight: 700;
  color: var(--fg);
}

.eval-title .hl {
  color: var(--accent);
}

.eval-desc {
  margin: 0;
  max-width: 820px;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.5;
}

.theme-toggle {
  background: var(--sunk);
  color: var(--fg);
  border: 1px solid var(--line);
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.15s ease;
}

.theme-toggle:hover {
  background: var(--surface);
  border-color: var(--accent);
}

.eval-content {
  padding-block: 28px 60px;
  flex: 1;
}

.card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r);
  box-shadow: var(--shadow);
  padding: 28px;
}

/* REGLAS OBLIGATORIAS */
.rules-card-box {
  background: rgba(79, 70, 229, 0.05);
  border: 1px solid rgba(79, 70, 229, 0.2);
  border-radius: 12px;
  padding: 18px 20px;
  margin-bottom: 24px;
}

.rules-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.rules-icon { font-size: 24px; }
.rules-header strong { font-size: 15px; color: var(--fg); display: block; }
.rules-header p { margin: 2px 0 0; font-size: 13px; color: var(--muted); }

.rules-list {
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13.5px;
  color: var(--fg);
}

/* INTRO */
.intro-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  color: var(--accent-2);
  text-transform: uppercase;
  margin-bottom: 8px;
}

.intro-title {
  margin: 0 0 12px;
  font-family: var(--f-display);
  font-size: 26px;
  color: var(--fg);
}

.intro-sub {
  margin: 0 0 24px;
  font-size: 15px;
  color: var(--muted);
  line-height: 1.6;
}

.dato-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
}

.dato-cuenta {
  font-weight: 700;
  font-size: 16px;
}

.no-soy {
  margin-top: 10px;
  font-size: 14px;
}

.link-btn {
  background: none;
  border: none;
  padding: 0;
  color: var(--accent);
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
}

.entrar-btn {
  align-self: end;
}

.error-cuenta {
  color: var(--bad);
  font-weight: 600;
  margin-top: 10px;
}

.learner-box {
  background: var(--sunk);
  border: 1px dashed var(--line);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 28px;
}

.learner-box h3 {
  margin: 0 0 6px;
  font-size: 16px;
  color: var(--fg);
}

.learner-box p {
  margin: 0 0 16px;
  font-size: 13.5px;
  color: var(--muted);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  font-size: 13px;
  font-weight: 600;
  color: var(--fg);
}

.form-field input {
  padding: 10px 14px;
  font-size: 14px;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--fg);
  outline: none;
  transition: border-color 0.15s;
}

.form-field input:focus {
  border-color: var(--accent);
}

.intro-actions {
  display: flex;
  justify-content: center;
}

.btn-primary-lg {
  background: var(--accent);
  color: #ffffff;
  border: none;
  font-size: 16px;
  font-weight: 700;
  padding: 14px 32px;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
  transition: all 0.2s ease;
}

.btn-primary-lg:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
}

/* EXAMEN EN CURSO */
.exam-progress-bar-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
  box-shadow: var(--shadow);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--fg);
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 12px;
}

.progress-left-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.progress-timer-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--sunk);
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid var(--line);
}

.progress-timer-box.timer-warning {
  background: #FFFBEB;
  border-color: #F59E0B;
  color: #B45309;
}

.progress-timer-box.timer-danger {
  background: #FEF2F2;
  border-color: #EF4444;
  color: #B91C1C;
  animation: pulse-danger 1s infinite alternate;
}

@keyframes pulse-danger {
  from { opacity: 1; }
  to { opacity: 0.7; }
}

.timer-details {
  display: flex;
  flex-direction: column;
}

.timer-label {
  font-size: 10.5px;
  color: var(--muted);
  text-transform: uppercase;
  font-weight: 700;
}

.timer-value {
  font-family: var(--f-mono);
  font-size: 16px;
  font-weight: 800;
}

.security-status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--muted);
  background: var(--sunk);
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--line);
}

.security-status-badge.has-warnings {
  color: #B45309;
  border-color: #F59E0B;
  background: #FFFBEB;
  font-weight: 700;
}

.security-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ok);
}

.has-warnings .security-dot {
  background: #F59E0B;
}

.progress-track {
  height: 8px;
  background: var(--sunk);
  border-radius: 99px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  transition: width 0.3s ease;
}

.exam-main-cols {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
}

@media (max-width: 860px) {
  .exam-main-cols {
    grid-template-columns: 1fr;
  }
}

.question-card {
  display: flex;
  flex-direction: column;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.cat-pill {
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 99px;
}

.diff-pill {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  background: var(--sunk);
  color: var(--muted);
}

.flag-btn {
  margin-left: auto;
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 6px;
  font-size: 12px;
  padding: 4px 10px;
  cursor: pointer;
  color: var(--muted);
  transition: all 0.15s;
}

.flag-btn.flagged {
  background: #FFFBEB;
  border-color: #F59E0B;
  color: #B45309;
  font-weight: 700;
}

.question-title {
  margin: 0 0 20px;
  font-size: 18px;
  font-family: var(--f-display);
  color: var(--fg);
  line-height: 1.45;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.option-btn {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--fg);
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 14.5px;
  line-height: 1.4;
}

.option-btn:hover {
  background: var(--sunk);
  border-color: var(--accent);
}

.option-btn.selected {
  background: var(--accent-soft);
  border-color: var(--accent);
  color: var(--accent);
  font-weight: 600;
}

.option-letter {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: var(--sunk);
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
}

.option-btn.selected .option-letter {
  background: var(--accent);
  color: #fff;
}

.question-nav-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 18px;
  border-top: 1px solid var(--line);
  gap: 12px;
}

.btn-nav {
  padding: 9px 18px;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--fg);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-nav:hover:not(:disabled) {
  border-color: var(--accent);
}

.btn-nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-nav.primary {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.btn-finish {
  background: var(--ok);
  color: #fff;
  border: none;
  font-size: 14px;
  font-weight: 700;
  padding: 9px 18px;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(19, 138, 85, 0.3);
}

.answered-badge {
  font-size: 12px;
  color: var(--ok);
  font-weight: 600;
}

.unanswered-badge {
  font-size: 12px;
  color: var(--muted);
}

/* SIDEBAR NAV */
.sidebar-title {
  margin: 0 0 14px;
  font-size: 15px;
  color: var(--fg);
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-bottom: 18px;
}

.grid-btn {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  color: var(--muted);
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  position: relative;
  transition: all 0.15s;
}

.grid-btn.answered {
  background: var(--sunk);
  color: var(--fg);
  border-color: var(--line);
}

.grid-btn.active {
  border-color: var(--accent);
  outline: 2px solid var(--accent);
  color: var(--accent);
}

.grid-btn.flagged {
  border-color: #F59E0B;
}

.grid-flag {
  position: absolute;
  top: 1px;
  right: 1px;
  font-size: 9px;
}

.nav-legend {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  color: var(--muted);
  border-top: 1px solid var(--line);
  padding-top: 12px;
  margin-bottom: 18px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  border: 1px solid var(--line);
}

.legend-dot.answered { background: var(--sunk); }
.legend-dot.unanswered { background: var(--surface); }
.legend-dot.flagged { background: #FEF3C7; border-color: #F59E0B; }

.btn-finish-sidebar {
  width: 100%;
  background: var(--ok);
  color: #fff;
  border: none;
  font-size: 14px;
  font-weight: 700;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
}

/* PANTALLA DE RESULTADOS CON NOTA DEL APRENDIZ */
.results-layout {
  max-width: 820px;
  margin: 0 auto;
}

.submitted-notice-banner {
  padding: 14px 18px;
  border-radius: 10px;
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 1.45;
}

.submitted-notice-banner.warning {
  background: #FFFBEB;
  border: 1px solid #FCD34D;
  color: #92400E;
}

.submitted-notice-banner.danger {
  background: #FEF2F2;
  border: 1px solid #FCA5A5;
  color: #991B1B;
}

.result-score-card {
  display: flex;
  align-items: center;
  gap: 32px;
  margin-bottom: 24px;
}

@media (max-width: 680px) {
  .result-score-card {
    flex-direction: column;
    text-align: center;
  }
}

.result-score-circle {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  border: 6px solid var(--accent);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--surface);
}

.result-score-card[data-status="ok"] .result-score-circle {
  border-color: var(--ok);
}

.result-score-card[data-status="bad"] .result-score-circle {
  border-color: var(--bad);
}

.score-number {
  font-family: var(--f-display);
  font-size: 38px;
  font-weight: 800;
  line-height: 1;
  color: var(--fg);
}

.score-unit {
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
}

.result-status-pill {
  display: inline-block;
  font-size: 12px;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 99px;
  margin-bottom: 8px;
}

.result-status-pill[data-status="ok"] {
  background: rgba(19, 138, 85, 0.12);
  color: var(--ok);
}

.result-status-pill[data-status="bad"] {
  background: rgba(194, 38, 63, 0.12);
  color: var(--bad);
}

.result-hero-title {
  margin: 0 0 8px;
  font-family: var(--f-display);
  font-size: 22px;
  color: var(--fg);
}

.result-hero-desc {
  margin: 0 0 14px;
  color: var(--muted);
  font-size: 14.5px;
  line-height: 1.5;
}

.result-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 13px;
  color: var(--fg);
  border-top: 1px solid var(--line);
  padding-top: 12px;
}

.restricted-info-box {
  background: rgba(79, 70, 229, 0.06);
  border: 1px solid rgba(79, 70, 229, 0.2);
  border-radius: 12px;
  padding: 16px 20px;
  text-align: left;
  margin-bottom: 28px;
}

.restricted-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.restricted-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.restricted-header strong {
  display: block;
  font-size: 14.5px;
  color: var(--fg);
  margin-bottom: 4px;
}

.restricted-header p {
  margin: 0;
  font-size: 13px;
  color: var(--muted);
  line-height: 1.5;
}

.submitted-actions {
  display: flex;
  justify-content: center;
}

.btn-return-home {
  background: var(--accent);
  border: none;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  padding: 12px 28px;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(79, 70, 229, 0.3);
  transition: all 0.15s;
}

.btn-return-home:hover {
  transform: translateY(-1px);
}

/* BLOQUEO POR CAMBIO DE VENTANA (UNA SOLA ADVERTENCIA) */
.security-lock-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
  z-index: 99999;
  padding: 24px;
}

.security-lock-card {
  max-width: 520px;
  width: 100%;
  background: var(--surface);
  border: 2px solid #F59E0B;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  animation: shake-danger 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake-danger {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

.security-lock-icon {
  font-size: 56px;
  margin-bottom: 12px;
}

.security-lock-title {
  margin: 0 0 10px;
  font-family: var(--f-display);
  font-size: 24px;
  color: #B45309;
}

.security-strike-badge {
  display: inline-block;
  background: #FFFBEB;
  color: #B45309;
  border: 1px solid #F59E0B;
  font-weight: 800;
  font-size: 13px;
  padding: 4px 14px;
  border-radius: 99px;
  margin-bottom: 16px;
}

.security-lock-msg {
  font-size: 16px;
  font-weight: 600;
  color: var(--fg);
  margin: 0 0 12px;
  line-height: 1.4;
}

.security-lock-sub {
  font-size: 13.5px;
  color: var(--muted);
  margin: 0 0 24px;
  line-height: 1.5;
}

.btn-resume-fullscreen {
  background: #D97706;
  color: #fff;
  border: none;
  font-size: 15px;
  font-weight: 700;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(217, 119, 6, 0.4);
  transition: all 0.15s;
}

.btn-resume-fullscreen:hover {
  transform: translateY(-1px);
}

/* MODAL CONFIRMACIÓN */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 14, 26, 0.7);
  display: grid;
  place-items: center;
  z-index: 999;
  padding: 20px;
}

.modal-card {
  max-width: 480px;
  width: 100%;
  background: var(--surface);
  box-shadow: var(--shadow-lg);
}

.modal-title {
  margin: 0 0 14px;
  font-size: 18px;
  color: var(--fg);
}

.modal-warning-box {
  background: #FFFBEB;
  border: 1px solid #FCD34D;
  color: #92400E;
  padding: 12px;
  border-radius: 8px;
  font-size: 13.5px;
  margin-bottom: 14px;
}

.modal-success-box {
  background: rgba(19, 138, 85, 0.1);
  border: 1px solid var(--ok);
  color: var(--ok);
  padding: 12px;
  border-radius: 8px;
  font-size: 13.5px;
  margin-bottom: 14px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-modal-cancel {
  background: var(--surface);
  border: 1px solid var(--line);
  color: var(--fg);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13.5px;
  cursor: pointer;
}

.btn-modal-confirm {
  background: var(--ok);
  border: none;
  color: #fff;
  padding: 8px 18px;
  border-radius: 6px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
}
</style>
