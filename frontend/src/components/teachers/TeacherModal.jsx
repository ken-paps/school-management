import { useEffect, useState } from 'react'
import { Wand2, Copy, Check, User as UserIcon, Briefcase, GraduationCap, Phone, BookOpen, X } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import useSubjectsForSelect from '../../hooks/useSubjectsForSelect'

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  employee_number: '',
  hire_date: '',
  phone: '',
  address: '',
  qualification: '',
  specialization: '',
  bio: '',
  subject_ids: [],
}

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

export default function TeacherModal({ open, onClose, onSubmit, teacher = null, generatePassword }) {
  const isEdit = Boolean(teacher)
  const { subjects, loading: subjectsLoading } = useSubjectsForSelect()

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return
    if (isEdit && teacher) {
      setForm({
        name: teacher.user?.name || '',
        email: teacher.user?.email || '',
        password: '',
        employee_number: teacher.employee_number || '',
        hire_date: teacher.hire_date?.slice(0, 10) || '',
        phone: teacher.phone || '',
        address: teacher.address || '',
        qualification: teacher.qualification || '',
        specialization: teacher.specialization || '',
        bio: teacher.bio || '',
        subject_ids: teacher.subjects?.map((s) => s.id) || [],
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setErrors({})
    setGeneratedPassword('')
    setCopied(false)
  }, [open, isEdit, teacher])

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

  const toggleSubject = (id) => {
    setForm((f) => ({
      ...f,
      subject_ids: f.subject_ids.includes(id) ? f.subject_ids.filter((x) => x !== id) : [...f.subject_ids, id],
    }))
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
      employee_number: form.employee_number.trim().toUpperCase(),
      hire_date: form.hire_date || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      qualification: form.qualification.trim() || null,
      specialization: form.specialization.trim() || null,
      bio: form.bio.trim() || null,
      subject_ids: form.subject_ids,
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
        flat._general = err.message || 'Failed to save teacher.'
      }
      setErrors(flat)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit teacher' : 'Create teacher'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors._general && <div className="rounded-md bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-3 py-2 text-sm text-red-700 dark:text-red-400">{errors._general}</div>}

        {/* ─── Identity ─── */}
        <FormSection icon={UserIcon} title="Identity">
          <Input label="Full name" value={form.name} onChange={(e) => setField('name', e.target.value)} error={errors.name} placeholder="e.g. Jane Mwangi" autoFocus required />
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

        {/* ─── Employment ─── */}
        <FormSection icon={Briefcase} title="Employment">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Employee number" value={form.employee_number} onChange={(e) => setField('employee_number', e.target.value.toUpperCase())} error={errors.employee_number} placeholder="TCH-2026-0001" required />
            <Input label="Hire date" type="date" value={form.hire_date} onChange={(e) => setField('hire_date', e.target.value)} error={errors.hire_date} />
          </div>
        </FormSection>

        {/* ─── Professional ─── */}
        <FormSection icon={GraduationCap} title="Professional">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Qualification" value={form.qualification} onChange={(e) => setField('qualification', e.target.value)} error={errors.qualification} placeholder="e.g. M.Ed, BSc" />
            <Input label="Specialization" value={form.specialization} onChange={(e) => setField('specialization', e.target.value)} error={errors.specialization} placeholder="e.g. Mathematics" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Bio <span className="text-zinc-400 font-normal">(optional)</span>
            </label>
            <textarea value={form.bio} onChange={(e) => setField('bio', e.target.value)} rows={2} placeholder="Short introduction..." className="w-full rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none" />
          </div>
        </FormSection>

        {/* ─── Subjects (multi-select chips) ─── */}
        <FormSection icon={BookOpen} title="Subjects Taught">
          {subjectsLoading ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading subjects…</p>
          ) : subjects.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No subjects available. Create subjects first.</p>
          ) : (
            <>
              {/* Selected chips */}
              {form.subject_ids.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.subject_ids.map((id) => {
                    const s = subjects.find((x) => x.id === id)
                    if (!s) return null
                    return (
                      <span key={id} className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-xs font-medium">
                        {s.code}
                        <button type="button" onClick={() => toggleSubject(id)} className="hover:text-emerald-900 dark:hover:text-emerald-300">
                          <X size={11} />
                        </button>
                      </span>
                    )
                  })}
                </div>
              )}

              {/* All available as clickable chips */}
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1">
                {subjects.map((s) => {
                  const selected = form.subject_ids.includes(s.id)
                  return (
                    <button key={s.id} type="button" onClick={() => toggleSubject(s.id)} className={['inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors', selected ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-emerald-500/40 hover:bg-emerald-500/5'].join(' ')}>
                      {s.name}
                    </button>
                  )
                })}
              </div>
            </>
          )}
          {errors.subject_ids && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.subject_ids}</p>}
        </FormSection>

        {/* ─── Contact ─── */}
        <FormSection icon={Phone} title="Contact">
          <Input label="Phone" value={form.phone} onChange={(e) => setField('phone', e.target.value)} error={errors.phone} placeholder="+254 700 000 000" />
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Address</label>
            <textarea value={form.address} onChange={(e) => setField('address', e.target.value)} rows={2} placeholder="Physical address..." className="w-full rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none" />
            {errors.address && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.address}</p>}
          </div>
        </FormSection>

        {/* ─── Actions ─── */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? 'Save changes' : 'Create teacher'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
