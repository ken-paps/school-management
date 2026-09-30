<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Flags a user (typically created by an admin) as required to
            // change their password on next login. Enforcement is deferred
            // until the Profile page exists — column is set but unused for now.
            $table->boolean('must_change_password')
                ->default(false)
                ->after('role');

            // Soft deletes: prevents orphaning FK references from students,
            // teachers, attendances, grades etc. that will be added in Phase 3.
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('must_change_password');
            $table->dropSoftDeletes();
        });
    }
};
