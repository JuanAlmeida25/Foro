<template>
  <template v-for="(s, i) in segmentos" :key="i">
    <template v-if="!s.termino">{{ s.texto }}</template>
    <span
      v-else
      :class="['glosa', { abierta: abierta === i, derecha: alDerecha === i }]"
      @mouseenter="ubicar($event, i)"
    >
      <button
        class="glosa-termino"
        type="button"
        :aria-expanded="abierta === i"
        :aria-describedby="`${idBase}-${i}`"
        @click="alternar($event, i)"
        @keydown.esc="abierta = null"
        @blur="abierta = null"
      >{{ s.texto }}</button>
      <span :id="`${idBase}-${i}`" class="glosa-tip" role="tooltip">
        <b>{{ s.termino.termino }}</b>
        {{ s.termino.definicion }}
      </span>
    </span>
  </template>
</template>

<script setup>
import { ref, computed } from 'vue'
import { TERMINOS } from '../data/glosario.js'
import { marcarTerminos } from '../utils/glosario.js'

const props = defineProps({
  texto: { type: String, default: '' }
})

// Cada instancia necesita ids propios para enlazar el término con su definición
const idBase = `glosa-${Math.random().toString(36).slice(2, 8)}`

const segmentos = computed(() => marcarTerminos(props.texto, TERMINOS))

// En el celular no hay "pasar el mouse": la definición se abre y se cierra tocando el término
const abierta = ref(null)
// Si el término queda en la mitad derecha de la pantalla, el cuadrito se abre hacia la izquierda
// para no salirse del borde (y no crear scroll horizontal)
const alDerecha = ref(null)

function ubicar(evento, i) {
  const { left } = evento.currentTarget.getBoundingClientRect()
  alDerecha.value = left > window.innerWidth / 2 ? i : null
}

function alternar(evento, i) {
  ubicar({ currentTarget: evento.currentTarget.parentElement }, i)
  abierta.value = abierta.value === i ? null : i
}
</script>

<style scoped>
.glosa {
  position: relative;
}

.glosa-termino {
  font: inherit;
  color: inherit;
  background: none;
  border: 0;
  padding: 0;
  cursor: help;
  text-decoration: underline dotted var(--accent);
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}

.glosa-termino:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 3px;
}

.glosa-tip {
  position: absolute;
  left: 0;
  bottom: calc(100% + 6px);
  z-index: 20;
  width: max-content;
  max-width: min(300px, 75vw);
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.5;
  white-space: normal;
  text-align: left;
  color: var(--fg);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 10px;
  box-shadow: var(--shadow-lg);
  visibility: hidden;
  opacity: 0;
  transition: opacity .15s ease, visibility .15s;
  pointer-events: none;
}

.glosa-tip b {
  display: block;
  color: var(--accent);
  margin-bottom: 2px;
}

.glosa.derecha .glosa-tip {
  left: auto;
  right: 0;
}

.glosa:hover .glosa-tip,
.glosa:focus-within .glosa-tip,
.glosa.abierta .glosa-tip {
  visibility: visible;
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .glosa-tip { transition: none; }
}
</style>
