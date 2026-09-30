<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Notice extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'body',
        'audience',
        'posted_by',
        'is_pinned',
        'published_at',
    ];

    protected $casts = [
        'is_pinned'    => 'boolean',
        'published_at' => 'datetime',
    ];

    // ─────────────────────────────────────────────
    //  Relationships
    // ─────────────────────────────────────────────

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'posted_by');
    }

    // ─────────────────────────────────────────────
    //  Scopes
    // ─────────────────────────────────────────────

    /**
     * Only published notices (excludes drafts).
     */
    public function scopePublished($query)
    {
        return $query->whereNotNull('published_at')
                     ->where('published_at', '<=', now());
    }

    /**
     * Notices visible to a given role.
     */
    public function scopeVisibleTo($query, string $role)
    {
        return $query->where(function ($q) use ($role) {
            $q->where('audience', 'all');
            if ($role === 'admin') {
                $q->orWhere('audience', 'admins');
            } elseif ($role === 'teacher') {
                $q->orWhereIn('audience', ['teachers', 'admins']);
            } elseif ($role === 'student') {
                $q->orWhere('audience', 'students');
            }
        });
    }

    // ─────────────────────────────────────────────
    //  Accessors
    // ─────────────────────────────────────────────

    public function getIsPublishedAttribute(): bool
    {
        return $this->published_at !== null && $this->published_at->isPast();
    }

    public function getExcerptAttribute(): string
    {
        return \Illuminate\Support\Str::limit(strip_tags($this->body), 140);
    }
}