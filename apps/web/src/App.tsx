import { ErrorBoundary } from './components/ErrorBoundary'
import { I18nProvider } from './i18n'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { FeaturesScroll } from './components/FeaturesScroll'
import { DiaryGallery } from './components/DiaryGallery'
import { LanguagesSection } from './components/LanguagesSection'
import { PricingSection } from './components/PricingSection'
import { FAQSection } from './components/FAQSection'
import { ContactForm } from './components/ContactForm'
import { Footer } from './components/Footer'

export default function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
      <Header />
      <main>
        <Hero />
        <FeaturesScroll />
        <DiaryGallery />
        <LanguagesSection />
        <PricingSection />
        <FAQSection />
        <ContactForm />
      </main>
      <Footer />
      </I18nProvider>
    </ErrorBoundary>
  )
}
