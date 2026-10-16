import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'

createApp(App).mount('#app')

// Retira la animación de inicio cuando la app ya está montada.
// Se respeta un tiempo mínimo para que la animación no parpadee, pero nunca se retrasa la carga de la app.
const splash = document.getElementById('splash')
if (splash) {
  const root = document.documentElement
  const minimo = root.classList.contains('intro') ? 1100 : 0
  const espera = Math.max(0, minimo - performance.now())

  setTimeout(() => {
    root.classList.remove('intro')
    splash.classList.add('salir')
    // Se elimina del DOM al terminar el desvanecimiento para no dejar capas extra.
    setTimeout(() => splash.remove(), 500)
  }, espera)
}
