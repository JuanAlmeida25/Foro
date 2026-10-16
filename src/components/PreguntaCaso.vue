<template>
  <div class="pregunta">
    <p v-if="caso.tema" class="case-tema">{{ caso.tema }}</p>
    <h3 class="case-q" tabindex="-1">{{ caso.enunciado }}</h3>
    <div class="opts" role="group" aria-label="Opciones de respuesta">
      <button
        v-for="(o, k) in caso.opciones"
        :key="k"
        type="button"
        class="opt"
        :data-s="estado(k)"
        :disabled="respondida"
        :aria-pressed="elegida === k ? 'true' : 'false'"
        @click="$emit('elegir', k)"
      >
        <span class="opt-key" aria-hidden="true">{{ LETRAS[k] }}</span>
        <span class="opt-text">{{ o.texto }}</span>
      </button>
    </div>
    <div v-if="respondida" class="explain" :data-ok="acerto ? '1' : '0'" role="status">
      <b>{{ acerto ? '¡Correcto!' : 'No es la mejor opción.' }}</b>
      <span v-if="!acerto"> La respuesta correcta es la {{ LETRAS[correcta] }}.</span>
      <p>{{ caso.explicacion }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const LETRAS = ['A', 'B', 'C', 'D', 'E']

const props = defineProps({
  // { tema, enunciado, opciones: [{ texto, ok }], explicacion }
  caso: { type: Object, required: true },
  // Índice de la opción elegida, o null si todavía no responde
  elegida: { type: Number, default: null }
})

defineEmits(['elegir'])

const respondida = computed(() => props.elegida !== null && props.elegida !== undefined)
const correcta = computed(() => props.caso.opciones.findIndex(o => o.ok))
const acerto = computed(() => respondida.value && props.elegida === correcta.value)

function estado(k) {
  if (!respondida.value) return ''
  if (k === correcta.value) return 'ok'
  if (k === props.elegida) return 'bad'
  return 'dim'
}
</script>
