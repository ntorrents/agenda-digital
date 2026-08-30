import { MessageSquare, ArrowRight, Bell, Mail } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function ComunicacionPage() {
  const t = useTranslations('dashboardComunicacion')

  return (
    <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto h-[calc(100vh-73px)] lg:h-screen flex flex-col">
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 shadow-sm">
          <MessageSquare className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-stone-800">{t('title')}</h1>
          <p className="text-sm text-stone-500 font-medium">{t('desc')}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white border border-stone-200/80 rounded-3xl shadow-sm relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-stone-50/50" />
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-teal-50 rounded-full blur-3xl opacity-50" />
        
        <div className="relative z-10 w-full max-w-3xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-stone-800 mb-2">{t('centerTitle')}</h2>
            <p className="text-stone-500 font-medium leading-relaxed max-w-lg mx-auto">
              {t('centerDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <Link href="/dashboard/avisos" className="group bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:border-amber-200 transition-all text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="h-12 w-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4 relative z-10">
                <Bell className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-stone-800 text-lg mb-1">{t('noticesTitle')}</h4>
              <p className="text-sm text-stone-500 mb-4">{t('noticesDesc')}</p>
              <span className="text-sm font-bold text-amber-600 flex items-center gap-1">
                {t('access')} <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            
            <Link href="/dashboard/missatges" className="group bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:border-cyan-200 transition-all text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="h-12 w-12 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center mb-4 relative z-10">
                <Mail className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-stone-800 text-lg mb-1">{t('messagesTitle')}</h4>
              <p className="text-sm text-stone-500 mb-4">{t('messagesDesc')}</p>
              <span className="text-sm font-bold text-cyan-600 flex items-center gap-1">
                {t('access')} <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
