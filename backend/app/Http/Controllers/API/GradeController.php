<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\BulkStoreGradesRequest;
use App\Models\Exam;
use App\Models\Grade;
use App\Models\SchoolClass;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GradeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Grade::query()
            ->with([
                'exam:id,name,term,year',
                'student.user:id,name,email',
                'subject:id,name,code',
            ])
            ->orderByDesc('created_at');

        if ($user->isStudent()) {
            $student = Student::where('user_id', $user->id)->first();
            if (! $student) {
                return response()->json($this->emptyPage());
            }
            $query->where('student_id', $student->id);
            // Students only see published grades
            $query->whereHas('exam', fn ($q) => $q->where('is_published', true));
        }

        if ($request->filled('exam_id')) $query->where('exam_id', $request->exam_id);
        if ($request->filled('student_id')) $query->where('student_id', $request->student_id);
        if ($request->filled('subject_id')) $query->where('subject_id', $request->subject_id);

        $perPage = min((int) $request->input('per_page', 15), 100);

        return response()->json($query->paginate($perPage));
    }

    /**
     * GET /api/grades/sheet
     * Pre-populated grade entry grid for exam + class + subject.
     */
    public function sheet(Request $request): JsonResponse
    {
        $request->validate([
            'exam_id'    => ['required', 'integer', 'exists:exams,id'],
            'class_id'   => ['required', 'integer', 'exists:classes,id'],
            'subject_id' => ['required', 'integer', 'exists:subjects,id'],
        ]);

        $students = Student::query()
            ->with('user:id,name,email')
            ->where('class_id', $request->class_id)
            ->orderBy('admission_number')
            ->get();

        $existing = Grade::query()
            ->where('exam_id', $request->exam_id)
            ->where('subject_id', $request->subject_id)
            ->whereIn('student_id', $students->pluck('id'))
            ->get()
            ->keyBy('student_id');

        $rows = $students->map(function ($student) use ($existing) {
            $record = $existing->get($student->id);
            return [
                'student_id'       => $student->id,
                'admission_number' => $student->admission_number,
                'name'             => $student->user?->name,
                'email'            => $student->user?->email,
                'score'            => $record?->score,
                'max_score'        => $record?->max_score ?? 100,
                'grade_letter'     => $record?->grade_letter,
                'remarks'          => $record?->remarks,
                'grade_id'         => $record?->id,
            ];
        });

        return response()->json([
            'exam_id'      => (int) $request->exam_id,
            'class_id'     => (int) $request->class_id,
            'subject_id'   => (int) $request->subject_id,
            'rows'         => $rows,
            'has_existing' => $existing->isNotEmpty(),
        ]);
    }

    /**
     * POST /api/grades/bulk
     * Save grade entry grid in one transaction.
     */
    public function bulkStore(BulkStoreGradesRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();

        $saved = DB::transaction(function () use ($data, $user) {
            $count = 0;
            foreach ($data['records'] as $record) {
                // Skip rows where score is empty (unentered)
                if ($record['score'] === null || $record['score'] === '') continue;

                $letter = Grade::letterFromScore(
                    (float) $record['score'],
                    (float) ($record['max_score'] ?? 100)
                );

                Grade::updateOrCreate(
                    [
                        'exam_id'    => $data['exam_id'],
                        'student_id' => $record['student_id'],
                        'subject_id' => $data['subject_id'],
                    ],
                    [
                        'score'        => $record['score'],
                        'max_score'    => $record['max_score'] ?? 100,
                        'grade_letter' => $letter,
                        'remarks'      => $record['remarks'] ?? null,
                        'entered_by'   => $user->id,
                    ]
                );
                $count++;
            }
            return $count;
        });

        return response()->json([
            'message' => "Saved grades for {$saved} student" . ($saved === 1 ? '' : 's') . '.',
            'saved'   => $saved,
        ]);
    }

    public function show(Grade $grade): JsonResponse
    {
        return response()->json([
            'grade' => $grade->load(['exam', 'student.user:id,name,email', 'subject:id,name,code']),
        ]);
    }

    public function destroy(Grade $grade): JsonResponse
    {
        $grade->delete();
        return response()->json(['message' => 'Grade deleted.']);
    }

    private function emptyPage(): array
    {
        return [
            'data' => [],
            'total' => 0,
            'current_page' => 1,
            'last_page' => 1,
            'per_page' => 15,
            'from' => null,
            'to' => null,
        ];
    }
}