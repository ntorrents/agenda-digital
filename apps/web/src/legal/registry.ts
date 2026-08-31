import avisLegalCa from './md/ca/avis-legal.md?raw'
import privacitatCa from './md/ca/privacitat.md?raw'
import cookiesCa from './md/ca/cookies.md?raw'
import termesCa from './md/ca/termes.md?raw'
import centresCa from './md/ca/centres.md?raw'
import encarrecCa from './md/ca/encarrec-tractament.md?raw'

import avisoLegalEs from './md/es/aviso-legal.md?raw'
import privacidadEs from './md/es/privacidad.md?raw'
import cookiesEs from './md/es/cookies.md?raw'
import terminosEs from './md/es/terminos.md?raw'
import centrosEs from './md/es/centros.md?raw'
import encargoEs from './md/es/encargo-tratamiento.md?raw'

export type LegalLocale = 'ca' | 'es'

export type LegalDoc = {
  slug: string
  locale: LegalLocale
  title: string
  content: string
  alternateSlug: string
}

export const legalDocs: Record<string, LegalDoc> = {
  'avis-legal': {
    slug: 'avis-legal',
    locale: 'ca',
    title: 'Avís legal',
    content: avisLegalCa,
    alternateSlug: 'aviso-legal',
  },
  privacitat: {
    slug: 'privacitat',
    locale: 'ca',
    title: 'Política de privacitat',
    content: privacitatCa,
    alternateSlug: 'privacidad',
  },
  cookies: {
    slug: 'cookies',
    locale: 'ca',
    title: 'Política de cookies',
    content: cookiesCa,
    alternateSlug: 'cookies',
  },
  termes: {
    slug: 'termes',
    locale: 'ca',
    title: "Termes d'ús",
    content: termesCa,
    alternateSlug: 'terminos',
  },
  centres: {
    slug: 'centres',
    locale: 'ca',
    title: 'Condicions per a centres educatius',
    content: centresCa,
    alternateSlug: 'centros',
  },
  'encarrec-tractament': {
    slug: 'encarrec-tractament',
    locale: 'ca',
    title: 'Encàrrec de tractament (RGPD)',
    content: encarrecCa,
    alternateSlug: 'encargo-tratamiento',
  },
  'aviso-legal': {
    slug: 'aviso-legal',
    locale: 'es',
    title: 'Aviso legal',
    content: avisoLegalEs,
    alternateSlug: 'avis-legal',
  },
  privacidad: {
    slug: 'privacidad',
    locale: 'es',
    title: 'Política de privacidad',
    content: privacidadEs,
    alternateSlug: 'privacitat',
  },
  terminos: {
    slug: 'terminos',
    locale: 'es',
    title: 'Términos de uso',
    content: terminosEs,
    alternateSlug: 'termes',
  },
  centros: {
    slug: 'centros',
    locale: 'es',
    title: 'Condiciones para centros educativos',
    content: centrosEs,
    alternateSlug: 'centres',
  },
  'encargo-tratamiento': {
    slug: 'encargo-tratamiento',
    locale: 'es',
    title: 'Encargo de tratamiento (RGPD)',
    content: encargoEs,
    alternateSlug: 'encarrec-tractament',
  },
}

/** Cookies ES shares the slug `/legal/cookies`; pick content by locale hint. */
export function getLegalDoc(slug: string | undefined, preferLocale?: LegalLocale): LegalDoc | null {
  if (!slug) return null

  if (slug === 'cookies') {
    if (preferLocale === 'es') {
      return {
        slug: 'cookies',
        locale: 'es',
        title: 'Política de cookies',
        content: cookiesEs,
        alternateSlug: 'cookies',
      }
    }
    return legalDocs.cookies
  }

  return legalDocs[slug] ?? null
}

export function getLegalPaths(locale: 'ca' | 'es' | 'en') {
  const isEs = locale === 'es'
  return {
    legal: isEs ? '/legal/aviso-legal' : '/legal/avis-legal',
    privacy: isEs ? '/legal/privacidad' : '/legal/privacitat',
    cookies: '/legal/cookies',
    terms: isEs ? '/legal/terminos' : '/legal/termes',
    schools: isEs ? '/legal/centros' : '/legal/centres',
  }
}
