export default function Card({ className = '', children }) {
  return <div className={`rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 ${className}`}>{children}</div>
}
