<template>
  <form class="marcar" @submit.prevent="enviar">
    <div>
      <h3>✅ Marcar mi asistencia de hoy</h3>
      <p class="nota">Escribe el código que el profe tiene en el tablero. Cambia cada 3 minutos.</p>
    </div>
    <div class="fila">
      <label for="codigo-asistencia" class="sr-only">Código del tablero</label>
      <input
        id="codigo-asistencia"
        class="inp codigo"
        :value="codigo"
        maxlength="4"
        autocomplete="off"
        autocapitalize="characters"
        spellcheck="false"
        placeholder="ABCD"
        @input="codigo = $event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4); $event.target.value = codigo"
      />
      <button class="btn primary" type="submit" :disabled="enviando || codigo.length !== 4">
        {{ enviando ? 'Marcando…' : 'Marcar' }}
      </button>
    </div>
    <p v-if="mensaje" :class="['resultado', tono]" role="status">{{ mensaje }}</p>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { marcarmeConCodigo } from '../services/api.js'

const emit = defineEmits(['marcada'])

const codigo = ref('')
const enviando = ref(false)
const mensaje = ref('')
const tono = ref('ok')

async function enviar() {
  enviando.value = true
  mensaje.value = ''
  try {
    const { yaEstaba } = await marcarmeConCodigo(codigo.value)
    tono.value = 'ok'
    mensaje.value = yaEstaba ? '👌 Ya estabas marcado hoy, tranquilo.' : '🎉 ¡Listo! Quedaste marcado para hoy.'
    codigo.value = ''
    emit('marcada')
  } catch (e) {
    tono.value = 'mal'
    mensaje.value = '⚠️ ' + e.message
  } finally {
    enviando.value = false
  }
}
</script>

<style scoped>
.marcar {
  border-left: 5px solid var(--ok);
  background: color-mix(in srgb, var(--ok) 8%, transparent);
  border-radius: var(--r);
  padding: 14px 16px;
  margin: 0 0 16px;
}

.marcar h3 {
  margin: 0 0 4px;
}

.nota {
  color: var(--muted);
  font-size: 14px;
  margin: 0 0 10px;
}

.fila {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.codigo {
  max-width: 160px;
  font-family: var(--f-mono);
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: .3em;
  text-align: center;
  text-transform: uppercase;
}

.resultado {
  margin: 10px 0 0;
  font-weight: 600;
}

.resultado.ok {
  color: var(--ok);
}

.resultado.mal {
  color: var(--bad);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
