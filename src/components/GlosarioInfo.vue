<template>
  <div class="glo-view">
    <!-- Encabezado con buscador -->
    <header class="glo-header-card">
      <div class="glo-header-badge">
        <span class="badge-info-pill">📖 Glosario</span>
        <span class="badge-role-pill">{{ TERMINOS.length }} términos</span>
      </div>
      <h2 class="glo-header-title">Glosario de licenciamiento de software</h2>
      <p class="glo-header-desc">
        Escribe cualquier palabra y verás su significado al instante. La búsqueda no distingue tildes ni mayúsculas
        e incluye sinónimos y definiciones.
      </p>

      <div class="search-box">
        <span class="search-icon" aria-hidden="true">🔍</span>
        <input
          ref="campoBusqueda"
          v-model="consulta"
          class="search-input"
          type="search"
          placeholder="Ej.: copyleft, EULA, derechos morales, SaaS…"
          aria-label="Buscar en el glosario"
          autocomplete="off"
          @keydown.esc="limpiar"
        />
        <button v-if="consulta" class="search-clear" type="button" aria-label="Borrar búsqueda" @click="limpiar">✕</button>
      </div>
    </header>

    <!-- Filtros: categorías e índice alfabético -->
    <div class="glo-filters">
      <div class="chip-row" role="group" aria-label="Filtrar por categoría">
        <button
          :class="['chip', { active: categoria === 'todas' }]"
          type="button"
          @click="categoria = 'todas'"
        >
          Todas
        </button>
        <button
          v-for="c in CATEGORIAS_GLOSARIO"
          :key="c.id"
          :class="['chip', { active: categoria === c.id }]"
          type="button"
          @click="categoria = c.id"
        >
          {{ c.icono }} {{ c.nombre }}
        </button>
      </div>

      <div class="az-row" role="group" aria-label="Índice alfabético">
        <button
          v-for="letra in letras"
          :key="letra"
          :class="['az-btn', { active: letraActiva === letra }]"
          :disabled="!letrasConTerminos.has(letra)"
          type="button"
          @click="elegirLetra(letra)"
        >
          {{ letra }}
        </button>
      </div>
    </div>

    <p class="glo-count" aria-live="polite">
      <template v-if="resultados.length">
        {{ resultados.length }} {{ resultados.length === 1 ? 'término' : 'términos' }}
        <span v-if="consulta.trim()">para «{{ consulta.trim() }}»</span>
      </template>
    </p>

    <!-- Resultados -->
    <div v-if="resultados.length" class="glo-grid">
      <article v-for="t in resultados" :key="t.id" class="term-card">
        <div class="term-head">
          <h3 class="term-title">
            <template v-for="(s, i) in resaltar(t.termino, consulta)" :key="i">
              <mark v-if="s.marca">{{ s.texto }}</mark><template v-else>{{ s.texto }}</template>
            </template>
          </h3>
          <span class="term-cat">{{ nombreCategoria(t.categoria) }}</span>
        </div>

        <p v-if="t.sinonimos.length" class="term-syn">
          También: <template v-for="(sin, j) in t.sinonimos" :key="sin">
            <template v-for="(s, i) in resaltar(sin, consulta)" :key="i">
              <mark v-if="s.marca">{{ s.texto }}</mark><template v-else>{{ s.texto }}</template>
            </template><template v-if="j < t.sinonimos.length - 1">, </template>
          </template>
        </p>

        <p class="term-def">
          <template v-for="(s, i) in resaltar(t.definicion, consulta)" :key="i">
            <mark v-if="s.marca">{{ s.texto }}</mark><template v-else>{{ s.texto }}</template>
          </template>
        </p>

        <p v-if="t.ejemplo" class="term-ej">
          <b>Ejemplo:</b>
          <template v-for="(s, i) in resaltar(t.ejemplo, consulta)" :key="i">
            <mark v-if="s.marca">{{ s.texto }}</mark><template v-else>{{ s.texto }}</template>
          </template>
        </p>

        <div v-if="t.relacionados.length" class="term-rel">
          <span>Ver también:</span>
          <button
            v-for="rid in t.relacionados"
            :key="rid"
            class="rel-btn"
            type="button"
            @click="buscar(porId[rid].termino)"
          >
            {{ porId[rid].termino }}
          </button>
        </div>
      </article>
    </div>

    <!-- Sin resultados -->
    <div v-else class="glo-empty">
      <div class="empty-icon">🤔</div>
      <p>No encontramos «{{ consulta.trim() }}» en el glosario.</p>
      <div v-if="sugeridos.length" class="empty-sug">
        <span>¿Quisiste decir…?</span>
        <button v-for="s in sugeridos" :key="s.id" class="rel-btn" type="button" @click="buscar(s.termino)">
          {{ s.termino }}
        </button>
      </div>
      <button class="btn sm" type="button" @click="limpiar">Ver todos los términos</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { TERMINOS, CATEGORIAS_GLOSARIO } from '../data/glosario.js'
import { buscarTerminos, sugerencias, resaltar, inicial } from '../utils/glosario.js'

const consulta = ref('')
const categoria = ref('todas')
const letraActiva = ref('')
const campoBusqueda = ref(null)

const porId = Object.fromEntries(TERMINOS.map(t => [t.id, t]))
const letras = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('')

const enCategoria = computed(() =>
  categoria.value === 'todas' ? TERMINOS : TERMINOS.filter(t => t.categoria === categoria.value)
)

const letrasConTerminos = computed(() => new Set(enCategoria.value.map(t => inicial(t.termino))))

const resultados = computed(() => {
  const lista = buscarTerminos(enCategoria.value, consulta.value)
  return letraActiva.value ? lista.filter(t => inicial(t.termino) === letraActiva.value) : lista
})

// Las sugerencias buscan en todo el glosario, no solo en la categoría elegida
const sugeridos = computed(() => (resultados.value.length ? [] : sugerencias(TERMINOS, consulta.value)))

function nombreCategoria(id) {
  return CATEGORIAS_GLOSARIO.find(c => c.id === id)?.nombre ?? id
}

function buscar(texto) {
  consulta.value = texto
  categoria.value = 'todas'
  letraActiva.value = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function limpiar() {
  consulta.value = ''
  letraActiva.value = ''
  campoBusqueda.value?.focus()
}

function elegirLetra(letra) {
  letraActiva.value = letraActiva.value === letra ? '' : letra
  consulta.value = ''
}

// Al escribir se busca en todas las letras
watch(consulta, valor => {
  if (valor.trim()) letraActiva.value = ''
})

onMounted(() => campoBusqueda.value?.focus())
</script>

<style scoped>
.glo-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.glo-header-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-left: 6px solid var(--accent);
  border-radius: 16px;
  padding: 24px 28px;
  box-shadow: var(--shadow);
}

.glo-header-badge {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.badge-info-pill {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--accent);
  background: var(--accent-soft);
  padding: 4px 10px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: .05em;
}

.badge-role-pill {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--ok);
  background: color-mix(in srgb, var(--ok) 12%, var(--surface));
  padding: 4px 10px;
  border-radius: 999px;
}

.glo-header-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--fg);
  margin: 0 0 8px 0;
}

.glo-header-desc {
  font-size: 15px;
  color: var(--muted);
  line-height: 1.6;
  margin: 0 0 18px 0;
  max-width: 760px;
}

/* Buscador */
.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  font-size: 18px;
  pointer-events: none;
}

.search-input {
  width: 100%;
  font-size: 17px;
  padding: 14px 48px 14px 48px;
  border-radius: 14px;
  border: 2px solid var(--line);
  background: var(--sunk);
  transition: border-color .15s, box-shadow .15s, background .15s;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent);
  background: var(--surface);
  box-shadow: 0 0 0 4px var(--accent-soft);
}

.search-input::-webkit-search-cancel-button {
  display: none;
}

.search-clear {
  position: absolute;
  right: 10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: var(--line);
  color: var(--fg);
  cursor: pointer;
  font-size: 13px;
}

/* Filtros */
.glo-filters {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chip-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.chip {
  background: var(--surface);
  border: 1px solid var(--line);
  color: var(--muted);
  font-size: 13px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 999px;
  cursor: pointer;
}

.chip.active {
  background: var(--accent-soft);
  border-color: var(--accent);
  color: var(--accent);
}

.az-row {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.az-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--fg);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.az-btn:disabled {
  opacity: .35;
  cursor: default;
}

.az-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--accent-ink);
}

.glo-count {
  font-size: 13.5px;
  color: var(--muted);
  margin: 0;
  min-height: 1.2em;
}

/* Tarjetas */
.glo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

@media (max-width: 520px) {
  .glo-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

.term-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 18px 20px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.term-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.term-title {
  font-size: 19px;
  color: var(--fg);
}

.term-cat {
  font-size: 11px;
  font-weight: 600;
  color: var(--muted);
  background: var(--sunk);
  border: 1px solid var(--line);
  padding: 3px 8px;
  border-radius: 999px;
  white-space: nowrap;
}

.term-syn {
  font-size: 12.5px;
  color: var(--muted);
  font-style: italic;
}

.term-def {
  font-size: 14.5px;
  color: var(--fg);
  line-height: 1.6;
}

.term-ej {
  font-size: 13.5px;
  color: var(--muted);
  line-height: 1.5;
  background: var(--sunk);
  border-radius: 10px;
  padding: 8px 12px;
}

.term-ej b {
  color: var(--fg);
}

.term-rel {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
  font-size: 12.5px;
  color: var(--muted);
  border-top: 1px dashed var(--line);
  padding-top: 10px;
  margin-top: auto;
}

.rel-btn {
  background: var(--accent-soft);
  color: var(--accent);
  border: none;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}

.rel-btn:hover {
  filter: brightness(.96);
  text-decoration: underline;
}

mark {
  background: color-mix(in srgb, var(--warn) 28%, transparent);
  color: inherit;
  border-radius: 3px;
  padding: 0 1px;
}

/* Sin resultados */
.glo-empty {
  background: var(--surface);
  border: 1px dashed var(--line);
  border-radius: 16px;
  padding: 36px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--muted);
}

.empty-icon {
  font-size: 34px;
}

.empty-sug {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}

@media (max-width: 640px) {
  .glo-header-card {
    padding: 18px;
  }
}
</style>
