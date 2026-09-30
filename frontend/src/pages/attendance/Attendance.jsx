import { useEffect, useState } from 'react'
import { CalendarCheck, Save, Check, X, Clock, Shield, Users as UsersIcon, AlertCircle, CheckCircle2, ClipboardList } from 'lucide-react'
import useAttendance from '../../hooks/useAttendance'
import useClassesForSelect from '../../hooks/useClassesForSelect'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'

// ─────────────────────────────────────────────
//  Status pill / button definitions
// ─────────────────────────────────────────────
const STATUS_CONFIG = {
  present: {
    label: 'Present',
    short: 'P',
    icon: Check,
    activeClasses: 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600',
    idleClasses: 'border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400',
  },
  absent: {
    label: 'Absent',
    short: 'A',
    icon: X,
    activeClasses: 'bg-red-500 text-white border-red-500 hover:bg-red-600',
    idleClasses: 'border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:border-red-500/50 hover:text-red-600 dark:hover:text-red-400',
  },
  late: {
    label: 'Late',
    short: 'L',
    icon: Clock,
    activeClasses: 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600',
    idleClasses: 'border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:border-amber-500/50 hover:text-amber-600 dark:hover:text-amber-400',
  },
  excused: {
    label: 'Excused',
    short: 'E',
    icon: Shield,
    activeClasses: 'bg-sky-500 text-white border-sky-500 hover:bg-sky-600',
    idleClasses: 'border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:border-sky-500/50 hover:text-sky-600 dark:hover:text-sky-400',
  },
}

const STATUS_ORDER = ['present', 'absent', 'late', 'excused']

// ─────────────────────────────────────────────
//  Status button component
// ─────────────────────────────────────────────
function StatusButton({ status, active, onClick }) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <button type="button" onClick={onClick} title={config.label} className={['inline-flex items-center justify-center w-8 h-8 rounded-md border text-xs font-semibold transition-colors', active ? config.activeClasses : config.idleClasses].join(' ')}>
      <Icon size={14} />
    </button>
  )
}

export default function Attendance() {
  const { classes, loading: classesLoading } = useClassesForSelect()
  const { rows, sheetMeta, loading, saving, error, saved, loadSheet, setRowNotes, setRowStatus, markAll, saveSheet } = useAttendance()

  const [selectedClass, setSelectedClass] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))

  // Load sheet when class + date are both set
  useEffect(() => {
    if (selectedClass && selectedDate) {
      loadSheet(selectedClass, selectedDate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, selectedDate])

  const classOptions = [
    { value: '', label: classesLoading ? 'Loading…' : 'Select a class…' },
    ...classes.map((c) => ({
      value: c.id,
      label: c.display_name || c.name,
    })),
  ]

  const stats = {
    present: rows.filter((r) => r.status === 'present').length,
    absent: rows.filter((r) => r.status === 'absent').length,
    late: rows.filter((r) => r.status === 'late').length,
    excused: rows.filter((r) => r.status === 'excused').length,
  }

  const total = rows.length

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Attendance</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Mark daily attendance for a class.</p>
        </div>
      </div>

      {/* Class + Date picker */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Select label="Class" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} options={classOptions} />
          </div>
          <div className="sm:w-56">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Date</label>
            <input type="date" value={selectedDate} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setSelectedDate(e.target.value)} className="w-full rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
        </div>
      </Card>

      {/* Empty state — no class selected */}
      {!selectedClass && (
        <Card className="p-12 text-center">
          <CalendarCheck size={32} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Select a class to begin</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Choose a class and date above, then mark each student's attendance.</p>
        </Card>
      )}

      {/* Error banner */}
      {error && (
        <Card className="p-4 border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div className="text-sm text-red-700 dark:text-red-400">
              <div className="font-medium">Something went wrong</div>
              <div className="text-xs mt-0.5 opacity-80">{error}</div>
            </div>
          </div>
        </Card>
      )}

      {/* Loading skeleton */}
      {selectedClass && loading && (
        <Card className="p-6">
          <div className="space-y-3 animate-pulse">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="flex-1 h-3 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-32 h-8 rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty state — class selected, no students */}
      {selectedClass && !loading && rows.length === 0 && !error && (
        <Card className="p-12 text-center">
          <UsersIcon size={32} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No students in this class</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Assign students to this class first.</p>
        </Card>
      )}

      {/* The grid */}
      {selectedClass && !loading && rows.length > 0 && !error && (
        <Card>
          {/* Sheet header — stats + bulk actions */}
          <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <ClipboardList size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{sheetMeta.has_existing ? 'Editing' : 'New'} attendance</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                — {total} student{total !== 1 ? 's' : ''}
              </span>

              {/* Stats pills */}
              <div className="flex items-center gap-1.5 ml-2">
                {stats.present > 0 && <Badge color="emerald">{stats.present} present</Badge>}
                {stats.absent > 0 && <Badge color="red">{stats.absent} absent</Badge>}
                {stats.late > 0 && <Badge color="amber">{stats.late} late</Badge>}
                {stats.excused > 0 && <Badge color="sky">{stats.excused} excused</Badge>}
              </div>
            </div>

            {/* Mark all present shortcut */}
            <button type="button" onClick={() => markAll('present')} className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
              Mark all present
            </button>
          </div>

          {/* Student rows */}
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {rows.map((row, idx) => {
              const showNotes = row.status !== 'present'

              return (
                <div key={row.student_id} className="px-5 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* # index */}
                    <div className="w-6 text-xs text-zinc-400 dark:text-zinc-500 tabular-nums text-right shrink-0">{idx + 1}</div>

                    {/* Student info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{row.name}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">{row.admission_number}</div>
                    </div>

                    {/* Status buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {STATUS_ORDER.map((status) => (
                        <StatusButton key={status} status={status} active={row.status === status} onClick={() => setRowStatus(row.student_id, status)} />
                      ))}
                    </div>
                  </div>

                  {/* Inline notes input — only shown for non-present statuses */}
                  {showNotes && (
                    <div className="mt-2 ml-10">
                      <input type="text" value={row.notes || ''} onChange={(e) => setRowNotes(row.student_id, e.target.value)} placeholder="Add a note (optional) — e.g. Doctor's note provided" className="w-full max-w-md rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Footer — Save */}
          <div className="px-5 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 flex-wrap">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              {saved ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 size={14} />
                  Saved successfully
                </span>
              ) : (
                <span>Changes are not saved until you click Save.</span>
              )}
            </div>

            <Button onClick={saveSheet} loading={saving} disabled={saving} icon={Save}>
              Save attendance
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
