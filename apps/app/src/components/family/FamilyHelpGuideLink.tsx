import Link from 'next/link'

/** Enllaç discret cap a la guia d'instal·lació / notificacions. */
export function FamilyHelpGuideLink({ className = '' }: { className?: string }) {
  return (
    <p className={`text-center text-[11px] text-stone-400 leading-relaxed ${className}`}>
      <span aria-hidden>💡 </span>
      <Link
        href="/mi-hijo/ayuda"
        className="italic text-stone-500 hover:text-teal-700 underline-offset-2 hover:underline"
      >
        Vols instal·lar l&apos;app i rebre notificacions? Consulta la guia d&apos;ajuda.
      </Link>
    </p>
  )
}
