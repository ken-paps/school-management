import { useEffect, useRef, useState } from 'react'
import { ChevronDown, LogOut, User as UserIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import RoleBadge from './RoleBadge'

export default function UserMenu() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '??'

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2.5 rounded-lg pl-1 pr-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" aria-haspopup="menu" aria-expanded={open}>
        <div className="w-8 h-8 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-semibold">{initials}</div>
        <div className="hidden sm:block text-left leading-tight">
          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-35">{user?.name}</div>
          <div className="text-[10px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{user?.role}</div>
        </div>
        <ChevronDown size={14} className="text-zinc-500 dark:text-zinc-400" />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-64 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg shadow-zinc-900/5 dark:shadow-black/20 p-2 z-50">
          <div className="px-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800 mb-1">
            <div className="flex items-center gap-2 mb-1">
              <UserIcon size={14} className="text-zinc-500" />
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{user?.name}</span>
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user?.email}</div>
            <div className="mt-2">
              <RoleBadge role={user?.role} />
            </div>
          </div>

          <button onClick={logout} className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors" role="menuitem">
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
