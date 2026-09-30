import { useState } from 'react'
import { Search, Plus, Pencil, Trash2, UserCog, AlertCircle, BookOpen } from 'lucide-react'
import useTeachers from '../../hooks/useTeachers'
import api from '../../lib/axios'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import RowActionsMenu from '../../components/ui/RowActionsMenu'
import TeacherModal from '../../components/teachers/TeacherModal'
import DeleteTeacherDialog from '../../components/teachers/DeleteTeacherDialog'

export default function Teachers() {
  const { teachers, meta, loading, error, filters, setFilters, createTeacher, updateTeacher, deleteTeacher } = useTeachers()

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const generatePassword = async () => {
    const { data } = await api.get('/api/users/generate-password')
    return data.password
  }

  const handleCreateSubmit = async (payload) => {
    await createTeacher(payload)
  }
  const handleEditSubmit = async (payload) => {
    await updateTeacher(editTarget.id, payload)
  }
  const handleDeleteConfirm = async (id) => {
    await deleteTeacher(id)
  }

  const isEmpty = !loading && teachers.length === 0 && !error

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Teachers</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage teaching staff and their subject assignments.</p>
        </div>
        <Button icon={Plus} onClick={() => setCreateOpen(true)}>
          Add teacher
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input type="text" value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))} placeholder="Search by name, email, or employee number..." className="w-full rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 pl-9 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
        </div>
      </Card>

      {/* Content */}
      <Card>
        {error && (
          <div className="flex items-start gap-2 px-6 py-4 border-b border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div className="text-sm text-red-700 dark:text-red-400">
              <div className="font-medium">Failed to load teachers</div>
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
                    <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/4 rounded bg-zinc-200 dark:bg-zinc-800" />
                      <div className="h-3 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isEmpty ? (
              <div className="px-6 py-16 text-center">
                <UserCog size={32} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{filters.search ? 'No matching teachers' : 'No teachers yet'}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{filters.search ? 'Try adjusting your search.' : 'Add your first teacher to get started.'}</p>
                {!filters.search && (
                  <Button size="sm" icon={Plus} className="mt-4" onClick={() => setCreateOpen(true)}>
                    Add teacher
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800">
                      <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Teacher</th>
                      <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 hidden md:table-cell">Employee #</th>
                      <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 hidden lg:table-cell">Subjects</th>
                      <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 hidden xl:table-cell">Classes</th>
                      <th className="w-12 px-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {teachers.map((t) => {
                      const initials = (t.user?.name || '?')
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()
                      return (
                        <tr key={t.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center text-xs font-semibold shrink-0">{initials}</div>
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{t.user?.name}</div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{t.user?.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3 hidden md:table-cell">
                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">{t.employee_number}</span>
                          </td>
                          <td className="px-6 py-3 hidden lg:table-cell">
                            {t.subjects && t.subjects.length > 0 ? (
                              <div className="flex flex-wrap gap-1 max-w-md">
                                {t.subjects.slice(0, 3).map((s) => (
                                  <Badge key={s.id} color="emerald">
                                    {s.code}
                                  </Badge>
                                ))}
                                {t.subjects.length > 3 && <Badge color="zinc">+{t.subjects.length - 3}</Badge>}
                              </div>
                            ) : (
                              <Badge color="zinc">None assigned</Badge>
                            )}
                          </td>
                          <td className="px-6 py-3 hidden xl:table-cell">
                            <div className="flex items-center gap-1.5">
                              <BookOpen size={13} className="text-zinc-400" />
                              <span className="text-sm tabular-nums text-zinc-700 dark:text-zinc-300">{t.classes_count ?? 0}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <RowActionsMenu
                              items={[
                                { label: 'Edit', icon: Pencil, onClick: () => setEditTarget(t) },
                                { label: 'Delete', icon: Trash2, destructive: true, onClick: () => setDeleteTarget(t) },
                              ]}
                            />
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

      <TeacherModal open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={handleCreateSubmit} generatePassword={generatePassword} />
      <TeacherModal open={Boolean(editTarget)} onClose={() => setEditTarget(null)} onSubmit={handleEditSubmit} teacher={editTarget} generatePassword={generatePassword} />
      <DeleteTeacherDialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} teacher={deleteTarget} onConfirm={handleDeleteConfirm} />
    </div>
  )
}
