import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useI18n } from '../i18n'
import { useMotionSafe } from '../lib/motion-safe'

type FormStatus = 'idle' | 'loading' | 'success' | 'error' | 'no-key'

export function ContactForm() {
  const { t } = useI18n()
  const { hidden, visible, hiddenScale, visibleScale } = useMotionSafe()
  const [status, setStatus] = useState<FormStatus>('idle')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const key = import.meta.env.VITE_WEB3FORMS_KEY

    if (!key || key === 'your_access_key_here') {
      setStatus('no-key')
      return
    }

    setStatus('loading')
    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: key,
          name: formData.get('name'),
          email: formData.get('email'),
          school: formData.get('school'),
          message: formData.get('message'),
          subject: `Petit Diari — Contacte de ${formData.get('school') || formData.get('name')}`,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setStatus('success')
        form.reset()
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contacte" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-pd-teal/5 via-pd-cream to-pd-amber/10 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-pd-teal mb-2">{t.contact.label}</p>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-stone-900">{t.contact.title}</h2>
            <p className="mt-3 text-stone-500 font-medium">{t.contact.subtitle}</p>

            {/* Decorative envelope */}
            <motion.div
              initial={hiddenScale || { opacity: 1, scale: 1 }}
              whileInView={visibleScale}
              viewport={{ once: true }}
              className="hidden lg:block mt-12 relative w-48 h-36"
            >
              <div className="absolute inset-0 bg-pd-amber-soft rounded-2xl border-2 border-amber-200 shadow-lg" />
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-amber-100 to-transparent clip-envelope" />
              <div className="absolute inset-0 flex items-center justify-center text-4xl">✉️</div>
            </motion.div>
          </div>

          <motion.div
            initial={hidden || { opacity: 1, y: 0 }}
            whileInView={visible}
            viewport={{ once: true }}
            className="diary-shadow rounded-[28px] bg-white border border-stone-200/60 p-6 sm:p-8"
          >
            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="w-12 h-12 text-pd-teal mb-4" />
                <p className="font-display font-black text-lg text-stone-800">{t.contact.success}</p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="mt-6 text-sm font-bold text-pd-teal hover:underline"
                >
                  ←
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                      {t.contact.name}
                    </label>
                    <input
                      id="name"
                      name="name"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pd-teal/20 focus:border-pd-teal/40 transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                      {t.contact.email}
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pd-teal/20 focus:border-pd-teal/40 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="school" className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                    {t.contact.school}
                  </label>
                  <input
                    id="school"
                    name="school"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pd-teal/20 focus:border-pd-teal/40 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                    {t.contact.message}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pd-teal/20 focus:border-pd-teal/40 transition-all resize-none"
                  />
                </div>

                {(status === 'error' || status === 'no-key') && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {status === 'no-key' ? t.contact.errorNoKey : t.contact.error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-pd-teal hover:bg-pd-teal-dark disabled:opacity-60 rounded-2xl shadow-md transition-all hover:-translate-y-0.5"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t.contact.sending}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {t.contact.submit}
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
