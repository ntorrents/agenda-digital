import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MessageCircle, Image as ImageIcon, Bell, FileText, HelpCircle } from 'lucide-react'

export default async function FamilyAppHome() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <main className="px-5 pt-8 pb-12 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
      
      <div className="w-full max-w-sm mx-auto space-y-8">
        
        {/* Welcome Section */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">Pantalla Principal</h2>
          <p className="text-sm font-medium text-stone-500">Tota la informació al teu abast</p>
        </div>

        {/* 6 Grid Buttons */}
        <div className="grid grid-cols-2 gap-4">
          
          <Link 
            href="/mi-hijo/agenda"
            className="group flex flex-col items-center justify-center gap-3 p-5 rounded-[28px] bg-white border border-stone-200/60 shadow-xs hover:shadow-md transition-all active:scale-95"
          >
            <div className="h-16 w-16 rounded-[20px] bg-rose-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <Calendar className="h-8 w-8 text-rose-500" />
            </div>
            <span className="text-sm font-black text-stone-700">Agenda</span>
          </Link>

          <Link 
            href="/mi-hijo/mensajes"
            className="group flex flex-col items-center justify-center gap-3 p-5 rounded-[28px] bg-white border border-stone-200/60 shadow-xs hover:shadow-md transition-all active:scale-95"
          >
            <div className="h-16 w-16 rounded-[20px] bg-cyan-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <MessageCircle className="h-8 w-8 text-cyan-500" />
            </div>
            <span className="text-sm font-black text-stone-700">Missatges</span>
          </Link>

          <Link 
            href="/mi-hijo/galeria"
            className="group flex flex-col items-center justify-center gap-3 p-5 rounded-[28px] bg-white border border-stone-200/60 shadow-xs hover:shadow-md transition-all active:scale-95"
          >
            <div className="h-16 w-16 rounded-[20px] bg-emerald-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <ImageIcon className="h-8 w-8 text-emerald-500" />
            </div>
            <span className="text-sm font-black text-stone-700">Fotos</span>
          </Link>

          <Link 
            href="/mi-hijo/avisos"
            className="group flex flex-col items-center justify-center gap-3 p-5 rounded-[28px] bg-white border border-stone-200/60 shadow-xs hover:shadow-md transition-all active:scale-95"
          >
            <div className="h-16 w-16 rounded-[20px] bg-amber-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <Bell className="h-8 w-8 text-amber-500" />
            </div>
            <span className="text-sm font-black text-stone-700">Tauler</span>
          </Link>

          <Link 
            href="/mi-hijo/calendario"
            className="group flex flex-col items-center justify-center gap-3 p-5 rounded-[28px] bg-white border border-stone-200/60 shadow-xs hover:shadow-md transition-all active:scale-95"
          >
            <div className="h-16 w-16 rounded-[20px] bg-purple-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
            <span className="text-sm font-black text-stone-700">Calendari</span>
          </Link>

          <Link 
            href="/mi-hijo/ayuda"
            className="group flex flex-col items-center justify-center gap-3 p-5 rounded-[28px] bg-white border border-stone-200/60 shadow-xs hover:shadow-md transition-all active:scale-95"
          >
            <div className="h-16 w-16 rounded-[20px] bg-blue-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <HelpCircle className="h-8 w-8 text-blue-500" />
            </div>
            <span className="text-sm font-black text-stone-700">Ajuda</span>
          </Link>

        </div>
      </div>
    </main>
  )
}
