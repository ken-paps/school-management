import { useState } from 'react'
import { Search, Plus, Pencil, Trash2, MoreVertical, Users as UsersIcon, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import useUsers from '../../hooks/useUsers'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Card from '../../components/ui/Card'
import RoleBadge from '../../components/layout/RoleBadge'
import UserModal from '../../components/users/UserModal'
import DeleteUserDialog from '../../components/users/DeleteUserDialog'
import RowActionsMenu from '../../components/ui/RowActionsMenu'

const ROLE_FILTERS = [
  { value: '', label: 'All roles' },
  { value: 'admin', label: 'Admins' },
  { value: 'teacher', label: 'Teachers' },
  { value: 'student', label: 'Students' },
]

export default function Users() {
  const { user: currentUser } = useAuth()
  const { users, meta, loading, error, filters, setFilters, createUser, updateUser, deleteUser, generatePassword } = useUsers()

  // Modal state
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Row action menu
  const [openMenuId, setOpenMenuId] = useState(null)

  // ─────────────────────────────────────────────
  //  Handlers
  // ─────────────────────────────────────────────
  const handleSearchChange = (e) => {
    setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))
  }

  const handleRoleChange = (e) => {
    setFilters((f) => ({ ...f, role: e.target.value, page: 1 }))
  }

  const handleCreateSubmit = async (payload) => {
    await createUser(payload)
  }

  const handleEditSubmit = async (payload) => {
    await updateUser(editTarget.id, payload)
  }

  const handleDeleteConfirm = async (id) => {
    await deleteUser(id)
    setOpenMenuId(null)
  }

  // ─────────────────────────────────────────────
  //  Render helpers
  // ─────────────────────────────────────────────
  const isEmpty = !loading && users.length === 0 && !error

  const renderEmptyState = () => {
    if (filters.search || filters.role) {
      return (
        <div className="px-6 py-16 text-center">
          <Search size={32} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No matching users</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Try adjusting your search or filters.</p>
        </div>
      )
    }
    return (
      <div className="px-6 py-16 text-center">
        <UsersIcon size={32} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No users yet</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Create the first user to get started.</p>
        <Button size="sm" icon={Plus} className="mt-4" onClick={() => setCreateOpen(true)}>
          Create user
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Users</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage admins, teachers, and students.</p>
        </div>
        <Button icon={Plus} onClick={() => setCreateOpen(true)}>
          Create user
        </Button>
      </div>

      {/* Filters bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
              <input type="text" value={filters.search} onChange={handleSearchChange} placeholder="Search by name or email..." className="w-full rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 pl-9 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
          </div>
          <div className="sm:w-44">
            <Select value={filters.role} onChange={handleRoleChange} options={ROLE_FILTERS} />
          </div>
        </div>
      </Card>

      {/* Content */}
      <Card>
        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-2 px-6 py-4 border-b border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div className="text-sm text-red-700 dark:text-red-400">
              <div className="font-medium">Failed to load users</div>
              <div className="text-xs mt-0.5 opacity-80">{error}</div>
            </div>
          </div>
        )}

        {/* Table */}
        {!error && (
          <>
            {loading ? (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                    <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/4 rounded bg-zinc-200 dark:bg-zinc-800" />
                      <div className="h-3 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
                    </div>
                    <div className="h-5 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                ))}
              </div>
            ) : isEmpty ? (
              renderEmptyState()
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800">
                      <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">User</th>
                      <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 hidden md:table-cell">Role</th>
                      <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 hidden lg:table-cell">Joined</th>
                      <th className="w-12 px-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {users.map((u) => {
                      const isSelf = currentUser?.id === u.id
                      const initials = u.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()

                      return (
                        <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-semibold shrink-0">{initials}</div>
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                  {u.name}
                                  {isSelf && <span className="ml-2 text-[10px] uppercase tracking-wide text-emerald-600 dark:text-emerald-400">you</span>}
                                </div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3 hidden md:table-cell">
                            <RoleBadge role={u.role} />
                          </td>
                          <td className="px-6 py-3 hidden lg:table-cell">
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                              {new Date(u.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <RowActionsMenu
                              items={[
                                {
                                  label: 'Edit',
                                  icon: Pencil,
                                  onClick: () => setEditTarget(u),
                                },
                                {
                                  label: 'Delete',
                                  icon: Trash2,
                                  destructive: true,
                                  disabled: isSelf,
                                  title: isSelf ? "You can't delete your own account" : '',
                                  onClick: () => setDeleteTarget(u),
                                },
                              ]}
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {/* Footer / pagination info */}
                {meta && (
                  <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 gap-3 flex-wrap">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Showing <span className="font-medium text-zinc-700 dark:text-zinc-300">{meta.from ?? 0}</span>–<span className="font-medium text-zinc-700 dark:text-zinc-300">{meta.to ?? 0}</span> of <span className="font-medium text-zinc-700 dark:text-zinc-300">{meta.total}</span>
                    </p>

                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Per-page selector */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">Show</span>
                        <select value={filters.per_page} onChange={(e) => setFilters((f) => ({ ...f, per_page: Number(e.target.value), page: 1 }))} className="rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-2 py-1 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                          {[15, 30, 50, 100].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Page controls — only if multiple pages */}
                      {meta.last_page > 1 && (
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="secondary" disabled={filters.page <= 1} onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}>
                            Previous
                          </Button>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                            {meta.current_page} / {meta.last_page}
                          </span>
                          <Button size="sm" variant="secondary" disabled={filters.page >= meta.last_page} onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}>
                            Next
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </Card>

      {/* Create modal */}
      <UserModal open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={handleCreateSubmit} generatePassword={generatePassword} />

      {/* Edit modal */}
      <UserModal open={Boolean(editTarget)} onClose={() => setEditTarget(null)} onSubmit={handleEditSubmit} user={editTarget} generatePassword={generatePassword} />

      {/* Delete dialog */}
      <DeleteUserDialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} user={deleteTarget} onConfirm={handleDeleteConfirm} />
    </div>
  )
}
