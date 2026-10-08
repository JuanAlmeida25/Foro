<template>
  <article class="reply">
    <div class="reply-head">
      <h3>
        Respuesta a {{ r.companero || 'un compañero' }}
        <span v-if="r.ejemplo" class="tag">Ejemplo</span>
      </h3>
      <time v-if="r.createdAt" :datetime="r.createdAt">{{ fecha }}</time>
    </div>
    <p v-if="r.ejemplo" class="hint">
      Esta réplica es un ejemplo de estructura. Elimínala o edítala con el comentario real de tu compañero.
    </p>
    <div class="quote">{{ r.comentario }}</div>
    <div class="mine">{{ r.respuesta }}</div>
    <div class="reply-actions">
      <span v-if="confirming" class="confirm">
        ¿Eliminar esta réplica?
        <button class="btn danger sm" type="button" @click="$emit('delete')">Sí, eliminar</button>
        <button class="btn sm" type="button" @click="$emit('cancel-delete')">Cancelar</button>
      </span>
      <template v-else>
        <button class="btn sm" type="button" @click="$emit('copy')">Copiar réplica</button>
        <template v-if="!readOnly">
          <button class="btn sm" type="button" @click="$emit('edit')">Editar</button>
          <button class="btn ghost sm danger" type="button" @click="$emit('ask-delete')">Eliminar</button>
        </template>
      </template>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { fmtDate } from '../utils/text.js'

const props = defineProps({
  r: { type: Object, required: true },
  readOnly: { type: Boolean, default: false },
  confirming: { type: Boolean, default: false }
})

defineEmits(['copy', 'edit', 'ask-delete', 'delete', 'cancel-delete'])

const fecha = computed(() => (props.r.createdAt ? fmtDate(props.r.createdAt) : ''))
</script>
