<template>
  <div>
    <div class="section-title" style="margin-bottom: 20px;">
      <div>
        <h2>Aportes publicados en el foro</h2>
        <p>Explora las participaciones de tus compañeros, lee sus análisis y aporta réplicas crítico-reflexivas.</p>
      </div>
      <div>
        <button class="btn primary" type="button" @click="$emit('nuevo-aporte')">
          + Redactar mi aporte
        </button>
      </div>
    </div>

    <!-- Preguntas orientadoras del debate -->
    <div class="forum-topic-banner">
      <div class="topic-header">
        <span class="topic-tag">🎯 Tema a debatir y preguntas orientadoras</span>
      </div>
      <ol class="topic-questions-list">
        <li><span class="num">1.</span> ¿Qué es un software?</li>
        <li><span class="num">2.</span> ¿Qué es una licencia de software?</li>
        <li><span class="num">3.</span> Tipos de licencias de software</li>
        <li><span class="num">4.</span> ¿Cuáles son las más adecuadas y por qué?</li>
      </ol>
    </div>

    <div v-if="loading" class="none">Cargando aportes del foro…</div>
    <div v-else-if="!aportes.length" class="none">
      Aún no hay aportes publicados en el foro. ¡Sé el primero en compartir tu análisis!
    </div>
    <template v-else>
      <!-- Orden por fecha y hora -->
      <div class="orden-bar">
        <span class="orden-count">{{ aportes.length }} {{ aportes.length === 1 ? 'aporte' : 'aportes' }}</span>
        <label class="orden-control" for="orden-aportes">
          <span>Ordenar por</span>
          <select id="orden-aportes" v-model="orden" class="orden-select">
            <option v-for="o in ORDENES" :key="o.id" :value="o.id">{{ o.label }}</option>
          </select>
        </label>
      </div>

      <div class="forum-grid">
        <article
          v-for="a in aportesOrdenados"
          :key="a.id"
          class="forum-card"
          @click="$emit('ver-aporte', a.id)"
        >
          <div>
            <div class="forum-card-head">
              <div>
                <h3 class="forum-card-title">{{ a.autor }}</h3>
                <span v-if="a.ficha" class="forum-card-ficha">{{ a.ficha }}</span>
              </div>
              <div style="display: flex; gap: 8px; align-items: center;">
                <span
                  v-if="a.calificacion !== null && a.calificacion !== undefined"
                  class="pill"
                  data-tone="ok"
                  style="padding: 3px 8px; font-size: 11px; font-weight: 600;"
                  title="Calificación del instructor"
                >
                  ⭐ {{ a.calificacion }}/100
                </span>
                <span class="badge-comment" title="Comentarios y réplicas">
                  💬 {{ a.total_comentarios || 0 }}
                </span>
              </div>
            </div>

            <div style="margin-top: 14px;">
              <div class="forum-question-badge">Pregunta orientadora</div>
              <h4 class="forum-card-question">
                {{ a.pregunta }}
              </h4>
              <p class="forum-card-preview">
                {{ a.respuesta }}
              </p>
            </div>
          </div>

          <div class="forum-card-foot">
            <time :datetime="fechaDe(a)" :title="fechaCompleta(fechaDe(a))">
              {{ orden === 'editados' && fueEditado(a) ? 'Editado ' : '' }}{{ formatFecha(fechaDe(a)) }}
            </time>
            <span class="btn sm ghost" style="padding: 0;">Leer completo y comentar →</span>
          </div>
        </article>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { fmtDate } from '../utils/text.js'
import { ORDENES, ORDEN_POR_DEFECTO, buscarOrden, ordenarAportes, fueEditado, fechaCompleta } from '../utils/orden.js'

const props = defineProps({
  aportes: { type: Array, required: true },
  loading: { type: Boolean, default: false }
})

defineEmits(['ver-aporte', 'nuevo-aporte'])

// El orden elegido se recuerda en este navegador
const LS_ORDEN_KEY = 'foro-orden-aportes-v1'

function leerOrden() {
  try {
    return buscarOrden(localStorage.getItem(LS_ORDEN_KEY) || ORDEN_POR_DEFECTO).id
  } catch (e) {
    return ORDEN_POR_DEFECTO
  }
}

const orden = ref(leerOrden())

watch(orden, valor => {
  try {
    localStorage.setItem(LS_ORDEN_KEY, valor)
  } catch (e) {
    // Sin almacenamiento disponible: el orden solo dura esta visita
  }
})

const aportesOrdenados = computed(() => ordenarAportes(props.aportes, orden.value))

// En "Editados recientemente" la tarjeta muestra la fecha de la última edición
function fechaDe(a) {
  return orden.value === 'editados' ? a.updated_at || a.created_at : a.created_at
}

function formatFecha(dateStr) {
  return fmtDate(dateStr) || 'Reciente'
}
</script>
