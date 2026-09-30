const COLORS = {
  emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  sky: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20',
  amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  zinc: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 border-zinc-500/20',
  red: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
}

export default function Badge({ color = 'zinc', children, className = '' }) {
  return <span className={['inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide', COLORS[color], className].join(' ')}>{children}</span>
}
