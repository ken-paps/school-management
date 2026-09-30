<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('classes', function (Blueprint $table) {
            $table->id();

            // Display name (e.g. "Grade 10 - A")
            $table->string('name');

            // Numeric grade level (e.g. 10, 11, 12). Nullable for pre-school or mixed.
            $table->unsignedTinyInteger('grade_level')->nullable();

            // Section letter/code (e.g. "A", "B", "Science")
            $table->string('section', 20)->nullable();

            // Maximum students allowed in this class
            $table->unsignedSmallInteger('capacity')->default(40);

            // Which teacher leads this class (head teacher / class teacher)
            // Nullable — a class can exist before a teacher is assigned.
            // nullOnDelete: if the teacher is deleted, this becomes NULL, not cascade.
            $table->foreignId('teacher_id')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            // Indexes for common queries
            $table->index('grade_level');
            $table->index('teacher_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('classes');
    }
};