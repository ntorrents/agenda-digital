const DEFAULT_MAX_WIDTH = 1600
const DEFAULT_MAX_HEIGHT = 1600
const DEFAULT_QUALITY = 0.82
const DEFAULT_MAX_BYTES = 750_000

type CompressOptions = {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxBytes?: number
}

/** Redueix fotos al client abans d'enviar-les a Server Actions (límit ~1 MB). */
export async function compressImageFile(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const maxWidth = options.maxWidth ?? DEFAULT_MAX_WIDTH
  const maxHeight = options.maxHeight ?? DEFAULT_MAX_HEIGHT
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES
  let quality = options.quality ?? DEFAULT_QUALITY

  if (!file.type.startsWith('image/') || file.type === 'image/gif') {
    return file
  }

  if (typeof createImageBitmap !== 'function') {
    return file
  }

  let bitmap: ImageBitmap | null = null

  try {
    bitmap = await createImageBitmap(file)
    let { width, height } = bitmap
    const scale = Math.min(1, maxWidth / width, maxHeight / height)
    width = Math.max(1, Math.round(width * scale))
    height = Math.max(1, Math.round(height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file

    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()
    bitmap = null

    let blob: Blob | null = null
    for (let attempt = 0; attempt < 6; attempt++) {
      blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', quality)
      )
      if (!blob) break
      if (blob.size <= maxBytes) break
      quality = Math.max(0.45, quality - 0.08)
    }

    if (!blob || blob.size >= file.size) {
      return file
    }

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'foto'
    return new File([blob], `${baseName}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    })
  } catch {
    if (bitmap) bitmap.close()
    return file
  }
}

export async function compressImageFiles(files: File[]): Promise<File[]> {
  return Promise.all(files.map((file) => compressImageFile(file)))
}
