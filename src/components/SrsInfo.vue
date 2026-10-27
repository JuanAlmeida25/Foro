<template>
  <div class="srs-view">
    <header class="srs-header">
      <div class="srs-badges">
        <span class="pill-info">📄 Guía de requisitos</span>
        <span class="pill-rol">SENA • ADSO</span>
      </div>
      <h2>SRS: Especificación de Requisitos de Software</h2>
      <p>
        El SRS (en español, <strong>ERS</strong>) es el documento donde se escribe qué debe hacer un software y con qué
        calidad, antes de diseñarlo y programarlo. Aquí verás para qué sirve, cómo se arma, cómo se redacta un buen
        requisito y qué normas y leyes lo rigen.
      </p>
    </header>

    <nav class="srs-tabs" aria-label="Temas del SRS">
      <button
        v-for="s in SECCIONES_SRS"
        :key="s.id"
        :class="['srs-tab', { active: seccion === s.id }]"
        type="button"
        :aria-pressed="seccion === s.id"
        @click="seccion = s.id"
      >
        <span aria-hidden="true">{{ s.icono }}</span>
        {{ s.titulo }}
      </button>
    </nav>

    <!-- ¿Qué es? -->
    <section v-if="seccion === 'concepto'" class="srs-bloque">
      <div class="bloque-head">
        <span class="tag">Concepto</span>
        <h3>¿Qué es un SRS?</h3>
        <p>
          Es la <strong>Software Requirements Specification</strong>: un documento formal que describe completo el
          comportamiento esperado del sistema. Trae los requisitos funcionales (lo que hace), los no funcionales (qué tan
          bien lo hace) y las restricciones (lo que no se puede negociar, como una ley o una tecnología impuesta).
          Es como los planos de una casa: nadie sensato pega ladrillos sin ellos. 🧱
        </p>
      </div>

      <div class="tarjetas">
        <article v-for="t in PARA_QUE_SIRVE" :key="t.titulo" class="tarjeta">
          <div class="tarjeta-ico" aria-hidden="true">{{ t.icono }}</div>
          <h4>{{ t.titulo }}</h4>
          <p>{{ t.texto }}</p>
        </article>
      </div>

      <h4 class="subtitulo">SRS frente a ficha técnica</h4>
      <div class="tabla-scroll">
        <table class="tabla">
          <thead>
            <tr>
              <th scope="col"></th>
              <th scope="col">📄 SRS</th>
              <th scope="col">📘 Ficha técnica</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in SRS_VS_FICHA" :key="f.aspecto">
              <th scope="row">{{ f.aspecto }}</th>
              <td>{{ f.srs }}</td>
              <td>{{ f.ficha }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Estructura -->
    <section v-else-if="seccion === 'estructura'" class="srs-bloque">
      <div class="bloque-head">
        <span class="tag">Plantilla</span>
        <h3>Estructura de un SRS</h3>
        <p>
          Esta es la plantilla clásica de la IEEE 830, que la ISO/IEC/IEEE 29148 retoma con pocos cambios.
          Cada empresa la adapta, pero estas partes casi nunca faltan.
        </p>
      </div>

      <ol class="estructura">
        <li v-for="p in ESTRUCTURA_SRS" :key="p.numero" class="estructura-item">
          <div class="estructura-num" aria-hidden="true">{{ p.numero }}</div>
          <div>
            <h4>{{ p.titulo }}</h4>
            <p class="muted">{{ p.descripcion }}</p>
            <ul>
              <li v-for="parte in p.partes" :key="parte">{{ parte }}</li>
            </ul>
          </div>
        </li>
      </ol>
    </section>

    <!-- Buenos requisitos -->
    <section v-else-if="seccion === 'requisitos'" class="srs-bloque">
      <div class="bloque-head">
        <span class="tag">Redacción</span>
        <h3>¿Cómo se escribe un buen requisito?</h3>
        <p>
          La ISO/IEC/IEEE 29148 pide que cada requisito cumpla estas características. Un truco: si no se te ocurre
          cómo probarlo, todavía no está bien escrito.
        </p>
      </div>

      <div class="caracteristicas">
        <div v-for="c in CARACTERISTICAS_REQUISITO" :key="c.nombre" class="caracteristica">
          <strong>{{ c.nombre }}</strong>
          <span>{{ c.detalle }}</span>
        </div>
      </div>

      <h4 class="subtitulo">Del requisito flojo al requisito bien hecho</h4>
      <div class="ejemplos">
        <article v-for="(e, i) in EJEMPLOS_REQUISITO" :key="i" class="ejemplo">
          <p class="malo"><span aria-hidden="true">❌</span> <span class="sr-only">Mal escrito:</span> {{ e.malo }}</p>
          <p class="bueno"><span aria-hidden="true">✅</span> <span class="sr-only">Bien escrito:</span> {{ e.bueno }}</p>
          <p class="porque">💡 {{ e.porque }}</p>
        </article>
      </div>
    </section>

    <!-- Normas internacionales -->
    <section v-else-if="seccion === 'normas'" class="srs-bloque">
      <div class="bloque-head">
        <span class="tag">Estándares</span>
        <h3>Normas internacionales que rigen el SRS</h3>
        <p>Las normas técnicas no son leyes: son acuerdos de buenas prácticas. Pero si el contrato o el cliente las exige, toca cumplirlas.</p>
      </div>

      <div class="normas">
        <article v-for="n in NORMAS_INTERNACIONALES" :key="n.codigo" class="norma">
          <div class="norma-top">
            <span class="codigo">{{ n.codigo }}</span>
            <span class="organismo">{{ n.organismo }}</span>
          </div>
          <h4>{{ n.nombre }}</h4>
          <p>{{ n.descripcion }}</p>
          <p class="en-srs"><strong>En el SRS:</strong> {{ n.enElSrs }}</p>
        </article>
      </div>
      <p class="aviso">⚠️ {{ ADVERTENCIA_VIGENCIA }}</p>
    </section>

    <!-- Leyes colombianas -->
    <section v-else-if="seccion === 'leyes'" class="srs-bloque">
      <div class="bloque-head">
        <span class="tag">Marco legal</span>
        <h3>Leyes colombianas que se vuelven requisitos</h3>
        <p>
          Ninguna ley dice «haga un SRS», pero varias obligan a que el software cumpla cosas. Esas obligaciones
          entran al SRS como restricciones o como requisitos, y si se olvidan, el problema ya no es técnico sino legal.
        </p>
      </div>

      <div class="normas">
        <article v-for="l in LEYES_COLOMBIANAS" :key="l.codigo" class="norma ley">
          <div class="norma-top">
            <span class="codigo">{{ l.codigo }}</span>
            <span class="organismo">{{ l.tipo }}</span>
          </div>
          <h4>{{ l.nombre }}</h4>
          <p>{{ l.descripcion }}</p>
          <p class="en-srs"><strong>Requisitos que salen de aquí:</strong></p>
          <ul>
            <li v-for="r in l.requisitos" :key="r">{{ r }}</li>
          </ul>
        </article>
      </div>
      <p class="aviso">⚠️ {{ ADVERTENCIA_VIGENCIA }}</p>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  SECCIONES_SRS,
  PARA_QUE_SIRVE,
  SRS_VS_FICHA,
  ESTRUCTURA_SRS,
  CARACTERISTICAS_REQUISITO,
  EJEMPLOS_REQUISITO,
  NORMAS_INTERNACIONALES,
  LEYES_COLOMBIANAS,
  ADVERTENCIA_VIGENCIA
} from '../data/srs.js'

const seccion = ref('concepto')
</script>

<style scoped>
.srs-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.srs-header {
  background: var(--surface);
  border: 1px solid var(--line);
  border-left: 6px solid var(--accent-2);
  border-radius: 12px;
  padding: 24px 28px;
  box-shadow: var(--shadow);
}

.srs-header h2 {
  font-family: var(--f-display);
  font-size: 26px;
  margin: 0 0 8px;
}

.srs-header p {
  color: var(--muted);
  font-size: 15px;
  max-width: 820px;
  margin: 0;
}

.srs-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.pill-info,
.pill-rol {
  font-size: 11.5px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: .05em;
}

.pill-info {
  color: var(--accent-2);
  background: color-mix(in srgb, var(--accent-2) 12%, var(--surface));
}

.pill-rol {
  color: var(--ok);
  background: color-mix(in srgb, var(--ok) 12%, var(--surface));
}

.srs-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.srs-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--muted);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: color .2s, border-color .2s, background .2s;
}

.srs-tab:hover {
  color: var(--fg);
}

.srs-tab.active {
  color: var(--accent-ink);
  background: var(--accent);
  border-color: var(--accent);
}

.srs-bloque {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 24px 28px;
  box-shadow: var(--shadow);
}

.bloque-head {
  margin-bottom: 20px;
}

.bloque-head h3 {
  font-family: var(--f-display);
  font-size: 22px;
  margin: 6px 0 8px;
}

.bloque-head p,
.muted {
  color: var(--muted);
  max-width: 820px;
}

.tag {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--accent);
}

.subtitulo {
  margin: 28px 0 12px;
  font-size: 17px;
}

.tarjetas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

.tarjeta {
  background: var(--sunk);
  border-radius: var(--r);
  padding: 16px 18px;
}

.tarjeta-ico {
  font-size: 26px;
}

.tarjeta h4 {
  margin: 6px 0 4px;
}

.tarjeta p {
  color: var(--muted);
  font-size: 14px;
  margin: 0;
}

.tabla-scroll {
  overflow-x: auto;
}

.tabla {
  width: 100%;
  min-width: 560px;
  border-collapse: collapse;
  font-size: 14px;
}

.tabla th,
.tabla td {
  text-align: left;
  vertical-align: top;
  padding: 10px 12px;
  border-bottom: 1px solid var(--line);
}

.tabla thead th {
  font-size: 13px;
  color: var(--muted);
}

.estructura {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.estructura-item {
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 14px;
  background: var(--sunk);
  border-radius: var(--r);
  padding: 16px 18px;
}

.estructura-num {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--accent);
  color: var(--accent-ink);
  font-family: var(--f-display);
  font-size: 20px;
  font-weight: 800;
}

.estructura-item h4 {
  margin: 0 0 4px;
}

.estructura-item ul,
.norma ul {
  margin: 8px 0 0;
  padding-left: 18px;
  font-size: 14px;
}

.caracteristicas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 10px;
}

.caracteristica {
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-left: 4px solid var(--ok);
  background: var(--sunk);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
}

.caracteristica span {
  color: var(--muted);
}

.ejemplos {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ejemplo {
  border: 1px solid var(--line);
  border-radius: var(--r);
  padding: 14px 16px;
}

.ejemplo p {
  margin: 0 0 6px;
  font-size: 14px;
  white-space: pre-line;
}

.malo {
  color: var(--bad);
  text-decoration: line-through;
  text-decoration-color: color-mix(in srgb, var(--bad) 50%, transparent);
}

.bueno {
  color: var(--ok);
  font-weight: 600;
}

.porque {
  color: var(--muted);
}

.normas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 14px;
}

.norma {
  background: var(--sunk);
  border-radius: var(--r);
  padding: 16px 18px;
  border-top: 4px solid var(--accent);
}

.norma.ley {
  border-top-color: var(--warn);
}

.norma-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  flex-wrap: wrap;
}

.codigo {
  font-family: var(--f-mono);
  font-size: 13px;
  font-weight: 700;
  color: var(--accent);
}

.norma.ley .codigo {
  color: var(--warn);
}

.organismo {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--muted);
}

.norma h4 {
  margin: 8px 0 6px;
}

.norma p {
  font-size: 14px;
  color: var(--muted);
  margin: 0 0 8px;
}

.norma .en-srs {
  color: var(--fg);
  margin: 0;
}

.aviso {
  margin: 18px 0 0;
  font-size: 13px;
  color: var(--muted);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (max-width: 560px) {
  .srs-header,
  .srs-bloque {
    padding: 18px 16px;
  }

  .normas {
    grid-template-columns: 1fr;
  }
}
</style>
