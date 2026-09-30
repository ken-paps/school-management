import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MoreVertical } from 'lucide-react'

export default function RowActionsMenu({ items = [], align = 'right' }) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, flipUp: false })
  const buttonRef = useRef(null)
  const menuRef = useRef(null)

  // Compute position based on the trigger button's viewport rect
  const computePosition = () => {
    if (!buttonRef.current || !menuRef.current) return

    const btn = buttonRef.current.getBoundingClientRect()
    const menu = menuRef.current.getBoundingClientRect()
    const gap = 6

    const spaceBelow = window.innerHeight - btn.bottom
    const spaceAbove = btn.top
    const flipUp = spaceBelow < menu.height + gap && spaceAbove > menu.height + gap

    const top = flipUp ? btn.top - menu.height - gap : btn.bottom + gap

    const left = align === 'right' ? btn.right - menu.width : btn.left

    setCoords({ top, left, flipUp })
  }

  // Position on open + on scroll/resize
  useLayoutEffect(() => {
    if (!open) return
    computePosition()

    const handle = () => computePosition()
    window.addEventListener('scroll', handle, true)
    window.addEventListener('resize', handle)
    return () => {
      window.removeEventListener('scroll', handle, true)
      window.removeEventListener('resize', handle)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Outside click + Escape to close
  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e) => {
      if (!buttonRef.current?.contains(e.target) && !menuRef.current?.contains(e.target)) {
        setOpen(false)
      }
    }
    const handleEscape = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const handleItemClick = (item) => {
    setOpen(false)
    item.onClick?.()
  }

  return (
    <>
      <button ref={buttonRef} onClick={() => setOpen((o) => !o)} className="p-1.5 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" aria-label="Row actions" aria-haspopup="menu" aria-expanded={open}>
        <MoreVertical size={16} />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              // Hide until measured so there's no flash at (0,0)
              visibility: coords.top === 0 && coords.left === 0 ? 'hidden' : 'visible',
            }}
            className={['z-50 w-40 rounded-lg border border-zinc-200 dark:border-zinc-700', 'bg-white dark:bg-zinc-800 shadow-lg shadow-zinc-900/10 dark:shadow-black/40 p-1'].join(' ')}
          >
            {items.map((item, i) => {
              const Icon = item.icon
              const isDestructive = item.destructive
              const isDisabled = item.disabled

              return (
                <button key={i} role="menuitem" onClick={() => !isDisabled && handleItemClick(item)} disabled={isDisabled} title={item.title} className={['w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors', isDestructive ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10' : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700', isDisabled ? 'opacity-40 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent' : ''].join(' ')}>
                  {Icon && <Icon size={14} />}
                  {item.label}
                </button>
              )
            })}
          </div>,
          document.body,
        )}
    </>
  )
}
