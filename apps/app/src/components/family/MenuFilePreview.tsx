'use client'

import { useState } from 'react'
import { Download, ExternalLink, FileText, ImageOff } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { isPdfUrl } from '@/lib/menu-file-url'

export function MenuFilePreview({ fileUrl }: { fileUrl: string }) {
  const t = useTranslations('familyMenus')
  const pdf = isPdfUrl(fileUrl)
  const [failed, setFailed] = useState(false)

  // Siempre vía proxy same-origin (PDF e imagen): evita X-Frame / hosts PRE raros
  const proxySrc = `/api/menu-file?url=${encodeURIComponent(fileUrl)}`

  const actions = (
    <div className="flex flex-wrap gap-2 justify-center">
      <a
        href={fileUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 text-sm font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-4 py-2.5 rounded-xl transition-colors"
      >
        <ExternalLink className="h-4 w-4" />
        {pdf ? t('openFull') : t('openFullImage')}
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
  )

  if (!pdf) {
    return (
      <div className="space-y-3">
        {!failed ? (
          <div className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={proxySrc}
              alt={t('imageAlt')}
              className="w-full object-contain max-h-[80vh]"
              onError={() => setFailed(true)}
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-10 text-center space-y-3">
            <ImageOff className="h-8 w-8 text-stone-300 mx-auto" />
            <p className="text-sm font-semibold text-stone-600">{t('previewFailed')}</p>
          </div>
        )}
        {actions}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-teal-800">
        <FileText className="h-4 w-4 shrink-0" />
        <span className="text-sm font-semibold">{t('pdfLabel')}</span>
      </div>

      {!failed ? (
        <div className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 shadow-sm">
          <object
            data={`${proxySrc}#toolbar=0&navpanes=0&view=FitH`}
            type="application/pdf"
            className="w-full h-[min(75vh,820px)] bg-white"
            onError={() => setFailed(true)}
          >
            <iframe
              src={`${proxySrc}#toolbar=0&navpanes=0&view=FitH`}
              title={t('pdfPreviewTitle')}
              className="w-full h-[min(75vh,820px)] bg-white"
              onLoad={(e) => {
                // Si el proxy devolvió JSON de error, el iframe muestra texto; detectamos por contentDocument si same-origin
                try {
                  const doc = (e.target as HTMLIFrameElement).contentDocument
                  const text = doc?.body?.innerText?.trim() || ''
                  if (text.startsWith('{') && text.includes('"error"')) {
                    setFailed(true)
                  }
                } catch {
                  // cross-origin: ignorar
                }
              }}
            />
          </object>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-8 text-center space-y-2">
          <FileText className="h-8 w-8 text-amber-500 mx-auto" />
          <p className="text-sm font-semibold text-amber-900">{t('previewFailed')}</p>
          <p className="text-xs text-amber-800/80">{t('pdfPreviewHint')}</p>
        </div>
      )}

      {!failed && (
        <p className="text-[11px] text-stone-400 font-medium text-center px-2">
          {t('pdfPreviewHint')}
        </p>
      )}

      {actions}
    </div>
  )
}
