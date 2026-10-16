<template>
  <button
    :class="['util-btn', { active }]"
    type="button"
    :aria-pressed="active"
    :title="active ? 'Quitar tu marca de «Útil»' : 'Marcar como útil'"
    @click.stop="$emit('reaccionar', { tipo, id })"
  >
    <span class="util-icon" aria-hidden="true">👍</span>
    <span>Útil</span>
    <span class="util-count">{{ total || 0 }}</span>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { yaReaccione } from '../services/reacciones.js'

const props = defineProps({
  tipo: { type: String, required: true },
  id: { type: String, required: true },
  total: { type: Number, default: 0 }
})

defineEmits(['reaccionar'])

const active = computed(() => yaReaccione(props.tipo, props.id))
</script>

<style scoped>
.util-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--muted);
  border-radius: 999px;
  padding: 5px 12px 5px 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color .15s, background .15s, color .15s, transform .15s;
}

.util-btn:hover {
  border-color: var(--accent);
  color: var(--fg);
}

.util-btn:active {
  transform: scale(.96);
}

.util-btn.active {
  background: var(--accent-soft);
  border-color: var(--accent);
  color: var(--accent);
}

.util-btn.active .util-icon {
  animation: pop .3s ease;
}

.util-count {
  min-width: 18px;
  text-align: center;
  font-variant-numeric: tabular-nums;
  background: var(--sunk);
  border-radius: 999px;
  padding: 0 6px;
}

.util-btn.active .util-count {
  background: var(--surface);
}

@keyframes pop {
  50% { transform: scale(1.35); }
}

@media (prefers-reduced-motion: reduce) {
  .util-btn.active .util-icon { animation: none; }
}
</style>
