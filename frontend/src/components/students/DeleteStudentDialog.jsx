import { useState } from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

export default function DeleteStudentDialog({ open, onClose, student, onConfirm }) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)

  const handleConfirm = async () => {
    setDeleting(true)
    setError(null)
    try {
      await onConfirm(student.id)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to delete student.')
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
    <Modal
      open={open}
      onClose={handleClose}
      title="Delete student"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm} loading={deleting} icon={Trash2}>
            Delete student
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-900 dark:text-zinc-100 font-medium">Are you sure you want to delete this student?</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Their user account will be signed out and deactivated immediately.</p>
          </div>
        </div>

        {student && (
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-3">
            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{student.user?.name}</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono">{student.admission_number}</div>
            {student.school_class && (
              <div className="mt-1.5">
                <Badge color="emerald">{student.school_class.display_name || student.school_class.name}</Badge>
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-zinc-500 dark:text-zinc-400">Can be restored later from the trash if needed.</p>

        {error && <div className="rounded-md bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-3 py-2 text-sm text-red-700 dark:text-red-400">{error}</div>}
      </div>
    </Modal>
  )
}
