import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MessageCircle, Mail } from 'lucide-react'
import MessageForm from '@/components/dashboard/MessageForm'

export default async function DashboardMissatgesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, school_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="p-8 text-center text-stone-500">
        Aquesta secció només està disponible per a la direcció del centre.
      </div>
    )
  }

  // Fetch all families in the school
  const { data: families } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('school_id', profile.school_id)
    .eq('role', 'guardian')
    .order('full_name')

  // Fetch sent messages
  const { data: sentMessages } = await supabase
    .from('messages')
    .select(`
      id,
      content,
      is_read,
      created_at,
      receiver:profiles!receiver_id(full_name)
    `)
    .eq('sender_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-cyan-100 flex items-center justify-center shadow-inner">
          <MessageCircle className="h-6 w-6 text-cyan-600" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-stone-800 tracking-tight">Missatges a Famílies</h2>
          <p className="text-stone-500 font-medium text-sm mt-0.5">Envia comunicats privats directament a una família</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <div className="lg:col-span-1">
          <MessageForm families={families || []} senderId={user.id} schoolId={profile.school_id} />
        </div>

        {/* Historial */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-stone-800">Historial d'enviaments</h3>
          
          {(!sentMessages || sentMessages.length === 0) ? (
            <div className="text-center p-8 bg-white rounded-2xl border border-stone-200 shadow-xs">
              <p className="text-stone-500 font-medium">No has enviat cap missatge encara.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sentMessages.map((msg: any) => (
                <div key={msg.id} className="bg-white border border-stone-200 rounded-[20px] p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-stone-100 flex items-center justify-center">
                        <Mail className="h-4 w-4 text-stone-400" />
                      </div>
                      <span className="text-sm font-bold text-stone-800">
                        Per a: {msg.receiver?.full_name}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-stone-400">
                      {new Date(msg.created_at).toLocaleDateString('ca-ES')}
                    </span>
                  </div>
                  <p className="text-sm text-stone-600 whitespace-pre-wrap pl-10">
                    {msg.content}
                  </p>
                  <div className="mt-3 pl-10">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                      msg.is_read ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'
                    }`}>
                      {msg.is_read ? 'Llegit per la família' : 'Pendent de lectura'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
