<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            if (!Schema::hasColumn('patients', 'user_id')) {
                $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->onDelete('set null');
            }
            if (!Schema::hasColumn('patients', 'nom')) {
                $table->string('nom')->after('user_id');
            }
            if (!Schema::hasColumn('patients', 'prenom')) {
                $table->string('prenom')->after('nom');
            }
            if (!Schema::hasColumn('patients', 'date_naissance')) {
                $table->date('date_naissance')->nullable()->after('prenom');
            }
            if (!Schema::hasColumn('patients', 'sexe')) {
                $table->enum('sexe', ['M', 'F', 'Autre'])->nullable()->after('date_naissance');
            }
            if (!Schema::hasColumn('patients', 'adresse')) {
                $table->string('adresse')->nullable()->after('sexe');
            }
            if (!Schema::hasColumn('patients', 'telephone')) {
                $table->string('telephone')->nullable()->after('adresse');
            }
            if (!Schema::hasColumn('patients', 'email')) {
                $table->string('email')->nullable()->after('telephone');
            }
            if (!Schema::hasColumn('patients', 'groupe_sanguin')) {
                $table->string('groupe_sanguin', 10)->nullable()->after('email');
            }
            if (!Schema::hasColumn('patients', 'contact_urgence')) {
                $table->string('contact_urgence')->nullable()->after('groupe_sanguin');
            }
            if (!Schema::hasColumn('patients', 'numero_securite_sociale')) {
                $table->string('numero_securite_sociale')->nullable()->after('contact_urgence');
            }
            if (!Schema::hasColumn('patients', 'mutuelle')) {
                $table->string('mutuelle')->nullable()->after('numero_securite_sociale');
            }
            if (!Schema::hasColumn('patients', 'allergies')) {
                $table->text('allergies')->nullable()->after('mutuelle');
            }
            if (!Schema::hasColumn('patients', 'antecedents')) {
                $table->text('antecedents')->nullable()->after('allergies');
            }
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $cols = ['user_id','nom','prenom','date_naissance','sexe','adresse','telephone','email','groupe_sanguin','contact_urgence','numero_securite_sociale','mutuelle','allergies','antecedents'];
            foreach ($cols as $c) {
                if (Schema::hasColumn('patients', $c)) {
                    if ($c === 'user_id') $table->dropForeign(['user_id']);
                    $table->dropColumn($c);
                }
            }
        });
    }
};
