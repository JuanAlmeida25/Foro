import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  hashClave,
  verificarClave,
  esHash,
  crearSesionAdmin,
  sesionAdminValida,
  esClaveAdmin
} from '../server/seguridad.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

test('Las claves de autor se guardan cifradas y se verifican correctamente', async () => {
  const hash = await hashClave('1234')
  assert.ok(esHash(hash), 'Debe quedar en formato scrypt')
  assert.ok(!hash.includes('1234'), 'El hash no debe contener la clave original')
  assert.notEqual(hash, await hashClave('1234'), 'Cada hash usa una sal distinta')

  assert.equal(await verificarClave('1234', hash), true)
  assert.equal(await verificarClave('1235', hash), false)
  assert.equal(await verificarClave('', hash), false)
  assert.equal(await verificarClave('1234', ''), false, 'Un aporte sin clave no se abre con ninguna clave')
  assert.equal(await verificarClave('1234', 'scrypt$basura'), false, 'Un hash dañado nunca valida')
})

test('El token de sesión de administrador no se puede falsificar', () => {
  const { token, expira } = crearSesionAdmin()
  assert.ok(expira > Date.now())
  assert.equal(sesionAdminValida(token), true)

  const [rol, fecha, firma] = token.split('.')
  assert.equal(sesionAdminValida(`${rol}.${Number(fecha) + 1000}.${firma}`), false, 'Cambiar la fecha invalida la firma')
  assert.equal(sesionAdminValida(`${rol}.${fecha}.${firma.slice(0, -2)}xx`), false, 'Una firma alterada no vale')
  assert.equal(sesionAdminValida(`admin.${Date.now() - 1}.${firma}`), false, 'Un token vencido no vale')
  assert.equal(sesionAdminValida(''), false)
  assert.equal(sesionAdminValida('CLAVE-VIEJA'), false)
})

test('Solo la clave de administrador exacta es aceptada', () => {
  assert.equal(esClaveAdmin(''), false)
  assert.equal(esClaveAdmin(undefined), false)
  assert.equal(esClaveAdmin('clave-equivocada'), false)
})

test('La clave de administrador no aparece en el código del navegador', () => {
  const archivos = [
    '../src/App.vue',
    '../src/services/api.js',
    '../src/components/AporteDetalle.vue',
    '../src/components/ForoList.vue'
  ]
  for (const archivo of archivos) {
    const contenido = fs.readFileSync(path.join(__dirname, archivo), 'utf8')
    assert.doesNotMatch(contenido, /['"`]CLAVE-VIEJA['"`]/, `${archivo} no debe contener la clave CLAVE-VIEJA`)
  }
})

test('La antigua clave pública CLAVE-VIEJA ya no abre el modo admin', () => {
  assert.equal(esClaveAdmin('CLAVE-VIEJA'), false)
  const codigo = fs.readFileSync(path.join(__dirname, '../server/seguridad.js'), 'utf8')
  assert.doesNotMatch(codigo, /['"`]CLAVE-VIEJA['"`]/, 'El servidor no debe traer una clave por defecto')
})

test('El solucionario del caso no viaja en el código del navegador', () => {
  assert.equal(fs.existsSync(path.join(__dirname, '../src/data/casoFichaSolucionario.js')), false)
  const componente = fs.readFileSync(path.join(__dirname, '../src/components/ActividadFichaCaso.vue'), 'utf8')
  assert.doesNotMatch(componente, /casoFichaSolucionario/, 'El componente no debe importar el solucionario')
})

test('API: el solucionario solo se le entrega al administrador', async () => {
  const { default: app } = await import('../server/app.js')
  // Esta ruta no toca la base de datos, así que basta con un adaptador de mentiras
  app.set('obtenerDb', () => ({}))

  const servidor = app.listen(0)
  await new Promise(resolve => servidor.once('listening', resolve))
  const url = `http://127.0.0.1:${servidor.address().port}/api/admin/caso-ficha/solucionario`

  try {
    assert.equal((await fetch(url)).status, 403, 'Sin token no hay solucionario')

    const conTokenFalso = await fetch(url, { headers: { Authorization: 'Bearer admin.9999999999999.chimbo' } })
    assert.equal(conTokenFalso.status, 401)

    const res = await fetch(url, { headers: { Authorization: `Bearer ${crearSesionAdmin().token}` } })
    assert.equal(res.status, 200)
    assert.equal(res.headers.get('cache-control'), 'no-store')
    const datos = await res.json()
    assert.ok(datos.VACIOS.length > 0)
    assert.ok(datos.FICHA_RESUELTA.length > 0)
    assert.ok(datos.RESPUESTAS_ESPERADAS.length > 0)
    assert.ok(datos.ERRORES_FRECUENTES.length > 0)
  } finally {
    await new Promise(resolve => servidor.close(resolve))
  }
})
