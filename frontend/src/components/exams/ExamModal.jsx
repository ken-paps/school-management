import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'

const TERM_OPTIONS = [
  { value: 'term1', label: 'Term 1' },
  { value: 'term2', label: 'Term 2' },
  { value: 'term3', label: 'Term 3' },
]

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => {
  const y = CURRENT_YEAR - 1 + i
  return { value: y, label: String(y) }
})

const EMPTY_FORM = {
  name: '',
  term: 'term1',
  year: CURRENT_YEAR,
  start_date: '',
  end_date: '',
  is_published: false,
}

export default function ExamModal({ open, onClose, onSubmit, exam = null }) {
  const isEdit = Boolean(exam)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    if (isEdit && exam) {
      setForm({
        name: exam.name || '',
        term: exam.term || 'term1',
        year: exam.year || CURRENT_YEAR,
        start_date: exam.start_date?.slice(0, 10) || '',
        end_date: exam.end_date?.slice(0, 10) || '',
        is_published: exam.is_published ?? false,
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setErrors({})
  }, [open, isEdit, exam])

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) {
      setErrors((e) => {
        const next = { ...e }
        delete next[key]
        return next
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})

    const payload = {
      name: form.name.trim(),
      term: form.term,
      year: Number(form.year),
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      is_published: Boolean(form.is_published),
    }

    try {
      await onSubmit(payload)
      onClose()
    } catch (err) {
      const backendErrors = err?.response?.data?.errors || {}
      const flat = {}
      Object.entries(backendErrors).forEach(([key, val]) => {
        flat[key] = Array.isArray(val) ? val[0] : val
      })
      if (Object.keys(flat).length === 0) {
        flat._general = err.message || 'Failed to save exam.'
      }
      setErrors(flat)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit exam' : 'Create exam'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors._general && <div className="rounded-md bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-3 py-2 text-sm text-red-700 dark:text-red-400">{errors._general}</div>}

        <Input label="Exam name" value={form.name} onChange={(e) => setField('name', e.target.value)} error={errors.name} placeholder="e.g. Term 1 Mid-Term" autoFocus required />

        <div className="grid grid-cols-2 gap-3">
          <Select label="Term" value={form.term} onChange={(e) => setField('term', e.target.value)} options={TERM_OPTIONS} error={errors.term} />
          <Select label="Year" value={form.year} onChange={(e) => setField('year', e.target.value)} options={YEAR_OPTIONS} error={errors.year} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Start date" type="date" value={form.start_date} onChange={(e) => setField('start_date', e.target.value)} error={errors.start_date} />
          <Input label="End date" type="date" value={form.end_date} onChange={(e) => setField('end_date', e.target.value)} error={errors.end_date} />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_published} onChange={(e) => setField('is_published', e.target.checked)} className="rounded border-zinc-300 dark:border-zinc-600 text-emerald-600 focus:ring-emerald-500" />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">Publish grades to students immediately</span>
        </label>
        <p className="-mt-2 text-xs text-zinc-500 dark:text-zinc-400">Leave unchecked to keep grades hidden while entering them. Toggle later when ready.</p>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? 'Save changes' : 'Create exam'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
