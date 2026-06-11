<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PatientController extends Controller
{
    public function index()
    {
        return response()->json(Patient::with('user')->orderByDesc('id')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom'                      => 'required|string|max:255',
            'prenom'                   => 'required|string|max:255',
            'date_naissance'           => 'nullable|date',
            'sexe'                     => 'nullable|in:M,F,Autre',
            'adresse'                  => 'nullable|string',
            'telephone'                => 'nullable|string|max:30',
            'email'                    => 'nullable|email|max:255',
            'groupe_sanguin'           => 'nullable|string|max:10',
            'contact_urgence'          => 'nullable|string|max:255',
            'numero_securite_sociale'  => 'nullable|string|max:50',
            'mutuelle'                 => 'nullable|string|max:255',
            'allergies'                => 'nullable|string',
            'antecedents'              => 'nullable|string',
            'creer_compte'             => 'nullable|boolean',
            'email_compte'             => 'nullable|email|max:255',
            'password'                 => 'nullable|string|min:6',
        ]);

        $user = null;
        $passwordPlain = null;

        if (!empty($validated['creer_compte'])) {
            $emailCompte = $validated['email_compte'] ?? $validated['email'] ?? null;
            if (!$emailCompte) {
                return response()->json([
                    'message' => 'Email requis pour créer un compte patient.'
                ], 422);
            }
            if (User::where('email', $emailCompte)->exists()) {
                return response()->json([
                    'message' => 'Un compte existe déjà avec cet email.'
                ], 422);
            }

            $roleId = DB::table('roles')->where('nom', 'patient')->value('id');
            $passwordPlain = $validated['password'] ?? Str::random(10);

            $user = User::create([
                'nom'       => $validated['nom'],
                'prenom'    => $validated['prenom'],
                'email'     => $emailCompte,
                'password'  => Hash::make($passwordPlain),
                'telephone' => $validated['telephone'] ?? null,
                'role'      => 'patient',
                'role_id'   => $roleId ?? 3,
                'statut'    => 'actif',
            ]);
        }

        $patientData = collect($validated)
            ->except(['creer_compte', 'email_compte', 'password'])
            ->toArray();
        $patientData['user_id'] = $user?->id;

        $patient = Patient::create($patientData);

        $response = $patient->load('user')->toArray();
        if ($user && $passwordPlain) {
            $response['compte_genere'] = [
                'email'    => $user->email,
                'password' => $passwordPlain,
                'message'  => 'Compte patient créé. Communiquez les identifiants au patient.',
            ];
        }

        return response()->json($response, 201);
    }

    public function show(Patient $patient)
    {
        return response()->json($patient->load(['user', 'consultations', 'prescriptions', 'rendezVous']));
    }

    public function update(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'nom'                      => 'sometimes|string|max:255',
            'prenom'                   => 'sometimes|string|max:255',
            'date_naissance'           => 'nullable|date',
            'sexe'                     => 'nullable|in:M,F,Autre',
            'adresse'                  => 'nullable|string',
            'telephone'                => 'nullable|string|max:30',
            'email'                    => 'nullable|email|max:255',
            'groupe_sanguin'           => 'nullable|string|max:10',
            'contact_urgence'          => 'nullable|string|max:255',
            'numero_securite_sociale'  => 'nullable|string|max:50',
            'mutuelle'                 => 'nullable|string|max:255',
            'allergies'                => 'nullable|string',
            'antecedents'              => 'nullable|string',
        ]);

        $patient->update($validated);
        return response()->json($patient->load('user'));
    }

    public function destroy(Patient $patient)
    {
        $patient->delete();
        return response()->json(['message' => 'Patient supprimé'], 200);
    }
}
