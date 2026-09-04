import { Resend } from 'resend'
import { isEmailDryRun } from '@/lib/email'

const BRAND = {
  teal: '#0f766e',
  tealLight: '#14b8a6',
  tealDark: '#0d5c56',
  cream: '#faf8f5',
  stone: '#57534e',
  stoneLight: '#78716c',
  border: '#e7e5e4',
}

const LOGO_URL = 'https://www.petitdiari.com/logo.png'
const WEBSITE_URL = 'https://www.petitdiari.com'
const PRIVACY_URL = 'https://www.petitdiari.com/legal/privacitat'

export type OutreachEmailParams = {
  to: string
  /** Ex: "Escola Bressol El Roure" — opcional, personalitza la salutació */
  schoolName?: string
  /** Nom del destinatari si el coneixes */
  contactName?: string
}

function greeting({ schoolName, contactName }: Pick<OutreachEmailParams, 'schoolName' | 'contactName'>) {
  if (contactName?.trim()) return `Bon dia, ${contactName.trim()},`
  if (schoolName?.trim()) return `Bon dia a l'equip de ${schoolName.trim()},`
  return 'Bon dia,'
}

export function buildCommercialOutreachHtml(params: Pick<OutreachEmailParams, 'schoolName' | 'contactName'> = {}) {
  const hello = greeting(params)

  return `<!DOCTYPE html>
<html lang="ca">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>Petit Diari</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.cream};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${BRAND.cream};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid ${BRAND.border};box-shadow:0 4px 24px rgba(15,118,110,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, ${BRAND.teal} 0%, ${BRAND.tealLight} 100%);padding:28px 32px;text-align:center;">
              <img src="${LOGO_URL}" alt="Petit Diari" width="56" height="56" style="display:block;margin:0 auto 12px;border-radius:14px;background:rgba(255,255,255,0.15);padding:8px;" />
              <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">Petit Diari</p>
              <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.9);font-weight:500;">Agenda digital per a l'etapa 0–3 · 100% en català</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 32px 8px;color:#292524;font-size:16px;line-height:1.65;">
              <p style="margin:0 0 16px;">${hello}</p>

              <p style="margin:0 0 16px;">Em dic <strong>Nil</strong>. Soc pare d'un nen de 2 anys i, juntament amb la directora d'una escola bressol de Terrassa, hem creat <strong>Petit Diari</strong>: una agenda digital pensada exclusivament per a l'etapa 0–3 i 100% en català.</p>

              <p style="margin:0 0 16px;">El projecte neix d'una necessitat real: les aplicacions que coneixíem eren feixugues o no s'adaptaven al ritme dels més petits. Hem volgut fer una eina molt senzilla, ràpida d'utilitzar per a l'equip docent i propera per a les famílies.</p>

              <p style="margin:0 0 20px;">Aquest curs ja comença a funcionar en un centre real. Hem volgut prendre'ns el temps necessari per deixar-ho tot ben afinat abans de mostrar-ho, i per això us escric ara, tot i saber que aneu de bòlit amb l'inici de curs:</p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;background:${BRAND.cream};border-radius:14px;border:1px solid ${BRAND.border};">
                <tr>
                  <td style="padding:20px 22px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding:0 0 12px;vertical-align:top;width:28px;font-size:18px;line-height:1.4;">✓</td>
                        <td style="padding:0 0 12px;font-size:15px;line-height:1.55;color:${BRAND.stone};"><strong style="color:#292524;">Si no teniu agenda digital:</strong> l'eina és tan senzilla que es pot deixar configurada i llesta per al vostre equip en menys d'una setmana, sense complicacions.</td>
                      </tr>
                      <tr>
                        <td style="padding:0 0 12px;vertical-align:top;width:28px;font-size:18px;line-height:1.4;color:${BRAND.teal};">✓</td>
                        <td style="padding:0 0 12px;font-size:15px;line-height:1.55;color:${BRAND.stone};"><strong style="color:#292524;">Si ja en teniu una però no us acaba d'agradar:</strong> us puc ajudar personalment a revisar si podem fer una migració de dades fàcil i neta.</td>
                      </tr>
                      <tr>
                        <td style="padding:0;vertical-align:top;width:28px;font-size:18px;line-height:1.4;color:${BRAND.teal};">✓</td>
                        <td style="padding:0;font-size:15px;line-height:1.55;color:${BRAND.stone};"><strong style="color:#292524;">Com que és un projecte nostre,</strong> ens podem adaptar a les necessitats particulars del vostre centre o afegir detalls a mida.</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 28px;">
                <tr>
                  <td style="border-radius:12px;background:${BRAND.teal};">
                    <a href="${WEBSITE_URL}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">Veure petitdiari.com</a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px;">Sense cap mena de compromís per les dates en què estem, si us fa curiositat veure com funciona per dins, estic a la vostra disposició per ensenyar-vos una <strong>demo breu de 10 minuts</strong> (per videotrucada o apropant-me al centre) i resoldre qualsevol dubte.</p>

              <p style="margin:0 0 8px;">Molt bon inici de curs!</p>
              <p style="margin:0 0 4px;">Atentament,</p>
              <p style="margin:0;font-weight:700;color:${BRAND.tealDark};">Nil Torrents</p>
              <p style="margin:4px 0 0;font-size:14px;color:${BRAND.stoneLight};">Petit Diari</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid ${BRAND.border};background:${BRAND.cream};">
              <p style="margin:0 0 8px;font-size:12px;color:${BRAND.stoneLight};line-height:1.5;">
                <a href="mailto:hola@petitdiari.com" style="color:${BRAND.teal};text-decoration:none;font-weight:600;">hola@petitdiari.com</a>
                · <a href="${WEBSITE_URL}" style="color:${BRAND.teal};text-decoration:none;">petitdiari.com</a>
              </p>
              <p style="margin:0;font-size:11px;color:#a8a29e;line-height:1.5;">
                <a href="${PRIVACY_URL}" style="color:#a8a29e;text-decoration:underline;">Política de privacitat</a>
                · Si preferiu no rebre més correus comercials, responeu <em>STOP</em>.
              </p>
            </td>
          </tr>

        </table>
        <p style="margin:16px 0 0;font-size:11px;color:#a8a29e;">© Petit Diari · Terrassa</p>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function buildCommercialOutreachText(params: Pick<OutreachEmailParams, 'schoolName' | 'contactName'> = {}) {
  const hello = greeting(params)
  return `${hello}

Em dic Nil. Soc pare d'un nen de 2 anys i, juntament amb la directora d'una escola bressol de Terrassa, hem creat Petit Diari: una agenda digital pensada exclusivament per a l'etapa 0-3 i 100% en català.

El projecte neix d'una necessitat real: les aplicacions que coneixíem eren feixugues o no s'adaptaven al ritme dels més petits. Hem volgut fer una eina molt senzilla, ràpida d'utilitzar per a l'equip docent i propera per a les famílies.

Aquest curs ja comença a funcionar en un centre real. Hem volgut prendre'ns el temps necessari per deixar-ho tot ben afinat abans de mostrar-ho, i per això us escric ara, tot i saber que aneu de bòlit amb l'inici de curs:

• Si no teniu agenda digital: L'eina és tan senzilla que es pot deixar configurada i llesta per al vostre equip en menys d'una setmana, sense complicacions.
• Si ja en teniu una però no us acaba d'agradar: Us puc ajudar personalment a revisar si podem fer una migració de dades fàcil i neta.
• Com que és un projecte nostre, ens podem adaptar a les necessitats particulars del vostre centre o afegir detalls a mida.

Podeu veure com és i les funcionalitats a ${WEBSITE_URL}

Sense cap mena de compromís per les dates en què estem, si us fa curiositat veure com funciona per dins, estic a la vostra disposició per ensenyar-vos una demo breu de 10 minuts (per videotrucada o apropant-me al centre) i resoldre qualsevol dubte.

Molt bon inici de curs!

Atentament,

Nil Torrents
Petit Diari
hola@petitdiari.com`
}

export const OUTREACH_SUBJECT = 'Petit Diari - Agenda Digital per escoles bressol'

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  return new Resend(apiKey)
}

export async function sendCommercialOutreachEmail(params: OutreachEmailParams) {
  const from = process.env.RESEND_FROM_EMAIL || 'Petit Diari <hola@petitdiari.com>'
  const replyTo = process.env.RESEND_REPLY_TO || 'hola@petitdiari.com'

  if (isEmailDryRun()) {
    console.info('[email:dry-run] Outreach no enviat:', params.to, OUTREACH_SUBJECT)
    return
  }

  const resend = getResendClient()
  if (!resend) {
    throw new Error('RESEND_API_KEY no està configurada a .env.local')
  }

  const { error } = await resend.emails.send({
    from,
    to: params.to,
    replyTo,
    subject: OUTREACH_SUBJECT,
    html: buildCommercialOutreachHtml(params),
    text: buildCommercialOutreachText(params),
  })

  if (error) {
    throw new Error(error.message || 'No s\'ha pogut enviar el correu.')
  }
}
