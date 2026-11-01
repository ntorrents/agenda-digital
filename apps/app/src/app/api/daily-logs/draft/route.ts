import { NextResponse } from 'next/server'
import { upsertDailyLog } from '@/app/actions/daily-logs'

/**
 * Guardado de borrador resistente a navegación (atrás del navegador / gesto).
 * Pensado para `fetch(..., { keepalive: true })` desde pagehide/popstate,
 * porque las Server Actions se cancelan al desmontar la página.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    formData.set('status', 'draft')
    const result = await upsertDailyLog(formData)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error saving draft'
    return NextResponse.json({ success: false, error: message }, { status: 400 })
  }
}
