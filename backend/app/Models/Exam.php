<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Exam extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'term',
        'year',
        'start_date',
        'end_date',
        'is_published',
    ];

    protected $casts = [
        'start_date'   => 'date',
        'end_date'     => 'date',
        'is_published' => 'boolean',
        'year'         => 'integer',
    ];

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class);
    }

    public function getDisplayNameAttribute(): string
    {
        $termLabel = match ($this->term) {
            'term1' => 'Term 1',
            'term2' => 'Term 2',
            'term3' => 'Term 3',
            default => $this->term,
        };
        return "{$this->name} — {$termLabel} {$this->year}";
    }
}