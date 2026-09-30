import { useState } from 'react'
import { Search, Plus, Pencil, Trash2, School, AlertCircle, Users as UsersIcon } from 'lucide-react'
import useClasses from '../../hooks/useClasses'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import RowActionsMenu from '../../components/ui/RowActionsMenu'
import ClassModal from '../../components/classes/ClassModal'
import DeleteClassDialog from '../../components/classes/DeleteClassDialog'

const GRADE_FILTERS = [{ value: '', label: 'All grades' }, ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => ({ value: g, label: `Grade ${g}` }))]

export default function Classes() {
  const { classes, meta, loading, error, filters, setFilters, createClass, updateClass, deleteClass } = useClasses()

  const { user } = useAuth()
  const canWrite = user?.role === 'admin'

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const handleCreateSubmit = async (payload) => {
    await createClass(payload)
  }
  const handleEditSubmit = async (payload) => {
    await updateClass(editTarget.id, payload)
  }
  const handleDeleteConfirm = async (id) => {
    await deleteClass(id)
  }

  const isEmpty = !loading && classes.length === 0 && !error

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Classes</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage grade levels and sections.</p>
        </div>
        {canWrite && (
          <Button icon={Plus} onClick={() => setCreateOpen(true)}>
            Create class
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input type="text" value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))} placeholder="Search by name or section..." className="w-full rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 pl-9 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
          <div className="sm:w-44">
            <Select value={filters.grade_level} onChange={(e) => setFilters((f) => ({ ...f, grade_level: e.target.value, page: 1 }))} options={GRADE_FILTERS} />
          </div>
        </div>
      </Card>

      {/* Content */}
      <Card>
        {error && (
          <div className="flex items-start gap-2 px-6 py-4 border-b border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div className="text-sm text-red-700 dark:text-red-400">
              <div className="font-medium">Failed to load classes</div>
              <div className="text-xs mt-0.5 opacity-80">{error}</div>
            </div>
          </div>
        )}

        {!error && (
          <>
            {loading ? (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                    <div className="w-9 h-9 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/4 rounded bg-zinc-200 dark:bg-zinc-800" />
                      <div className="h-3 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isEmpty ? (
              <div className="px-6 py-16 text-center">
                <School size={32} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{filters.search || filters.grade_level ? 'No matching classes' : 'No classes yet'}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{filters.search || filters.grade_level ? 'Try adjusting your filters.' : 'Create the first class to get started.'}</p>
                {canWrite && !filters.search && !filters.grade_level && (
                  <Button size="sm" icon={Plus} className="mt-4" onClick={() => setCreateOpen(true)}>
                    Create class
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800">
                      <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Class</th>
                      <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 hidden md:table-cell">Teacher</th>
                      <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 hidden lg:table-cell">Enrollment</th>
                      <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 hidden lg:table-cell">Capacity</th>
                      <th className="w-12 px-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {classes.map((c) => {
                      const fillRate = c.capacity > 0 ? (c.students_count / c.capacity) * 100 : 0
                      const isFull = c.students_count >= c.capacity
                      return (
                        <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                <School size={16} />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{c.display_name || c.name}</div>
                                {c.section && <div className="text-xs text-zinc-500 dark:text-zinc-400">Section {c.section}</div>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3 hidden md:table-cell">{c.teacher ? <span className="text-sm text-zinc-700 dark:text-zinc-300">{c.teacher.name}</span> : <Badge color="zinc">Unassigned</Badge>}</td>
                          <td className="px-6 py-3 hidden lg:table-cell">
                            <div className="flex items-center gap-2">
                              <UsersIcon size={14} className="text-zinc-400" />
                              <span className="text-sm tabular-nums text-zinc-700 dark:text-zinc-300">{c.students_count}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3 hidden lg:table-cell">
                            <div className="flex items-center gap-2">
                              <span className="text-sm tabular-nums text-zinc-700 dark:text-zinc-300">{c.capacity}</span>
                              {isFull ? <Badge color="red">Full</Badge> : fillRate >= 80 ? <Badge color="amber">Filling</Badge> : null}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            {canWrite && (
                              <RowActionsMenu
                                items={[
                                  { label: 'Edit', icon: Pencil, onClick: () => setEditTarget(c) },
                                  {
                                    label: 'Delete',
                                    icon: Trash2,
                                    destructive: true,
                                    disabled: c.students_count > 0,
                                    title: c.students_count > 0 ? 'Move students out first' : '',
                                    onClick: () => setDeleteTarget(c),
                                  },
                                ]}
                              />
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

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

      <ClassModal open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={handleCreateSubmit} />
      <ClassModal open={Boolean(editTarget)} onClose={() => setEditTarget(null)} onSubmit={handleEditSubmit} schoolClass={editTarget} />
      <DeleteClassDialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} schoolClass={deleteTarget} onConfirm={handleDeleteConfirm} />
    </div>
  )
}
