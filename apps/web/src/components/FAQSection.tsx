import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useI18n } from '../i18n'

const stickyColors = [
  'bg-pd-amber-soft border-amber-200 rotate-1',
  'bg-sky-50 border-sky-200 -rotate-1',
  'bg-emerald-50 border-emerald-200 rotate-2',
  'bg-rose-50 border-rose-200 -rotate-2',
  'bg-violet-50 border-violet-200 rotate-1',
  'bg-lime-50 border-lime-200 -rotate-1',
]

export function FAQSection() {
  const { t } = useI18n()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="py-24 bg-white/60">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-black uppercase tracking-widest text-pd-teal mb-2">{t.faq.label}</p>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-stone-900">{t.faq.title}</h2>
        </div>

        <div className="space-y-4">
          {t.faq.items.map((item, i) => (
            <motion.div
              key={i}
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className={`w-full text-left rounded-2xl border p-5 transition-all ${stickyColors[i % stickyColors.length]} ${
                  openIndex === i ? 'shadow-md' : 'shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="font-display font-black text-stone-800 text-sm sm:text-base leading-snug">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 text-stone-400 transition-transform duration-300 ${
                      openIndex === i ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-3 text-sm text-stone-600 leading-relaxed pr-6">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
