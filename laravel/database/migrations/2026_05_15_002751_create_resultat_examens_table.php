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
        Schema::create('resultat_examens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('medecin_id')->nullable()->constrained('medecins')->onDelete('set null');
            $table->string('nom_examen');
            $table->string('valeur');
            $table->string('unite')->nullable();
            $table->string('valeurs_reference')->nullable();
            $table->enum('interpretation', ['normal', 'a_surveiller', 'anormal'])->default('normal');
            $table->date('date_examen');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resultat_examens');
    }
};
