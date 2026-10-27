<template>
  <section>
    <div class="section-title" style="margin-bottom: 16px;">
      <div>
        <h2>👥 Aprendices registrados</h2>
        <p>
          Cada aprendiz se registra con su documento y un PIN de 4 números (el PIN va cifrado: ni tú lo puedes ver).
          Si falla el PIN 3 veces, su cuenta se bloquea 15 minutos. Si se le olvidó, dale <strong>PIN nuevo</strong> y díctaselo.
        </p>
      </div>
      <div class="actions">
        <button class="btn sm" type="button" :disabled="cargando" @click="cargar">
          {{ cargando ? 'Actualizando…' : '↻ Actualizar' }}
        </button>
        <button class="btn primary sm" type="button" :disabled="!aprendices.length" @click="exportarCsv">
          ⬇️ Exportar CSV
        </button>
      </div>
    </div>

    <p v-if="error" class="ojo" role="alert">⚠️ {{ error }}</p>

    <div v-if="pinNuevo" class="pin-nuevo" role="status">
      <p>PIN nuevo de <strong>{{ pinNuevo.nombre }}</strong>:</p>
      <p class="numero-pin">{{ pinNuevo.pin }}</p>
      <p class="nota">Díctaselo ya: no se vuelve a mostrar. Si quiere otro, se lo vuelves a reiniciar.</p>
      <button class="btn sm" type="button" @click="pinNuevo = null">Listo, ya se lo dije</button>
    </div>

    <div v-if="aprendices.length" class="cifras">
      <div><span>Registrados</span><strong>{{ aprendices.length }}</strong></div>
      <div><span>Bloqueados ahora</span><strong>{{ bloqueados }}</strong></div>
      <div><span>Sin firma todavía</span><strong>{{ sinFirma }}</strong></div>
      <div class="rojos"><span>🔴 En riesgo</span><strong>{{ enRiesgo }}</strong></div>
    </div>

    <label class="sr-only" for="buscar-aprendiz">Buscar por nombre, documento o ficha</label>
    <input id="buscar-aprendiz" v-model="busqueda" class="inp buscar" placeholder="🔎 Buscar por nombre, documento o ficha" />

    <p v-if="cargando" class="nota">Cargando aprendices…</p>
    <p v-else-if="!aprendices.length" class="nota">Todavía nadie se ha registrado. Diles que entren por 👤 Mi cuenta.</p>
    <p v-else-if="!filtrados.length" class="nota">Nadie coincide con «{{ busqueda }}».</p>

    <div v-else class="tabla-scroll">
      <table class="tabla">
        <thead>
          <tr>
            <th scope="col">Aprendiz</th>
            <th scope="col">Seguimiento</th>
            <th scope="col">Documento</th>
            <th scope="col">Ficha</th>
            <th scope="col">Firma</th>
            <th scope="col">Registrado</th>
            <th scope="col"><span class="sr-only">Acciones</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in filtrados" :key="a.documento">
            <template v-if="editando?.documento === a.documento">
              <td>
                <label class="sr-only" :for="`nombre-${a.documento}`">Nombre</label>
                <input :id="`nombre-${a.documento}`" v-model="editando.nombre" class="inp" maxlength="80" />
              </td>
              <td></td>
              <td>
                <label class="sr-only" :for="`tipo-${a.documento}`">Tipo de documento</label>
                <select :id="`tipo-${a.documento}`" v-model="editando.tipoDocumento" class="inp corto">
                  <option v-for="t in TIPOS_DOCUMENTO" :key="t" :value="t">{{ t }}</option>
                </select>
                {{ a.documento }}
              </td>
              <td>
                <label class="sr-only" :for="`ficha-${a.documento}`">Ficha</label>
                <input :id="`ficha-${a.documento}`" v-model="editando.ficha" class="inp corto" inputmode="numeric" maxlength="12" />
              </td>
              <td>{{ a.tieneFirma ? '✔' : '—' }}</td>
              <td>{{ fmtDate(a.fecha) }}</td>
              <td class="acciones">
                <button class="btn primary sm" type="button" :disabled="guardando" @click="guardarCambios">
                  {{ guardando ? 'Guardando…' : '💾 Guardar' }}
                </button>
                <button class="btn sm" type="button" @click="editando = null">Cancelar</button>
              </td>
            </template>
            <template v-else>
              <td>
                <strong>{{ a.nombre }}</strong>
                <small v-if="a.bloqueado" class="bloqueado">🔒 Bloqueado por fallar el PIN</small>
              </td>
              <td>
                <span
                  :class="['semaforo', a.semaforo?.color]"
                  :title="a.semaforo?.motivos.join(' · ') || 'Sin alertas'"
                >
                  <span class="luz" aria-hidden="true"></span>
                  {{ a.fallas }} {{ a.fallas === 1 ? 'falla' : 'fallas' }} · {{ a.aportes }} {{ a.aportes === 1 ? 'aporte' : 'aportes' }}
                </span>
                <small v-for="m in a.semaforo?.motivos || []" :key="m" class="motivo">{{ m }}</small>
              </td>
              <td>
                <span :class="['tipo', { falta: !a.tipoDocumento }]">{{ a.tipoDocumento || '¿?' }}</span>
                {{ a.documento }}
              </td>
              <td>{{ a.ficha || '—' }}</td>
              <td>
                <span v-if="a.tieneFirma" class="firmo">✔ Firmó</span>
                <span v-else class="sin-firma">Falta</span>
              </td>
              <td>{{ fmtDate(a.fecha) }}</td>
              <td class="acciones">
                <button class="btn sm" type="button" @click="editar(a)">✏️ Corregir</button>
                <button class="btn sm" type="button" @click="reiniciar(a)">🔑 PIN nuevo</button>
                <button v-if="a.tieneFirma" class="btn sm" type="button" @click="borrarFirma(a)">✍️ Borrar firma</button>
                <button class="btn danger sm" type="button" :aria-label="`Borrar la cuenta de ${a.nombre}`" @click="borrar(a)">🗑️</button>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  fetchAprendicesAdmin,
  corregirAprendiz,
  reiniciarPinAprendiz,
  borrarFirmaAprendiz,
  borrarAprendiz
} from '../services/api.js'
import { generarCsv } from '../utils/panel.js'
import { downloadFile } from '../utils/exporter.js'
import { fmtDate } from '../utils/text.js'

const emit = defineEmits(['toast'])

const TIPOS_DOCUMENTO = ['CC', 'TI', 'CE', 'PPT', 'PEP']

const cargando = ref(true)
const error = ref('')
const aprendices = ref([])
const busqueda = ref('')
const editando = ref(null)
const guardando = ref(false)
// El PIN nuevo se muestra una sola vez, para dictárselo al aprendiz
const pinNuevo = ref(null)

const filtrados = computed(() => {
  const texto = busqueda.value.trim().toLowerCase()
  if (!texto) return aprendices.value
  return aprendices.value.filter(a => `${a.nombre} ${a.documento} ${a.ficha}`.toLowerCase().includes(texto))
})
const bloqueados = computed(() => aprendices.value.filter(a => a.bloqueado).length)
const sinFirma = computed(() => aprendices.value.filter(a => !a.tieneFirma).length)
const enRiesgo = computed(() => aprendices.value.filter(a => a.semaforo?.color === 'rojo').length)

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    aprendices.value = (await fetchAprendicesAdmin()).aprendices
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
}

function editar(a) {
  editando.value = { documento: a.documento, nombre: a.nombre, tipoDocumento: a.tipoDocumento || 'CC', ficha: a.ficha }
  error.value = ''
}

async function guardarCambios() {
  guardando.value = true
  error.value = ''
  try {
    const { documento, nombre, tipoDocumento, ficha } = editando.value
    const { aprendiz } = await corregirAprendiz(documento, { nombre, tipoDocumento, ficha })
    const i = aprendices.value.findIndex(a => a.documento === documento)
    if (i >= 0) aprendices.value[i] = { ...aprendices.value[i], ...aprendiz }
    editando.value = null
    emit('toast', 'Datos corregidos')
  } catch (e) {
    error.value = e.message
  } finally {
    guardando.value = false
  }
}

async function reiniciar(a) {
  if (!window.confirm(`¿Darle un PIN nuevo a ${a.nombre}? El viejo deja de servir y se le cierra la sesión donde la tenga abierta.`)) return
  error.value = ''
  try {
    const { pin } = await reiniciarPinAprendiz(a.documento)
    pinNuevo.value = { nombre: a.nombre, documento: a.documento, pin }
    a.bloqueado = false
  } catch (e) {
    error.value = e.message
  }
}

async function borrarFirma(a) {
  if (!window.confirm(`¿Borrar la firma de ${a.nombre}? Tendrá que firmar otra vez desde su cuenta.`)) return
  error.value = ''
  try {
    await borrarFirmaAprendiz(a.documento)
    a.tieneFirma = false
    emit('toast', 'Firma borrada')
  } catch (e) {
    error.value = e.message
  }
}

async function borrar(a) {
  if (!window.confirm(`¿Borrar la cuenta de ${a.nombre} (${a.documento})? Se borran su firma y su asistencia; sus aportes se quedan en el foro.`)) return
  error.value = ''
  try {
    await borrarAprendiz(a.documento)
    aprendices.value = aprendices.value.filter(x => x.documento !== a.documento)
    if (pinNuevo.value?.documento === a.documento) pinNuevo.value = null
    emit('toast', 'Cuenta borrada')
  } catch (e) {
    error.value = e.message
  }
}

function exportarCsv() {
  const csv = generarCsv(aprendices.value, [
    { titulo: 'Nombre', valor: a => a.nombre },
    { titulo: 'Tipo doc', valor: a => a.tipoDocumento },
    { titulo: 'Documento', valor: a => a.documento },
    { titulo: 'Ficha', valor: a => a.ficha },
    { titulo: 'Firmó', valor: a => (a.tieneFirma ? 'Sí' : 'No') },
    { titulo: 'Asistencias', valor: a => a.asistencias },
    { titulo: 'Fallas', valor: a => a.fallas },
    { titulo: 'Aportes', valor: a => a.aportes },
    { titulo: 'Semáforo', valor: a => a.semaforo?.color },
    { titulo: 'Motivos', valor: a => a.semaforo?.motivos.join(' · ') },
    { titulo: 'Registrado', valor: a => fmtDate(a.fecha) }
  ])
  const hoy = new Date().toISOString().slice(0, 10)
  downloadFile(`aprendices-${hoy}.csv`, new Blob([csv], { type: 'text/csv;charset=utf-8' }))
}

onMounted(cargar)
</script>

<style scoped>
.nota {
  color: var(--muted);
  font-size: 14px;
  margin: 10px 0;
}

.ojo {
  color: var(--bad);
  font-weight: 600;
  margin: 10px 0;
}

.pin-nuevo {
  border-left: 5px solid var(--ok);
  background: color-mix(in srgb, var(--ok) 10%, transparent);
  border-radius: var(--r);
  padding: 12px 16px;
  margin-bottom: 16px;
}

.pin-nuevo p {
  margin: 0 0 6px;
}

.numero-pin {
  font-family: var(--f-mono);
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: 0.3em;
  color: var(--ok);
}

.cifras {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.cifras div {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r);
  padding: 10px 14px;
}

.cifras span {
  display: block;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--muted);
}

.cifras strong {
  font-family: var(--f-display);
  font-size: 1.6rem;
}

.buscar {
  max-width: 420px;
  margin-bottom: 12px;
}

.tabla-scroll {
  overflow-x: auto;
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: var(--surface);
}

.tabla {
  border-collapse: collapse;
  width: 100%;
  min-width: 760px;
}

.tabla th,
.tabla td {
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid var(--line);
  vertical-align: middle;
}

.tabla thead th {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--muted);
}

.tabla small {
  display: block;
}

.bloqueado {
  color: var(--bad);
  font-weight: 600;
}

.cifras .rojos strong {
  color: var(--bad);
}

.semaforo {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  white-space: nowrap;
}

.luz {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--muted);
}

.semaforo.verde .luz { background: var(--ok); }
.semaforo.amarillo .luz { background: var(--warn); }
.semaforo.rojo .luz { background: var(--bad); }
.semaforo.rojo { color: var(--bad); }

.motivo {
  color: var(--muted);
  font-size: 12px;
}

.tipo {
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  background: var(--accent-soft);
  color: var(--accent);
  border-radius: 6px;
  padding: 1px 6px;
  margin-right: 4px;
}

.tipo.falta {
  background: color-mix(in srgb, var(--warn) 15%, transparent);
  color: var(--warn);
}

.firmo {
  color: var(--ok);
  font-weight: 700;
}

.sin-firma {
  color: var(--warn);
  font-weight: 700;
}

.acciones {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.corto {
  max-width: 120px;
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
