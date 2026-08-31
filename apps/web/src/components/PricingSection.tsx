import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useI18n } from '../i18n'
import { useMotionSafe } from '../lib/motion-safe'

export function PricingSection() {
  const { t } = useI18n()
  const { hidden, visible } = useMotionSafe()

  return (
    <section id="preus" className="py-24 relative">
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_27px,#e7e5e4_27px,#e7e5e4_28px)] opacity-30 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-black uppercase tracking-widest text-pd-teal mb-2">{t.pricing.label}</p>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-stone-900">{t.pricing.title}</h2>
          <p className="mt-3 text-stone-500 font-medium">{t.pricing.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {t.pricing.plans.map((plan, i) => (
            <motion.article
              key={plan.id}
              initial={hidden || { opacity: 1, y: 0 }}
              whileInView={visible}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className={`relative rounded-[28px] p-6 sm:p-8 transition-transform hover:-translate-y-1 ${
                plan.highlight
                  ? 'bg-pd-teal text-white diary-shadow scale-[1.02] md:scale-105 z-10'
                  : 'bg-white border border-stone-200/80 diary-shadow'
              }`}
            >
              {plan.sticker && (
                <span className="absolute -top-3 -right-2 text-2xl sticker animate-wiggle">{plan.sticker}</span>
              )}

              <h3 className={`font-display font-black text-xl ${plan.highlight ? 'text-white' : 'text-stone-800'}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mt-1 ${plan.highlight ? 'text-white/70' : 'text-stone-500'}`}>
                {plan.description}
              </p>

              <div className="mt-6 mb-6">
                <span className={`font-display font-black text-4xl ${plan.highlight ? 'text-white' : 'text-pd-teal'}`}>
                  {plan.price}
                </span>
                {plan.unit && (
                  <span className={`text-sm font-bold ml-1 ${plan.highlight ? 'text-white/70' : 'text-stone-400'}`}>
                    {plan.unit}
                  </span>
                )}
                {plan.monthlyEquivalent && (
                  <p className={`text-xs font-semibold mt-2 inline-block px-2.5 py-1 rounded-full ${
                    plan.highlight
                      ? 'bg-white/15 text-white/90'
                      : 'bg-pd-teal/8 text-pd-teal'
                  }`}>
                    {plan.monthlyEquivalent}
                  </p>
                )}
              </div>

              <ul className="space-y-3">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-sm">
                    <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.highlight ? 'text-pd-amber' : 'text-pd-teal'}`} />
                    <span className={plan.highlight ? 'text-white/90' : 'text-stone-600'}>{feat}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#contacte"
                className={`mt-8 block text-center py-3 rounded-2xl text-sm font-bold transition-colors ${
                  plan.highlight
                    ? 'bg-white text-pd-teal hover:bg-pd-amber-soft'
                    : 'bg-pd-teal/10 text-pd-teal hover:bg-pd-teal/20'
                }`}
              >
                {t.hero.ctaPrimary}
              </a>
            </motion.article>
          ))}
        </div>

        <p className="text-center text-xs sm:text-sm text-stone-400 font-normal leading-relaxed mt-10 max-w-3xl mx-auto">
          {t.pricing.note}
        </p>
      </div>
    </section>
  )
}
