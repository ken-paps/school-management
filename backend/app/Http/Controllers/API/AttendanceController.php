<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\BulkStoreAttendanceRequest;
use App\Models\Attendance;
use App\Models\SchoolClass;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    /**
     * GET /api/attendance
     * List attendance records with filters (admin: all, teacher: own classes, student: own records).
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Attendance::query()
            ->with([
                'student:id,user_id,admission_number,class_id',
                'student.user:id,name,email',
                'schoolClass:id,name,grade_level,section',
                'markedBy:id,name',
            ])
            ->orderByDesc('date')
            ->orderBy('student_id');

        // Students only see their own attendance
        if ($user->isStudent()) {
            $student = Student::where('user_id', $user->id)->first();
            if (! $student) {
                return response()->json([
                    'data' => [],
                    'total' => 0,
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 15,
                    'from' => null,
                    'to' => null,
                ]);
            }
            $query->where('student_id', $student->id);
        }

        // Teachers only see attendance for classes they lead
        if ($user->isTeacher()) {
            $classIds = SchoolClass::where('teacher_id', $user->id)->pluck('id');
            $query->whereIn('class_id', $classIds);
        }

        if ($request->filled('class_id')) {
            $query->forClass($request->class_id);
        }

        if ($request->filled('date')) {
            $query->forDate($request->date);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('student_id')) {
            $query->forStudent($request->student_id);
        }

        $perPage = min((int) $request->input('per_page', 15), 100);

        return response()->json($query->paginate($perPage));
    }

    /**
     * GET /api/attendance/sheet
     * Returns the pre-populated attendance sheet for a class + date.
     * This is what the teacher's grid view calls first.
     */
    public function sheet(Request $request): JsonResponse
    {
        $request->validate([
            'class_id' => ['required', 'integer', 'exists:classes,id'],
            'date'     => ['required', 'date'],
        ]);

        $user = $request->user();

        // Teachers can only access their own classes
        if ($user->isTeacher()) {
            $owns = SchoolClass::where('id', $request->class_id)
                ->where('teacher_id', $user->id)
                ->exists();
            if (! $owns) {
                return response()->json([
                    'message' => 'You can only take attendance for classes you lead.',
                ], 403);
            }
        }

        $students = Student::query()
            ->with('user:id,name,email')
            ->where('class_id', $request->class_id)
            ->orderBy('admission_number')
            ->get();

        // Load any existing attendance records for this class + date
        $existing = Attendance::query()
            ->where('class_id', $request->class_id)
            ->forDate($request->date)
            ->get()
            ->keyBy('student_id');

        // Merge: each student with their existing status (or default 'present')
        $rows = $students->map(function ($student) use ($existing) {
            $record = $existing->get($student->id);
            return [
                'student_id'       => $student->id,
                'admission_number' => $student->admission_number,
                'name'             => $student->user?->name,
                'email'            => $student->user?->email,
                'status'           => $record?->status ?? 'present',
                'notes'            => $record?->notes,
                'attendance_id'    => $record?->id,
                'marked_at'        => $record?->updated_at,
            ];
        });

        return response()->json([
            'class_id'   => (int) $request->class_id,
            'date'       => $request->date,
            'rows'       => $rows,
            'has_existing' => $existing->isNotEmpty(),
        ]);
    }

    /**
     * POST /api/attendance/bulk
     * Save (upsert) attendance for an entire class + date in one request.
     */
    public function bulkStore(BulkStoreAttendanceRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();

        // Teachers can only save for their own classes
        if ($user->isTeacher()) {
            $owns = SchoolClass::where('id', $data['class_id'])
                ->where('teacher_id', $user->id)
                ->exists();
            if (! $owns) {
                return response()->json([
                    'message' => 'You can only take attendance for classes you lead.',
                ], 403);
            }
        }

        $saved = DB::transaction(function () use ($data, $user) {
            $count = 0;
            foreach ($data['records'] as $record) {
                // Upsert: if a record exists for (student, date), update it
                Attendance::updateOrCreate(
                    [
                        'student_id' => $record['student_id'],
                        'date'       => $data['date'],
                    ],
                    [
                        'class_id'  => $data['class_id'],
                        'status'    => $record['status'],
                        'notes'     => $record['notes'] ?? null,
                        'marked_by' => $user->id,
                    ]
                );
                $count++;
            }
            return $count;
        });

        return response()->json([
            'message' => "Attendance saved for {$saved} student" . ($saved === 1 ? '' : 's') . '.',
            'saved'   => $saved,
        ]);
    }

    public function show(Attendance $attendance): JsonResponse
    {
        return response()->json([
            'attendance' => $attendance->load([
                'student.user:id,name,email',
                'schoolClass:id,name,grade_level,section',
                'markedBy:id,name',
            ]),
        ]);
    }

    public function destroy(Attendance $attendance): JsonResponse
    {
        $attendance->delete();

        return response()->json([
            'message' => 'Attendance record deleted.',
        ]);
    }
}