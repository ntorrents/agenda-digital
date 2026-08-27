import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MessageCircle, ChevronLeft, Send, User } from 'lucide-react'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'

export default async function MensajesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, school_id')
    .eq('id', user.id)
    .single()

  const { data: guardianRel } = await supabase
    .from('student_guardians')
    .select('student_id')
    .eq('guardian_id', user.id)
    .limit(1)
    .single()

  if (!guardianRel) redirect('/login')

  const { data: student } = await supabase
    .from('students')
    .select('id, school_id, classroom_id, classrooms(teacher_id, profiles(full_name))')
    .eq('id', guardianRel.student_id)
    .single()

  // Find the teacher to message
  const classroom: any = student?.classrooms
  const teacherId = classroom?.teacher_id
  const teacherName = classroom?.profiles?.full_name || 'Direcció'

  // Fetch messages
  const { data: messages } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(full_name, role),
      receiver:profiles!messages_receiver_id_fkey(full_name, role)
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: true })

  async function sendMessage(formData: FormData) {
    'use server'
    const content = formData.get('content') as string
    if (!content || !content.trim()) return

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Obtenemos los datos necesarios si no los pasamos por form (por seguridad)
    const { data: guardianRel } = await supabase.from('student_guardians').select('student_id').eq('guardian_id', user.id).single()
    if (!guardianRel) return
    const { data: student } = await supabase.from('students').select('school_id, classrooms(teacher_id)').eq('id', guardianRel.student_id).single()
    
    const targetTeacherId = (student?.classrooms as any)?.teacher_id

    if (targetTeacherId) {
      await supabase.from('messages').insert({
        school_id: student?.school_id,
        sender_id: user.id,
        receiver_id: targetTeacherId,
        student_id: guardianRel.student_id,
        content: content.trim()
      })
    }

    revalidatePath('/mi-hijo/mensajes')
  }

  return (
    <main className="max-w-md mx-auto pt-6 pb-24 px-4 space-y-4 min-h-screen flex flex-col">
      
      {/* Cabecera Fija (idealmente) */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-cyan-600" /> Missatges
            </h2>
            <p className="text-xs font-bold text-stone-500">
              Conversa amb {teacherName}
            </p>
          </div>
        </div>
      </div>

      {/* Historial de Mensajes */}
      <div className="flex-1 overflow-y-auto space-y-3 py-4 no-scrollbar flex flex-col justify-end">
        {!messages || messages.length === 0 ? (
          <div className="bg-stone-50 border border-stone-200/80 rounded-[28px] p-8 text-center shadow-xs my-auto">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-stone-400 mb-3 shadow-sm">
              <MessageCircle className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-stone-800">No hi ha missatges</h3>
            <p className="text-xs text-stone-500 mt-1">Escriu el primer missatge a l'educadora per començar a parlar.</p>
          </div>
        ) : (
          messages.map((msg: any) => {
            const isMine = msg.sender_id === user.id
            const timeStr = new Date(msg.created_at).toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' })

            return (
              <div key={msg.id} className={`flex flex-col max-w-[85%] ${isMine ? 'self-end items-end' : 'self-start items-start'}`}>
                {!isMine && (
                  <span className="text-[10px] font-bold text-stone-400 ml-1 mb-1">
                    {msg.sender?.full_name}
                  </span>
                )}
                <div className={`px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                  isMine 
                    ? 'bg-cyan-600 text-white rounded-br-none' 
                    : 'bg-white border border-stone-200/60 text-stone-800 rounded-bl-none'
                }`}>
                  {msg.content}
                </div>
                <span className="text-[9px] font-bold text-stone-400 mt-1 mx-1">
                  {timeStr}
                </span>
              </div>
            )
          })
        )}
      </div>

      {/* Input Form fijo abajo (simulado con position fixed si es necesario, pero aquí usamos flow normal + min-h-screen) */}
      <form action={sendMessage} className="sticky bottom-4 left-0 w-full mt-auto pt-2">
        <div className="flex items-center gap-2 bg-white border border-stone-200 shadow-lg shadow-stone-200/50 p-2 rounded-full">
          <input 
            type="text" 
            name="content"
            placeholder={`Escriu a ${teacherName}...`}
            className="flex-1 bg-transparent px-4 py-2 text-sm font-medium text-stone-800 focus:outline-none"
            autoComplete="off"
          />
          <button 
            type="submit"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-600 text-white hover:bg-cyan-700 active:scale-95 transition-all shadow-sm"
          >
            <Send className="h-4 w-4 ml-0.5" />
          </button>
        </div>
      </form>

    </main>
  )
}
