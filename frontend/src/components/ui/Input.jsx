import { forwardRef } from 'react'

const Input = forwardRef(function Input({ label, error, hint, className = '', ...props }, ref) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{label}</label>}
      <input ref={ref} className={['w-full rounded-md border bg-white dark:bg-zinc-900 px-3 py-2 text-sm', 'text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500', 'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500', 'disabled:opacity-60 disabled:cursor-not-allowed', error ? 'border-red-400 dark:border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-zinc-300 dark:border-zinc-600', className].join(' ')} {...props} />
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
      {!error && hint && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>}
    </div>
  )
})

export default Input
