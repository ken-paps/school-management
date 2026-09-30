<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();

            $table->foreignId('student_id')
                  ->constrained('students')
                  ->cascadeOnDelete();

            // Denormalized: the class the student was in *at the time*
            // Critical for historical accuracy if a student transfers classes.
            $table->foreignId('class_id')
                  ->constrained('classes')
                  ->cascadeOnDelete();

            $table->date('date');

            $table->enum('status', ['present', 'absent', 'late', 'excused'])
                  ->default('present');

            $table->text('notes')->nullable();

            // Who marked this attendance record
            $table->foreignId('marked_by')
                  ->constrained('users')
                  ->cascadeOnDelete();

            $table->timestamps();

            // One record per student per day — the core rule
            $table->unique(['student_id', 'date']);

            // Common queries
            $table->index(['class_id', 'date']);
            $table->index(['date', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};