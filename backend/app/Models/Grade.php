<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Grade extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_id',
        'student_id',
        'subject_id',
        'score',
        'max_score',
        'grade_letter',
        'remarks',
        'entered_by',
    ];

    protected $casts = [
        'score'     => 'decimal:2',
        'max_score' => 'decimal:2',
    ];

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function enteredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'entered_by');
    }

    /**
     * Compute letter grade from percentage.
     * Standard scale — tweak later if needed.
     */
    public static function letterFromScore(float $score, float $maxScore = 100): string
    {
        if ($maxScore <= 0) return '—';
        $pct = ($score / $maxScore) * 100;

        if ($pct >= 90) return 'A';
        if ($pct >= 80) return 'A-';
        if ($pct >= 75) return 'B+';
        if ($pct >= 70) return 'B';
        if ($pct >= 65) return 'B-';
        if ($pct >= 60) return 'C+';
        if ($pct >= 55) return 'C';
        if ($pct >= 50) return 'C-';
        if ($pct >= 40) return 'D';
        return 'F';
    }
}