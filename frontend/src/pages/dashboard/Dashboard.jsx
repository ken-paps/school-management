import { GraduationCap, Users, School, CalendarCheck, BookOpen, Megaphone, UserPlus, AlertCircle, Loader2, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import useDashboardStats from '../../hooks/useDashboardStats'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import RoleBadge from '../../components/layout/RoleBadge'

// ─────────────────────────────────────────────
//  Utils
// ─────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString()
}

// ─────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth()
  const { data, loading, error } = useDashboardStats()

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome banner */}
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Welcome back, {user?.name?.split(' ')[0]}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
          <RoleBadge role={user?.role} />
        </div>
      </Card>

      {/* Error */}
      {error && (
        <Card className="p-4 border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div className="text-sm text-red-700 dark:text-red-400">
              <div className="font-medium">Failed to load dashboard</div>
              <div className="text-xs mt-0.5 opacity-80">{error}</div>
            </div>
          </div>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-emerald-600" />
        </div>
      )}

      {/* Content */}
      {!loading && data && (
        <>
          {/* Admin: 4 stat cards + attendance snapshot */}
          {data.role === 'admin' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <StatCard label="Students" value={data.cards.students} icon={GraduationCap} hint="Total enrolled" />
                <StatCard label="Teachers" value={data.cards.teachers} icon={Users} hint="Active staff" />
                <StatCard label="Classes" value={data.cards.classes} icon={School} hint="Across all grades" />
                <StatCard label="Subjects" value={data.cards.subjects} icon={BookOpen} hint="Currently offered" />
              </div>

              {/* Attendance snapshot */}
              <Card className="p-6">
                <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <CalendarCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Attendance — Today</h3>
                  </div>
                  {data.attendance_today.rate !== null && <Badge color={data.attendance_today.rate >= 80 ? 'emerald' : data.attendance_today.rate >= 60 ? 'amber' : 'red'}>{data.attendance_today.rate}% present</Badge>}
                </div>
                {data.attendance_today.total_marked === 0 ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    No attendance marked yet today.{' '}
                    <Link to="/attendance" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                      Mark attendance →
                    </Link>
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <AttendanceStat label="Present" value={data.attendance_today.present} color="emerald" />
                    <AttendanceStat label="Absent" value={data.attendance_today.absent} color="red" />
                    <AttendanceStat label="Late" value={data.attendance_today.late} color="amber" />
                    <AttendanceStat label="Excused" value={data.attendance_today.excused} color="sky" />
                  </div>
                )}
              </Card>
            </>
          )}

          {/* Teacher: 3 stat cards */}
          {data.role === 'teacher' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
              <StatCard label="My Classes" value={data.cards.classes} icon={School} hint="Class teacher of" />
              <StatCard label="My Students" value={data.cards.students} icon={GraduationCap} hint="Across all my classes" />
              <StatCard label="My Subjects" value={data.cards.subjects} icon={BookOpen} hint="Assigned to me" />
            </div>
          )}

          {/* Student: 4 stat cards */}
          {data.role === 'student' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <StatCard label="Attendance" value={data.cards.attendance_rate !== null ? `${data.cards.attendance_rate}%` : '—'} icon={CalendarCheck} hint="Last 30 days" />
                <StatCard label="Average Grade" value={data.cards.avg_grade !== null ? `${data.cards.avg_grade}%` : '—'} icon={TrendingUp} hint={data.cards.grades_count > 0 ? `${data.cards.grades_count} grades` : 'No published grades yet'} />
                <StatCard label="Subjects" value={data.cards.subjects} icon={BookOpen} hint="With published grades" />
                <StatCard label="My Class" value={data.class?.name?.replace('Grade ', 'G') || '—'} icon={School} hint={data.class?.name || 'Not assigned'} />
              </div>
            </>
          )}

          {/* Two-column: Recent Notices + Recent Enrollments (admin only) */}
          <div className={`grid grid-cols-1 ${data.role === 'admin' ? 'lg:grid-cols-2' : ''} gap-6`}>
            {/* Recent Notices */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Megaphone size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Recent Notices</h3>
                </div>
                <Link to="/notices" className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                  View all →
                </Link>
              </div>
              {data.recent_notices?.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">No notices yet.</p>
              ) : (
                <div className="space-y-3">
                  {(data.recent_notices || []).map((n) => (
                    <div key={n.id} className="flex items-start gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0 last:pb-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {n.is_pinned && <Badge color="amber">Pinned</Badge>}
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{n.title}</span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{timeAgo(n.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Recent Enrollments — admin only */}
            {data.role === 'admin' && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <UserPlus size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Recent Enrollments</h3>
                  </div>
                  <Link to="/students" className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                    View all →
                  </Link>
                </div>
                {data.recent_enrollments?.length === 0 ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">No students yet.</p>
                ) : (
                  <div className="space-y-3">
                    {(data.recent_enrollments || []).map((s) => {
                      const initials = (s.user?.name || '?')
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()
                      return (
                        <div key={s.id} className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0 last:pb-0">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-semibold shrink-0">{initials}</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{s.user?.name}</div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                              {s.school_class?.name || 'Unassigned'} · {timeAgo(s.created_at)}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
//  Attendance sub-stat
// ─────────────────────────────────────────────
function AttendanceStat({ label, value, color }) {
  const colors = {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    red: 'text-red-600 dark:text-red-400',
    amber: 'text-amber-600 dark:text-amber-400',
    sky: 'text-sky-600 dark:text-sky-400',
  }
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400 font-medium">{label}</div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${colors[color]}`}>{value}</div>
    </div>
  )
}
