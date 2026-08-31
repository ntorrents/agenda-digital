import type { Translations } from './types'
import { features, galleryItems } from './ca'

const esFeatureTitles: Record<string, string> = {
  agenda: 'Agenda diaria',
  nota: 'Nota del día del aula',
  bulk: 'Registro rápido para educadoras',
  avisos: 'Avisos y circulares',
  missatges: 'Mensajes privados',
  galeria: 'Galería por días',
  calendari: 'Calendario escolar',
  menu: 'Menú del comedor',
  direccio: 'Panel de dirección',
  gestio: 'Gestión del centro',
  pwa: 'App instalable (PWA)',
  i18n: 'Multilingüe y marca propia',
}

const esFeatureDescs: Record<string, string> = {
  agenda: 'Comidas, siesta, pañal, estado de ánimo, notas y fotos del día — todo en un solo lugar para cada infant.',
  nota: 'Un mensaje (y foto opcional) para todo el aula, visible para todas las familias del grupo.',
  bulk: 'Marca la comida como «Todo», publica la foto grupal y la nota del día en un solo clic.',
  avisos: 'Comunicados generales o por aula, con opción de fijarlos como destacados en el tablón familiar.',
  missatges: 'La dirección contacta familias concretas con indicador de lectura y respuesta.',
  galeria: 'Fotos individuales y grupales agrupadas por fecha. Las familias pueden descargarlas en ZIP.',
  calendari: 'Eventos, festivos y actividades del centro o del aula, siempre a mano.',
  menu: 'Sube el menú mensual en imagen, PDF o texto. Las familias lo consultan desde la app.',
  direccio: 'Métricas del día: agendas pendientes, bajas del personal y alertas de alergias.',
  gestio: 'Alumnos, familias, aulas, equipo docente y envío masivo de accesos por correo.',
  pwa: 'Funciona como una app en el móvil de familias y educadoras, sin pasar por las tiendas.',
  i18n: 'CA, ES, EN y FR. Cada centro muestra su logo y nombre en la app familiar.',
}

const esGalleryCaptions: Record<string, string> = {
  agenda: 'El día de Marc, explicado con cariño',
  foto: 'Momentos del patio compartidos con las familias',
  menu: 'El menú del mes, siempre accesible',
  avis: 'Circulares y comunicados destacados',
  calendari: 'Festivos y actividades del curso',
  missatge: 'Canal directo con la dirección',
  familia: 'Acceso rápido desde el móvil',
  equip: 'Educadoras y auxiliares conectadas',
  direccio: 'Resumen del día de un vistazo',
}

export const es: Translations = {
  meta: {
    title: 'Petit Diari — Agenda digital para escuelas infantiles',
    description: 'El día a día en la escuela infantil, cerca de la familia. Agenda digital para centros 0-3.',
  },
  nav: {
    features: 'Funcionalidades',
    gallery: 'Galería',
    pricing: 'Precios',
    faq: 'FAQ',
    contact: 'Contacto',
    enterApp: 'Entrar a la App',
  },
  hero: {
    badge: 'Escuelas infantiles 0-3',
    title: 'El día a día en la escuela,',
    titleHighlight: 'cerca de la familia',
    subtitle: 'Petit Diari conecta escuelas y familias con una agenda digital pensada para el ritmo de los más pequeños.',
    ctaPrimary: 'Pide una demo',
    ctaSecondary: 'Descubre cómo funciona',
    scrollHint: 'Desplázate para explorar',
  },
  features: {
    label: 'Funcionalidades',
    title: 'Todo lo que necesitas, como en un cuaderno',
    subtitle: 'Cada página del diario cubre una parte del día a día del centro.',
    scrollHint: '← Desplázate horizontalmente →',
    items: features.map((f) => ({
      ...f,
      title: esFeatureTitles[f.id] ?? f.title,
      description: esFeatureDescs[f.id] ?? f.description,
    })),
  },
  gallery: {
    label: 'Experiencia',
    title: 'Una app que parece un diario',
    subtitle: 'Interfaz cálida, intuitiva y pensada para el móvil de las familias.',
    items: galleryItems.map((g) => ({
      ...g,
      caption: esGalleryCaptions[g.id] ?? g.caption,
    })),
  },
  languages: {
    label: 'Idiomas',
    title: 'Hablamos tu idioma',
    subtitle: 'Interfaz disponible en cuatro idiomas para adaptarse a familias y equipo.',
    langs: [
      { code: 'CA', name: 'Catalán' },
      { code: 'ES', name: 'Castellano' },
      { code: 'EN', name: 'Inglés' },
      { code: 'FR', name: 'Francés' },
    ],
  },
  pricing: {
    label: 'Precios',
    title: 'Planes por tamaño de centro',
    subtitle: 'Precios orientativos. Contáctanos para un presupuesto a medida.',
    note: 'Todos los planes incluyen soporte, actualizaciones y formación inicial.',
    plans: [
      {
        id: 'petit',
        name: 'Pequeño',
        price: '~250',
        unit: '€/año',
        description: 'Centros de hasta 2 aulas o 30 alumnos',
        sticker: '⭐',
        features: ['Agenda diaria ilimitada', 'Galería y avisos', 'App PWA para familias', 'Configuración inicial incluida'],
      },
      {
        id: 'mitja',
        name: 'Mediano',
        price: '~350',
        unit: '€/año',
        description: 'Centros de 3 a 5 aulas o más de 30 alumnos',
        highlight: true,
        sticker: '🌟',
        features: ['Todo lo del plan Pequeño', 'Mensajes privados', 'Panel de dirección', 'Prioridad en soporte'],
      },
      {
        id: 'gran',
        name: 'Grande',
        price: 'A medida',
        unit: '',
        description: 'Centros grandes o redes',
        sticker: '🏫',
        features: ['Todo lo del plan Mediano', 'Múltiples centros', 'Importación de datos', 'Acuerdo personalizado'],
      },
    ],
  },
  faq: {
    label: 'FAQ',
    title: 'Preguntas frecuentes',
    items: [
      {
        q: '¿Hay que instalar algo?',
        a: 'No. Petit Diari es una app web que se puede instalar en el móvil como PWA, pero funciona perfectamente desde el navegador.',
      },
      {
        q: '¿Las familias pueden ver fotos de todos los niños?',
        a: 'No. Cada familia solo ve la información de su hijo o hija, excepto las fotos grupales del aula.',
      },
      {
        q: '¿Cuánto tarda ponerlo en marcha?',
        a: 'Con la formación inicial incluida, un centro pequeño puede estar operativo en menos de una semana.',
      },
      {
        q: '¿Se pueden exportar los datos?',
        a: 'Sí. Las familias pueden descargar las fotos en ZIP y el centro puede solicitar exportaciones.',
      },
      {
        q: '¿Funciona en más de un idioma?',
        a: 'Sí. Catalán, castellano, inglés y francés. Cada usuario elige su idioma.',
      },
      {
        q: '¿Qué pasa si una educadora está de baja?',
        a: 'La dirección gestiona la asistencia del equipo y puede reasignar aulas desde el panel de configuración.',
      },
    ],
  },
  contact: {
    label: 'Contacto',
    title: '¿Hablamos de tu centro?',
    subtitle: 'Cuéntanos tu escuela infantil y te enviaremos una demo personalizada.',
    name: 'Nombre',
    email: 'Correo electrónico',
    school: 'Nombre del centro',
    message: 'Mensaje',
    submit: 'Enviar mensaje',
    sending: 'Enviando...',
    success: '¡Mensaje enviado! Te contactaremos pronto.',
    error: 'No se pudo enviar. Inténtalo de nuevo.',
    errorNoKey: 'Formulario no configurado. Reinicia el servidor local (npm run dev:web) o vuelve a desplegar en Vercel tras añadir VITE_WEB3FORMS_KEY.',
  },
  footer: {
    tagline: 'El día a día en la escuela, cerca de la familia.',
    rights: 'Todos los derechos reservados.',
    madeIn: 'Hecho con cariño para escuelas infantiles',
  },
}
