'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

type PdfjsModule = {
  GlobalWorkerOptions: { workerSrc: string }
  getDocument: (src: { data: Uint8Array }) => { promise: Promise<PdfDocument> }
}

type PdfDocument = {
  numPages: number
  getPage: (n: number) => Promise<PdfPage>
}

type PdfPage = {
  getViewport: (opts: { scale: number }) => { width: number; height: number }
  render: (opts: {
    canvasContext: CanvasRenderingContext2D
    viewport: { width: number; height: number }
    canvas: HTMLCanvasElement
  }) => { promise: Promise<void> }
}

/**
 * Carga pdf.js desde /public (no npm) para evitar fallos de Turbopack
 * con `import('pdfjs-dist')`.
 */
async function loadPdfjs(): Promise<PdfjsModule> {
  // webpackIgnore / turbopackIgnore: no resolver como dependencia de node_modules
  const mod = await import(
    /* webpackIgnore: true */
    /* turbopackIgnore: true */
    '/pdf.min.mjs'
  )
  return (mod as { default?: PdfjsModule } & PdfjsModule).default ?? (mod as PdfjsModule)
}

/**
 * Renderiza el PDF como imágenes (canvas → JPEG).
 * Fiable en Safari/móvil donde iframe/object de PDF no funciona.
 */
export function PdfMenuPreview({
  fileUrl,
  onFailed,
}: {
  fileUrl: string
  onFailed?: () => void
}) {
  const t = useTranslations('familyMenus')
  const [pages, setPages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(false)
      setPages([])

      try {
        const pdfjs = await loadPdfjs()
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

        const proxyUrl = `/api/menu-file?url=${encodeURIComponent(fileUrl)}`
        let res = await fetch(proxyUrl, { credentials: 'same-origin' })
        if (!res.ok) {
          res = await fetch(fileUrl)
        }
        if (!res.ok) {
          throw new Error(`fetch ${res.status}`)
        }

        const data = new Uint8Array(await res.arrayBuffer())
        const doc = await pdfjs.getDocument({ data }).promise
        const maxPages = Math.min(doc.numPages, 15)
        const rendered: string[] = []

        for (let i = 1; i <= maxPages; i++) {
          const page = await doc.getPage(i)
          const viewport = page.getViewport({ scale: 1.6 })
          const canvas = document.createElement('canvas')
          canvas.width = Math.floor(viewport.width)
          canvas.height = Math.floor(viewport.height)
          const ctx = canvas.getContext('2d')
          if (!ctx) continue

          await page.render({
            canvasContext: ctx,
            viewport,
            canvas,
          }).promise

          rendered.push(canvas.toDataURL('image/jpeg', 0.88))
          if (cancelled) return
        }

        if (!cancelled) {
          if (rendered.length === 0) throw new Error('no pages')
          setPages(rendered)
          setLoading(false)
        }
      } catch (err) {
        console.error('[PdfMenuPreview]', err)
        if (!cancelled) {
          setError(true)
          setLoading(false)
          onFailed?.()
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [fileUrl, onFailed])

  if (loading) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-16 flex flex-col items-center gap-3">
        <Loader2 className="h-7 w-7 text-teal-600 animate-spin" />
        <p className="text-sm font-semibold text-stone-500">{t('pdfRendering')}</p>
      </div>
    )
  }

  if (error || pages.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {pages.map((src, i) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden border border-stone-200 bg-white shadow-sm"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={`${t('pdfPageAlt', { page: i + 1 })}`}
            className="w-full h-auto block"
          />
        </div>
      ))}
    </div>
  )
}
