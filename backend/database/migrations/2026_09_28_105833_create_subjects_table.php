<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();

            // Display name (e.g. "Mathematics")
            $table->string('name');

            // Short code (e.g. "MATH", "PHY"). Unique — schools use these on timetables.
            $table->string('code', 20)->unique();

            // Optional description for the subject
            $table->text('description')->nullable();

            // Credit hours / periods per week (optional, useful for scheduling later)
            $table->unsignedTinyInteger('periods_per_week')->nullable();

            // Is this subject currently offered? (for archiving old subjects)
            $table->boolean('is_active')->default(true);

            $table->timestamps();
            $table->softDeletes();

            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subjects');
    }
};
