<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Grade;
use App\Models\Notice;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        return match ($user->role) {
            'admin'   => $this->adminStats(),
            'teacher' => $this->teacherStats($user),
            'student' => $this->studentStats($user),
            default   => response()->json(['message' => 'Unknown role.'], 403),
        };
    }

    // ─────────────────────────────────────────────
    //  Admin — school-wide overview
    // ─────────────────────────────────────────────
    private function adminStats(): JsonResponse
    {
        $today = now()->toDateString();

        $totalStudents  = Student::count();
        $totalTeachers  = Teacher::count();
        $totalClasses   = SchoolClass::count();
        $totalSubjects  = \App\Models\Subject::count();

        // Today's attendance snapshot
        $todayAttendance = Attendance::where('date', $today)
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN status = 'absent'  THEN 1 ELSE 0 END) as absent,
                SUM(CASE WHEN status = 'late'    THEN 1 ELSE 0 END) as late,
                SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as excused
            ")
            ->first();

        $attendanceRate = $todayAttendance && $todayAttendance->total > 0
            ? round(($todayAttendance->present / $todayAttendance->total) * 100, 1)
            : null;

        // Recent notices (latest 5)
        $recentNotices = Notice::query()
            ->orderByDesc('is_pinned')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get(['id', 'title', 'audience', 'is_pinned', 'created_at']);

        // Recent enrollments (latest 5 students)
        $recentEnrollments = Student::query()
            ->with('user:id,name,email', 'schoolClass:id,name,grade_level,section')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        return response()->json([
            'role' => 'admin',
            'cards' => [
                'students' => $totalStudents,
                'teachers' => $totalTeachers,
                'classes'  => $totalClasses,
                'subjects' => $totalSubjects,
            ],
            'attendance_today' => [
                'date'           => $today,
                'total_marked'   => (int) ($todayAttendance->total ?? 0),
                'present'        => (int) ($todayAttendance->present ?? 0),
                'absent'         => (int) ($todayAttendance->absent ?? 0),
                'late'           => (int) ($todayAttendance->late ?? 0),
                'excused'        => (int) ($todayAttendance->excused ?? 0),
                'rate'           => $attendanceRate,
            ],
            'recent_notices'    => $recentNotices,
            'recent_enrollments'=> $recentEnrollments,
        ]);
    }

    // ─────────────────────────────────────────────
    //  Teacher — their classes focus
    // ─────────────────────────────────────────────
    private function teacherStats(User $user): JsonResponse
    {
        $teacher = Teacher::where('user_id', $user->id)->first();

        if (! $teacher) {
            return response()->json([
                'role' => 'teacher',
                'cards' => ['classes' => 0, 'students' => 0, 'subjects' => 0],
                'message' => 'Teacher profile not set up yet.',
            ]);
        }

        $classIds = SchoolClass::where('teacher_id', $user->id)->pluck('id');

        $totalStudents = Student::whereIn('class_id', $classIds)->count();
        $totalSubjects = $teacher->subjects()->count();
        $totalClasses  = $classIds->count();

        // Recent notices visible to teachers
        $recentNotices = Notice::query()
            ->whereIn('audience', ['everyone', 'teachers'])
            ->orderByDesc('is_pinned')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get(['id', 'title', 'audience', 'is_pinned', 'created_at']);

        return response()->json([
            'role' => 'teacher',
            'cards' => [
                'classes'  => $totalClasses,
                'students' => $totalStudents,
                'subjects' => $totalSubjects,
            ],
            'recent_notices' => $recentNotices,
        ]);
    }

    // ─────────────────────────────────────────────
    //  Student — their own snapshot
    // ─────────────────────────────────────────────
    private function studentStats(User $user): JsonResponse
    {
        $student = Student::where('user_id', $user->id)->first();

        if (! $student) {
            return response()->json([
                'role' => 'student',
                'cards' => [],
                'message' => 'Student profile not set up yet.',
            ]);
        }

        // Attendance summary (last 30 days)
        $since = now()->subDays(30)->toDateString();
        $attendance = Attendance::where('student_id', $student->id)
            ->where('date', '>=', $since)
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
            ")
            ->first();

        $attendanceRate = $attendance && $attendance->total > 0
            ? round(($attendance->present / $attendance->total) * 100, 1)
            : null;

        // Latest published exam + average grade
        $publishedExams = \App\Models\Exam::where('is_published', true)->pluck('id');
        $grades = Grade::where('student_id', $student->id)
            ->whereIn('exam_id', $publishedExams)
            ->get();

        $avgPct = null;
        $gradeCount = $grades->count();
        if ($gradeCount > 0) {
            $sum = $grades->sum(fn ($g) => ($g->score / $g->max_score) * 100);
            $avgPct = round($sum / $gradeCount, 1);
        }

        // Recent notices visible to students
        $recentNotices = Notice::query()
            ->whereIn('audience', ['everyone', 'students'])
            ->orderByDesc('is_pinned')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get(['id', 'title', 'audience', 'is_pinned', 'created_at']);

        return response()->json([
            'role' => 'student',
            'cards' => [
                'attendance_rate' => $attendanceRate,
                'avg_grade'       => $avgPct,
                'subjects'        => $grades->pluck('subject_id')->unique()->count(),
                'grades_count'    => $gradeCount,
            ],
            'class' => $student->schoolClass ? [
                'name' => $student->schoolClass->display_name,
            ] : null,
            'recent_notices' => $recentNotices,
        ]);
    }
}