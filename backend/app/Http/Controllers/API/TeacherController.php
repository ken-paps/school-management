<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTeacherRequest;
use App\Http\Requests\UpdateTeacherRequest;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TeacherController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Teacher::query()
            ->with([
                'user:id,name,email,role',
                'subjects:id,name,code',
            ])
            ->withCount('classes')
            ->orderByDesc('created_at');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('employee_number', 'like', "%{$s}%")
                    ->orWhereHas('user', function ($u) use ($s) {
                        $u->where('name', 'like', "%{$s}%")
                            ->orWhere('email', 'like', "%{$s}%");
                    });
            });
        }

        $perPage = min((int) $request->input('per_page', 15), 100);

        return response()->json($query->paginate($perPage));
    }

    public function store(StoreTeacherRequest $request): JsonResponse
    {
        $data = $request->validated();
        $subjectIds = $data['subject_ids'] ?? [];
        unset($data['subject_ids']);

        $teacher = DB::transaction(function () use ($data, $subjectIds) {
            // 1. Create the user account
            $user = User::create([
                'name'                 => $data['name'],
                'email'                => $data['email'],
                'password'             => $data['password'],
                'role'                 => 'teacher',
                'must_change_password' => true,
                'email_verified_at'    => now(),
            ]);

            // 2. Create the teacher record
            $teacher = Teacher::create([
                'user_id'          => $user->id,
                'employee_number'  => $data['employee_number'],
                'hire_date'        => $data['hire_date'] ?? null,
                'phone'            => $data['phone'] ?? null,
                'address'          => $data['address'] ?? null,
                'qualification'    => $data['qualification'] ?? null,
                'specialization'   => $data['specialization'] ?? null,
                'bio'              => $data['bio'] ?? null,
            ]);

            // 3. Attach subjects (many-to-many)
            if (! empty($subjectIds)) {
                $teacher->subjects()->sync(
                    collect($subjectIds)->mapWithKeys(fn($id) => [
                        $id => ['assigned_at' => now()],
                    ])->all()
                );
            }

            return $teacher;
        });

        return response()->json([
            'message' => 'Teacher created successfully.',
            'teacher' => $teacher->load(['user:id,name,email,role', 'subjects:id,name,code']),
        ], 201);
    }

    public function show(Teacher $teacher): JsonResponse
    {
        return response()->json([
            'teacher' => $teacher->load(['user:id,name,email,role', 'subjects:id,name,code'])->loadCount('classes'),
        ]);
    }

    public function update(UpdateTeacherRequest $request, Teacher $teacher): JsonResponse
    {
        $data = $request->validated();
        $subjectIds = $data['subject_ids'] ?? null;
        unset($data['subject_ids']);

        DB::transaction(function () use ($data, $subjectIds, $teacher) {
            // 1. Update user
            $userData = [
                'name'  => $data['name'],
                'email' => $data['email'],
            ];
            if (! empty($data['password'])) {
                $userData['password'] = $data['password'];
                $userData['must_change_password'] = false;
            }
            $teacher->user->update($userData);

            // 2. Update teacher
            $teacher->update([
                'employee_number' => $data['employee_number'],
                'hire_date'       => $data['hire_date'] ?? null,
                'phone'           => $data['phone'] ?? null,
                'address'         => $data['address'] ?? null,
                'qualification'   => $data['qualification'] ?? null,
                'specialization'  => $data['specialization'] ?? null,
                'bio'             => $data['bio'] ?? null,
            ]);

            // 3. Sync subjects (only if provided)
            if (is_array($subjectIds)) {
                $teacher->subjects()->sync(
                    collect($subjectIds)->mapWithKeys(fn($id) => [
                        $id => ['assigned_at' => now()],
                    ])->all()
                );
            }
        });

        return response()->json([
            'message' => 'Teacher updated successfully.',
            'teacher' => $teacher->fresh()->load(['user:id,name,email,role', 'subjects:id,name,code']),
        ]);
    }

    public function destroy(Teacher $teacher): JsonResponse
    {
        DB::transaction(function () use ($teacher) {
            // Revoke sessions
            DB::table('sessions')->where('user_id', $teacher->user_id)->delete();

            // Detach subjects (pivot cleanup is automatic via cascade, but explicit is clearer)
            $teacher->subjects()->detach();

            // Soft delete both
            $teacher->delete();
            $teacher->user?->delete();
        });

        return response()->json([
            'message' => 'Teacher deleted successfully.',
        ]);
    }
}
