import { motion } from 'framer-motion'
import { useI18n } from '../i18n'
import { useMotionSafe } from '../lib/motion-safe'

function MockAgenda() {
  return (
    <div className="space-y-2 p-3">
      {['🥣 Esmorzar — Tot!', '😴 Migdiada — 1h', '😊 Ànim — Molt bé'].map((line) => (
        <div key={line} className="text-[9px] font-bold text-stone-600 bg-white/80 rounded-lg px-2 py-1.5">{line}</div>
      ))}
      <div className="flex gap-1 mt-2">
        <div className="flex-1 h-8 rounded-lg bg-teal-200/60" />
        <div className="flex-1 h-8 rounded-lg bg-amber-200/60" />
      </div>
    </div>
  )
}

function MockGallery() {
  return (
    <div className="grid grid-cols-2 gap-1.5 p-3">
      {['bg-teal-200/50', 'bg-rose-200/50', 'bg-amber-200/50', 'bg-sky-200/50'].map((c, i) => (
        <div key={i} className={`aspect-square rounded-lg ${c}`} />
      ))}
    </div>
  )
}

function MockMenu() {
  return (
    <div className="p-3 space-y-1.5">
      <div className="h-16 rounded-lg bg-lime-100/80 border border-lime-200/50" />
      <p className="text-[8px] font-bold text-stone-500 text-center">Menú — Setembre</p>
    </div>
  )
}

function MockAvis() {
  return (
    <div className="p-3 space-y-2">
      <div className="bg-rose-50 rounded-lg px-2 py-2 border-l-2 border-rose-400">
        <p className="text-[8px] font-black text-rose-600">📌 DESTACAT</p>
        <p className="text-[9px] font-bold text-stone-700 mt-0.5">Reunió de famílies</p>
      </div>
      <div className="bg-stone-50 rounded-lg px-2 py-1.5">
        <p className="text-[9px] font-bold text-stone-600">Excursió al parc</p>
      </div>
    </div>
  )
}

function MockCalendari() {
  return (
    <div className="p-3">
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: 21 }).map((_, i) => (
          <div
            key={i}
            className={`aspect-square rounded-sm text-[6px] flex items-center justify-center font-bold ${
              i === 14 ? 'bg-indigo-500 text-white' : 'bg-stone-100 text-stone-400'
            }`}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  )
}

function MockMissatge() {
  return (
    <div className="p-3 space-y-2">
      <div className="bg-violet-50 rounded-xl rounded-bl-sm px-2.5 py-2 ml-4">
        <p className="text-[9px] font-medium text-stone-700">Hola! Demà porteu bata...</p>
      </div>
      <div className="bg-pd-teal/10 rounded-xl rounded-br-sm px-2.5 py-2 mr-4">
        <p className="text-[9px] font-medium text-stone-700">Perfecte, gràcies!</p>
      </div>
    </div>
  )
}

const mockComponents: Record<string, () => React.ReactNode> = {
  agenda: MockAgenda,
  foto: MockGallery,
  menu: MockMenu,
  avis: MockAvis,
  calendari: MockCalendari,
  missatge: MockMissatge,
}

export function DiaryGallery() {
  const { t } = useI18n()
  const { hidden, visible, hiddenScale, visibleScale } = useMotionSafe()

  return (
    <section id="galeria" className="py-24 bg-pd-cream-dark/40 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-black uppercase tracking-widest text-pd-teal mb-2">{t.gallery.label}</p>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-stone-900">{t.gallery.title}</h2>
          <p className="mt-3 text-stone-500 font-medium max-w-lg mx-auto">{t.gallery.subtitle}</p>
        </div>

        {/* Scattered polaroid wall */}
        <div className="relative min-h-[520px] sm:min-h-[480px]">
          {t.gallery.items.map((item, i) => {
            const Mock = mockComponents[item.id]
            const positions = [
              'top-0 left-[5%] sm:left-[8%]',
              'top-8 right-[5%] sm:right-[10%]',
              'top-[38%] left-[2%] sm:left-[15%]',
              'top-[32%] right-[2%] sm:right-[12%]',
              'bottom-8 left-[10%] sm:left-[25%]',
              'bottom-0 right-[8%] sm:right-[20%]',
            ]

            return (
              <motion.div
                key={item.id}
                initial={hidden ? false : { opacity: 0, y: 24, rotate: item.rotate }}
                whileInView={{ ...visible, rotate: item.rotate }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                whileHover={{ scale: 1.05, rotate: 0, zIndex: 20 }}
                className={`absolute w-[140px] sm:w-[170px] ${positions[i]} cursor-default`}
              >
                <div className="polaroid rounded-sm transition-shadow duration-300 hover:shadow-2xl">
                  <div className={`aspect-[4/3] rounded-sm overflow-hidden ${item.color}`}>
                    {Mock?.()}
                  </div>
                  <p className="absolute bottom-3 left-3 right-3 text-[10px] font-bold text-stone-600 leading-tight">
                    {item.caption}
                  </p>
                </div>
                <span className="absolute -top-2 -right-2 bg-pd-teal text-white text-[9px] font-black px-2 py-0.5 rounded-md sticker">
                  {item.label}
                </span>
              </motion.div>
            )
          })}

          {/* Center decorative diary */}
          <motion.div
            initial={hiddenScale || { opacity: 1, scale: 1 }}
            whileInView={visibleScale}
            viewport={{ once: true }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-pd-teal to-pd-teal-light flex items-center justify-center shadow-xl z-10"
          >
            <div className="text-center text-white">
              <p className="text-3xl sm:text-4xl">📖</p>
              <p className="font-display font-black text-xs sm:text-sm mt-1">Petit Diari</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
