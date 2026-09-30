import { GraduationCap, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getNavForRole } from '../../lib/navigation'
import SidebarLink from './SidebarLink'

export default function Sidebar({ mobileOpen, onClose }) {
  const { user } = useAuth()
  const items = getNavForRole(user?.role)

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && <div className="fixed inset-0 z-30 bg-zinc-900/50 backdrop-blur-sm lg:hidden" onClick={onClose} aria-hidden="true" />}

      <aside className={['fixed lg:static inset-y-0 left-0 z-40 w-64 shrink-0', 'bg-white dark:bg-zinc-950', 'border-r border-zinc-200 dark:border-zinc-800', 'flex flex-col', 'transition-transform lg:translate-x-0', mobileOpen ? 'translate-x-0' : '-translate-x-full'].join(' ')}>
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <GraduationCap size={18} />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">School</div>
              <div className="text-[10px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Management</div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {items.map((item) => (
            <SidebarLink key={item.to} to={item.to} icon={item.icon} label={item.label} onClick={onClose} />
          ))}
        </nav>

        {/* Footer / version */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-[11px] text-zinc-400 dark:text-zinc-600">v0.1.0 — Phase 1</p>
        </div>
      </aside>
    </>
  )
}
