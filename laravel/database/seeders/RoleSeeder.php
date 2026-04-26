<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['nom' => 'admin',      'description' => 'Administrateur système'],
            ['nom' => 'medecin',    'description' => 'Médecin traitant'],
            ['nom' => 'infirmier',  'description' => 'Infirmier(ère)'],
            ['nom' => 'patient',    'description' => 'Patient de l\'hôpital'],
        ];

        foreach ($roles as $role) {
            DB::table('roles')->insertOrIgnore($role);
        }
    }
}