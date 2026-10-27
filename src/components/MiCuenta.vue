<template>
  <!-- Ya entró: sus datos, lo que le falta (tipo de documento y firma) y el botón de salir -->
  <section v-if="aprendiz" class="sheet cuenta">
    <div class="sheet-head">
      <div>
        <h2>¡Quiubo, {{ aprendiz.nombre.split(' ')[0] }}! 👋</h2>
        <p>Ya estás adentro. Lo que publiques y repliques en el foro sale con el nombre de tu cuenta.</p>
      </div>
      <button class="btn sm" type="button" @click="salir">🚪 Salir</button>
    </div>

    <div class="sheet-body">
      <dl class="datos">
        <div><dt>Nombre</dt><dd>{{ aprendiz.nombre }}</dd></div>
        <div><dt>Documento</dt><dd>{{ aprendiz.tipoDocumento }} {{ aprendiz.documento }}</dd></div>
        <div v-if="aprendiz.ficha"><dt>Ficha</dt><dd>{{ aprendiz.ficha }}</dd></div>
        <div><dt>Firma</dt><dd>{{ aprendiz.tieneFirma ? '✔ Guardada' : 'Falta' }}</dd></div>
      </dl>

      <div v-if="!aprendiz.tipoDocumento" class="pendiente">
        <h3>🪪 Falta tu tipo de documento</h3>
        <p>Lo pide la planilla de asistencia del SENA.</p>
        <div class="fila">
          <label for="tipo-pendiente" class="sr-only">Tipo de documento</label>
          <select id="tipo-pendiente" v-model="tipoPendiente" class="inp">
            <option value="" disabled>Escoge uno…</option>
            <option v-for="t in TIPOS_DOCUMENTO" :key="t.valor" :value="t.valor">{{ t.texto }}</option>
          </select>
          <button class="btn primary" type="button" :disabled="guardandoPerfil" @click="guardarTipo">Guardar</button>
        </div>
      </div>

      <div v-if="!aprendiz.tieneFirma" class="pendiente">
        <h3>✍️ Falta tu firma</h3>
        <p>Fírmate una sola vez, como en tu documento. Tu instructor la pone en la planilla de asistencia los días que vengas.</p>
        <PadFirma ref="pad" />
        <div class="fila">
          <button class="btn" type="button" @click="pad?.limpiar()">🧽 Borrar y repetir</button>
          <button class="btn primary" type="button" :disabled="guardandoPerfil" @click="guardarFirma">
            {{ guardandoPerfil ? 'Guardando…' : '💾 Guardar mi firma' }}
          </button>
        </div>
      </div>
      <p v-if="errorPerfil" class="ojo" role="alert">⚠️ {{ errorPerfil }}</p>

      <MarcarAsistencia @marcada="boletin?.cargar()" />
      <BoletinAprendiz ref="boletin" />

      <p class="nota">¿Un dato mal escrito? Díselo a tu instructor y te lo corrige.</p>
      <div class="fila">
        <button class="btn primary" type="button" @click="emit('ir-a', 'editor')">✍️ Redactar mi aporte</button>
        <button class="btn" type="button" @click="emit('ir-a', 'foro')">Ir al foro →</button>
      </div>
      <p class="nota">Si estás en un computador del salón, dale <strong>Salir</strong> al terminar. Igual se cierra sola al cerrar la pestaña.</p>
    </div>
  </section>

  <!-- No ha entrado: entrar o registrarse -->
  <section v-else class="sheet cuenta">
    <div class="sheet-head">
      <div>
        <h2>👤 Tu cuenta de aprendiz</h2>
        <p>
          Regístrate una sola vez con tu documento y un PIN de 4 números. Con tu cuenta publicas y replicas en el foro,
          y tu firma sale en la planilla de asistencia.
        </p>
      </div>
    </div>

    <div class="sheet-body">
      <div class="modos" role="tablist" aria-label="Entrar o registrarse">
        <button
          type="button"
          role="tab"
          :aria-selected="modo === 'entrar'"
          :class="['btn', 'sm', { primary: modo === 'entrar' }]"
          @click="cambiarModo('entrar')"
        >
          🔑 Ya tengo cuenta
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="modo === 'registro'"
          :class="['btn', 'sm', { primary: modo === 'registro' }]"
          @click="cambiarModo('registro')"
        >
          📋 Es mi primera vez
        </button>
      </div>

      <form class="formulario" novalidate @submit.prevent="enviar">
        <template v-if="modo === 'registro'">
          <label class="lbl" for="registro-nombre">Nombre completo</label>
          <input id="registro-nombre" v-model="nombre" class="inp" autocomplete="name" maxlength="80" placeholder="Ej: Laura Gómez Pushaina" />

          <label class="lbl" for="registro-tipo">Tipo de documento</label>
          <select id="registro-tipo" v-model="tipoDocumento" class="inp">
            <option value="" disabled>Escoge uno…</option>
            <option v-for="t in TIPOS_DOCUMENTO" :key="t.valor" :value="t.valor">{{ t.texto }}</option>
          </select>
        </template>

        <label class="lbl" for="registro-documento">Número de documento</label>
        <input
          id="registro-documento"
          class="inp"
          :value="documento"
          inputmode="numeric"
          autocomplete="username"
          placeholder="Solo números"
          @input="documento = soloNumeros($event.target.value, 15); $event.target.value = documento"
        />

        <template v-if="modo === 'registro'">
          <label class="lbl" for="registro-ficha">Ficha <span class="opcional">(si te la sabes)</span></label>
          <input
            id="registro-ficha"
            class="inp"
            :value="ficha"
            inputmode="numeric"
            placeholder="Ej: 2977456"
            @input="ficha = soloNumeros($event.target.value, 12); $event.target.value = ficha"
          />
        </template>

        <div :class="['pines', { doble: modo === 'registro' }]">
          <div>
            <label class="lbl" for="registro-pin">{{ modo === 'registro' ? 'Inventa un PIN de 4 números' : 'Tu PIN' }}</label>
            <input
              id="registro-pin"
              class="inp pin"
              :value="pin"
              type="password"
              inputmode="numeric"
              :autocomplete="modo === 'registro' ? 'new-password' : 'current-password'"
              maxlength="4"
              placeholder="••••"
              @input="pin = soloNumeros($event.target.value, 4); $event.target.value = pin"
            />
          </div>
          <div v-if="modo === 'registro'">
            <label class="lbl" for="registro-pin-2">Escríbelo otra vez</label>
            <input
              id="registro-pin-2"
              class="inp pin"
              :value="pinOtraVez"
              type="password"
              inputmode="numeric"
              autocomplete="new-password"
              maxlength="4"
              placeholder="••••"
              @input="pinOtraVez = soloNumeros($event.target.value, 4); $event.target.value = pinOtraVez"
            />
          </div>
        </div>

        <p v-if="modo === 'registro'" class="nota">
          🤫 No uses tu fecha de cumpleaños ni 1234, y no se lo digas a nadie: con tu PIN, otro podría publicar en el foro a tu nombre.
        </p>
        <p v-else class="nota">Tienes 3 intentos. Si fallas los 3, tu cuenta se bloquea 15 minutos.</p>

        <div v-if="segundosBloqueo" class="bloqueo" role="alert">
          <strong>🔒 Cuenta bloqueada</strong>
          <p>{{ error }}</p>
          <p class="reloj">Podrás intentar de nuevo en <strong>{{ cuentaRegresiva }}</strong></p>
        </div>
        <p v-else-if="error" class="ojo" role="alert">⚠️ {{ error }}</p>

        <button type="submit" class="btn primary" :disabled="enviando || segundosBloqueo > 0">
          {{ enviando ? 'Un momentico…' : modo === 'registro' ? '📋 Registrarme' : '🔑 Entrar' }}
        </button>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { aprendiz, registrarAprendiz, entrarAprendiz, salirAprendiz, completarPerfil } from '../services/sesionAprendiz.js'
import PadFirma from './PadFirma.vue'
import MarcarAsistencia from './MarcarAsistencia.vue'
import BoletinAprendiz from './BoletinAprendiz.vue'

const emit = defineEmits(['ir-a', 'toast'])

const TIPOS_DOCUMENTO = [
  { valor: 'CC', texto: 'CC · Cédula de ciudadanía' },
  { valor: 'TI', texto: 'TI · Tarjeta de identidad' },
  { valor: 'CE', texto: 'CE · Cédula de extranjería' },
  { valor: 'PPT', texto: 'PPT · Permiso por protección temporal' },
  { valor: 'PEP', texto: 'PEP · Permiso especial de permanencia' }
]

const modo = ref('entrar')
const nombre = ref('')
const documento = ref('')
const ficha = ref('')
const tipoDocumento = ref('')
const pin = ref('')
const pinOtraVez = ref('')
const error = ref('')
const enviando = ref(false)

// Cuando el servidor bloquea la cuenta, se muestra la cuenta regresiva hasta que se pueda volver a intentar
const bloqueadoHasta = ref(0)
const ahora = ref(Date.now())
let reloj = null
const segundosBloqueo = computed(() => Math.max(0, Math.ceil((bloqueadoHasta.value - ahora.value) / 1000)))
const cuentaRegresiva = computed(() => {
  const s = segundosBloqueo.value
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
})

function arrancarReloj() {
  clearInterval(reloj)
  reloj = setInterval(() => {
    ahora.value = Date.now()
    if (!segundosBloqueo.value) {
      clearInterval(reloj)
      error.value = ''
    }
  }, 1000)
}
onBeforeUnmount(() => clearInterval(reloj))

// Solo números: en el celular sale el teclado numérico y si pegan con espacios o puntos, se limpian
const soloNumeros = (valor, largo) => valor.replace(/\D/g, '').slice(0, largo)

function cambiarModo(nuevo) {
  modo.value = nuevo
  error.value = ''
  pin.value = ''
  pinOtraVez.value = ''
}

function validar() {
  if (modo.value === 'registro') {
    if (nombre.value.trim().length < 5 || !nombre.value.trim().includes(' ')) return 'Escribe tu nombre completo (nombre y apellido).'
    if (!tipoDocumento.value) return 'Escoge tu tipo de documento.'
  }
  if (documento.value.length < 6) return 'Escribe tu número de documento (mínimo 6 números).'
  if (!/^\d{4}$/.test(pin.value)) return 'El PIN son 4 números.'
  if (modo.value === 'registro' && pin.value !== pinOtraVez.value) return 'Los dos PIN no son iguales. Escríbelos otra vez.'
  return ''
}

async function enviar() {
  error.value = validar()
  if (error.value) return
  enviando.value = true
  try {
    if (modo.value === 'registro') {
      await registrarAprendiz({
        nombre: nombre.value,
        documento: documento.value,
        tipoDocumento: tipoDocumento.value,
        ficha: ficha.value,
        pin: pin.value
      })
      emit('toast', '¡Cuenta creada! Ya puedes publicar en el foro')
    } else {
      await entrarAprendiz(documento.value, pin.value)
      emit('toast', '¡Bienvenido de vuelta!')
    }
    nombre.value = ''
    ficha.value = ''
    tipoDocumento.value = ''
  } catch (e) {
    error.value = e.message
    if (e.datos?.bloqueado) {
      bloqueadoHasta.value = e.datos.bloqueadoHasta
      ahora.value = Date.now()
      arrancarReloj()
    }
  } finally {
    pin.value = ''
    pinOtraVez.value = ''
    enviando.value = false
  }
}

// Para refrescar el boletín apenas se marca la asistencia
const boletin = ref(null)

/* ----- Completar el perfil: tipo de documento y firma ----- */
const pad = ref(null)
const tipoPendiente = ref('')
const errorPerfil = ref('')
const guardandoPerfil = ref(false)

async function guardarPerfil(datos) {
  errorPerfil.value = ''
  guardandoPerfil.value = true
  try {
    await completarPerfil(datos)
    emit('toast', 'Datos guardados')
  } catch (e) {
    errorPerfil.value = e.message
  } finally {
    guardandoPerfil.value = false
  }
}

function guardarTipo() {
  if (!tipoPendiente.value) {
    errorPerfil.value = 'Escoge tu tipo de documento.'
    return
  }
  guardarPerfil({ tipoDocumento: tipoPendiente.value })
}

function guardarFirma() {
  const firma = pad.value?.aImagen()
  if (!firma) {
    errorPerfil.value = 'Primero dibuja tu firma en el recuadro.'
    return
  }
  if (!window.confirm('¿Guardar esta firma? Solo se hace una vez y es la que va a salir en la planilla de asistencia.')) return
  guardarPerfil({ firma })
}

function salir() {
  salirAprendiz()
  documento.value = ''
  cambiarModo('entrar')
  emit('toast', 'Sesión cerrada')
}
</script>

<style scoped>
.cuenta {
  max-width: 720px;
  margin-inline: auto;
}

.modos {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding-block: 18px 6px;
}

.formulario {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 460px;
}

.formulario .lbl {
  margin-top: 10px;
}

.opcional {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 400;
}

.pines {
  display: grid;
  gap: 12px;
}

.pines.doble {
  grid-template-columns: 1fr 1fr;
}

.pin {
  font-size: 1.4rem;
  letter-spacing: 0.4em;
  text-align: center;
}

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

.bloqueo {
  border-left: 5px solid var(--bad);
  background: color-mix(in srgb, var(--bad) 10%, transparent);
  border-radius: var(--r);
  padding: 12px 14px;
  margin: 10px 0;
  color: var(--bad);
}

.bloqueo p {
  margin: 6px 0 0;
  color: var(--fg);
}

.bloqueo .reloj strong {
  font-family: var(--f-display);
  font-size: 1.3rem;
  color: var(--bad);
}

.datos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
  margin: 18px 0;
}

.datos div {
  background: var(--sunk);
  border-radius: var(--r);
  padding: 10px 14px;
}

.datos dt {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--muted);
}

.datos dd {
  margin: 2px 0 0;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.pendiente {
  border-left: 5px solid var(--warn);
  background: color-mix(in srgb, var(--warn) 10%, transparent);
  border-radius: var(--r);
  padding: 14px 16px;
  margin: 0 0 16px;
}

.pendiente h3 {
  margin: 0 0 4px;
}

.pendiente p {
  color: var(--muted);
  margin: 0 0 10px;
}

.fila {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 10px;
}

.fila select {
  max-width: 320px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (max-width: 480px) {
  .pines.doble {
    grid-template-columns: 1fr;
  }
}
</style>
