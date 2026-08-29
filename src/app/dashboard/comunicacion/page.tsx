import { MessageSquare, Megaphone, Construction, ArrowRight, Bell } from 'lucide-react'
import Link from 'next/link'

export default function ComunicacionPage() {
  return (
    <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto h-[calc(100vh-73px)] lg:h-screen flex flex-col">
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 shadow-sm">
          <MessageSquare className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-stone-800">Comunicació</h1>
          <p className="text-sm text-stone-500 font-medium">Bústia i avisos per a famílies i equip educatiu.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white border border-stone-200/80 rounded-3xl shadow-sm relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-stone-50/50" />
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-teal-50 rounded-full blur-3xl opacity-50" />
        
        <div className="relative z-10 flex flex-col items-center max-w-md">
          <div className="h-24 w-24 bg-white rounded-3xl shadow-lg border border-stone-100 flex items-center justify-center mb-6 relative">
            <Construction className="h-10 w-10 text-stone-300" />
            <div className="absolute -top-3 -right-3 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
              <Megaphone className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-black text-stone-800 mb-2">Mòdul en Construcció</h2>
          <p className="text-stone-500 font-medium mb-8 leading-relaxed">
            Aquest espai centralitzarà totes les comunicacions de l'escola. Properament podràs enviar avisos globals, circulars a les famílies i missatges directes a l'equip.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm text-left">
              <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
                <Bell className="h-4 w-4" />
              </div>
              <h4 className="font-bold text-stone-800 text-sm">Avisos Globals</h4>
              <p className="text-xs text-stone-500 mt-1">Notificacions massives tipus "push" per a tota l'escola.</p>
            </div>
            
            <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm text-left">
              <div className="h-8 w-8 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-3">
                <MessageSquare className="h-4 w-4" />
              </div>
              <h4 className="font-bold text-stone-800 text-sm">Xat i Missatgeria</h4>
              <p className="text-xs text-stone-500 mt-1">Comunicació bidireccional entre direcció, educadores i pares.</p>
            </div>
          </div>

          <Link href="/dashboard" className="mt-8 text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
            Tornar a l'inici <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  )
}
