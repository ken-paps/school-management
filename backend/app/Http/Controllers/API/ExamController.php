<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExamRequest;
use App\Http\Requests\UpdateExamRequest;
use App\Models\Exam;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExamController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Exam::query()
            ->withCount('grades')
            ->orderByDesc('year')
            ->orderBy('term')
            ->orderByDesc('created_at');

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }
        if ($request->filled('term')) {
            $query->where('term', $request->term);
        }
        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        $perPage = min((int) $request->input('per_page', 15), 100);

        return response()->json($query->paginate($perPage));
    }

    public function store(StoreExamRequest $request): JsonResponse
    {
        $exam = Exam::create($request->validated());

        return response()->json([
            'message' => 'Exam created successfully.',
            'exam'    => $exam->loadCount('grades'),
        ], 201);
    }

    public function show(Exam $exam): JsonResponse
    {
        return response()->json([
            'exam' => $exam->loadCount('grades'),
        ]);
    }

    public function update(UpdateExamRequest $request, Exam $exam): JsonResponse
    {
        $exam->update($request->validated());

        return response()->json([
            'message' => 'Exam updated successfully.',
            'exam'    => $exam->fresh()->loadCount('grades'),
        ]);
    }

    public function destroy(Exam $exam): JsonResponse
    {
        if ($exam->grades()->exists()) {
            return response()->json([
                'message' => 'Cannot delete an exam that has grades recorded. Unpublish it instead.',
            ], 422);
        }

        $exam->delete();

        return response()->json(['message' => 'Exam deleted successfully.']);
    }
}   