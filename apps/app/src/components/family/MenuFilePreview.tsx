'use client'

import { useCallback, useState } from 'react'
import { Download, ExternalLink, FileText, ImageOff } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { isPdfUrl } from '@/lib/menu-file-url'
import { PdfMenuPreview } from './PdfMenuPreview'

export function MenuFilePreview({ fileUrl }: { fileUrl: string }) {
  const t = useTranslations('familyMenus')
  const pdf = isPdfUrl(fileUrl)
  const [imageFailed, setImageFailed] = useState(false)
  const [pdfFailed, setPdfFailed] = useState(false)
  const [imgSrc, setImgSrc] = useState(() => `/api/menu-file?url=${encodeURIComponent(fileUrl)}`)

  const onPdfFailed = useCallback(() => setPdfFailed(true), [])

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
        {!imageFailed ? (
          <div className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgSrc}
              alt={t('imageAlt')}
              className="w-full object-contain max-h-[80vh]"
              onError={() => {
                // 1) falló proxy → probar URL directa; 2) si ya era directa → error
                if (imgSrc.startsWith('/api/menu-file')) {
                  setImgSrc(fileUrl)
                } else {
                  setImageFailed(true)
                }
              }}
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

      {!pdfFailed && <PdfMenuPreview fileUrl={fileUrl} onFailed={onPdfFailed} />}

      {pdfFailed && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-8 text-center space-y-2">
          <FileText className="h-8 w-8 text-amber-500 mx-auto" />
          <p className="text-sm font-semibold text-amber-900">{t('previewFailed')}</p>
          <p className="text-xs text-amber-800/80">{t('pdfPreviewHint')}</p>
        </div>
      )}

      {!pdfFailed && (
        <p className="text-[11px] text-stone-400 font-medium text-center px-2">
          {t('pdfRenderedHint')}
        </p>
      )}

      {actions}
    </div>
  )
}
