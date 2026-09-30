<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();

            // Link to identity record
            $table->foreignId('user_id')
                ->unique()
                ->constrained('users')
                ->cascadeOnDelete();

            // School-issued employee number
            $table->string('employee_number')->unique();

            // When they joined the school
            $table->date('hire_date')->nullable();

            // Personal contact (separate from the school email in users)
            $table->string('phone', 30)->nullable();
            $table->text('address')->nullable();

            // Professional info
            $table->string('qualification')->nullable();      // e.g. "M.Ed", "BSc Physics"
            $table->string('specialization')->nullable();     // e.g. "Physics & Mathematics"
            $table->text('bio')->nullable();                  // short intro for profile page

            $table->timestamps();
            $table->softDeletes();

            $table->index('employee_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teachers');
    }
};
