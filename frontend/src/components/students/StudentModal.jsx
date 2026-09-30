import { useEffect, useState } from 'react'
import { Wand2, Copy, Check, User as UserIcon, Heart, Phone, BookOpen, GraduationCap } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import useClassesForSelect from '../../hooks/useClassesForSelect'

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  admission_number: '',
  class_id: '',
  enrollment_date: '',
  date_of_birth: '',
  gender: '',
  guardian_name: '',
  guardian_phone: '',
  guardian_email: '',
  address: '',
  notes: '',
}

const GENDER_OPTIONS = [
  { value: '', label: 'Not specified' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

function FormSection({ icon: Icon, title, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-1 border-b border-zinc-100 dark:border-zinc-800">
        <Icon size={14} className="text-emerald-600 dark:text-emerald-400" />
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export default function StudentModal({ open, onClose, onSubmit, student = null, generatePassword }) {
  const isEdit = Boolean(student)
  const { classes, loading: classesLoading } = useClassesForSelect()

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return
    if (isEdit && student) {
      setForm({
        name: student.user?.name || '',
        email: student.user?.email || '',
        password: '',
        admission_number: student.admission_number || '',
        class_id: student.class_id ?? '',
        enrollment_date: student.enrollment_date?.slice(0, 10) || '',
        date_of_birth: student.date_of_birth?.slice(0, 10) || '',
        gender: student.gender || '',
        guardian_name: student.guardian_name || '',
        guardian_phone: student.guardian_phone || '',
        guardian_email: student.guardian_email || '',
        address: student.address || '',
        notes: student.notes || '',
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setErrors({})
    setGeneratedPassword('')
    setCopied(false)
  }, [open, isEdit, student])

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

  const handleGeneratePassword = async () => {
    try {
      const pwd = await generatePassword()
      setGeneratedPassword(pwd)
      setField('password', pwd)
      setCopied(false)
    } catch (err) {
      setErrors((e) => ({ ...e, password: err.message }))
    }
  }

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {}
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      admission_number: form.admission_number.trim(),
      class_id: form.class_id === '' ? null : Number(form.class_id),
      enrollment_date: form.enrollment_date || null,
      date_of_birth: form.date_of_birth || null,
      gender: form.gender || null,
      guardian_name: form.guardian_name.trim() || null,
      guardian_phone: form.guardian_phone.trim() || null,
      guardian_email: form.guardian_email.trim() || null,
      address: form.address.trim() || null,
      notes: form.notes.trim() || null,
    }
    if (form.password) payload.password = form.password

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
        flat._general = err.message || 'Failed to save student.'
      }
      setErrors(flat)
    } finally {
      setSubmitting(false)
    }
  }

  const classOptions = [
    { value: '', label: classesLoading ? 'Loading…' : 'Unassigned' },
    ...classes.map((c) => ({
      value: c.id,
      label: c.display_name || c.name,
    })),
  ]

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit student' : 'Create student'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors._general && <div className="rounded-md bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-3 py-2 text-sm text-red-700 dark:text-red-400">{errors._general}</div>}

        {/* ─── Identity ─── */}
        <FormSection icon={UserIcon} title="Identity">
          <Input label="Full name" value={form.name} onChange={(e) => setField('name', e.target.value)} error={errors.name} placeholder="e.g. Amara Okafor" autoFocus required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} error={errors.email} placeholder="name@school.test" required />

          <div>
            <div className="flex items-end justify-between mb-1.5 gap-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {isEdit ? 'New password' : 'Password'}
                {isEdit && <span className="ml-1 text-xs font-normal text-zinc-500 dark:text-zinc-400">(leave blank to keep current)</span>}
              </label>
              {!isEdit && (
                <button type="button" onClick={handleGeneratePassword} className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700">
                  <Wand2 size={12} /> Generate
                </button>
              )}
            </div>
            <Input
              type="text"
              value={form.password}
              onChange={(e) => {
                setField('password', e.target.value)
                setGeneratedPassword('')
              }}
              placeholder={isEdit ? 'Leave blank to keep current' : 'Set a password'}
              error={errors.password}
              autoComplete="new-password"
            />
            {generatedPassword && (
              <div className="mt-2 flex items-center justify-between gap-3 rounded-md border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 px-3 py-2">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wide text-emerald-700 dark:text-emerald-400 font-medium">Generated password</div>
                  <div className="mt-0.5 font-mono text-sm text-zinc-900 dark:text-zinc-100 truncate">{generatedPassword}</div>
                </div>
                <button type="button" onClick={handleCopyPassword} className="shrink-0 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10">
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            )}
          </div>
        </FormSection>

        {/* ─── Enrollment ─── */}
        <FormSection icon={GraduationCap} title="Enrollment">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Admission number" value={form.admission_number} onChange={(e) => setField('admission_number', e.target.value.toUpperCase())} error={errors.admission_number} placeholder="STU-2026-0001" required />
            <Input label="Enrollment date" type="date" value={form.enrollment_date} onChange={(e) => setField('enrollment_date', e.target.value)} error={errors.enrollment_date} />
          </div>
          <Select label="Class" value={form.class_id} onChange={(e) => setField('class_id', e.target.value)} options={classOptions} error={errors.class_id} hint="Optional — can be assigned later." />
        </FormSection>

        {/* ─── Personal ─── */}
        <FormSection icon={Heart} title="Personal">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date of birth" type="date" value={form.date_of_birth} onChange={(e) => setField('date_of_birth', e.target.value)} error={errors.date_of_birth} />
            <Select label="Gender" value={form.gender} onChange={(e) => setField('gender', e.target.value)} options={GENDER_OPTIONS} error={errors.gender} />
          </div>
        </FormSection>

        {/* ─── Guardian ─── */}
        <FormSection icon={Phone} title="Guardian / Emergency Contact">
          <Input label="Guardian name" value={form.guardian_name} onChange={(e) => setField('guardian_name', e.target.value)} error={errors.guardian_name} placeholder="e.g. Chidi Okafor" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Guardian phone" value={form.guardian_phone} onChange={(e) => setField('guardian_phone', e.target.value)} error={errors.guardian_phone} placeholder="+254 700 000 000" />
            <Input label="Guardian email" type="email" value={form.guardian_email} onChange={(e) => setField('guardian_email', e.target.value)} error={errors.guardian_email} placeholder="parent@example.com" />
          </div>
        </FormSection>

        {/* ─── Additional ─── */}
        <FormSection icon={BookOpen} title="Additional Info">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Address</label>
            <textarea value={form.address} onChange={(e) => setField('address', e.target.value)} rows={2} placeholder="Physical address..." className="w-full rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none" />
            {errors.address && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.address}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={(e) => setField('notes', e.target.value)} rows={2} placeholder="Allergies, medical conditions, special needs..." className="w-full rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none" />
            {errors.notes && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.notes}</p>}
          </div>
        </FormSection>

        {/* ─── Actions (inside the form!) ─── */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? 'Save changes' : 'Create student'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
