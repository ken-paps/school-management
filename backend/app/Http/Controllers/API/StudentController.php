<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Student::query()
            ->with([
                'user:id,name,email,role',
                'schoolClass:id,name,grade_level,section',
            ])
            ->orderByDesc('created_at');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('admission_number', 'like', "%{$s}%")
                    ->orWhereHas('user', function ($u) use ($s) {
                        $u->where('name', 'like', "%{$s}%")
                            ->orWhere('email', 'like', "%{$s}%");
                    });
            });
        }

        if ($request->filled('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        if ($request->filled('gender')) {
            $query->where('gender', $request->gender);
        }

        $perPage = min((int) $request->input('per_page', 15), 100);

        return response()->json($query->paginate($perPage));
    }

    public function store(StoreStudentRequest $request): JsonResponse
    {
        $data = $request->validated();

        $student = DB::transaction(function () use ($data) {
            // 1. Create the user account first
            $user = User::create([
                'name'                 => $data['name'],
                'email'                => $data['email'],
                'password'             => $data['password'],
                'role'                 => 'student',
                'must_change_password' => true,
                'email_verified_at'    => now(),
            ]);

            // 2. Create the student record linked to the user
            return Student::create([
                'user_id'          => $user->id,
                'admission_number' => $data['admission_number'],
                'class_id'         => $data['class_id'] ?? null,
                'date_of_birth'    => $data['date_of_birth'] ?? null,
                'gender'           => $data['gender'] ?? null,
                'guardian_name'    => $data['guardian_name'] ?? null,
                'guardian_phone'   => $data['guardian_phone'] ?? null,
                'guardian_email'   => $data['guardian_email'] ?? null,
                'address'          => $data['address'] ?? null,
                'enrollment_date'  => $data['enrollment_date'] ?? null,
                'notes'            => $data['notes'] ?? null,
            ]);
        });

        return response()->json([
            'message' => 'Student created successfully.',
            'student' => $student->load(['user:id,name,email,role', 'schoolClass:id,name,grade_level,section']),
        ], 201);
    }

    public function show(Student $student): JsonResponse
    {
        return response()->json([
            'student' => $student->load(['user:id,name,email,role', 'schoolClass:id,name,grade_level,section']),
        ]);
    }

    public function update(UpdateStudentRequest $request, Student $student): JsonResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $student) {
            // 1. Update the user record
            $userData = [
                'name'  => $data['name'],
                'email' => $data['email'],
            ];
            if (! empty($data['password'])) {
                $userData['password'] = $data['password'];
                $userData['must_change_password'] = false;
            }
            $student->user->update($userData);

            // 2. Update the student record
            $student->update([
                'admission_number' => $data['admission_number'],
                'class_id'         => $data['class_id'] ?? null,
                'date_of_birth'    => $data['date_of_birth'] ?? null,
                'gender'           => $data['gender'] ?? null,
                'guardian_name'    => $data['guardian_name'] ?? null,
                'guardian_phone'   => $data['guardian_phone'] ?? null,
                'guardian_email'   => $data['guardian_email'] ?? null,
                'address'          => $data['address'] ?? null,
                'enrollment_date'  => $data['enrollment_date'] ?? null,
                'notes'            => $data['notes'] ?? null,
            ]);
        });

        return response()->json([
            'message' => 'Student updated successfully.',
            'student' => $student->fresh()->load(['user:id,name,email,role', 'schoolClass:id,name,grade_level,section']),
        ]);
    }

    public function destroy(Student $student): JsonResponse
    {
        DB::transaction(function () use ($student) {
            // Revoke sessions so they're logged out immediately
            DB::table('sessions')->where('user_id', $student->user_id)->delete();

            // Soft delete the student + their user account
            $student->delete();
            $student->user?->delete();
        });

        return response()->json([
            'message' => 'Student deleted successfully.',
        ]);
    }
}
