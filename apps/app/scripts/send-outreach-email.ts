/**
 * Envia el correu comercial de presentació a escoles bressol.
 *
 * Ús:
 *   npm run outreach:preview              → genera scripts/outreach-preview.html
 *   npm run outreach:send -- --to escola@example.com
 *   npm run outreach:send -- --to a@x.com --school "Escola El Roure"
 *   npm run outreach:send -- --to a@x.com --contact "Maria" --dry-run
 *
 * Requereix RESEND_API_KEY i RESEND_FROM_EMAIL a apps/app/.env.local
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildCommercialOutreachHtml,
  OUTREACH_SUBJECT,
  sendCommercialOutreachEmail,
} from '../src/lib/email-outreach'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(__dirname, '../.env.local'), 'utf8')
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      let val = trimmed.slice(eq + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      if (!process.env[key]) process.env[key] = val
    }
  } catch {
    console.warn('No s\'ha trobat .env.local — assegura\'t que RESEND_API_KEY estigui definida.')
  }
}

function parseArgs(argv: string[]) {
  const opts: {
    to: string[]
    school?: string
    contact?: string
    preview: boolean
    dryRun: boolean
    delayMs: number
  } = {
    to: [],
    preview: false,
    dryRun: false,
    delayMs: 1500,
  }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--preview') opts.preview = true
    else if (arg === '--dry-run') opts.dryRun = true
    else if (arg === '--to') {
      const val = argv[++i]
      if (val) opts.to.push(...val.split(',').map((e) => e.trim()).filter(Boolean))
    } else if (arg === '--school') opts.school = argv[++i]
    else if (arg === '--contact') opts.contact = argv[++i]
    else if (arg === '--delay') opts.delayMs = parseInt(argv[++i] || '1500', 10) || 1500
    else if (arg === '--help' || arg === '-h') {
      console.log(`
Petit Diari — correu comercial

  npm run outreach:preview
  npm run outreach:send -- --to correu@escola.cat [--school "Nom escola"] [--contact "Nom"]
  npm run outreach:send -- --to a@x.com,b@y.com --dry-run

Opcions:
  --preview     Genera outreach-preview.html (obrir al navegador)
  --dry-run     Mostra destinatari sense enviar
  --delay N     Pausa entre enviaments en ms (defecte 1500)
`)
      process.exit(0)
    }
  }

  return opts
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function main() {
  loadEnvLocal()
  const opts = parseArgs(process.argv.slice(2))

  if (opts.preview) {
    const html = buildCommercialOutreachHtml({ schoolName: opts.school, contactName: opts.contact })
    const out = resolve(__dirname, 'outreach-preview.html')
    writeFileSync(out, html, 'utf8')
    console.log(`Vista prèvia guardada: ${out}`)
    console.log(`Assumpte: ${OUTREACH_SUBJECT}`)
    return
  }

  if (opts.to.length === 0) {
    console.error('Cal --to correu@escola.cat (o --preview)')
    process.exit(1)
  }

  console.log(`Assumpte: ${OUTREACH_SUBJECT}`)
  console.log(`Des de: ${process.env.RESEND_FROM_EMAIL || 'Petit Diari <hola@petitdiari.com>'}`)
  console.log(`Destinataris: ${opts.to.length}`)

  for (let i = 0; i < opts.to.length; i++) {
    const to = opts.to[i]
    if (opts.dryRun) {
      console.log(`[dry-run] Enviaria a: ${to}`)
      continue
    }

    try {
      await sendCommercialOutreachEmail({
        to,
        schoolName: opts.school,
        contactName: opts.contact,
      })
      console.log(`✓ Enviat a ${to}`)
    } catch (err) {
      console.error(`✗ Error amb ${to}:`, err instanceof Error ? err.message : err)
    }

    if (i < opts.to.length - 1) await sleep(opts.delayMs)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
