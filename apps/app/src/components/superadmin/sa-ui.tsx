'use client'

import { cn } from '@/lib/utils'

export function SaPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-stone-900 border border-stone-800 rounded-lg overflow-hidden', className)}>
      {children}
    </div>
  )
}

export function SaPanelHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="px-4 py-3 border-b border-stone-800 flex items-center justify-between gap-3">
      <h3 className="text-sm font-bold text-stone-200">{title}</h3>
      {action}
    </div>
  )
}

export function SaInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'w-full bg-stone-950 border border-stone-700 rounded px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-violet-500',
        props.className
      )}
    />
  )
}

export function SaSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        'w-full bg-stone-950 border border-stone-700 rounded px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-violet-500',
        props.className
      )}
    />
  )
}

export function SaTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        'w-full bg-stone-950 border border-stone-700 rounded px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-violet-500 resize-y min-h-[80px]',
        props.className
      )}
    />
  )
}

export function SaLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-1">{children}</label>
}

export function SaButton({
  children,
  variant = 'primary',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }) {
  const variants = {
    primary: 'bg-violet-600 hover:bg-violet-500 text-white',
    secondary: 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700',
    danger: 'bg-red-900/40 hover:bg-red-900/60 text-red-300 border border-red-800',
    ghost: 'bg-transparent hover:bg-stone-800 text-stone-400',
  }
  return (
    <button
      {...props}
      className={cn(
        'px-3 py-1.5 rounded text-xs font-bold transition-colors disabled:opacity-50',
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  )
}

export function SaTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  )
}

export function SaMessage({ type, children }: { type: 'ok' | 'err'; children: React.ReactNode }) {
  return (
    <p
      className={cn(
        'text-xs font-medium px-3 py-2 rounded',
        type === 'ok' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-red-950 text-red-400 border border-red-900'
      )}
    >
      {children}
    </p>
  )
}

export function SaTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string }[]
  active: string
  onChange: (id: string) => void
}) {
  return (
    <div className="flex gap-1 border-b border-stone-800 px-2 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-3 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-colors',
            active === tab.id
              ? 'border-violet-500 text-white'
              : 'border-transparent text-stone-500 hover:text-stone-300'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export function SaField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <SaLabel>{label}</SaLabel>
      {children}
    </div>
  )
}
