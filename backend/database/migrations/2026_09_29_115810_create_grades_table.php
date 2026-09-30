<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grades', function (Blueprint $table) {
            $table->id();

            $table->foreignId('exam_id')
                  ->constrained('exams')
                  ->cascadeOnDelete();

            $table->foreignId('student_id')
                  ->constrained('students')
                  ->cascadeOnDelete();

            $table->foreignId('subject_id')
                  ->constrained('subjects')
                  ->cascadeOnDelete();

            $table->decimal('score', 5, 2);
            $table->decimal('max_score', 5, 2)->default(100);

            // Computed letter grade (A, B+, C...). Nullable — computed on save.
            $table->string('grade_letter', 3)->nullable();

            $table->text('remarks')->nullable();

            // Who entered this grade
            $table->foreignId('entered_by')
                  ->constrained('users')
                  ->cascadeOnDelete();

            $table->timestamps();

            // One score per student, per subject, per exam
            $table->unique(['exam_id', 'student_id', 'subject_id']);

            $table->index(['exam_id', 'subject_id']);
            $table->index(['student_id', 'exam_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};