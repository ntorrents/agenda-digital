import { Header } from '../components/Header'
import { Hero } from '../components/Hero'
import { FeaturesScroll } from '../components/FeaturesScroll'
import { DiaryGallery } from '../components/DiaryGallery'
import { LanguagesSection } from '../components/LanguagesSection'
import { OriginStorySection } from '../components/OriginStorySection'
import { PricingSection } from '../components/PricingSection'
import { FAQSection } from '../components/FAQSection'
import { ContactForm } from '../components/ContactForm'
import { Footer } from '../components/Footer'

export function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <FeaturesScroll />
        <DiaryGallery />
        <LanguagesSection />
        <OriginStorySection />
        <PricingSection />
        <FAQSection />
        <ContactForm />
      </main>
      <Footer />
    </>
  )
}
