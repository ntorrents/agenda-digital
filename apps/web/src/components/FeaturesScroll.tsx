import type { CSSProperties } from 'react'
import { useI18n } from '../i18n'

export function FeaturesScroll() {
  const { t } = useI18n()

  return (
    <section id="funcionalitats" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-pd-cream via-pd-cream-dark/50 to-pd-cream pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 mb-10">
        <p className="text-xs font-black uppercase tracking-widest text-pd-teal mb-2">{t.features.label}</p>
        <h2 className="font-display font-black text-3xl sm:text-4xl text-stone-900">{t.features.title}</h2>
        <p className="mt-3 text-stone-500 font-medium max-w-xl">{t.features.subtitle}</p>
        <p className="mt-4 text-[11px] font-bold text-stone-400 uppercase tracking-wider">{t.features.scrollHint}</p>
      </div>

      <div className="relative overflow-x-auto no-scrollbar pb-4 px-4 sm:px-6">
        <div className="flex gap-5 w-max min-w-full px-2">
          {t.features.items.map((feature, i) => (
            <article
              key={feature.id}
              className="group relative w-[280px] sm:w-[300px] shrink-0"
              style={{ '--rot': `${(i % 3 - 1) * 2}deg` } as CSSProperties}
            >
              <div
                className="diary-shadow rounded-[24px] bg-white border border-stone-200/60 overflow-hidden h-full transition-transform duration-300 group-hover:-translate-y-2 group-hover:rotate-0"
                style={{ transform: `rotate(${(i % 3 - 1) * 1.5}deg)` }}
              >
                <div className={`h-2 bg-gradient-to-r ${feature.color}`} />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-3xl">{feature.icon}</span>
                    <span className="text-[10px] font-black text-stone-300">#{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="font-display font-black text-lg text-stone-800 leading-tight mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{feature.description}</p>
                </div>
                <div className="px-6 pb-5 space-y-2 opacity-30">
                  <div className="h-1 bg-stone-200 rounded-full w-full" />
                  <div className="h-1 bg-stone-200 rounded-full w-4/5" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-12 overflow-hidden border-y border-stone-200/60 bg-white/50 py-3">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, dup) => (
            <div key={dup} className="flex shrink-0">
              {t.features.items.map((f) => (
                <span key={`${dup}-${f.id}`} className="mx-6 text-sm font-bold text-stone-400 flex items-center gap-2">
                  <span>{f.icon}</span> {f.title}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
