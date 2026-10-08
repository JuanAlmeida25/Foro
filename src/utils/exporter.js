import { jsPDF } from 'jspdf'
import { TEXT_KEYS, TITLES } from '../data/constants.js'
import { slug, pdfSafe } from './text.js'

export function getAporteText(aporte) {
  const out = []
  out.push('Foro temático: Licenciamiento de software')
  const who = [
    (aporte.autor || '').trim() && ('Aprendiz: ' + (aporte.autor || '').trim()),
    (aporte.ficha || '').trim() && ('Ficha: ' + (aporte.ficha || '').trim())
  ].filter(Boolean).join(' · ')

  if (who) out.push(who)
  out.push('')

  TEXT_KEYS.forEach(k => {
    const v = (aporte[k] || '').trim()
    if (!v) return
    if (k !== 'saludo') out.push(TITLES[k])
    out.push(v)
    out.push('')
  })

  return out.join('\n').trim() + '\n'
}

export function getRepliesText(replicas) {
  const realReplicas = (replicas || []).filter(r => !r.ejemplo)
  if (!realReplicas.length) return ''

  const out = ['', 'Réplicas a compañeros', '']
  realReplicas.forEach((r, i) => {
    out.push('Réplica ' + (i + 1) + (r.companero ? ' · a ' + r.companero : ''))
    out.push('Comentario del compañero:')
    out.push(r.comentario || '')
    out.push('Mi réplica:')
    out.push(r.respuesta || '')
    out.push('')
  })

  return out.join('\n')
}

export function getMarkdown(aporte, replicas) {
  const out = ['# Foro temático: Licenciamiento de software', '']
  if ((aporte.autor || '').trim()) out.push('**Aprendiz:** ' + aporte.autor.trim() + '  ')
  if ((aporte.ficha || '').trim()) out.push('**Ficha:** ' + aporte.ficha.trim() + '  ')
  out.push('')

  TEXT_KEYS.forEach(k => {
    const v = (aporte[k] || '').trim()
    if (!v) return
    if (k !== 'saludo') out.push('## ' + TITLES[k], '')
    out.push(v.replace(/^• /gm, '- '), '')
  })

  const realReplicas = (replicas || []).filter(r => !r.ejemplo)
  if (realReplicas.length) {
    out.push('## Réplicas a compañeros', '')
    realReplicas.forEach((r, i) => {
      out.push('### Réplica ' + (i + 1) + (r.companero ? ': ' + r.companero : ''), '')
      out.push((r.comentario || '').split('\n').map(l => '> ' + l).join('\n'), '')
      out.push(r.respuesta || '', '')
    })
  }

  return out.join('\n')
}

export function getFileBase(aporte) {
  const n = slug(aporte.autor)
  return 'Foro_Licenciamiento_de_software' + (n ? '_' + n : '')
}

export async function downloadFile(name, data, downloadsProvider = null) {
  if (downloadsProvider) {
    try {
      await downloadsProvider.save({ filename: name, data })
      return
    } catch (e) {
      if (e && e.code === 'declined') return
    }
  }

  const blob = data instanceof Blob ? data : new Blob([data], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function buildPdf(aporte, replicas) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  const M = 64
  const W = doc.internal.pageSize.getWidth() - M * 2
  const H = doc.internal.pageSize.getHeight()
  let y = M

  const ensure = h => {
    if (y + h > H - M) {
      doc.addPage()
      y = M
    }
  }

  function para(text, size, style, after, color) {
    doc.setFont('helvetica', style || 'normal')
    doc.setFontSize(size)
    doc.setTextColor.apply(doc, color || [23, 32, 43])
    const lh = size * 1.45
    pdfSafe(text).split('\n').forEach(p => {
      if (!p.trim()) {
        y += lh * 0.5
        return
      }
      doc.splitTextToSize(p, W).forEach(line => {
        ensure(lh)
        doc.text(line, M, y)
        y += lh
      })
    })
    y += after || 0
  }

  para('Foro temático: Licenciamiento de software', 18, 'bold', 6)
  const who = [
    (aporte.autor || '').trim() && ('Aprendiz: ' + (aporte.autor || '').trim()),
    (aporte.ficha || '').trim() && ('Ficha: ' + (aporte.ficha || '').trim())
  ].filter(Boolean).join('   ')

  if (who) para(who, 10, 'normal', 14, [89, 101, 117])
  else y += 10

  TEXT_KEYS.forEach(k => {
    const v = (aporte[k] || '').trim()
    if (!v) return
    if (k !== 'saludo') {
      ensure(40)
      para(TITLES[k], 12.5, 'bold', 4)
    }
    para(v, 11, 'normal', 12)
  })

  const realReplicas = (replicas || []).filter(r => !r.ejemplo)
  if (realReplicas.length) {
    ensure(50)
    para('Réplicas a compañeros', 14, 'bold', 6)
    realReplicas.forEach((r, i) => {
      ensure(40)
      para('Réplica ' + (i + 1) + (r.companero ? ' - a ' + r.companero : ''), 11.5, 'bold', 4)
      para('Comentario del compañero:', 10, 'bold', 2, [89, 101, 117])
      para(r.comentario || '', 10.5, 'italic', 6, [89, 101, 117])
      para('Mi réplica:', 10, 'bold', 2)
      para(r.respuesta || '', 11, 'normal', 12)
    })
  }

  return doc.output('blob')
}
