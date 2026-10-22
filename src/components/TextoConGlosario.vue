<template>
  <template v-for="(s, i) in segmentos" :key="i">
    <template v-if="!s.termino">{{ s.texto }}</template>
    <span
      v-else
      :class="['glosa', { abierta: abierta === i }]"
      @mouseenter="ubicar($event.currentTarget)"
    >
      <button
        class="glosa-termino"
        type="button"
        :aria-expanded="abierta === i"
        :aria-describedby="`${idBase}-${i}`"
        @click="alternar($event.currentTarget.parentElement, i)"
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
import { ref, computed, nextTick } from 'vue'
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

const MARGEN = 8

// Ya con el cuadrito visible se mide y, si se sale por algún borde, se corre hacia adentro.
// Así no aparece scroll horizontal ni queda media definición cortada en el celular.
function ubicar(glosa) {
  requestAnimationFrame(() => {
    const tip = glosa.querySelector('.glosa-tip')
    if (!tip) return
    tip.style.setProperty('--mover', '0px')
    const caja = tip.getBoundingClientRect()
    if (!caja.width) return // sigue escondido (el mouse ya se fue)
    const ancho = document.documentElement.clientWidth
    let mover = 0
    if (caja.right > ancho - MARGEN) mover = ancho - MARGEN - caja.right
    if (caja.left + mover < MARGEN) mover = MARGEN - caja.left
    tip.style.setProperty('--mover', `${mover}px`)
  })
}

async function alternar(glosa, i) {
  abierta.value = abierta.value === i ? null : i
  await nextTick()
  if (abierta.value === i) ubicar(glosa)
}
</script>

<style scoped>
.glosa {
  position: relative;
}

/* Que se note que el término se puede tocar: color de acento, fondito suave y subrayado */
.glosa-termino {
  font: inherit;
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-soft);
  border: 0;
  border-radius: 4px;
  padding: 0 3px;
  cursor: help;
  text-decoration: underline dotted var(--accent);
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}

.glosa-termino:hover {
  text-decoration-style: solid;
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
  /* display: none y no visibility: hidden: un cuadrito escondido igual ocupa espacio
     y los del borde derecho creaban scroll horizontal en toda la página */
  display: none;
  pointer-events: none;
  transform: translateX(var(--mover, 0px));
}

.glosa-tip b {
  display: block;
  color: var(--accent);
  margin-bottom: 2px;
}

.glosa:hover .glosa-tip,
.glosa:focus-within .glosa-tip,
.glosa.abierta .glosa-tip {
  display: block;
}
</style>
