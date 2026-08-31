type LogoProps = {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

const sizes = {
  sm: 'h-8 w-auto',
  md: 'h-9 w-auto',
  lg: 'h-12 w-auto',
}

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  return (
    <span className={`flex items-center gap-2.5 shrink-0 ${className}`}>
      <img
        src="/logo-petit-diari.svg"
        alt="Petit Diari"
        className={`${sizes[size]} object-contain`}
      />
      {showText && (
        <span className="font-display font-black text-lg text-stone-800 tracking-tight">
          Petit <span className="text-pd-teal">Diari</span>
        </span>
      )}
    </span>
  )
}
