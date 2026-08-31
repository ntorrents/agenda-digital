export type Locale = 'ca' | 'es' | 'en'

export type Feature = {
  id: string
  icon: string
  color: string
  title: string
  description: string
}

export type GalleryItem = {
  id: string
  label: string
  caption: string
  rotate: number
  color: string
  desktopOnly?: boolean
}

export type PricingPlan = {
  id: string
  name: string
  price: string
  unit: string
  monthlyEquivalent?: string
  description: string
  features: string[]
  highlight?: boolean
  sticker?: string
}

export type FAQItem = {
  q: string
  a: string
}

export type Translations = {
  meta: { title: string; description: string }
  nav: {
    features: string
    gallery: string
    pricing: string
    faq: string
    contact: string
    enterApp: string
  }
  hero: {
    badge: string
    title: string
    titleHighlight: string
    subtitle: string
    ctaPrimary: string
    ctaSecondary: string
    scrollHint: string
  }
  features: {
    label: string
    title: string
    subtitle: string
    scrollHint: string
    items: Feature[]
  }
  gallery: {
    label: string
    title: string
    subtitle: string
    items: GalleryItem[]
  }
  languages: {
    label: string
    title: string
    subtitle: string
    langs: { code: string; name: string }[]
  }
  origin: {
    label: string
    title: string
    lead: string
    paragraphs: string[]
    closing: string
    highlights: {
      madeIn: string
      tested: string
      families: string
    }
  }
  pricing: {
    label: string
    title: string
    subtitle: string
    note: string
    plans: PricingPlan[]
  }
  faq: {
    label: string
    title: string
    items: FAQItem[]
  }
  contact: {
    label: string
    title: string
    subtitle: string
    name: string
    email: string
    school: string
    message: string
    submit: string
    sending: string
    success: string
    error: string
    errorNoKey: string
  }
  footer: {
    tagline: string
    rights: string
    madeIn: string
  }
}
