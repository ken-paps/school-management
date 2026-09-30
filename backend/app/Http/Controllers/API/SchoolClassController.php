<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSchoolClassRequest;
use App\Http\Requests\UpdateSchoolClassRequest;
use App\Models\SchoolClass;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SchoolClassController extends Controller
{
    /**
     * GET /api/classes
     */
    public function index(Request $request): JsonResponse
    {
        $query = SchoolClass::query()
            ->with('teacher:id,name,email')
            ->withCount('students')
            ->orderByDesc('created_at');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                    ->orWhere('section', 'like', "%{$s}%");
            });
        }

        if ($request->filled('grade_level')) {
            $query->where('grade_level', $request->grade_level);
        }

        $perPage = min((int) $request->input('per_page', 15), 100);

        return response()->json($query->paginate($perPage));
    }

    /**
     * POST /api/classes
     */
    public function store(StoreSchoolClassRequest $request): JsonResponse
    {
        $class = SchoolClass::create($request->validated());

        return response()->json([
            'message' => 'Class created successfully.',
            'class'   => $class->load('teacher:id,name,email')->loadCount('students'),
        ], 201);
    }

    /**
     * GET /api/classes/{class}
     */
    public function show(SchoolClass $class): JsonResponse
    {
        return response()->json([
            'class' => $class->load('teacher:id,name,email')->loadCount('students'),
        ]);
    }

    /**
     * PUT/PATCH /api/classes/{class}
     */
    public function update(UpdateSchoolClassRequest $request, SchoolClass $class): JsonResponse
    {
        $class->update($request->validated());

        return response()->json([
            'message' => 'Class updated successfully.',
            'class'   => $class->fresh()->load('teacher:id,name,email')->loadCount('students'),
        ]);
    }

    /**
     * DELETE /api/classes/{class}
     */
    public function destroy(SchoolClass $class): JsonResponse
    {
        // Guard: can't delete a class that has students
        if ($class->students()->exists()) {
            return response()->json([
                'message' => 'Cannot delete a class that still has students enrolled. Move them first.',
            ], 422);
        }

        $class->delete();

        return response()->json([
            'message' => 'Class deleted successfully.',
        ]);
    }
}
