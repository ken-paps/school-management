import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary: 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent shadow-sm',
  secondary: 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700',
  danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent shadow-sm',
  ghost: 'bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-transparent',
}

const SIZES = {
  sm: 'text-xs px-2.5 py-1.5 gap-1.5',
  md: 'text-sm px-3.5 py-2 gap-2',
  lg: 'text-sm px-4 py-2.5 gap-2',
}

export default function Button({ variant = 'primary', size = 'md', loading = false, disabled = false, icon: Icon, children, className = '', ...props }) {
  return (
    <button disabled={disabled || loading} className={['inline-flex items-center justify-center rounded-md border font-medium transition-colors', 'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900', 'disabled:opacity-60 disabled:cursor-not-allowed', VARIANTS[variant], SIZES[size], className].join(' ')} {...props}>
      {loading ? <Loader2 size={15} className="animate-spin" /> : Icon ? <Icon size={15} /> : null}
      {children}
    </button>
  )
}
