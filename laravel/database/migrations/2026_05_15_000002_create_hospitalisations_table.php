<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hospitalisations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('medecin_id')->constrained('medecins')->onDelete('cascade');
            $table->string('chambre')->nullable();
            $table->string('lit')->nullable();
            $table->dateTime('date_entree');
            $table->dateTime('date_sortie_prevue')->nullable();
            $table->dateTime('date_sortie_reelle')->nullable();
            $table->string('motif')->nullable();
            $table->text('notes')->nullable();
            $table->enum('statut', ['en_cours', 'sortie', 'transfere'])->default('en_cours');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hospitalisations');
    }
};
