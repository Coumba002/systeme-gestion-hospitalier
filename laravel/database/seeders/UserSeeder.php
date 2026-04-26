<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Récupérer les IDs des rôles
        $adminId    = DB::table('roles')->where('nom', 'admin')->value('id');
        $medecinId  = DB::table('roles')->where('nom', 'medecin')->value('id');
        $patientId  = DB::table('roles')->where('nom', 'patient')->value('id');

        DB::table('users')->insertOrIgnore([
            [
                'role_id'  => $adminId,
                'nom'      => 'Diop',
                'prenom'   => 'Mouhamed',
                'email'    => 'admin@sgh.sn',
                'password' => Hash::make('Admin@1234'),
                'statut'   => 'actif',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_id'  => $medecinId,
                'nom'      => 'Kane',
                'prenom'   => 'Amadou Habib',
                'email'    => 'medecin@sgh.sn',
                'password' => Hash::make('Medecin@1234'),
                'statut'   => 'actif',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_id'  => $patientId,
                'nom'      => 'Dramé',
                'prenom'   => 'Manétou',
                'email'    => 'patient@sgh.sn',
                'password' => Hash::make('Patient@1234'),
                'statut'   => 'actif',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}