import { ALL_KEYS } from '../data/constants.js'

export function words(t) {
  t = (t || '').trim()
  return t ? t.split(/\s+/).length : 0
}

export function blank() {
  const o = {}
  ALL_KEYS.forEach(k => {
    o[k] = ''
  })
  return o
}

export function fmtTime(d) {
  try {
    const date = typeof d === 'string' ? new Date(d) : d
    return date.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })
  } catch (e) {
    return ''
  }
}

export function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleString('es-CO', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit'
    })
  } catch (e) {
    return ''
  }
}

export function slug(s) {
  return (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export function pdfSafe(t) {
  return (t || '')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/•/g, '-')
    .replace(/…/g, '...')
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, '')
}
