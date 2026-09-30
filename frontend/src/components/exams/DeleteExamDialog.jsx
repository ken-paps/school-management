import { useState } from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

export default function DeleteExamDialog({ open, onClose, exam, onConfirm }) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)

  const handleConfirm = async () => {
    setDeleting(true)
    setError(null)
    try {
      await onConfirm(exam.id)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to delete exam.')
    } finally {
      setDeleting(false)
    }
  }

  const handleClose = () => {
    if (deleting) return
    setError(null)
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Delete exam" size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-900 dark:text-zinc-100 font-medium">Delete this exam?</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Exams with grades recorded cannot be deleted. Unpublish them instead.</p>
          </div>
        </div>

        {exam && (
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-3">
            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{exam.name}</div>
            <div className="mt-1.5 flex items-center gap-2">
              <Badge color="zinc">{exam.term}</Badge>
              <Badge color="zinc">{exam.year}</Badge>
              {exam.grades_count > 0 && <Badge color="amber">{exam.grades_count} grades</Badge>}
            </div>
          </div>
        )}

        {error && <div className="rounded-md bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-3 py-2 text-sm text-red-700 dark:text-red-400">{error}</div>}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={deleting}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={handleConfirm} loading={deleting} icon={Trash2}>
            Delete exam
          </Button>
        </div>
      </div>
    </Modal>
  )
}
