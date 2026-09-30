import { useState } from 'react'
import { Search, Plus, Pencil, Trash2, GraduationCap, AlertCircle, Phone } from 'lucide-react'
import useStudents from '../../hooks/useStudents'
import useClassesForSelect from '../../hooks/useClassesForSelect'
import api from '../../lib/axios'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import RowActionsMenu from '../../components/ui/RowActionsMenu'
import StudentModal from '../../components/students/StudentModal'
import DeleteStudentDialog from '../../components/students/DeleteStudentDialog'

const GENDER_FILTERS = [
  { value: '', label: 'All genders' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

export default function Students() {
  const { students, meta, loading, error, filters, setFilters, createStudent, updateStudent, deleteStudent } = useStudents()

  const { user } = useAuth()
  const canWrite = user?.role === 'admin'

  const { classes } = useClassesForSelect()

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const generatePassword = async () => {
    const { data } = await api.get('/api/users/generate-password')
    return data.password
  }

  const handleCreateSubmit = async (payload) => {
    await createStudent(payload)
  }
  const handleEditSubmit = async (payload) => {
    await updateStudent(editTarget.id, payload)
  }
  const handleDeleteConfirm = async (id) => {
    await deleteStudent(id)
  }

  const classFilterOptions = [{ value: '', label: 'All classes' }, ...classes.map((c) => ({ value: c.id, label: c.display_name || c.name }))]

  const isEmpty = !loading && students.length === 0 && !error

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Students</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage student enrollment and records.</p>
        </div>
        {canWrite && (
          <Button icon={Plus} onClick={() => setCreateOpen(true)}>
            Enroll student
          </Button>
        )}
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input type="text" value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))} placeholder="Search by name, email, or admission #..." className="w-full rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 pl-9 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
          <div className="sm:w-44">
            <Select value={filters.class_id} onChange={(e) => setFilters((f) => ({ ...f, class_id: e.target.value, page: 1 }))} options={classFilterOptions} />
          </div>
          <div className="sm:w-40">
            <Select value={filters.gender} onChange={(e) => setFilters((f) => ({ ...f, gender: e.target.value, page: 1 }))} options={GENDER_FILTERS} />
          </div>
        </div>
      </Card>

      <Card>
        {error && (
          <div className="flex items-start gap-2 px-6 py-4 border-b border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div className="text-sm text-red-700 dark:text-red-400">
              <div className="font-medium">Failed to load students</div>
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
                <GraduationCap size={32} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{filters.search || filters.class_id || filters.gender ? 'No matching students' : 'No students yet'}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{filters.search || filters.class_id || filters.gender ? 'Try adjusting your filters.' : 'Enroll your first student to get started.'}</p>
                {canWrite && (
                  <Button icon={Plus} onClick={() => setCreateOpen(true)}>
                    Enroll student
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800">
                      <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Student</th>
                      <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 hidden md:table-cell">Admission #</th>
                      <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 hidden lg:table-cell">Class</th>
                      <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 hidden xl:table-cell">Guardian</th>
                      <th className="w-12 px-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {students.map((s) => {
                      const initials = (s.user?.name || '?')
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()
                      return (
                        <tr key={s.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-semibold shrink-0">{initials}</div>
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{s.user?.name}</div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{s.user?.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3 hidden md:table-cell">
                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">{s.admission_number}</span>
                          </td>
                          <td className="px-6 py-3 hidden lg:table-cell">{s.school_class ? <Badge color="emerald">{s.school_class.display_name || s.school_class.name}</Badge> : <Badge color="zinc">Unassigned</Badge>}</td>
                          <td className="px-6 py-3 hidden xl:table-cell">
                            {s.guardian_name ? (
                              <div className="flex items-center gap-1.5">
                                <Phone size={12} className="text-zinc-400" />
                                <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate max-w-45">{s.guardian_name}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-zinc-400 dark:text-zinc-500">—</span>
                            )}
                          </td>
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

      <StudentModal open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={handleCreateSubmit} generatePassword={generatePassword} />
      <StudentModal open={Boolean(editTarget)} onClose={() => setEditTarget(null)} onSubmit={handleEditSubmit} student={editTarget} generatePassword={generatePassword} />
      <DeleteStudentDialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} student={deleteTarget} onConfirm={handleDeleteConfirm} />
    </div>
  )
}
