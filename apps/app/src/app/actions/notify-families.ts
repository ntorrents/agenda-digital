'use server'

import { sendPushToUser, sendPushToUsers } from '@/lib/push/send'
import {
  getGuardianIdsForClassroom,
  getGuardianIdsForSchool,
} from '@/lib/push/recipients'
import { PUSH_COPY, messageBody } from '@/lib/push/copy'

/**
 * Notifica famílies després de crear un avís (comunicació).
 * Els esdeveniments de calendari NO envien push.
 */
export async function notifyFamiliesOfAnnouncement(input: {
  id?: string | null
  schoolId: string
  title: string
  eventType: 'event' | 'announcement'
  audience: string
  classroomId?: string | null
}) {
  try {
    if (input.eventType !== 'announcement') {
      return { skipped: true as const }
    }
    if (input.audience === 'staff') {
      return { skipped: true as const }
    }

    let guardianIds: string[] = []
    if (input.audience === 'classroom') {
      if (!input.classroomId) return { skipped: true as const }
      guardianIds = await getGuardianIdsForClassroom(input.classroomId)
    } else if (input.audience === 'school') {
      guardianIds = await getGuardianIdsForSchool(input.schoolId)
    } else {
      return { skipped: true as const }
    }

    if (!guardianIds.length) {
      return { sent: 0, failed: 0, cleaned: 0 }
    }

    return await sendPushToUsers(guardianIds, {
      title: PUSH_COPY.announcement.title,
      body: input.title.trim(),
      url: '/mi-hijo/avisos',
      tag: `announcement-${input.id || input.schoolId}`,
    })
  } catch (e) {
    console.warn('[push] notifyFamiliesOfAnnouncement failed', e)
    return { sent: 0, failed: 0, cleaned: 0 }
  }
}

/** Notifica el destinatari d’un missatge privat (direcció ↔ família). */
export async function notifyUserOfPrivateMessage(input: {
  receiverId: string
  messageId?: string | null
  content: string
}) {
  try {
    return await sendPushToUser(input.receiverId, {
      title: PUSH_COPY.message.title,
      body: messageBody(input.content),
      url: '/mi-hijo/mensajes',
      tag: `message-${input.messageId || input.receiverId}`,
    })
  } catch (e) {
    console.warn('[push] notifyUserOfPrivateMessage failed', e)
    return { sent: 0, failed: 0, cleaned: 0 }
  }
}
