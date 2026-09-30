<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exams', function (Blueprint $table) {
            $table->id();

            $table->string('name');                        // "Term 1 Mid-Term"
            $table->enum('term', ['term1', 'term2', 'term3'])->default('term1');
            $table->unsignedSmallInteger('year');          // 2026

            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();

            // Grades only visible to students when this is true
            $table->boolean('is_published')->default(false);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['year', 'term']);
            $table->index('is_published');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exams');
    }
};