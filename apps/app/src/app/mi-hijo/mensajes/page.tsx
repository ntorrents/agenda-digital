import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MessageCircle, Mail } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { FamilyHelpGuideLink } from '@/components/family/FamilyHelpGuideLink'

export default async function MissatgesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const t = await getTranslations('messages')

  const { data: messages } = await supabase
    .from('messages')
    .select(
      `
      id,
      content,
      is_read,
      created_at,
      sender:profiles!sender_id(full_name, role)
    `
    )
    .eq('receiver_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 pt-6">
      <div>
        <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-cyan-600" /> {t('title')}
        </h2>
        <p className="text-sm text-stone-500 mt-1">{t('subtitle')}</p>
      </div>

      <div className="space-y-4">
        {!messages || messages.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-2xl border border-stone-200/60 shadow-xs">
            <p className="text-stone-500 font-medium">{t('noMessages')}</p>
          </div>
        ) : (
          messages.map((message: any) => (
            <div
              key={message.id}
              className={`p-5 rounded-[24px] border shadow-xs relative ${
                !message.is_read
                  ? 'bg-cyan-50/30 border-cyan-200'
                  : 'bg-white border-stone-200/60'
              }`}
            >
              {!message.is_read && (
                <div className="absolute top-4 right-4 h-3 w-3 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500/50" />
              )}
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-stone-100 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-stone-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-800">
                    {message.sender?.full_name || t('direction')}
                  </h4>
                  <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wide">
                    {new Date(message.created_at).toLocaleString('ca-ES')}
                  </p>
                </div>
              </div>
              <div className="pl-13">
                <p className="text-sm text-stone-600 whitespace-pre-wrap bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  {message.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <FamilyHelpGuideLink />
    </div>
  )
}
