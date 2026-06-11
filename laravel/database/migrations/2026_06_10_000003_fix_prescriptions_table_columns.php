<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('prescriptions', function (Blueprint $table) {
            if (!Schema::hasColumn('prescriptions', 'patient_id')) {
                $table->foreignId('patient_id')->after('id')->constrained('patients')->onDelete('cascade');
            }
            if (!Schema::hasColumn('prescriptions', 'medecin_id')) {
                $table->foreignId('medecin_id')->after('patient_id')->constrained('medecins')->onDelete('cascade');
            }
            if (!Schema::hasColumn('prescriptions', 'consultation_id')) {
                $table->foreignId('consultation_id')->nullable()->after('medecin_id')->constrained('consultations')->onDelete('set null');
            }
            if (!Schema::hasColumn('prescriptions', 'date_prescription')) {
                $table->date('date_prescription')->after('consultation_id');
            }
            if (!Schema::hasColumn('prescriptions', 'medicaments')) {
                $table->text('medicaments')->after('date_prescription');
            }
            if (!Schema::hasColumn('prescriptions', 'dosage')) {
                $table->string('dosage')->nullable()->after('medicaments');
            }
            if (!Schema::hasColumn('prescriptions', 'frequence')) {
                $table->string('frequence')->nullable()->after('dosage');
            }
            if (!Schema::hasColumn('prescriptions', 'duree')) {
                $table->string('duree')->nullable()->after('frequence');
            }
            if (!Schema::hasColumn('prescriptions', 'instructions')) {
                $table->text('instructions')->nullable()->after('duree');
            }
            if (!Schema::hasColumn('prescriptions', 'statut')) {
                $table->enum('statut', ['active', 'terminee', 'annulee'])->default('active')->after('instructions');
            }
        });
    }

    public function down(): void
    {
        Schema::table('prescriptions', function (Blueprint $table) {
            foreach (['patient_id','medecin_id','consultation_id','date_prescription','medicaments','dosage','frequence','duree','instructions','statut'] as $c) {
                if (Schema::hasColumn('prescriptions', $c)) {
                    if (in_array($c, ['patient_id','medecin_id','consultation_id'])) $table->dropForeign([$c]);
                    $table->dropColumn($c);
                }
            }
        });
    }
};
