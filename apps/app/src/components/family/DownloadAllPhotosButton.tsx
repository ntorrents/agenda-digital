'use client'

import { Download, Loader2 } from 'lucide-react'
import { useState } from 'react'

type PhotoDownload = {
  url: string
  filename: string
}

export function DownloadAllPhotosButton({
  photos,
  label,
  zipName = 'galeria-fotos.zip',
}: {
  photos: PhotoDownload[]
  label: string
  zipName?: string
}) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownloadAll = async () => {
    if (photos.length === 0 || isDownloading) return
    setIsDownloading(true)

    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()

      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i]
        try {
          const response = await fetch(photo.url)
          if (!response.ok) continue
          const blob = await response.blob()
          zip.file(photo.filename, blob)
        } catch {
          // skip failed photo
        }
      }

      const content = await zip.generateAsync({ type: 'blob' })
      const objectUrl = URL.createObjectURL(content)
      const anchor = document.createElement('a')
      anchor.href = objectUrl
      anchor.download = zipName
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(objectUrl)
    } finally {
      setIsDownloading(false)
    }
  }

  if (photos.length === 0) return null

  return (
    <button
      type="button"
      onClick={handleDownloadAll}
      disabled={isDownloading}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors disabled:opacity-60"
    >
      {isDownloading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {label}
    </button>
  )
}
