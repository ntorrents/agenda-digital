import { motion } from 'framer-motion'
import { Heart, MapPin, Sprout } from 'lucide-react'
import { useI18n } from '../i18n'
import { useMotionSafe } from '../lib/motion-safe'

export function OriginStorySection() {
  const { t } = useI18n()
  const { hidden, visible } = useMotionSafe()

  return (
    <section id="origen" className="py-24 bg-pd-cream-dark/35 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(15,118,110,0.06),transparent_60%)] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-[1fr_280px] gap-12 lg:gap-16 items-start">
          <motion.div
            initial={hidden || { opacity: 1, y: 0 }}
            whileInView={visible}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-black uppercase tracking-widest text-pd-teal mb-2">{t.origin.label}</p>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-stone-900 leading-tight">
              {t.origin.title}
            </h2>
            <p className="mt-5 text-lg text-stone-700 font-medium leading-relaxed">
              {t.origin.lead}
            </p>

            <div className="mt-8 space-y-5">
              {t.origin.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="text-stone-600 font-medium leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {t.origin.closing && (
              <p className="mt-8 text-stone-800 font-semibold leading-relaxed border-l-2 border-pd-teal/40 pl-4">
                {t.origin.closing}
              </p>
            )}
          </motion.div>

          <motion.aside
            initial={hidden || { opacity: 1, y: 0 }}
            whileInView={visible}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="hidden lg:flex flex-col gap-4"
          >
            {[
              { icon: MapPin, text: t.origin.highlights.madeIn },
              { icon: Sprout, text: t.origin.highlights.tested },
              { icon: Heart, text: t.origin.highlights.families },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-start gap-3 rounded-2xl bg-white/80 border border-stone-200/60 p-4 shadow-sm"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pd-teal/10 text-pd-teal">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm font-medium text-stone-600 leading-snug pt-1">{text}</p>
              </div>
            ))}
          </motion.aside>
        </div>
      </div>
    </section>
  )
}
