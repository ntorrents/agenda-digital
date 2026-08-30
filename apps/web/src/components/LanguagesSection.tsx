import { motion } from 'framer-motion'
import { useI18n } from '../i18n'
import { useMotionSafe } from '../lib/motion-safe'

const langColors = [
  'from-red-400 to-yellow-400',
  'from-yellow-400 to-red-500',
  'from-blue-400 to-red-400',
  'from-blue-500 to-white',
]

export function LanguagesSection() {
  const { t } = useI18n()
  const { hiddenScale, visibleScale } = useMotionSafe()

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-pd-teal mb-2">{t.languages.label}</p>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-stone-900">{t.languages.title}</h2>
            <p className="mt-3 text-stone-500 font-medium">{t.languages.subtitle}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {t.languages.langs.map((lang, i) => (
              <motion.div
                key={lang.code}
                initial={hiddenScale || { opacity: 1, scale: 1 }}
                whileInView={visibleScale}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="relative group"
              >
                <div className="diary-shadow rounded-[20px] bg-white border border-stone-200/60 p-5 text-center transition-shadow group-hover:shadow-lg">
                  <div className={`w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br ${langColors[i]} mb-3 shadow-sm flex items-center justify-center`}>
                    <span className="text-white font-black text-sm drop-shadow-sm">{lang.code}</span>
                  </div>
                  <p className="font-display font-black text-stone-800">{lang.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
