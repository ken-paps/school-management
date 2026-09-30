<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * GET /api/users
     * List users with optional search + role filter + pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query()->orderByDesc('created_at');

        // Filter by role
        if ($request->filled('role') && in_array($request->role, ['admin', 'teacher', 'student'], true)) {
            $query->where('role', $request->role);
        }

        // Search by name or email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Pagination — default 15 per page, max 100
        $perPage = min((int) $request->input('per_page', 15), 100);

        return response()->json($query->paginate($perPage));
    }

    /**
     * POST /api/users
     * Create a new user (admin only — enforced by route middleware).
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = User::create([
            'name'                 => $data['name'],
            'email'                => $data['email'],
            'password'             => $data['password'], // cast handles hashing
            'role'                 => $data['role'],
            'must_change_password' => true,
            'email_verified_at'    => now(), // admin-created users are trusted
        ]);

        return response()->json([
            'message' => 'User created successfully.',
            'user'    => $user,
        ], 201);
    }

    /**
     * GET /api/users/{user}
     */
    public function show(User $user): JsonResponse
    {
        return response()->json(['user' => $user]);
    }

    /**
     * PUT/PATCH /api/users/{user}
     */
    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $data = $request->validated();

        // Only update password if one was provided
        if (! empty($data['password'])) {
            $user->password = $data['password']; // cast hashes
            $user->must_change_password = false;  // admin explicitly reset it
        }

        $user->name = $data['name'];
        $user->email = $data['email'];
        $user->role = $data['role'];
        $user->save();

        return response()->json([
            'message' => 'User updated successfully.',
            'user'    => $user->fresh(),
        ]);
    }

    /**
     * DELETE /api/users/{user}
     * Soft-deletes the user AND revokes their active sessions.
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        // Guard: admin can't delete themselves
        if ($request->user()->id === $user->id) {
            return response()->json([
                'message' => 'You cannot delete your own account.',
            ], 422);
        }

        DB::transaction(function () use ($user) {
            // Revoke all active sessions for this user → immediate logout
            DB::table('sessions')->where('user_id', $user->id)->delete();

            // Soft delete
            $user->delete();
        });

        return response()->json([
            'message' => 'User deleted successfully.',
        ]);
    }

    /**
     * POST /api/users/{user}/restore
     * Restore a soft-deleted user.
     */
    public function restore(int $id): JsonResponse
    {
        $user = User::withTrashed()->findOrFail($id);
        $user->restore();

        return response()->json([
            'message' => 'User restored successfully.',
            'user'    => $user->fresh(),
        ]);
    }

    /**
     * GET /api/users/generate-password
     * Returns a readable random password for the admin to hand out.
     * Format: Word-Word-NN  (e.g. Falcon-River-47)
     */
    public function generatePassword(): JsonResponse
    {
        $words = [
            'Falcon',
            'River',
            'Tiger',
            'Maple',
            'Cedar',
            'Amber',
            'Onyx',
            'Solar',
            'Frost',
            'Ember',
            'Storm',
            'Raven',
            'Willow',
            'Quartz',
            'Ivory',
            'Noble',
            'Arrow',
            'Tower',
            'Coral',
            'Lunar',
            'Vapor',
            'Granite',
            'Sage',
            'Orchid',
        ];

        $password = sprintf(
            '%s-%s-%02d',
            $words[array_rand($words)],
            $words[array_rand($words)],
            random_int(10, 99),
        );

        return response()->json(['password' => $password]);
    }
}
