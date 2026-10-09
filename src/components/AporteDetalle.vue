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
            class="btn ghost sm danger"
            type="button"
            @click="confirmarEliminarAdmin"
          >
            🗑️ Eliminar (Admin)
          </button>
        </template>

        <!-- Botones de Usuario / Autor -->
        <template v-else>
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

      <div class="post-question-block">
        <span class="forum-question-badge" style="font-size: 12px;">Pregunta Orientadora</span>
        <h3 class="post-question-title" style="color: var(--accent); font-size: 22px; line-height: 1.35; margin-top: 2px;">
          {{ aporte.pregunta }}
        </h3>
        <div style="margin-top: 14px;">
          <span class="eyebrow" style="display: block; margin-bottom: 8px;">Respuesta y Desarrollo</span>
          <p class="post-question-text">{{ aporte.respuesta }}</p>
        </div>
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

      <!-- Formulario para agregar réplica/comentario -->
      <form class="sheet form" style="background: var(--sunk);" @submit.prevent="enviarComentario">
        <div class="row2">
          <div>
            <label class="lbl" for="c-autor">Tu nombre</label>
            <input
              id="c-autor"
              v-model="nuevoComentario.autor"
              class="inp"
              placeholder="Ej. Juan Pérez"
              required
            />
          </div>
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
      <div v-else class="list">
        <article
          v-for="c in aporte.comentarios"
          :key="c.id"
          class="comment-card"
        >
          <div class="comment-card-head">
            <b>{{ c.autor }}</b>
            <div style="display: flex; gap: 10px; align-items: center;">
              <time>{{ formatFecha(c.created_at) }}</time>
              <button
                class="btn ghost sm danger"
                style="padding: 2px 6px; font-size: 11px;"
                type="button"
                :title="isAdmin ? 'Eliminar comentario (Admin)' : 'Eliminar comentario'"
                @click="$emit('eliminar-comentario', c.id)"
              >
                ✕
              </button>
            </div>
          </div>
          <blockquote v-if="c.comentario_citado" class="comment-quote">
            "{{ c.comentario_citado }}"
          </blockquote>
          <p class="comment-text">{{ c.contenido }}</p>
        </article>
      </div>
    </section>

    <!-- MODAL: Calificar Aporte (Exclusivo Administrador con clave 2501) -->
    <div v-if="mostrarModalCalificar" class="modal-backdrop" @click.self="mostrarModalCalificar = false">
      <div class="modal-box">
        <h3>Calificar Aporte (Evaluación Docente)</h3>
        <p style="font-size: 14px; color: var(--muted);">
          Asigna una calificación numérica de 0 a 100 y una retroalimentación pedagógica para el aprendiz.
        </p>

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
        </div>

        <div class="actions" style="justify-content: flex-end; margin-top: 10px;">
          <button class="btn sm" type="button" @click="mostrarModalCalificar = false">Cancelar</button>
          <button class="btn primary sm" type="button" @click="enviarCalificacion">Guardar Calificación</button>
        </div>
      </div>
    </div>

    <!-- MODAL: Validar Clave Personal de Autor (para Editar o Eliminar) -->
    <div v-if="mostrarModalClave" class="modal-backdrop" @click.self="mostrarModalClave = false">
      <div class="modal-box">
        <h3>Validación de Autor</h3>
        <p style="font-size: 14px; color: var(--muted);">
          Ingresa la clave de autor que definiste al crear este aporte (o la clave de administrador 2501):
        </p>

        <div>
          <label class="lbl" for="autor-clave">Clave o PIN de autor</label>
          <input
            id="autor-clave"
            v-model="claveIngresada"
            class="inp"
            type="password"
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
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { fmtDate } from '../utils/text.js'
import { getAporteText } from '../utils/exporter.js'

const props = defineProps({
  aporte: { type: Object, required: true },
  isAdmin: { type: Boolean, default: false },
  adminClave: { type: String, default: '' }
})

const emit = defineEmits([
  'volver',
  'comentario-agregado',
  'eliminar-comentario',
  'eliminar-aporte',
  'iniciar-edicion',
  'calificar-aporte',
  'toast'
])

const guardando = ref(false)
const errorMsg = ref('')

const nuevoComentario = reactive({
  autor: '',
  comentario_citado: '',
  contenido: ''
})

// Estado de modales
const mostrarModalCalificar = ref(false)
const formCalificacion = reactive({
  nota: props.aporte.calificacion ?? 100,
  retroalimentacion: props.aporte.retroalimentacion || ''
})

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
  mostrarModalCalificar.value = true
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
    emit('eliminar-aporte', { id: props.aporte.id, clave: props.adminClave || '2501' })
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
  if (!nuevoComentario.autor.trim() || !nuevoComentario.contenido.trim()) {
    errorMsg.value = 'Por favor completa tu nombre y el comentario'
    return
  }

  errorMsg.value = ''
  guardando.value = true

  try {
    emit('comentario-agregado', {
      aporteId: props.aporte.id,
      autor: nuevoComentario.autor.trim(),
      comentario_citado: nuevoComentario.comentario_citado.trim(),
      contenido: nuevoComentario.contenido.trim()
    })

    nuevoComentario.contenido = ''
    nuevoComentario.comentario_citado = ''
  } finally {
    guardando.value = false
  }
}
</script>
