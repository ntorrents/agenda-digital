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

export function getAppLoginUrl() {
  const url = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://app.petitdiari.com'
  return url.replace(/\/$/, '')
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
  const resend = getResendClient()
  if (!resend) {
    throw new Error('RESEND_API_KEY no està configurada.')
  }

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
      <p style="font-size: 13px; color: #a8a29e; margin-top: 32px;">Si no esperaves aquest correu, contacta amb la direcció del centre.</p>
    </div>
  `

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
  return Boolean(process.env.RESEND_API_KEY)
}
