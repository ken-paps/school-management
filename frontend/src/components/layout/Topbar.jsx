import { Menu, Moon, Sun } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { getNavItemForPath } from '../../lib/navigation'
import UserMenu from './UserMenu'

export default function Topbar({ onOpenSidebar }) {
  const { theme, toggleTheme } = useTheme()
  const { pathname } = useLocation()
  const navItem = getNavItemForPath(pathname)
  const title = navItem?.label || 'Dashboard'

  return (
    <header className="h-16 shrink-0 sticky top-0 z-20 bg-white/80 dark:bg-zinc-900/80 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onOpenSidebar} className="lg:hidden p-2 -ml-2 rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Open sidebar">
          <Menu size={20} />
        </button>
        <h1 className="text-base lg:text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h1>
      </div>

      <div className="flex items-center gap-1.5">
        <button onClick={toggleTheme} className="p-2 rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <UserMenu />
      </div>
    </header>
  )
}
