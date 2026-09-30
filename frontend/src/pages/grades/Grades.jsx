import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { ClipboardList, FileText, BarChart3, LayoutGrid } from 'lucide-react'
import Card from '../../components/ui/Card'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import useExams from '../../hooks/useExams'
import useClassesForSelect from '../../hooks/useClassesForSelect'
import useSubjectsForSelect from '../../hooks/useSubjectsForSelect'
import GradeSheet from '../../components/grades/GradeSheet'
import Exams from '../exams/Exams'
import MyGrades from '../../components/grades/MyGrades'

const TABS = [
  { id: 'exams', label: 'Exams', icon: FileText },
  { id: 'entry', label: 'Enter Grades', icon: ClipboardList },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
]

export default function Grades() {
  const { user } = useAuth()
  const isStudent = user?.role === 'student'
  const [activeTab, setActiveTab] = useState('exams')

  if (isStudent) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">My Grades</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Your published results across all exams.</p>
        </div>
        <MyGrades />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Grades</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage exams, enter scores, and view reports.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-1 -mb-px">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={['inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px', isActive ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400' : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'].join(' ')}>
                <Icon size={15} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'exams' && <Exams embedded />}
      {activeTab === 'entry' && <GradeEntryTab />}
      {activeTab === 'reports' && <ReportsTab />}
    </div>
  )
}

/** ──────────────────────────────────────────
 *  Enter Grades tab
 *  ────────────────────────────────────────── */
function GradeEntryTab() {
  const { exams, loading: examsLoading } = useExams()
  const { classes, loading: classesLoading } = useClassesForSelect()
  const { subjects, loading: subjectsLoading } = useSubjectsForSelect()

  const [examId, setExamId] = useState('')
  const [classId, setClassId] = useState('')
  const [subjectId, setSubjectId] = useState('')

  const examOptions = [
    { value: '', label: examsLoading ? 'Loading…' : 'Select exam…' },
    ...exams.map((e) => ({
      value: e.id,
      label: (e.display_name || e.name) + (e.is_published ? ' (published)' : ''),
    })),
  ]
  const classOptions = [{ value: '', label: classesLoading ? 'Loading…' : 'Select class…' }, ...classes.map((c) => ({ value: c.id, label: c.display_name || c.name }))]
  const subjectOptions = [{ value: '', label: subjectsLoading ? 'Loading…' : 'Select subject…' }, ...subjects.map((s) => ({ value: s.id, label: `${s.name} (${s.code})` }))]

  const ready = examId && classId && subjectId

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select label="Exam" value={examId} onChange={(e) => setExamId(e.target.value)} options={examOptions} />
          <Select label="Class" value={classId} onChange={(e) => setClassId(e.target.value)} options={classOptions} />
          <Select label="Subject" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} options={subjectOptions} />
        </div>
      </Card>

      {!ready && (
        <Card className="p-12 text-center">
          <LayoutGrid size={28} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Select an exam, class, and subject to begin entering grades.</p>
        </Card>
      )}

      {ready && <GradeSheet examId={Number(examId)} classId={Number(classId)} subjectId={Number(subjectId)} />}
    </div>
  )
}

/** ──────────────────────────────────────────
 *  Reports tab
 *  ────────────────────────────────────────── */
function ReportsTab() {
  return (
    <Card className="p-12 text-center">
      <BarChart3 size={28} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Reports coming soon</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">Report cards, class rankings, and per-subject averages will appear here. You can build this in Phase 5.</p>
    </Card>
  )
}
