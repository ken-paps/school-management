import { NavLink } from 'react-router-dom'

export default function SidebarLink({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink to={to} end={to === '/'} onClick={onClick} className={({ isActive }) => ['group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors', isActive ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'].join(' ')}>
      {({ isActive }) => (
        <>
          {/* Left accent bar */}
          <span className={['absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full transition-opacity', isActive ? 'bg-emerald-600 dark:bg-emerald-500 opacity-100' : 'opacity-0'].join(' ')} aria-hidden="true" />
          <Icon size={18} className={isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200'} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  )
}
