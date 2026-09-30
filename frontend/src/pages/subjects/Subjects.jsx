import { useState } from 'react'
import { Search, Plus, Pencil, Trash2, MoreVertical, BookOpen, AlertCircle } from 'lucide-react'
import useSubjects from '../../hooks/useSubjects'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import SubjectModal from '../../components/subjects/SubjectModal'
import DeleteSubjectDialog from '../../components/subjects/DeleteSubjectDialog'
import RowActionsMenu from '../../components/ui/RowActionsMenu'

const ACTIVE_FILTERS = [
  { value: '', label: 'All subjects' },
  { value: 'true', label: 'Active only' },
  { value: 'false', label: 'Archived only' },
]

export default function Subjects() {
  const { subjects, meta, loading, error, filters, setFilters, createSubject, updateSubject, deleteSubject } = useSubjects()

  const { user } = useAuth()
  const canWrite = user?.role === 'admin'

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)

  const handleCreateSubmit = async (payload) => {
    await createSubject(payload)
  }
  const handleEditSubmit = async (payload) => {
    await updateSubject(editTarget.id, payload)
  }
  const handleDeleteConfirm = async (id) => {
    await deleteSubject(id)
    setOpenMenuId(null)
  }

  const isEmpty = !loading && subjects.length === 0 && !error

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Subjects</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage subjects offered at the school.</p>
        </div>
        {canWrite && (
          <Button icon={Plus} onClick={() => setCreateOpen(true)}>
            Create subject
          </Button>
        )}
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input type="text" value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))} placeholder="Search by name or code..." className="w-full rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 pl-9 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
          <div className="sm:w-44">
            <Select value={filters.is_active} onChange={(e) => setFilters((f) => ({ ...f, is_active: e.target.value, page: 1 }))} options={ACTIVE_FILTERS} />
          </div>
        </div>
      </Card>

      <Card>
        {error && (
          <div className="flex items-start gap-2 px-6 py-4 border-b border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div className="text-sm text-red-700 dark:text-red-400">
              <div className="font-medium">Failed to load subjects</div>
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
                      <div className="h-3 w-1/6 rounded bg-zinc-200 dark:bg-zinc-800" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isEmpty ? (
              <div className="px-6 py-16 text-center">
                <BookOpen size={32} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{filters.search || filters.is_active ? 'No matching subjects' : 'No subjects yet'}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{filters.search || filters.is_active ? 'Try adjusting your filters.' : 'Create your first subject to get started.'}</p>
                {canWrite && !filters.search && !filters.is_active && (
                  <Button size="sm" icon={Plus} className="mt-4" onClick={() => setCreateOpen(true)}>
                    Create subject
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800">
                      <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Subject</th>
                      <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 hidden md:table-cell">Code</th>
                      <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 hidden lg:table-cell">Periods/week</th>
                      <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Status</th>
                      <th className="w-12 px-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {subjects.map((s) => (
                      <tr key={s.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                              <BookOpen size={16} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{s.name}</div>
                              {s.description && <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-md">{s.description}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 hidden md:table-cell">
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">{s.code}</span>
                        </td>
                        <td className="px-6 py-3 hidden lg:table-cell">
                          <span className="text-sm tabular-nums text-zinc-700 dark:text-zinc-300">{s.periods_per_week ?? '—'}</span>
                        </td>
                        <td className="px-6 py-3">{s.is_active ? <Badge color="emerald">Active</Badge> : <Badge color="zinc">Archived</Badge>}</td>
                        <td className="px-3 py-3">
                          {canWrite && (
                            <RowActionsMenu
                              items={[
                                { label: 'Edit', icon: Pencil, onClick: () => setEditTarget(s) },
                                { label: 'Delete', icon: Trash2, destructive: true, onClick: () => setDeleteTarget(s) },
                              ]}
                            />
                          )}
                        </td>
                      </tr>
                    ))}
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

      <SubjectModal open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={handleCreateSubmit} />
      <SubjectModal open={Boolean(editTarget)} onClose={() => setEditTarget(null)} onSubmit={handleEditSubmit} subject={editTarget} />
      <DeleteSubjectDialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} subject={deleteTarget} onConfirm={handleDeleteConfirm} />
    </div>
  )
}
