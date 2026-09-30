import { useEffect, useMemo, useState } from 'react'
import { Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import api from '../../lib/axios'

export default function GradeSheet({ examId, classId, subjectId, onSaved }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  // Load the sheet
  useEffect(() => {
    if (!examId || !classId || !subjectId) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      setSuccessMsg(null)
      try {
        const { data } = await api.get('/api/grades/sheet', {
          params: { exam_id: examId, class_id: classId, subject_id: subjectId },
        })
        if (!cancelled) setRows(data.rows || [])
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [examId, classId, subjectId])

  const updateRow = (studentId, key, value) => {
    setRows((prev) => prev.map((r) => (r.student_id === studentId ? { ...r, [key]: value } : r)))
    setSuccessMsg(null)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const payload = {
        exam_id: examId,
        subject_id: subjectId,
        records: rows
          .filter((r) => r.score !== null && r.score !== '' && r.score !== undefined)
          .map((r) => ({
            student_id: r.student_id,
            score: Number(r.score),
            max_score: Number(r.max_score || 100),
            remarks: r.remarks || null,
          })),
      }
      const { data } = await api.post('/api/grades/bulk', payload)
      setSuccessMsg(data.message || 'Saved.')
      onSaved?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Derived: compute percentage + letter client-side (mirrors backend)
  const computeLetter = (score, max) => {
    if (score === '' || score === null || score === undefined) return null
    const s = Number(score)
    const m = Number(max || 100)
    if (m <= 0) return '—'
    const pct = (s / m) * 100
    if (pct >= 90) return 'A'
    if (pct >= 80) return 'A-'
    if (pct >= 75) return 'B+'
    if (pct >= 70) return 'B'
    if (pct >= 65) return 'B-'
    if (pct >= 60) return 'C+'
    if (pct >= 55) return 'C'
    if (pct >= 50) return 'C-'
    if (pct >= 40) return 'D'
    return 'F'
  }

  const stats = useMemo(() => {
    const filled = rows.filter((r) => r.score !== '' && r.score !== null && r.score !== undefined)
    if (filled.length === 0) return null
    const total = filled.reduce((sum, r) => {
      const pct = (Number(r.score) / Number(r.max_score || 100)) * 100
      return sum + pct
    }, 0)
    return {
      count: filled.length,
      average: (total / filled.length).toFixed(1),
    }
  }, [rows])

  if (!examId || !classId || !subjectId) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge color="emerald">{rows.length} students</Badge>
          {stats && (
            <>
              <Badge color="sky">{stats.count} entered</Badge>
              <Badge color="amber">avg {stats.average}%</Badge>
            </>
          )}
        </div>
        <Button icon={saving ? undefined : Save} loading={saving} onClick={handleSave} disabled={stats?.count === 0}>
          Save grades
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-start gap-2 rounded-md bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-3 py-2">
          <AlertCircle size={14} className="shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
          <div className="text-sm text-red-700 dark:text-red-400">{error}</div>
        </div>
      )}
      {successMsg && (
        <div className="flex items-start gap-2 rounded-md bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 px-3 py-2">
          <CheckCircle2 size={14} className="shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
          <div className="text-sm text-emerald-700 dark:text-emerald-400">{successMsg}</div>
        </div>
      )}

      {/* Table */}
      {rows.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No students in this class yet.</p>
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="text-left px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 w-12">#</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Student</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 hidden md:table-cell">Admission #</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 w-28">Score</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 w-24 hidden sm:table-cell">Max</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 w-20">Grade</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 hidden lg:table-cell">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {rows.map((r, idx) => {
                  const letter = computeLetter(r.score, r.max_score)
                  const letterColor = letter === 'A' || letter === 'A-' ? 'emerald' : letter === 'B+' || letter === 'B' || letter === 'B-' ? 'sky' : letter === 'F' ? 'red' : 'amber'
                  return (
                    <tr key={r.student_id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <td className="px-4 py-2 text-xs text-zinc-400 tabular-nums">{idx + 1}</td>
                      <td className="px-4 py-2">
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{r.name}</div>
                      </td>
                      <td className="px-4 py-2 hidden md:table-cell">
                        <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">{r.admission_number}</span>
                      </td>
                      <td className="px-4 py-2">
                        <input type="number" min="0" step="0.5" value={r.score ?? ''} onChange={(e) => updateRow(r.student_id, 'score', e.target.value)} placeholder="—" className="w-full rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-2 py-1 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 tabular-nums" />
                      </td>
                      <td className="px-4 py-2 hidden sm:table-cell">
                        <input type="number" min="1" step="1" value={r.max_score ?? 100} onChange={(e) => updateRow(r.student_id, 'max_score', e.target.value)} className="w-full rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-2 py-1 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 tabular-nums" />
                      </td>
                      <td className="px-4 py-2">{letter ? <Badge color={letterColor}>{letter}</Badge> : <span className="text-zinc-400 text-xs">—</span>}</td>
                      <td className="px-4 py-2 hidden lg:table-cell">
                        <input type="text" value={r.remarks ?? ''} onChange={(e) => updateRow(r.student_id, 'remarks', e.target.value)} placeholder="Optional" maxLength={500} className="w-full rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-2 py-1 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Changes aren't saved until you click <span className="font-medium">Save grades</span>. Empty score rows are skipped.
      </p>
    </div>
  )
}
