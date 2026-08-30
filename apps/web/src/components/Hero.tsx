import { motion } from 'framer-motion'
import { ChevronDown, Sparkles } from 'lucide-react'
import { useI18n } from '../i18n'
import { useMotionSafe } from '../lib/motion-safe'

export function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-pd-teal/8 blur-3xl" />
      <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-pd-amber/15 blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-64 h-64 rounded-full bg-pd-coral/10 blur-3xl" />
      <motion.div
        className="absolute top-32 right-[15%] w-16 h-16 rounded-2xl bg-pd-amber/30 rotate-12"
        animate={{ y: [0, -16, 0], rotate: [12, 18, 12] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-40 left-[10%] w-12 h-12 rounded-full bg-pd-teal/20"
        animate={{ y: [0, 12, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute top-1/2 right-[8%] w-8 h-8 rounded-lg bg-pd-lavender/25 -rotate-6"
        animate={{ y: [0, -10, 0], rotate: [-6, 6, -6] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
    </div>
  )
}

function DiaryIllustration() {
  const { hidden, visible } = useMotionSafe()

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <motion.div
        initial={hidden || { opacity: 1, y: 0, rotate: -2 }}
        animate={{ ...visible, rotate: -2 }}
        transition={{ duration: 0.8, delay: 0.15 }}
        className="relative diary-shadow rounded-[28px] bg-white border border-stone-200/80 overflow-hidden"
      >
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-pd-teal/20 to-transparent z-10" />
        <div className="absolute left-3 top-8 bottom-8 w-0.5 border-l-2 border-dashed border-pd-teal/20" />

        <div className="bg-gradient-to-r from-pd-teal to-pd-teal-light px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">👶</div>
          <div>
            <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider">Agenda d&apos;avui</p>
            <p className="text-white font-black text-sm">Aula dels Conills</p>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full bg-pd-amber animate-pulse-dot" />
        </div>

        <div className="p-5 space-y-3">
          {[
            { emoji: '🥣', label: 'Esmorzar', val: 'Tot!', color: 'bg-emerald-50 text-emerald-700' },
            { emoji: '😴', label: 'Migdiada', val: '1h 20m', color: 'bg-indigo-50 text-indigo-700' },
            { emoji: '🍼', label: 'Bolquer', val: 'Sec', color: 'bg-sky-50 text-sky-700' },
            { emoji: '😊', label: 'Ànim', val: 'Molt bé', color: 'bg-amber-50 text-amber-700' },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center gap-3 bg-stone-50 rounded-2xl px-4 py-2.5"
            >
              <span className="text-lg">{row.emoji}</span>
              <span className="text-xs font-bold text-stone-500 flex-1">{row.label}</span>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${row.color}`}>{row.val}</span>
            </div>
          ))}

          <div className="flex gap-2 pt-1">
            {['bg-teal-100', 'bg-amber-100', 'bg-rose-100'].map((bg, i) => (
              <div key={i} className={`flex-1 h-14 rounded-xl ${bg} border border-white shadow-sm`} />
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute -top-4 -right-4 sticker bg-pd-amber text-amber-900 text-xs font-black px-3 py-2 rounded-xl rotate-6 shadow-lg"
        animate={{ rotate: [6, 10, 6] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        ✨ Nou!
      </motion.div>
    </div>
  )
}

export function Hero() {
  const { t } = useI18n()
  const { hidden, visible } = useMotionSafe()

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
      <FloatingShapes />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={hidden || { opacity: 1, y: 0 }}
            animate={visible}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pd-teal/10 text-pd-teal text-xs font-bold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              {t.hero.badge}
            </span>

            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-stone-900 leading-[1.08] tracking-tight">
              {t.hero.title}
              <br />
              <span className="text-pd-teal">{t.hero.titleHighlight}</span>
            </h1>

            <p className="mt-6 text-lg text-stone-500 font-medium leading-relaxed max-w-lg">
              {t.hero.subtitle}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#contacte"
                className="inline-flex items-center px-6 py-3.5 text-sm font-bold text-white bg-pd-teal hover:bg-pd-teal-dark rounded-2xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                {t.hero.ctaPrimary}
              </a>
              <a
                href="#funcionalitats"
                className="inline-flex items-center px-6 py-3.5 text-sm font-bold text-pd-teal bg-white border-2 border-pd-teal/20 hover:border-pd-teal/40 rounded-2xl transition-all hover:-translate-y-0.5"
              >
                {t.hero.ctaSecondary}
              </a>
            </div>
          </motion.div>

          <DiaryIllustration />
        </div>

        <motion.div
          className="mt-12 flex flex-col items-center gap-1 text-stone-400 lg:absolute lg:bottom-8 lg:left-1/2 lg:-translate-x-1/2 lg:mt-0"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest">{t.hero.scrollHint}</span>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </div>
    </section>
  )
}
