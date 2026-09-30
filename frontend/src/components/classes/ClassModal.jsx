import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import useTeachersForSelect from '../../hooks/useTeachersForSelect'

const EMPTY_FORM = {
  name: '',
  grade_level: '',
  section: '',
  capacity: 40,
  teacher_id: '',
}

export default function ClassModal({ open, onClose, onSubmit, schoolClass = null }) {
  const isEdit = Boolean(schoolClass)
  const { teachers, loading: teachersLoading } = useTeachersForSelect()

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    if (isEdit && schoolClass) {
      setForm({
        name: schoolClass.name || '',
        grade_level: schoolClass.grade_level ?? '',
        section: schoolClass.section || '',
        capacity: schoolClass.capacity ?? 40,
        teacher_id: schoolClass.teacher_id ?? '',
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setErrors({})
  }, [open, isEdit, schoolClass])

  // Auto-suggest name from grade + section (create mode only)
  useEffect(() => {
    if (isEdit || !open) return
    if (form.grade_level) {
      const section = form.section ? ` - ${form.section}` : ''
      setForm((f) => ({ ...f, name: `Grade ${f.grade_level}${section}` }))
    }
  }, [form.grade_level, form.section, isEdit, open])

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
      grade_level: form.grade_level === '' ? null : Number(form.grade_level),
      section: form.section.trim() || null,
      capacity: Number(form.capacity),
      teacher_id: form.teacher_id === '' ? null : Number(form.teacher_id),
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
        flat._general = err.message || 'Failed to save class.'
      }
      setErrors(flat)
    } finally {
      setSubmitting(false)
    }
  }

  const teacherOptions = [{ value: '', label: teachersLoading ? 'Loading…' : 'No class teacher' }, ...teachers.map((t) => ({ value: t.id, label: `${t.name} (${t.email})` }))]

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit class' : 'Create class'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors._general && <div className="rounded-md bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-3 py-2 text-sm text-red-700 dark:text-red-400">{errors._general}</div>}

        <div className="grid grid-cols-2 gap-3">
          <Input label="Grade level" type="number" min="1" max="12" value={form.grade_level} onChange={(e) => setField('grade_level', e.target.value)} error={errors.grade_level} placeholder="e.g. 10" autoFocus />
          <Input label="Section" value={form.section} onChange={(e) => setField('section', e.target.value)} error={errors.section} placeholder="e.g. A" />
        </div>

        <Input label="Class name" value={form.name} onChange={(e) => setField('name', e.target.value)} error={errors.name} placeholder="e.g. Grade 10 - A" required hint="Auto-suggested from grade + section. You can override." />

        <Input label="Capacity" type="number" min="1" max="200" value={form.capacity} onChange={(e) => setField('capacity', e.target.value)} error={errors.capacity} required hint="Maximum number of students allowed." />

        <Select label="Class teacher" value={form.teacher_id} onChange={(e) => setField('teacher_id', e.target.value)} options={teacherOptions} error={errors.teacher_id} hint="Optional. Can be assigned later." />

        {/* Actions inside the form */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? 'Save changes' : 'Create class'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
