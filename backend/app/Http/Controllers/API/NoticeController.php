<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNoticeRequest;
use App\Http\Requests\UpdateNoticeRequest;
use App\Models\Notice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NoticeController extends Controller
{
    /**
     * GET /api/notices
     * Role-aware: students see 'all' + 'students', teachers see more, admins see everything.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Notice::query()
            ->with('author:id,name,email,role')
            ->orderByDesc('is_pinned')
            ->orderByDesc('published_at')
            ->orderByDesc('created_at');

        // Non-admins see published-only + role-filtered
        if ($user->role !== 'admin') {
            $query->published()->visibleTo($user->role);
        }

        // Admins can filter by audience
        if ($user->role === 'admin' && $request->filled('audience')) {
            $query->where('audience', $request->audience);
        }

        // Admins can filter drafts vs published
        if ($user->role === 'admin' && $request->filled('status')) {
            if ($request->status === 'draft') {
                $query->whereNull('published_at');
            } elseif ($request->status === 'published') {
                $query->whereNotNull('published_at');
            }
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")
                  ->orWhere('body', 'like', "%{$s}%");
            });
        }

        $perPage = min((int) $request->input('per_page', 15), 100);

        return response()->json($query->paginate($perPage));
    }

    public function store(StoreNoticeRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['posted_by'] = $request->user()->id;

        // Auto-publish if requested (or leave as draft)
        if ($request->boolean('publish')) {
            $data['published_at'] = now();
        }

        $notice = Notice::create($data);

        return response()->json([
            'message' => 'Notice created successfully.',
            'notice'  => $notice->load('author:id,name,email,role'),
        ], 201);
    }

    public function show(Notice $notice): JsonResponse
    {
        return response()->json([
            'notice' => $notice->load('author:id,name,email,role'),
        ]);
    }

    public function update(UpdateNoticeRequest $request, Notice $notice): JsonResponse
    {
        $data = $request->validated();

        // Publishing a draft
        if ($request->boolean('publish') && $notice->published_at === null) {
            $data['published_at'] = now();
        }

        // Unpublishing (back to draft)
        if ($request->boolean('unpublish')) {
            $data['published_at'] = null;
        }

        $notice->update($data);

        return response()->json([
            'message' => 'Notice updated successfully.',
            'notice'  => $notice->fresh()->load('author:id,name,email,role'),
        ]);
    }

    public function destroy(Notice $notice): JsonResponse
    {
        $notice->delete();

        return response()->json([
            'message' => 'Notice deleted successfully.',
        ]);
    }
}