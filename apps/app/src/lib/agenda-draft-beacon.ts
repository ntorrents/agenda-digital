/** Clave sessionStorage para mostrar toast tras atrás del navegador. */
export const DRAFT_SAVED_STORAGE_KEY = 'petitdiari:agendaDraftSaved'

/**
 * Dispara un POST keepalive que sobrevive al unload de la página
 * (Safari / atrás del navegador / gesto). Límite ~64KB: no adjuntar fotos nuevas.
 */
export function sendDraftBeacon(formData: FormData, studentName: string) {
  try {
    sessionStorage.setItem(
      DRAFT_SAVED_STORAGE_KEY,
      JSON.stringify({ name: studentName, at: Date.now() })
    )
  } catch {
    // ignore quota / private mode
  }

  void fetch('/api/daily-logs/draft', {
    method: 'POST',
    body: formData,
    credentials: 'same-origin',
    keepalive: true,
  }).catch(() => {
    // La página puede estar cerrándose; el keepalive ya está en vuelo.
  })
}
