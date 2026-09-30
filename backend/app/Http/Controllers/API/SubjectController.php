<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSubjectRequest;
use App\Http\Requests\UpdateSubjectRequest;
use App\Models\Subject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Subject::query()
            ->with('teachers:id,user_id,employee_number')
            ->with('teachers.user:id,name,email')
            ->orderByDesc('created_at');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                    ->orWhere('code', 'like', "%{$s}%");
            });
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = min((int) $request->input('per_page', 15), 100);

        return response()->json($query->paginate($perPage));
    }

    public function store(StoreSubjectRequest $request): JsonResponse
    {
        $subject = Subject::create($request->validated());

        return response()->json([
            'message' => 'Subject created successfully.',
            'subject' => $subject->load('teachers.user:id,name,email'),
        ], 201);
    }

    public function show(Subject $subject): JsonResponse
    {
        return response()->json([
            'subject' => $subject->load('teachers.user:id,name,email'),
        ]);
    }

    public function update(UpdateSubjectRequest $request, Subject $subject): JsonResponse
    {
        $subject->update($request->validated());

        return response()->json([
            'message' => 'Subject updated successfully.',
            'subject' => $subject->fresh()->load('teachers.user:id,name,email'),
        ]);
    }

    public function destroy(Subject $subject): JsonResponse
    {
        // Subjects are referenced by future grades; guard if any dependent records exist.
        // For now, allow delete — we'll add grade guards in Phase 4.

        $subject->delete();

        return response()->json([
            'message' => 'Subject deleted successfully.',
        ]);
    }

    /**
     * POST /api/subjects/{subject}/assign-teacher
     * Body: { teacher_id: int }
     */
    public function assignTeacher(Request $request, Subject $subject): JsonResponse
    {
        $request->validate([
            'teacher_id' => ['required', 'integer', 'exists:teachers,id'],
        ]);

        // attach() ignores duplicates automatically due to unique pivot constraint
        $subject->teachers()->syncWithoutDetaching([
            $request->teacher_id => ['assigned_at' => now()],
        ]);

        return response()->json([
            'message' => 'Teacher assigned successfully.',
            'subject' => $subject->fresh()->load('teachers.user:id,name,email'),
        ]);
    }

    /**
     * DELETE /api/subjects/{subject}/unassign-teacher/{teacher}
     */
    public function unassignTeacher(Subject $subject, int $teacher): JsonResponse
    {
        $subject->teachers()->detach($teacher);

        return response()->json([
            'message' => 'Teacher unassigned successfully.',
            'subject' => $subject->fresh()->load('teachers.user:id,name,email'),
        ]);
    }
}
