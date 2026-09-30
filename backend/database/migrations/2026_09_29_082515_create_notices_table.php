<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notices', function (Blueprint $table) {
            $table->id();

            $table->string('title');
            $table->text('body');

            // Who can see this notice
            $table->enum('audience', ['all', 'admins', 'teachers', 'students'])
                  ->default('all');

            // Author
            $table->foreignId('posted_by')
                  ->constrained('users')
                  ->cascadeOnDelete();

            // Pinned notices sort to top
            $table->boolean('is_pinned')->default(false);

            // Null = draft, timestamp = published
            $table->timestamp('published_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Common queries: filter by audience, sort by pinned + published
            $table->index(['audience', 'published_at']);
            $table->index('is_pinned');
            $table->index('published_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notices');
    }
};