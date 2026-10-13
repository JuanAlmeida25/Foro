// Punto de entrada de la API en Vercel.
// Vercel ejecuta este archivo como función y le pasa todas las peticiones /api/*
// (ver "rewrites" en vercel.json). Es la misma app Express que se usa en local.
import app from '../server/app.js'

export default app
