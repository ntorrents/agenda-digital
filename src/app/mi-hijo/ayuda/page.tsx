import { HelpCircle, Mail, Phone, ExternalLink, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function AyudaPage() {
  return (
    <main className="max-w-md mx-auto pt-6 pb-12 px-4 space-y-6">
      
      {/* Cabecera */}
      <div className="flex items-center gap-3">
        <Link 
          href="/mi-hijo"
          className="p-2 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-95 transition-all"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-blue-600" /> Ajuda i Centre
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Canals de contacte i suport tècnic.
          </p>
        </div>
      </div>

      <div className="bg-white border border-stone-200/80 rounded-[28px] p-6 shadow-xs space-y-6">
        
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-500 mb-4 shadow-sm border border-blue-100">
            <SchoolLogoPlaceholder />
          </div>
          <h3 className="text-lg font-black text-stone-800">Escola Bressol Pas A Pas</h3>
          <p className="text-sm font-medium text-stone-500 px-4">
            Horari d'atenció: Dilluns a Divendres de 9:00h a 17:00h.
          </p>
        </div>

        <div className="grid gap-3 pt-4 border-t border-stone-100">
          <a href="tel:600000000" className="flex items-center gap-4 p-4 rounded-[20px] bg-stone-50 hover:bg-stone-100 border border-stone-200/50 active:scale-95 transition-all">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm text-stone-600">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Telèfon d'Urgències</p>
              <p className="text-sm font-black text-stone-800">600 000 000</p>
            </div>
          </a>
          
          <a href="mailto:direccio@escola.cat" className="flex items-center gap-4 p-4 rounded-[20px] bg-stone-50 hover:bg-stone-100 border border-stone-200/50 active:scale-95 transition-all">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm text-stone-600">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Correu de Direcció</p>
              <p className="text-sm font-black text-stone-800">direccio@escola.cat</p>
            </div>
          </a>
        </div>
      </div>
      
      <div className="px-2">
        <p className="text-[10px] font-bold text-stone-400 text-center uppercase tracking-wider mb-3">Opcions de l'Aplicació</p>
        <Link href="/mi-hijo/perfil" className="flex items-center justify-between p-4 rounded-[20px] bg-white border border-stone-200/60 shadow-xs active:scale-95 transition-all">
          <span className="text-sm font-black text-stone-700">El Meu Perfil</span>
          <ExternalLink className="h-4 w-4 text-stone-400" />
        </Link>
      </div>

    </main>
  )
}

function SchoolLogoPlaceholder() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  )
}
