<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Infirmier;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class InfirmierController extends Controller
{
    public function index()
    {
        return response()->json(Infirmier::with('user')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom'          => 'required|string|max:255',
            'prenom'       => 'required|string|max:255',
            'service'      => 'nullable|string|max:255',
            'telephone'    => 'nullable|string|max:255',
            'email'        => 'nullable|email|unique:infirmiers,email|max:255',
            'numero_badge' => 'nullable|string|unique:infirmiers,numero_badge|max:255',
            // Champs compte utilisateur
            'email_compte' => 'nullable|email|unique:users,email|max:255',
            'password'     => 'nullable|string|min:8',
        ]);

        // Créer le compte User automatiquement (rôle infirmier)
        $emailCompte = $validated['email_compte'] ?? $validated['email'] ?? null;
        $user = null;
        $password = null;

        if ($emailCompte) {
            if (!User::where('email', $emailCompte)->exists()) {
                $roleId = \Illuminate\Support\Facades\DB::table('roles')->where('nom', 'infirmier')->value('id');
                
                $password = $validated['password'] ?? Str::random(12);
                $user = User::create([
                    'nom'       => $validated['nom'],
                    'prenom'    => $validated['prenom'],
                    'email'     => $emailCompte,
                    'password'  => Hash::make($password),
                    'telephone' => $validated['telephone'] ?? null,
                    'role'      => 'infirmier',
                    'role_id'   => $roleId ?? 4,
                    'statut'    => 'actif',
                ]);
            }
        }

        $infirmier = Infirmier::create([
            'user_id'      => $user?->id,
            'nom'          => $validated['nom'],
            'prenom'       => $validated['prenom'],
            'service'      => $validated['service'] ?? null,
            'telephone'    => $validated['telephone'] ?? null,
            'email'        => $validated['email'] ?? null,
            'numero_badge' => $validated['numero_badge'] ?? null,
        ]);

        $response = $infirmier->load('user')->toArray();

        if ($user && !isset($validated['password'])) {
            $response['compte_genere'] = [
                'email'    => $user->email,
                'password' => $password,
                'message'  => 'Compte créé automatiquement. Veuillez communiquer ces identifiants à l\'infirmier(ère).',
            ];
        }

        return response()->json($response, 201);
    }

    public function show(Infirmier $infirmier)
    {
        return response()->json($infirmier->load('user'));
    }

    public function update(Request $request, Infirmier $infirmier)
    {
        $validated = $request->validate([
            'nom'          => 'sometimes|required|string|max:255',
            'prenom'       => 'sometimes|required|string|max:255',
            'service'      => 'nullable|string|max:255',
            'telephone'    => 'nullable|string|max:255',
            'email'        => 'nullable|email|unique:infirmiers,email,' . $infirmier->id . '|max:255',
            'numero_badge' => 'nullable|string|unique:infirmiers,numero_badge,' . $infirmier->id . '|max:255',
        ]);

        $infirmier->update($validated);

        if ($infirmier->user_id && $infirmier->user) {
            $infirmier->user->update([
                'nom'    => $validated['nom'] ?? $infirmier->user->nom,
                'prenom' => $validated['prenom'] ?? $infirmier->user->prenom,
            ]);
        }

        return response()->json($infirmier->load('user'));
    }

    public function destroy(Infirmier $infirmier)
    {
        if ($infirmier->user_id && $infirmier->user) {
            $infirmier->user->update(['statut' => 'inactif']);
        }

        $infirmier->delete();
        return response()->json(['message' => 'Infirmier(ère) supprimé(e) avec succès']);
    }
}
