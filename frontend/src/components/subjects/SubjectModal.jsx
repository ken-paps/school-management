import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'

const EMPTY_FORM = {
  name: '',
  code: '',
  description: '',
  periods_per_week: '',
  is_active: true,
}

export default function SubjectModal({ open, onClose, onSubmit, subject = null }) {
  const isEdit = Boolean(subject)

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    if (isEdit && subject) {
      setForm({
        name: subject.name || '',
        code: subject.code || '',
        description: subject.description || '',
        periods_per_week: subject.periods_per_week ?? '',
        is_active: subject.is_active ?? true,
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setErrors({})
  }, [open, isEdit, subject])

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
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || null,
      periods_per_week: form.periods_per_week === '' ? null : Number(form.periods_per_week),
      is_active: Boolean(form.is_active),
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
        flat._general = err.message || 'Failed to save subject.'
      }
      setErrors(flat)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit subject' : 'Create subject'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors._general && <div className="rounded-md bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-3 py-2 text-sm text-red-700 dark:text-red-400">{errors._general}</div>}

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Input label="Subject name" value={form.name} onChange={(e) => setField('name', e.target.value)} error={errors.name} placeholder="e.g. Mathematics" autoFocus required />
          </div>
          <Input label="Code" value={form.code} onChange={(e) => setField('code', e.target.value.toUpperCase())} error={errors.code} placeholder="MATH" maxLength={20} required />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Description <span className="text-zinc-400 font-normal">(optional)</span>
          </label>
          <textarea value={form.description} onChange={(e) => setField('description', e.target.value)} rows={3} placeholder="Brief description of what this subject covers..." className={['w-full rounded-md border bg-white dark:bg-zinc-900 px-3 py-2 text-sm', 'text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500', 'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none', errors.description ? 'border-red-400 dark:border-red-500' : 'border-zinc-300 dark:border-zinc-600'].join(' ')} />
          {errors.description && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.description}</p>}
        </div>

        <Input label="Periods per week" type="number" min="1" max="20" value={form.periods_per_week} onChange={(e) => setField('periods_per_week', e.target.value)} error={errors.periods_per_week} placeholder="e.g. 5" hint="Optional — useful for timetabling later." />

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setField('is_active', e.target.checked)} className="rounded border-zinc-300 dark:border-zinc-600 text-emerald-600 focus:ring-emerald-500" />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">Active — available for enrollment and grading</span>
        </label>

        {/* Actions inside the form */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? 'Save changes' : 'Create subject'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
