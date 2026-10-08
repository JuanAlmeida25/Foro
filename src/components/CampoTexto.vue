<template>
  <div class="field">
    <div class="field-head">
      <h3>
        <span v-if="q" class="q">{{ q }}</span>
        <label :for="id">{{ label }}</label>
      </h3>
      <span class="count" :data-ok="ok ? '1' : '0'">
        {{ n }} {{ n === 1 ? 'palabra' : 'palabras' }}
      </span>
    </div>
    <textarea
      :id="id"
      ref="ta"
      class="doc"
      :rows="rows"
      :disabled="disabled"
      :placeholder="placeholder"
      :value="modelValue"
      @input="onInput"
      @blur="$emit('blur')"
    ></textarea>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { words } from '../utils/text.js'
import { MIN_WORDS } from '../data/constants.js'

const props = defineProps({
  id: { type: String, default: '' },
  label: { type: String, default: '' },
  q: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  modelValue: { type: String, default: '' },
  rows: { type: Number, default: 4 },
  disabled: { type: Boolean, default: false },
  pregunta: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'blur'])

const ta = ref(null)
const n = computed(() => words(props.modelValue))
const ok = computed(() => props.pregunta && n.value >= MIN_WORDS)

function autosize() {
  const el = ta.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = (el.scrollHeight + 2) + 'px'
}

function onInput(e) {
  emit('update:modelValue', e.target.value)
  autosize()
}

watch(() => props.modelValue, () => nextTick(autosize))

onMounted(() => {
  autosize()
  window.addEventListener('resize', autosize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', autosize)
})
</script>
