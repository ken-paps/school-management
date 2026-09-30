import { useState } from 'react'
import { Search, Plus, Pencil, Trash2, FileText, AlertCircle, Eye, EyeOff, CalendarRange, Trophy } from 'lucide-react'
import useExams from '../../hooks/useExams'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import RowActionsMenu from '../../components/ui/RowActionsMenu'
import ExamModal from '../../components/exams/ExamModal'
import DeleteExamDialog from '../../components/exams/DeleteExamDialog'

const TERM_FILTERS = [
  { value: '', label: 'All terms' },
  { value: 'term1', label: 'Term 1' },
  { value: 'term2', label: 'Term 2' },
  { value: 'term3', label: 'Term 3' },
]

const TERM_LABELS = { term1: 'Term 1', term2: 'Term 2', term3: 'Term 3' }

export default function Exams({ embedded = false }) {
  const { exams, meta, loading, error, filters, setFilters, createExam, updateExam, deleteExam, togglePublish } = useExams()

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const handleCreateSubmit = async (payload) => {
    await createExam(payload)
  }
  const handleEditSubmit = async (payload) => {
    await updateExam(editTarget.id, payload)
  }
  const handleDeleteConfirm = async (id) => {
    await deleteExam(id)
  }

  const isEmpty = !loading && exams.length === 0 && !error

  return (
    <div className={embedded ? 'space-y-4' : 'max-w-7xl mx-auto space-y-6'}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          {!embedded && <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Exams</h1>}
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Define exam periods for entering and publishing grades.</p>
        </div>
        <Button icon={Plus} onClick={() => setCreateOpen(true)}>
          Create exam
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input type="text" value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))} placeholder="Search exam name..." className="w-full rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 pl-9 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
          <div className="sm:w-44">
            <Select value={filters.term} onChange={(e) => setFilters((f) => ({ ...f, term: e.target.value, page: 1 }))} options={TERM_FILTERS} />
          </div>
        </div>
      </Card>

      <Card>
        {error && (
          <div className="flex items-start gap-2 px-6 py-4 border-b border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div className="text-sm text-red-700 dark:text-red-400">
              <div className="font-medium">Failed to load exams</div>
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
                      <div className="h-3 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
                      <div className="h-3 w-1/4 rounded bg-zinc-200 dark:bg-zinc-800" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isEmpty ? (
              <div className="px-6 py-16 text-center">
                <FileText size={32} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{filters.search || filters.term ? 'No matching exams' : 'No exams yet'}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{filters.search || filters.term ? 'Try adjusting your search.' : 'Create an exam period to start entering grades.'}</p>
                {!filters.search && !filters.term && (
                  <Button size="sm" icon={Plus} className="mt-4" onClick={() => setCreateOpen(true)}>
                    Create exam
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800">
                      <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Exam</th>
                      <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 hidden md:table-cell">Period</th>
                      <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 hidden lg:table-cell">Grades</th>
                      <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Status</th>
                      <th className="w-12 px-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {exams.map((ex) => (
                      <tr key={ex.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                              <FileText size={16} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{ex.name}</div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                {TERM_LABELS[ex.term]} {ex.year}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 hidden md:table-cell">
                          {ex.start_date || ex.end_date ? (
                            <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                              <CalendarRange size={12} />
                              {ex.start_date ? new Date(ex.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                              {ex.end_date && ` – ${new Date(ex.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-3 hidden lg:table-cell">
                          <div className="flex items-center gap-1.5">
                            <Trophy size={13} className="text-zinc-400" />
                            <span className="text-sm tabular-nums text-zinc-700 dark:text-zinc-300">{ex.grades_count ?? 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3">{ex.is_published ? <Badge color="emerald">Published</Badge> : <Badge color="zinc">Draft</Badge>}</td>
                        <td className="px-3 py-3">
                          <RowActionsMenu
                            items={[
                              {
                                label: ex.is_published ? 'Unpublish' : 'Publish',
                                icon: ex.is_published ? EyeOff : Eye,
                                onClick: () => togglePublish(ex.id, !ex.is_published),
                              },
                              { label: 'Edit', icon: Pencil, onClick: () => setEditTarget(ex) },
                              {
                                label: 'Delete',
                                icon: Trash2,
                                destructive: true,
                                disabled: (ex.grades_count ?? 0) > 0,
                                title: (ex.grades_count ?? 0) > 0 ? 'Remove grades first' : '',
                                onClick: () => setDeleteTarget(ex),
                              },
                            ]}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {meta && meta.last_page > 1 && (
                  <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-200 dark:border-zinc-800">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Showing <span className="font-medium text-zinc-700 dark:text-zinc-300">{meta.from ?? 0}</span>–<span className="font-medium text-zinc-700 dark:text-zinc-300">{meta.to ?? 0}</span> of <span className="font-medium text-zinc-700 dark:text-zinc-300">{meta.total}</span>
                    </p>
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
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </Card>

      <ExamModal open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={handleCreateSubmit} />
      <ExamModal open={Boolean(editTarget)} onClose={() => setEditTarget(null)} onSubmit={handleEditSubmit} exam={editTarget} />
      <DeleteExamDialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} exam={deleteTarget} onConfirm={handleDeleteConfirm} />
    </div>
  )
}
