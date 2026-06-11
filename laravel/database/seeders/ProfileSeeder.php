<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Patient;
use App\Models\Medecin;
use App\Models\Infirmier;

class ProfileSeeder extends Seeder
{
    public function run(): void
    {
        // Patient profile pour le user patient seedé
        $patientUser = User::where('email', 'patient@sgh.sn')->first();
        if ($patientUser && !Patient::where('user_id', $patientUser->id)->exists()) {
            Patient::create([
                'user_id'        => $patientUser->id,
                'nom'            => $patientUser->nom,
                'prenom'         => $patientUser->prenom,
                'email'          => $patientUser->email,
                'date_naissance' => '1995-03-12',
                'sexe'           => 'F',
                'adresse'        => 'Dakar, Sénégal',
                'telephone'      => '+221 77 100 20 30',
                'groupe_sanguin' => 'A+',
                'contact_urgence'=> 'Famille Dramé · +221 77 200 30 40',
                'mutuelle'       => 'IPRES Santé',
            ]);
        }

        // Medecin profile
        $medUser = User::where('email', 'medecin@sgh.sn')->first();
        if ($medUser && !Medecin::where('user_id', $medUser->id)->exists()) {
            Medecin::create([
                'user_id'      => $medUser->id,
                'nom'          => $medUser->nom,
                'prenom'       => $medUser->prenom,
                'specialite'   => 'Médecine générale',
                'telephone'    => '+221 77 555 00 11',
                'email'        => $medUser->email,
                'numero_ordre' => 'ORD-2024-001',
            ]);
        }

        // Infirmier profile
        $infUser = User::where('email', 'infirmier@sgh.sn')->first();
        if ($infUser && !Infirmier::where('user_id', $infUser->id)->exists()) {
            Infirmier::create([
                'user_id'      => $infUser->id,
                'nom'          => $infUser->nom,
                'prenom'       => $infUser->prenom,
                'service'      => 'Médecine interne',
                'telephone'    => '+221 77 555 00 12',
                'email'        => $infUser->email,
                'numero_badge' => 'BDG-2024-001',
            ]);
        }
    }
}
