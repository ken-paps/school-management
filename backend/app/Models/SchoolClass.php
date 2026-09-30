<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SchoolClass extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     * Laravel would guess "school_classes" from the class name,
     * but our table is named "classes" (avoids PHP's reserved word issue).
     */
    protected $table = 'classes';

    protected $fillable = [
        'name',
        'grade_level',
        'section',
        'capacity',
        'teacher_id',
    ];

    protected $casts = [
        'grade_level' => 'integer',
        'capacity'    => 'integer',
    ];

    protected $appends = ['display_name'];

    // ─────────────────────────────────────────────
    //  Relationships
    // ─────────────────────────────────────────────

    /**
     * The teacher (User) who leads this class.
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * Students enrolled in this class.
     * (Relationship declared now — the students table comes next.)
     */
    public function students(): HasMany
    {
        return $this->hasMany(Student::class, 'class_id');
    }

    // ─────────────────────────────────────────────
    //  Accessors / Helpers
    // ─────────────────────────────────────────────

    /**
     * Human-readable label: "Grade 10 - A" or just "Grade 10" if no section.
     */
    public function getDisplayNameAttribute(): string
    {
        if ($this->grade_level && $this->section) {
            return "Grade {$this->grade_level} - {$this->section}";
        }
        if ($this->grade_level) {
            return "Grade {$this->grade_level}";
        }
        return $this->name;
    }

    /**
     * Current enrollment count.
     */
    public function getStudentCountAttribute(): int
    {
        return $this->students()->count();
    }

    /**
     * Is this class at capacity?
     */
    public function isFull(): bool
    {
        return $this->student_count >= $this->capacity;
    }
}