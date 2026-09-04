import { Resend } from 'resend'

type AccessEmailParams = {
  to: string
  fullName: string
  tempPassword: string
  role: 'guardian' | 'teacher' | 'admin' | 'auxiliary' | string
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  return new Resend(apiKey)
}

const PRODUCTION_APP_URL = 'https://app.petitdiari.com'

/** PRE local: no envia correus reals (log a consola). */
export function isEmailDryRun() {
  if (process.env.EMAIL_DRY_RUN === 'true') return true
  if (process.env.EMAIL_DRY_RUN === 'false') return false
  const app = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || ''
  return app.includes('localhost') || app.includes('127.0.0.1')
}

export function getAppLoginUrl() {
  // Respecta APP_URL sempre (inclòs localhost a PRE)
  const explicit = (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '')
  if (explicit) return explicit

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : null
  if (vercel && !vercel.includes('localhost')) return vercel.replace(/\/$/, '')

  return PRODUCTION_APP_URL
}

/** Enllaços d'impersonació sempre cap a producció (evita localhost al magic link). */
export function getImpersonationAppUrl() {
  const explicit = process.env.IMPERSONATION_APP_URL?.replace(/\/$/, '')
  if (explicit) return explicit

  const base = getAppLoginUrl()
  if (base.includes('localhost') || base.includes('127.0.0.1')) return PRODUCTION_APP_URL
  return base
}

function roleLabel(role: string) {
  switch (role) {
    case 'guardian':
      return 'família'
    case 'teacher':
    case 'auxiliary':
      return 'equip educatiu'
    case 'admin':
      return 'direcció'
    default:
      return 'usuari'
  }
}

export async function sendAccessEmail({ to, fullName, tempPassword, role }: AccessEmailParams) {
  const from = process.env.RESEND_FROM_EMAIL || 'Petit Diari <hola@petitdiari.com>'
  const loginUrl = getAppLoginUrl()
  const name = fullName?.trim() || 'Hola'
  const audience = roleLabel(role)

  const html = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 520px; margin: 0 auto; color: #292524; line-height: 1.6;">
      <p style="font-size: 18px; font-weight: 700; color: #0f766e; margin-bottom: 8px;">Petit Diari</p>
      <p>Hola${fullName ? ` ${name}` : ''},</p>
      <p>T'hem creat l'accés a <strong>Petit Diari</strong> com a ${audience}. Aquí tens les teves credencials:</p>
      <div style="background: #faf8f5; border: 1px solid #e7e5e4; border-radius: 16px; padding: 20px; margin: 24px 0;">
        <p style="margin: 0 0 8px;"><strong>Correu:</strong> ${to}</p>
        <p style="margin: 0;"><strong>Contrasenya temporal:</strong> <code style="background: #fff; padding: 2px 8px; border-radius: 6px;">${tempPassword}</code></p>
      </div>
      <p><a href="${loginUrl}/login" style="display: inline-block; background: #0f766e; color: #fff; text-decoration: none; font-weight: 700; padding: 12px 24px; border-radius: 12px;">Entrar a Petit Diari</a></p>
      <p style="font-size: 14px; color: #78716c;">En el primer accés se't demanarà canviar la contrasenya per seguretat.</p>
      <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 32px 0 16px;" />
      <p style="font-size: 12px; color: #a8a29e; margin: 0 0 4px;">Petit Diari · app.petitdiari.com</p>
      <p style="font-size: 12px; color: #a8a29e; margin: 0 0 4px;">Política de privacitat: <a href="https://petitdiari.com/legal/privacitat" style="color: #0f766e;">https://petitdiari.com/legal/privacitat</a></p>
      <p style="font-size: 13px; color: #a8a29e; margin-top: 8px;">Si no esperaves aquest correu, contacta amb la direcció del teu centre.</p>
    </div>
  `

  if (isEmailDryRun()) {
    console.info('[email:dry-run] No s\'ha enviat correu (PRE/local). Credencials:')
    console.info(`  to: ${to}`)
    console.info(`  password: ${tempPassword}`)
    console.info(`  login: ${loginUrl}/login`)
    console.info(`  from: ${from}`)
    return
  }

  const resend = getResendClient()
  if (!resend) {
    throw new Error('RESEND_API_KEY no està configurada.')
  }

  const { error } = await resend.emails.send({
    from,
    to,
    subject: 'Accés a Petit Diari',
    html,
  })

  if (error) {
    throw new Error(error.message || 'No s\'ha pogut enviar el correu.')
  }
}

export function isEmailConfigured() {
  return isEmailDryRun() || Boolean(process.env.RESEND_API_KEY)
}
