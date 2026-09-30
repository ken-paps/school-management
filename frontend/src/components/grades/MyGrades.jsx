import { useEffect, useMemo, useState } from 'react'
import { BookOpen, GraduationCap, Loader2, AlertCircle, TrendingUp } from 'lucide-react'
import api from '../../lib/axios'
import Card from '../ui/Card'
import Badge from '../ui/Badge'

const LETTER_COLOR = (letter) => {
  if (!letter) return 'zinc'
  if (letter === 'A' || letter === 'A-') return 'emerald'
  if (letter === 'B+' || letter === 'B' || letter === 'B-') return 'sky'
  if (letter === 'F') return 'red'
  return 'amber'
}

export default function MyGrades() {
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await api.get('/api/grades', { params: { per_page: 100 } })
        if (!cancelled) setGrades(data.data || [])
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Group by exam
  const grouped = useMemo(() => {
    const map = new Map()
    grades.forEach((g) => {
      const examId = g.exam?.id
      if (!examId) return
      if (!map.has(examId)) {
        map.set(examId, {
          exam: g.exam,
          grades: [],
        })
      }
      map.get(examId).grades.push(g)
    })
    return Array.from(map.values())
  }, [grades])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-emerald-600" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-4 border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10">
        <div className="flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
          <div className="text-sm text-red-700 dark:text-red-400">{error}</div>
        </div>
      </Card>
    )
  }

  if (grouped.length === 0) {
    return (
      <Card className="p-12 text-center">
        <BookOpen size={32} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No grades published yet</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">Your results will appear here once your teachers submit them and the exam is published.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {grouped.map(({ exam, grades: examGrades }) => {
        // Compute average
        const filled = examGrades.filter((g) => g.score !== null && g.max_score > 0)
        const avg = filled.length > 0 ? filled.reduce((sum, g) => sum + (Number(g.score) / Number(g.max_score)) * 100, 0) / filled.length : null

        return (
          <Card key={exam.id} className="overflow-hidden">
            {/* Exam header */}
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <GraduationCap size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{exam.name}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Term {exam.term?.replace('term', '')} · {exam.year}
                  </p>
                </div>
              </div>
              {avg !== null && <Badge color={avg >= 80 ? 'emerald' : avg >= 60 ? 'sky' : avg >= 40 ? 'amber' : 'red'}>Average {avg.toFixed(1)}%</Badge>}
            </div>

            {/* Grades table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800">
                    <th className="text-left px-6 py-2.5 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Subject</th>
                    <th className="text-left px-6 py-2.5 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 w-32">Score</th>
                    <th className="text-left px-6 py-2.5 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 w-24">Grade</th>
                    <th className="text-left px-6 py-2.5 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 hidden md:table-cell">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {examGrades.map((g) => {
                    const pct = g.max_score > 0 ? Math.round((Number(g.score) / Number(g.max_score)) * 100) : null
                    return (
                      <tr key={g.id}>
                        <td className="px-6 py-3">
                          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{g.subject?.name}</div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">{g.subject?.code}</div>
                        </td>
                        <td className="px-6 py-3">
                          <span className="text-sm tabular-nums text-zinc-900 dark:text-zinc-100">
                            {g.score} <span className="text-zinc-400">/ {g.max_score}</span>
                          </span>
                          {pct !== null && <div className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">{pct}%</div>}
                        </td>
                        <td className="px-6 py-3">
                          <Badge color={LETTER_COLOR(g.grade_letter)}>{g.grade_letter || '—'}</Badge>
                        </td>
                        <td className="px-6 py-3 hidden md:table-cell">
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">{g.remarks || '—'}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
