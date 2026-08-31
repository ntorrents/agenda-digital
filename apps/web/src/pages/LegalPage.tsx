import { useEffect } from 'react'
import { useParams, useSearchParams, Navigate } from 'react-router-dom'
import { marked } from 'marked'
import { getLegalDoc } from '../legal/registry'
import { LegalLayout } from '../components/LegalLayout'
import { useI18n } from '../i18n'

marked.setOptions({ gfm: true, breaks: false })

export function LegalPage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const { locale } = useI18n()

  const langHint = searchParams.get('lang') === 'es' ? 'es' : slug === 'cookies' && locale === 'es' ? 'es' : undefined
  const doc = getLegalDoc(slug, langHint)

  useEffect(() => {
    if (doc) {
      document.title = `${doc.title} · Petit Diari`
      document.documentElement.lang = doc.locale
    }
  }, [doc])

  if (!doc) {
    return <Navigate to="/" replace />
  }

  const html = marked.parse(doc.content) as string

  return (
    <LegalLayout doc={doc} uiLocale={locale}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </LegalLayout>
  )
}
