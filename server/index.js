// Servidor para desarrollo local (npm run dev / npm run server).
// En Vercel no se usa este archivo: la misma app se ejecuta desde api/index.js.
import app from './app.js'
import { dbEngine } from './database.js'

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor API corriendo en http://localhost:${PORT} (base de datos: ${dbEngine})`)
})
