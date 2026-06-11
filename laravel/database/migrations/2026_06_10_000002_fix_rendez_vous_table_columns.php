<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rendez_vous', function (Blueprint $table) {
            if (!Schema::hasColumn('rendez_vous', 'patient_id')) {
                $table->foreignId('patient_id')->after('id')->constrained('patients')->onDelete('cascade');
            }
            if (!Schema::hasColumn('rendez_vous', 'medecin_id')) {
                $table->foreignId('medecin_id')->after('patient_id')->constrained('medecins')->onDelete('cascade');
            }
            if (!Schema::hasColumn('rendez_vous', 'date_heure')) {
                $table->dateTime('date_heure')->after('medecin_id');
            }
            if (!Schema::hasColumn('rendez_vous', 'motif')) {
                $table->string('motif')->nullable()->after('date_heure');
            }
            if (!Schema::hasColumn('rendez_vous', 'statut')) {
                $table->enum('statut', ['en_attente', 'confirme', 'annule', 'realise'])
                    ->default('en_attente')
                    ->after('motif');
            }
            if (!Schema::hasColumn('rendez_vous', 'notes')) {
                $table->text('notes')->nullable()->after('statut');
            }
        });
    }

    public function down(): void
    {
        Schema::table('rendez_vous', function (Blueprint $table) {
            foreach (['patient_id','medecin_id','date_heure','motif','statut','notes'] as $c) {
                if (Schema::hasColumn('rendez_vous', $c)) {
                    if (in_array($c, ['patient_id','medecin_id'])) $table->dropForeign([$c]);
                    $table->dropColumn($c);
                }
            }
        });
    }
};
