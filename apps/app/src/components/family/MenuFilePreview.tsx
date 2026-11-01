'use client'

import { Download, ExternalLink, FileText } from 'lucide-react'
import { useTranslations } from 'next-intl'

function isPdfUrl(url: string) {
  try {
    const path = new URL(url).pathname.toLowerCase()
    return path.endsWith('.pdf')
  } catch {
    return /\.pdf($|\?)/i.test(url)
  }
}

export function MenuFilePreview({ fileUrl }: { fileUrl: string }) {
  const t = useTranslations('familyMenus')
  const pdf = isPdfUrl(fileUrl)

  if (!pdf) {
    return (
      <div className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fileUrl} alt={t('imageAlt')} className="w-full object-contain max-h-[80vh]" />
      </div>
    )
  }

  // Proxy same-origin: evita bloqueo X-Frame-Options de Storage
  const proxySrc = `/api/menu-file?url=${encodeURIComponent(fileUrl)}#toolbar=0&navpanes=0&view=FitH`

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-teal-800">
        <FileText className="h-4 w-4 shrink-0" />
        <span className="text-sm font-semibold">{t('pdfLabel')}</span>
      </div>

      <div className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 shadow-sm">
        <iframe
          src={proxySrc}
          title={t('pdfPreviewTitle')}
          className="w-full h-[min(75vh,820px)] bg-white"
        />
      </div>

      <p className="text-[11px] text-stone-400 font-medium text-center px-2">
        {t('pdfPreviewHint')}
      </p>

      <div className="flex flex-wrap gap-2 justify-center">
        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-4 py-2.5 rounded-xl transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          {t('openFull')}
        </a>
        <a
          href={fileUrl}
          download
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 px-4 py-2.5 rounded-xl transition-colors"
        >
          <Download className="h-4 w-4" />
          {t('download')}
        </a>
      </div>
    </div>
  )
}
