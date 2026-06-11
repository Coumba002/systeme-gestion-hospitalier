<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('user_name')->nullable();    // copie nom (résiste à la suppression user)
            $table->string('user_role', 30)->nullable();
            $table->string('action', 30);               // created, updated, deleted, login, logout, login_failed
            $table->string('entity_type', 80)->nullable(); // Patient, Medecin, etc.
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->string('entity_label', 200)->nullable(); // résumé lisible de l'entité
            $table->json('changes')->nullable();        // {before, after} pour les updates
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 255)->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['action', 'created_at']);
            $table->index(['entity_type', 'entity_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
