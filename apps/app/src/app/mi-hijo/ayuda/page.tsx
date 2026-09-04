import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getTranslations, getLocale } from 'next-intl/server'
import { getLegalUrls } from '@/lib/legal-urls'
import { createClient } from '@/lib/supabase/server'
import { FamilyHelpOnboarding } from '@/components/family/FamilyHelpOnboarding'
import { HelpCircle, Mail, Phone, ExternalLink, Shield } from 'lucide-react'

export default async function AyudaPage() {
  const t = await getTranslations('familyHelp')
  const locale = await getLocale()
  const urls = getLegalUrls(locale)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  let school: {
    name: string
    phone: string | null
    contact_email: string | null
    logo_url: string | null
    settings: Record<string, unknown> | null
  } | null = null

  if (profile?.school_id) {
    const { data } = await supabase
      .from('schools')
      .select('name, phone, contact_email, logo_url, settings')
      .eq('id', profile.school_id)
      .single()
    school = data
  }

  const settings = (school?.settings || {}) as {
    opening_time?: string
    closing_time?: string
  }
  const opening = settings.opening_time || '09:00'
  const closing = settings.closing_time || '17:00'
  const schoolName = school?.name || 'El teu centre'
  const phone = school?.phone?.trim() || null
  const email = school?.contact_email?.trim() || null

  return (
    <main className="max-w-md mx-auto pt-6 space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-blue-600" /> Ajuda i Centre
          </h2>
          <p className="text-sm text-stone-500 mt-1">Canals de contacte i suport tècnic.</p>
        </div>
      </div>

      <FamilyHelpOnboarding />

      <div className="bg-white border border-stone-200/80 rounded-[28px] p-6 shadow-xs space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-500 mb-4 shadow-sm border border-blue-100 overflow-hidden">
            {school?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={school.logo_url}
                alt={schoolName}
                className="h-full w-full object-cover"
              />
            ) : (
              <SchoolLogoPlaceholder />
            )}
          </div>
          <h3 className="text-lg font-black text-stone-800">{schoolName}</h3>
          <p className="text-sm font-medium text-stone-500 px-4">
            Horari d&apos;atenció: Dilluns a Divendres de {opening} a {closing}.
          </p>
        </div>

        <div className="grid gap-3 pt-4 border-t border-stone-100">
          {phone ? (
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="flex items-center gap-4 p-4 rounded-[20px] bg-stone-50 hover:bg-stone-100 border border-stone-200/50 active:scale-95 transition-all"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm text-stone-600">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Telèfon d&apos;Urgències
                </p>
                <p className="text-sm font-black text-stone-800">{phone}</p>
              </div>
            </a>
          ) : (
            <div className="flex items-center gap-4 p-4 rounded-[20px] bg-stone-50 border border-stone-200/50 opacity-70">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm text-stone-400">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Telèfon d&apos;Urgències
                </p>
                <p className="text-sm font-medium text-stone-500">No indicat pel centre</p>
              </div>
            </div>
          )}

          {email ? (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-4 p-4 rounded-[20px] bg-stone-50 hover:bg-stone-100 border border-stone-200/50 active:scale-95 transition-all"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm text-stone-600">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Correu de Direcció
                </p>
                <p className="text-sm font-black text-stone-800 break-all">{email}</p>
              </div>
            </a>
          ) : (
            <div className="flex items-center gap-4 p-4 rounded-[20px] bg-stone-50 border border-stone-200/50 opacity-70">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm text-stone-400">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Correu de Direcció
                </p>
                <p className="text-sm font-medium text-stone-500">No indicat pel centre</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-stone-200/80 rounded-[28px] p-6 shadow-xs space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
            <Shield className="h-5 w-5" />
          </div>
          <div className="space-y-3 min-w-0">
            <h3 className="text-base font-black text-stone-900">{t('privacyTitle')}</h3>
            <p className="text-sm text-stone-600 leading-relaxed">{t('privacyBody')}</p>
            <p className="text-sm text-stone-600 leading-relaxed">{t('privacyRights')}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold">
              <a
                href={urls.privacy}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-700 hover:text-teal-900 underline underline-offset-2"
              >
                {t('privacyLink')}
              </a>
              <span className="text-stone-300" aria-hidden>
                ·
              </span>
              <a
                href={urls.terms}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-700 hover:text-teal-900 underline underline-offset-2"
              >
                {t('termsLink')}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="px-2">
        <p className="text-[10px] font-bold text-stone-400 text-center uppercase tracking-wider mb-3">
          Opcions de l&apos;Aplicació
        </p>
        <Link
          href="/mi-hijo/perfil"
          className="flex items-center justify-between p-4 rounded-[20px] bg-white border border-stone-200/60 shadow-xs active:scale-95 transition-all"
        >
          <span className="text-sm font-black text-stone-700">El Meu Perfil</span>
          <ExternalLink className="h-4 w-4 text-stone-400" />
        </Link>
      </div>
    </main>
  )
}

function SchoolLogoPlaceholder() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  )
}
