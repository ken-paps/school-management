import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

const Select = forwardRef(function Select({ label, error, hint, options = [], className = '', ...props }, ref) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{label}</label>}
      <div className="relative">
        <select ref={ref} className={['w-full appearance-none rounded-md border bg-white dark:bg-zinc-900 px-3 py-2 pr-9 text-sm', 'text-zinc-900 dark:text-zinc-100', 'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500', 'disabled:opacity-60 disabled:cursor-not-allowed', error ? 'border-red-400 dark:border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-zinc-300 dark:border-zinc-600', className].join(' ')} {...props}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 dark:text-zinc-500" />
      </div>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
      {!error && hint && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>}
    </div>
  )
})

export default Select
