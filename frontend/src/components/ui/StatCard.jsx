import Card from './Card'

export default function StatCard({ label, value, icon: Icon, hint }) {
  return (
    <Card className="p-5 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-colors">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400 font-medium">{label}</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{value}</p>
          {hint && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>}
        </div>
        {Icon && (
          <div className="shrink-0 w-10 h-10 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Icon size={20} />
          </div>
        )}
      </div>
    </Card>
  )
}
