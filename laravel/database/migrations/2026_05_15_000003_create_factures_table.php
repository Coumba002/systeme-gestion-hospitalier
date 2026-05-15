<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('factures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('consultation_id')->nullable()->constrained('consultations')->onDelete('set null');
            $table->foreignId('hospitalisation_id')->nullable()->constrained('hospitalisations')->onDelete('set null');
            $table->decimal('montant_total', 10, 2)->default(0);
            $table->decimal('montant_paye', 10, 2)->default(0);
            $table->enum('statut', ['en_attente', 'payee', 'partielle', 'annulee'])->default('en_attente');
            $table->string('description')->nullable();
            $table->date('date_emission');
            $table->date('date_echeance')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('factures');
    }
};
