<template>
  <div class="detail-view">
    <div class="detail-header">
      <button class="back-btn" type="button" @click="$emit('volver')">
        ← Volver al listado de aportes
      </button>

      <div class="actions">
        <button class="btn sm" type="button" @click="copiarTextoAporte">
          Copiar aporte
        </button>

        <!-- Botones de Administrador -->
        <template v-if="isAdmin">
          <button
            class="btn primary sm"
            type="button"
            @click="abrirModalCalificar"
          >
            ⭐ {{ aporte.calificacion !== null && aporte.calificacion !== undefined ? 'Modificar Calificación' : 'Calificar Aporte' }}
          </button>
          <button
            class="btn sm"
            type="button"
            @click="$emit('fijar-juicio', { aporteId: aporte.id, abierto: !aporte.juicio })"
          >
            ⚖️ {{ aporte.juicio ? 'Archivar juicio' : 'Abrir juicio' }}
          </button>
          <button
            v-if="aporte.juicio"
            class="btn sm"
            type="button"
            @click="abrirModalSentencia"
          >
            🔨 {{ aporte.juicio.veredicto ? 'Corregir sentencia' : 'Dictar sentencia' }}
          </button>
          <button
            class="btn sm"
            type="button"
            @click="$emit('iniciar-edicion', { aporte, clave: '' })"
          >
            ✏️ Editar (Admin)
          </button>
          <button
            class="btn ghost sm danger"
            type="button"
            @click="confirmarEliminarAdmin"
          >
            🗑️ Eliminar (Admin)
          </button>
        </template>

        <!-- Botones del dueño con cuenta: su sesión basta, sin clave -->
        <template v-else-if="aporte.es_mio">
          <button
            class="btn sm"
            type="button"
            @click="$emit('iniciar-edicion', { aporte, clave: '' })"
          >
            ✏️ Editar mi aporte
          </button>
          <button
            class="btn ghost sm danger"
            type="button"
            @click="confirmarEliminarPropio"
          >
            Eliminar
          </button>
        </template>

        <!-- Botones de Usuario / Autor (aportes de antes de las cuentas, con clave de autor) -->
        <template v-else-if="aporte.tiene_clave">
          <button
            class="btn sm"
            type="button"
            @click="abrirModalClave('editar')"
          >
            ✏️ Editar mi aporte
          </button>
          <button
            class="btn ghost sm danger"
            type="button"
            @click="abrirModalClave('eliminar')"
          >
            Eliminar
          </button>
        </template>
      </div>
    </div>

    <!-- Contenido completo del aporte -->
    <article class="post-content">
      <div class="post-author-box">
        <div>
          <h2>{{ aporte.autor }}</h2>
          <span v-if="aporte.ficha" class="eyebrow" style="margin-top: 4px; display: block;">
            Ficha: {{ aporte.ficha }}
          </span>
        </div>
        <div style="text-align: right;">
          <time class="count">{{ formatFecha(aporte.created_at) }}</time>
          <span v-if="aporte.updated_at && aporte.updated_at !== aporte.created_at" class="eyebrow" style="display: block; font-size: 11px;">
            (Editado: {{ formatFecha(aporte.updated_at) }})
          </span>
        </div>
      </div>

      <!-- Cuadro de Calificación Oficial del Instructor -->
      <div v-if="aporte.calificacion !== null && aporte.calificacion !== undefined" class="grade-card">
        <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px;">
          <span class="grade-badge">
            Evaluación y Juicio del Instructor
          </span>
          <span class="grade-score">
            {{ aporte.calificacion }} / 100
            <span style="font-size: 15px; font-weight: 500; color: var(--muted);">
              ({{ aporte.calificacion >= 70 ? 'Aprobado' : 'No aprobado' }})
            </span>
          </span>
        </div>
        <div v-if="aporte.retroalimentacion" class="grade-feedback">
          <b>Retroalimentación:</b>
          <p style="margin-top: 4px; white-space: pre-wrap;">{{ aporte.retroalimentacion }}</p>
        </div>
        <span v-if="aporte.calificado_at" class="eyebrow" style="font-size: 11px;">
          Fecha de evaluación: {{ formatFecha(aporte.calificado_at) }}
        </span>
      </div>

      <!-- El Juicio de Macondo: sala de audiencias y sentencia -->
      <section v-if="aporte.juicio" class="juicio-card" aria-label="Juicio de Macondo">
        <div class="juicio-head">
          <span class="juicio-badge">⚖️ El Juicio de Macondo</span>
          <span class="eyebrow">{{ aporte.juicio.veredicto ? 'Caso cerrado' : 'Audiencia en curso' }}</span>
        </div>
        <p v-if="!aporte.juicio.veredicto" class="juicio-intro">
          Este aporte está en juicio. Al replicar, escoge bando: la Fiscalía acusa, la Defensa defiende
          y los neutrales aportan pruebas. El instructor dictará sentencia al final.
        </p>

        <div class="juicio-bandos">
          <span v-for="b in BANDOS_JUICIO" :key="b.id" :class="['juicio-conteo', b.id]">
            {{ b.icono }} {{ b.nombre }}: <b>{{ conteoBandos[b.id] }}</b>
          </span>
        </div>

        <div v-if="veredicto" :class="['juicio-sentencia', aporte.juicio.veredicto]">
          <span class="juicio-sello">{{ veredicto.icono }} {{ veredicto.nombre }}</span>
          <p class="juicio-texto">{{ aporte.juicio.sentencia }}</p>
          <span v-if="aporte.juicio.sentenciado_at" class="eyebrow" style="font-size: 11px;">
            Sentencia del {{ formatFecha(aporte.juicio.sentenciado_at) }} · no afecta la calificación
          </span>
        </div>
      </section>

      <div class="post-question-block">
        <span class="forum-question-badge" style="font-size: 12px;">Pregunta Orientadora</span>
        <h3 class="post-question-title" style="color: var(--accent); font-size: 22px; line-height: 1.35; margin-top: 2px;">
          {{ aporte.pregunta }}
        </h3>
        <div style="margin-top: 14px;">
          <span class="eyebrow" style="display: block; margin-bottom: 8px;">Respuesta y Desarrollo</span>
          <p class="post-question-text"><TextoConGlosario :texto="aporte.respuesta" /></p>
          <span class="glosa-hint">Los términos subrayados tienen su definición del glosario: pasa el mouse o tócalos.</span>
        </div>
      </div>

      <div class="reaction-row">
        <BotonUtil
          tipo="aporte"
          :id="aporte.id"
          :total="Number(aporte.total_reacciones) || 0"
          @reaccionar="$emit('reaccionar', $event)"
        />
        <span class="reaction-hint">¿Te sirvió este aporte? Márcalo como útil.</span>
      </div>
    </article>

    <!-- Sección de comentarios / réplicas -->
    <section class="comments-section">
      <div class="section-title">
        <div>
          <h3>Comentarios y Réplicas ({{ (aporte.comentarios || []).length }})</h3>
          <p>Participa activamente comentando la postura de tu compañero, complementando o formulando preguntas.</p>
        </div>
      </div>

      <!-- Sin cuenta no se replica: se le muestra cómo entrar -->
      <div v-if="!isAdmin && !aprendiz" class="sheet form sin-cuenta" style="background: var(--sunk);">
        <p>👤 Para replicar entra con tu cuenta de aprendiz. Así tu réplica sale con tu nombre y nadie puede hacerse pasar por ti.</p>
        <button class="btn primary sm" type="button" @click="$emit('ir-a-cuenta')">Entrar o registrarme</button>
      </div>

      <!-- Formulario para agregar réplica/comentario -->
      <form v-else class="sheet form" style="background: var(--sunk);" @submit.prevent="enviarComentario">
        <div class="row2">
          <div v-if="isAdmin">
            <label class="lbl" for="c-autor">Nombre con el que replicas</label>
            <input
              id="c-autor"
              v-model="nuevoComentario.autor"
              class="inp"
              placeholder="Ej. Instructor"
              required
            />
          </div>
          <p v-else class="replica-como">Replicas como <strong>{{ aprendiz.nombre }}</strong></p>
          <div>
            <label class="lbl" for="c-cita">Texto o idea citada del aporte (opcional)</label>
            <input
              id="c-cita"
              v-model="nuevoComentario.comentario_citado"
              class="inp"
              placeholder="Pega un fragmento que quieras argumentar o complementar"
            />
          </div>
          <div>
            <label class="lbl" for="c-contenido">Tu comentario o réplica</label>
            <textarea
              id="c-contenido"
              v-model="nuevoComentario.contenido"
              class="inp"
              rows="4"
              placeholder="Escribe tu análisis reflexivo, datos adicionales, preguntas o postura..."
              required
            ></textarea>
          </div>
          <fieldset v-if="aporte.juicio && !aporte.juicio.veredicto" class="bando-picker">
            <legend class="lbl">¿De qué lado estás en el juicio?</legend>
            <label v-for="b in BANDOS_JUICIO" :key="b.id" :class="['bando-opcion', b.id, { activo: nuevoComentario.bando === b.id }]">
              <input v-model="nuevoComentario.bando" type="radio" name="bando" :value="b.id" />
              <span>{{ b.icono }} <b>{{ b.nombre }}</b></span>
              <small>{{ b.ayuda }}</small>
            </label>
          </fieldset>
        </div>

        <div class="form-foot">
          <span v-if="errorMsg" class="msg">{{ errorMsg }}</span>
          <span v-else></span>
          <button class="btn primary sm" type="submit" :disabled="guardando">
            {{ guardando ? 'Guardando…' : 'Publicar comentario' }}
          </button>
        </div>
      </form>

      <!-- Lista de comentarios -->
      <div v-if="!(aporte.comentarios || []).length" class="none">
        No hay comentarios en este aporte aún. ¡Sé el primero en responder!
      </div>
      <TransitionGroup v-else tag="div" name="comment" class="list">
        <article
          v-for="c in aporte.comentarios"
          :key="c.id"
          class="comment-card"
        >
          <div class="comment-card-head">
            <b>
              {{ c.autor }}
              <span v-if="bandoPorId(c.bando)" :class="['bando-tag', c.bando]">
                {{ bandoPorId(c.bando).icono }} {{ bandoPorId(c.bando).nombre }}
              </span>
            </b>
            <div style="display: flex; gap: 10px; align-items: center;">
              <time>{{ formatFecha(c.created_at) }}</time>
              <button
                v-if="isAdmin"
                class="btn ghost sm danger"
                style="padding: 2px 6px; font-size: 11px;"
                type="button"
                title="Eliminar comentario (Admin)"
                @click="$emit('eliminar-comentario', c.id)"
              >
                ✕
              </button>
            </div>
          </div>
          <blockquote v-if="c.comentario_citado" class="comment-quote">
            "{{ c.comentario_citado }}"
          </blockquote>
          <p class="comment-text"><TextoConGlosario :texto="c.contenido" /></p>
          <div class="reaction-row compact">
            <BotonUtil
              tipo="comentario"
              :id="c.id"
              :total="Number(c.total_reacciones) || 0"
              @reaccionar="$emit('reaccionar', $event)"
            />
          </div>
        </article>
      </TransitionGroup>
    </section>

    <!-- MODAL: Calificar Aporte (Exclusivo Administrador) -->
    <Transition name="modal">
    <div v-if="mostrarModalCalificar" class="modal-backdrop" @click.self="mostrarModalCalificar = false">
      <div class="modal-box">
        <h3>Calificar Aporte (Evaluación Docente)</h3>
        <p style="font-size: 14px; color: var(--muted);">
          Asigna una calificación numérica de 0 a 100 y una retroalimentación pedagógica para el aprendiz.
        </p>

        <fieldset class="rubrica">
          <legend class="lbl">Rúbrica (marca lo que cumple y la nota se suma sola)</legend>
          <label v-for="c in CRITERIOS_RUBRICA" :key="c.id" class="rubrica-item">
            <input
              type="checkbox"
              :checked="formCalificacion.criterios.includes(c.id)"
              @change="alternarCriterio(c.id)"
            />
            <span>{{ c.texto }}</span>
            <b>{{ c.puntos }}</b>
          </label>
        </fieldset>

        <div>
          <label class="lbl" for="calif-nota">Calificación (0 a 100)</label>
          <input
            id="calif-nota"
            v-model.number="formCalificacion.nota"
            class="inp"
            type="number"
            min="0"
            max="100"
            placeholder="Ej. 95"
            required
          />
        </div>

        <div>
          <label class="lbl" for="calif-feedback">Retroalimentación / Observaciones</label>
          <textarea
            id="calif-feedback"
            v-model="formCalificacion.retroalimentacion"
            class="inp"
            rows="4"
            placeholder="Detalla aciertos técnicos, cumplimiento normativo y sugerencias de mejora..."
          ></textarea>
          <div class="plantillas" role="group" aria-label="Retroalimentaciones frecuentes">
            <button
              v-for="p in PLANTILLAS_RETRO"
              :key="p.id"
              class="plantilla-chip"
              type="button"
              :title="p.texto"
              @click="usarPlantilla(p.texto)"
            >
              {{ p.titulo }}
            </button>
          </div>
        </div>

        <div class="actions" style="justify-content: flex-end; margin-top: 10px;">
          <button class="btn sm" type="button" @click="mostrarModalCalificar = false">Cancelar</button>
          <button class="btn primary sm" type="button" @click="enviarCalificacion">Guardar Calificación</button>
        </div>
      </div>
    </div>
    </Transition>

    <!-- MODAL: Dictar Sentencia del Juicio (Exclusivo Administrador) -->
    <Transition name="modal">
    <div v-if="mostrarModalSentencia" class="modal-backdrop" @click.self="mostrarModalSentencia = false">
      <div class="modal-box">
        <h3>🔨 Dictar sentencia</h3>
        <p style="font-size: 14px; color: var(--muted);">
          Escoge el veredicto y explica los argumentos. La sentencia no cambia la calificación de 0 a 100.
        </p>

        <fieldset class="bando-picker">
          <legend class="lbl">Veredicto</legend>
          <label
            v-for="v in VEREDICTOS_JUICIO"
            :key="v.id"
            :class="['bando-opcion', v.id, { activo: formSentencia.veredicto === v.id }]"
          >
            <input v-model="formSentencia.veredicto" type="radio" name="veredicto" :value="v.id" />
            <span>{{ v.icono }} <b>{{ v.nombre }}</b></span>
            <small>{{ v.detalle }}</small>
          </label>
        </fieldset>

        <div>
          <label class="lbl" for="sentencia-texto">Argumentos de la sentencia</label>
          <textarea
            id="sentencia-texto"
            v-model="formSentencia.sentencia"
            class="inp"
            rows="4"
            maxlength="5000"
            placeholder="Ej. La Defensa demostró que la GPL no obliga a publicar el código si el sistema solo corre en el servidor..."
          ></textarea>
        </div>

        <div class="actions" style="justify-content: flex-end; margin-top: 10px;">
          <button class="btn sm" type="button" @click="mostrarModalSentencia = false">Cancelar</button>
          <button class="btn primary sm" type="button" @click="enviarSentencia">Dictar sentencia</button>
        </div>
      </div>
    </div>
    </Transition>

    <!-- MODAL: Validar Clave Personal de Autor (para Editar o Eliminar) -->
    <Transition name="modal">
    <div v-if="mostrarModalClave" class="modal-backdrop" @click.self="mostrarModalClave = false">
      <div class="modal-box">
        <h3>Validación de Autor</h3>
        <p style="font-size: 14px; color: var(--muted);">
          Ingresa la clave de autor que definiste al crear este aporte:
        </p>

        <div>
          <label class="lbl" for="autor-clave">Clave o PIN de autor</label>
          <input
            id="autor-clave"
            v-model="claveIngresada"
            class="inp"
            type="password"
            autocomplete="current-password"
            placeholder="Ingresa tu clave..."
            @keyup.enter="confirmarAccionConClave"
          />
        </div>

        <div class="actions" style="justify-content: flex-end; margin-top: 10px;">
          <button class="btn sm" type="button" @click="mostrarModalClave = false">Cancelar</button>
          <button class="btn primary sm" type="button" @click="confirmarAccionConClave">
            {{ accionPendiente === 'editar' ? 'Continuar a Edición' : 'Confirmar Eliminación' }}
          </button>
        </div>
      </div>
    </div>
    </Transition>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { fmtDate } from '../utils/text.js'
import { getAporteText } from '../utils/exporter.js'
import { sumarRubrica, agregarPlantilla } from '../utils/rubrica.js'
import { CRITERIOS_RUBRICA, PLANTILLAS_RETRO } from '../data/rubrica.js'
import { BANDOS_JUICIO, VEREDICTOS_JUICIO, bandoPorId, veredictoPorId, contarBandos } from '../data/juicio.js'
import BotonUtil from './BotonUtil.vue'
import TextoConGlosario from './TextoConGlosario.vue'
import { aprendiz } from '../services/sesionAprendiz.js'

const props = defineProps({
  aporte: { type: Object, required: true },
  isAdmin: { type: Boolean, default: false }
})

const emit = defineEmits([
  'volver',
  'comentario-agregado',
  'eliminar-comentario',
  'eliminar-aporte',
  'iniciar-edicion',
  'calificar-aporte',
  'reaccionar',
  'fijar-juicio',
  'dictar-sentencia',
  'ir-a-cuenta',
  'toast'
])

const guardando = ref(false)
const errorMsg = ref('')

const nuevoComentario = reactive({
  autor: '',
  comentario_citado: '',
  contenido: '',
  bando: 'neutral'
})

const conteoBandos = computed(() => contarBandos(props.aporte.comentarios))
const veredicto = computed(() => veredictoPorId(props.aporte.juicio?.veredicto))

// Estado de modales
const mostrarModalCalificar = ref(false)
const formCalificacion = reactive({
  nota: props.aporte.calificacion ?? 100,
  retroalimentacion: props.aporte.retroalimentacion || '',
  criterios: []
})

const mostrarModalSentencia = ref(false)
const formSentencia = reactive({ veredicto: '', sentencia: '' })

const mostrarModalClave = ref(false)
const accionPendiente = ref('') // 'editar' | 'eliminar'
const claveIngresada = ref('')

function formatFecha(d) {
  return fmtDate(d) || 'Reciente'
}

function copiarTextoAporte() {
  const txt = getAporteText(props.aporte)
  navigator.clipboard.writeText(txt).then(() => {
    emit('toast', 'Aporte copiado al portapapeles')
  })
}

function abrirModalCalificar() {
  formCalificacion.nota = props.aporte.calificacion ?? 100
  formCalificacion.retroalimentacion = props.aporte.retroalimentacion || ''
  // La rúbrica arranca sin marcar: la nota guardada no dice qué criterios se cumplieron
  formCalificacion.criterios = []
  mostrarModalCalificar.value = true
}

// Al marcar o desmarcar un criterio la nota se recalcula; después el profe la puede ajustar a mano
function alternarCriterio(id) {
  const criterios = formCalificacion.criterios
  formCalificacion.criterios = criterios.includes(id) ? criterios.filter(c => c !== id) : [...criterios, id]
  formCalificacion.nota = sumarRubrica(CRITERIOS_RUBRICA, formCalificacion.criterios)
}

function usarPlantilla(texto) {
  formCalificacion.retroalimentacion = agregarPlantilla(formCalificacion.retroalimentacion, texto)
}

function abrirModalSentencia() {
  formSentencia.veredicto = props.aporte.juicio?.veredicto || ''
  formSentencia.sentencia = props.aporte.juicio?.sentencia || ''
  mostrarModalSentencia.value = true
}

function enviarSentencia() {
  if (!formSentencia.veredicto) {
    alert('Escoge un veredicto')
    return
  }
  if (!formSentencia.sentencia.trim()) {
    alert('Escribe los argumentos de la sentencia')
    return
  }
  emit('dictar-sentencia', {
    aporteId: props.aporte.id,
    veredicto: formSentencia.veredicto,
    sentencia: formSentencia.sentencia.trim()
  })
  mostrarModalSentencia.value = false
}

function enviarCalificacion() {
  if (formCalificacion.nota < 0 || formCalificacion.nota > 100) {
    alert('La calificación debe estar entre 0 y 100')
    return
  }
  emit('calificar-aporte', {
    aporteId: props.aporte.id,
    calificacion: formCalificacion.nota,
    retroalimentacion: formCalificacion.retroalimentacion
  })
  mostrarModalCalificar.value = false
}

function confirmarEliminarAdmin() {
  if (confirm('¿Confirmas como Administrador la eliminación definitiva de este aporte?')) {
    emit('eliminar-aporte', { id: props.aporte.id, clave: '' })
  }
}

function confirmarEliminarPropio() {
  if (confirm('¿Seguro que quieres eliminar tu aporte? Se borran también sus réplicas y no hay vuelta atrás.')) {
    emit('eliminar-aporte', { id: props.aporte.id, clave: '' })
  }
}

function abrirModalClave(accion) {
  accionPendiente.value = accion
  claveIngresada.value = ''
  mostrarModalClave.value = true
}

function confirmarAccionConClave() {
  if (!claveIngresada.value.trim()) {
    alert('Por favor escribe tu clave')
    return
  }

  const clave = claveIngresada.value.trim()
  mostrarModalClave.value = false

  if (accionPendiente.value === 'editar') {
    emit('iniciar-edicion', { aporte: props.aporte, clave })
  } else if (accionPendiente.value === 'eliminar') {
    if (confirm('¿Estás seguro de que deseas eliminar tu aporte?')) {
      emit('eliminar-aporte', { id: props.aporte.id, clave })
    }
  }
}

async function enviarComentario() {
  // El aprendiz no escribe su nombre: el servidor lo saca de su cuenta
  const autor = props.isAdmin ? nuevoComentario.autor.trim() : aprendiz.value?.nombre || ''
  if (!autor || !nuevoComentario.contenido.trim()) {
    errorMsg.value = props.isAdmin ? 'Por favor completa tu nombre y el comentario' : 'Escribe tu comentario'
    return
  }

  errorMsg.value = ''
  guardando.value = true

  try {
    emit('comentario-agregado', {
      aporteId: props.aporte.id,
      autor,
      comentario_citado: nuevoComentario.comentario_citado.trim(),
      contenido: nuevoComentario.contenido.trim(),
      bando: props.aporte.juicio ? nuevoComentario.bando : ''
    })

    nuevoComentario.contenido = ''
    nuevoComentario.comentario_citado = ''
  } finally {
    guardando.value = false
  }
}
</script>

<style scoped>
.sin-cuenta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.sin-cuenta p,
.replica-como {
  margin: 0;
  color: var(--muted);
}

/* Con la rúbrica el modal de calificar crece: en pantallas bajitas se desplaza por dentro */
.modal-box {
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}

.glosa-hint {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: var(--muted);
}

/* ----- Rúbrica y plantillas ----- */
.rubrica {
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 10px 12px;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rubrica-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 8px;
  align-items: start;
  font-size: 13.5px;
  line-height: 1.4;
  cursor: pointer;
}

.rubrica-item input {
  margin-top: 2px;
  accent-color: var(--accent);
}

.rubrica-item b {
  font-variant-numeric: tabular-nums;
  color: var(--accent);
}

.plantillas {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.plantilla-chip {
  background: var(--sunk);
  border: 1px solid var(--line);
  color: var(--fg);
  font-size: 12.5px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 999px;
  cursor: pointer;
}

.plantilla-chip:hover {
  border-color: var(--accent);
  color: var(--accent);
}

/* ----- El Juicio de Macondo ----- */
.juicio-card {
  background: color-mix(in srgb, var(--accent) 7%, var(--surface));
  border: 1px solid color-mix(in srgb, var(--accent) 30%, var(--surface));
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.juicio-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
}

.juicio-badge {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .05em;
  font-family: var(--f-mono);
  color: var(--accent);
}

.juicio-intro {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
}

.juicio-bandos {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.juicio-conteo,
.bando-tag {
  font-size: 12.5px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--surface);
}

.bando-tag {
  margin-left: 6px;
  font-size: 11px;
  padding: 2px 8px;
  vertical-align: middle;
}

.fiscalia { --bando: var(--bad); }
.defensa { --bando: var(--accent); }
.neutral,
.dividido { --bando: var(--muted); }

.juicio-conteo,
.bando-tag {
  border-color: color-mix(in srgb, var(--bando, var(--line)) 45%, var(--surface));
  color: var(--bando, var(--fg));
}

.juicio-sentencia {
  border: 2px dashed var(--bando);
  border-radius: 10px;
  padding: 12px 14px;
  background: var(--surface);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.juicio-sello {
  align-self: flex-start;
  font-family: var(--f-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--bando);
  transform: rotate(-2deg);
}

.juicio-texto {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  white-space: pre-wrap;
}

/* Selector de bando (réplicas) y de veredicto (sentencia) */
.bando-picker {
  border: 0;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 8px;
}

.bando-picker legend {
  margin-bottom: 6px;
}

.bando-opcion {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--surface);
  cursor: pointer;
  font-size: 13.5px;
}

.bando-opcion input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.bando-opcion small {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.35;
}

.bando-opcion b {
  color: var(--bando);
}

.bando-opcion.activo {
  border-color: var(--bando);
  box-shadow: 0 0 0 1px var(--bando);
}

.bando-opcion:focus-within {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
</style>
