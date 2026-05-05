<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Ajouter name si elle n'existe pas
            if (!Schema::hasColumn('users', 'name')) {
                $table->string('name')->nullable();
            }
            // Ajouter role
            if (!Schema::hasColumn('users', 'role')) {
                $table->string('role')->default('patient');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['name', 'role']);
        });
    }
};