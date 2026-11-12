export async function downloadPhoto(url: string, filename?: string) {
  const fallbackName = filename || `foto-${Date.now()}.jpg`
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error('fetch failed')
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = fallbackName
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(objectUrl)
  } catch {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fallbackName
    anchor.target = '_blank'
    anchor.rel = 'noopener noreferrer'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
  }
}

export function photoFilenameFromUrl(url: string, index = 0) {
  try {
    const pathname = new URL(url).pathname
    const base = pathname.split('/').pop()
    if (base && /\.[a-z0-9]+$/i.test(base)) return decodeURIComponent(base)
  } catch {
    // ignore invalid urls
  }
  return `foto-${index + 1}.jpg`
}
