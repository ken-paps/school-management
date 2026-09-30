import { useState } from 'react'
import { Search, Plus, Pencil, Trash2, Megaphone, AlertCircle, Pin, Clock, User as UserIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import useNotices from '../../hooks/useNotices'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import RowActionsMenu from '../../components/ui/RowActionsMenu'
import NoticeModal from '../../components/notices/NoticeModal'
import DeleteNoticeDialog from '../../components/notices/DeleteNoticeDialog'

const AUDIENCE_FILTERS = [
  { value: '', label: 'All audiences' },
  { value: 'all', label: 'Everyone' },
  { value: 'teachers', label: 'Teachers' },
  { value: 'students', label: 'Students' },
  { value: 'admins', label: 'Admins' },
]

const STATUS_FILTERS = [
  { value: '', label: 'All statuses' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Drafts' },
]

const AUDIENCE_BADGE = {
  all: 'emerald',
  teachers: 'sky',
  students: 'amber',
  admins: 'zinc',
}

function timeAgo(dateString) {
  const date = new Date(dateString)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Notices() {
  const { user } = useAuth()
  const { notices, meta, loading, error, filters, setFilters, createNotice, updateNotice, deleteNotice } = useNotices()

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const canManage = user?.role === 'admin' || user?.role === 'teacher'
  const canFilter = user?.role === 'admin'

  const handleCreateSubmit = async (payload) => {
    await createNotice(payload)
  }
  const handleEditSubmit = async (payload) => {
    await updateNotice(editTarget.id, payload)
  }
  const handleDeleteConfirm = async (id) => {
    await deleteNotice(id)
  }

  const isEmpty = !loading && notices.length === 0 && !error

  // Determine if user can edit/delete a specific notice
  const canEditNotice = (notice) => {
    if (user?.role === 'admin') return true
    if (user?.role === 'teacher' && notice.posted_by === user.id) return true
    return false
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Notices</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Announcements from the school administration.</p>
        </div>
        {canManage && (
          <Button icon={Plus} onClick={() => setCreateOpen(true)}>
            Post notice
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input type="text" value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))} placeholder="Search notices..." className="w-full rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 pl-9 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
          {canFilter && (
            <>
              <div className="sm:w-40">
                <Select value={filters.audience} onChange={(e) => setFilters((f) => ({ ...f, audience: e.target.value, page: 1 }))} options={AUDIENCE_FILTERS} />
              </div>
              <div className="sm:w-40">
                <Select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))} options={STATUS_FILTERS} />
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Error banner */}
      {error && (
        <Card className="p-4 border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div className="text-sm text-red-700 dark:text-red-400">
              <div className="font-medium">Failed to load notices</div>
              <div className="text-xs mt-0.5 opacity-80">{error}</div>
            </div>
          </div>
        </Card>
      )}

      {/* Loading */}
      {loading && !error && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="p-5 animate-pulse">
              <div className="space-y-2">
                <div className="h-4 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-3 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty */}
      {isEmpty && (
        <Card className="p-12 text-center">
          <Megaphone size={32} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{filters.search ? 'No matching notices' : 'No notices yet'}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{filters.search ? 'Try adjusting your search or filters.' : canManage ? 'Post the first notice to get started.' : 'Check back later for announcements.'}</p>
          {!filters.search && canManage && (
            <Button size="sm" icon={Plus} className="mt-4" onClick={() => setCreateOpen(true)}>
              Post notice
            </Button>
          )}
        </Card>
      )}

      {/* Feed */}
      {!loading && !error && notices.length > 0 && (
        <div className="space-y-3">
          {notices.map((n) => {
            const isDraft = n.published_at === null
            const editable = canEditNotice(n)

            return (
              <Card key={n.id} className={['p-5 transition-colors', n.is_pinned ? 'border-emerald-500/30 dark:border-emerald-500/30 bg-emerald-500/2 dark:bg-emerald-500/3' : ''].join(' ')}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Top badges row */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {n.is_pinned && (
                        <Badge color="emerald">
                          <Pin size={10} className="mr-0.5" />
                          Pinned
                        </Badge>
                      )}
                      <Badge color={AUDIENCE_BADGE[n.audience] || 'zinc'}>{n.audience === 'all' ? 'Everyone' : n.audience}</Badge>
                      {isDraft && <Badge color="zinc">Draft</Badge>}
                    </div>

                    {/* Title */}
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">{n.title}</h2>

                    {/* Body preview */}
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line line-clamp-4">{n.body}</p>

                    {/* Meta */}
                    <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        <UserIcon size={12} />
                        <span>{n.author?.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} />
                        <span>{isDraft ? 'Not published' : timeAgo(n.published_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {editable && (
                    <RowActionsMenu
                      items={[
                        { label: 'Edit', icon: Pencil, onClick: () => setEditTarget(n) },
                        { label: 'Delete', icon: Trash2, destructive: true, onClick: () => setDeleteTarget(n) },
                      ]}
                    />
                  )}
                </div>
              </Card>
            )
          })}

          {/* Pagination */}
          {meta && (meta.last_page > 1 || meta.total > 15) && (
            <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
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

      {/* Modals */}
      <NoticeModal open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={handleCreateSubmit} />
      <NoticeModal open={Boolean(editTarget)} onClose={() => setEditTarget(null)} onSubmit={handleEditSubmit} notice={editTarget} />
      <DeleteNoticeDialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} notice={deleteTarget} onConfirm={handleDeleteConfirm} />
    </div>
  )
}
