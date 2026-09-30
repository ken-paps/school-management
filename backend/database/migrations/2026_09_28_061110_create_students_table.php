<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();

            // Link to the identity record in users
            $table->foreignId('user_id')
                  ->unique()
                  ->constrained('users')
                  ->cascadeOnDelete();

            // School-issued admission number (unique identifier)
            $table->string('admission_number')->unique();

            // Current class enrollment (nullable until assigned)
            $table->foreignId('class_id')
                  ->nullable()
                  ->constrained('classes')
                  ->nullOnDelete();

            // Personal info
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();

            // Guardian / emergency contact
            $table->string('guardian_name')->nullable();
            $table->string('guardian_phone', 30)->nullable();
            $table->string('guardian_email')->nullable();

            // Physical address
            $table->text('address')->nullable();

            // When the student joined
            $table->date('enrollment_date')->nullable();

            // Free-form notes (allergies, special needs, etc.)
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('class_id');
            $table->index('admission_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};