import { useEffect, useState } from 'react'
import { Pin, Send, FileText } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'

const AUDIENCE_OPTIONS = [
  { value: 'all', label: 'Everyone' },
  { value: 'teachers', label: 'Teachers only' },
  { value: 'students', label: 'Students only' },
  { value: 'admins', label: 'Admins only' },
]

const EMPTY_FORM = {
  title: '',
  body: '',
  audience: 'all',
  is_pinned: false,
  publish: true,
}

export default function NoticeModal({ open, onClose, onSubmit, notice = null }) {
  const isEdit = Boolean(notice)

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    if (isEdit && notice) {
      setForm({
        title: notice.title || '',
        body: notice.body || '',
        audience: notice.audience || 'all',
        is_pinned: notice.is_pinned ?? false,
        publish: notice.published_at !== null, // already published = keep published
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setErrors({})
  }, [open, isEdit, notice])

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
      title: form.title.trim(),
      body: form.body.trim(),
      audience: form.audience,
      is_pinned: Boolean(form.is_pinned),
      publish: Boolean(form.publish),
    }

    // If editing a published notice and unpublishing, send unpublish flag
    if (isEdit && notice.published_at && !form.publish) {
      payload.unpublish = true
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
        flat._general = err.message || 'Failed to save notice.'
      }
      setErrors(flat)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit notice' : 'Post notice'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors._general && <div className="rounded-md bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-3 py-2 text-sm text-red-700 dark:text-red-400">{errors._general}</div>}

        <Input label="Title" value={form.title} onChange={(e) => setField('title', e.target.value)} error={errors.title} placeholder="e.g. Sports day coming up" autoFocus required />

        <Select label="Audience" value={form.audience} onChange={(e) => setField('audience', e.target.value)} options={AUDIENCE_OPTIONS} error={errors.audience} hint="Who should see this notice?" />

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Body</label>
          <textarea value={form.body} onChange={(e) => setField('body', e.target.value)} rows={8} placeholder="Write the notice content here..." className={['w-full rounded-md border bg-white dark:bg-zinc-900 px-3 py-2 text-sm', 'text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500', 'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500', 'resize-y min-h-40', errors.body ? 'border-red-400 dark:border-red-500' : 'border-zinc-300 dark:border-zinc-600'].join(' ')} />
          {errors.body && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.body}</p>}
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{form.body.length} characters</p>
        </div>

        {/* Toggles */}
        <div className="space-y-2 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_pinned} onChange={(e) => setField('is_pinned', e.target.checked)} className="rounded border-zinc-300 dark:border-zinc-600 text-emerald-600 focus:ring-emerald-500" />
            <Pin size={14} className="text-zinc-500" />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">Pin to top of notice board</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.publish} onChange={(e) => setField('publish', e.target.checked)} className="rounded border-zinc-300 dark:border-zinc-600 text-emerald-600 focus:ring-emerald-500" />
            <Send size={14} className="text-zinc-500" />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">Publish immediately (uncheck to save as draft)</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? 'Save changes' : form.publish ? 'Publish notice' : 'Save draft'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
