import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Petit Diari',
    short_name: 'Petit Diari',
    description: "El dia a dia a l'escola, a prop de la família",
    start_url: '/',
    display: 'standalone',
    background_color: '#fafaf9',
    theme_color: '#0f766e',
    orientation: 'portrait-primary',
    categories: ['education', 'productivity'],
    icons: [
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
