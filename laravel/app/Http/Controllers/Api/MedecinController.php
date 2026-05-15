<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medecin;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class MedecinController extends Controller
{
    public function index()
    {
        return response()->json(Medecin::with('user')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom'          => 'required|string|max:255',
            'prenom'       => 'required|string|max:255',
            'specialite'   => 'required|string|max:255',
            'telephone'    => 'nullable|string|max:255',
            'email'        => 'nullable|email|unique:medecins,email|max:255',
            'numero_ordre' => 'nullable|string|unique:medecins,numero_ordre|max:255',
            // Champs compte utilisateur (optionnels)
            'email_compte' => 'nullable|email|unique:users,email|max:255',
            'password'     => 'nullable|string|min:8',
        ]);

        // Créer le compte User automatiquement
        $emailCompte = $validated['email_compte'] ?? $validated['email'] ?? null;
        $user = null;

        if ($emailCompte) {
            // Vérifier que l'email n'existe pas déjà dans users
            if (!User::where('email', $emailCompte)->exists()) {
                $roleId = \Illuminate\Support\Facades\DB::table('roles')->where('nom', 'medecin')->value('id');
                
                $password = $validated['password'] ?? Str::random(12);
                $user = User::create([
                    'nom'       => $validated['nom'],
                    'prenom'    => $validated['prenom'],
                    'email'     => $emailCompte,
                    'password'  => Hash::make($password),
                    'telephone' => $validated['telephone'] ?? null,
                    'role'      => 'medecin',
                    'role_id'   => $roleId ?? 2,
                    'statut'    => 'actif',
                ]);
            }
        }

        $medecin = Medecin::create([
            'user_id'      => $user?->id,
            'nom'          => $validated['nom'],
            'prenom'       => $validated['prenom'],
            'specialite'   => $validated['specialite'],
            'telephone'    => $validated['telephone'] ?? null,
            'email'        => $validated['email'] ?? null,
            'numero_ordre' => $validated['numero_ordre'] ?? null,
        ]);

        $response = $medecin->load('user')->toArray();

        // Inclure le mot de passe généré dans la réponse (une seule fois)
        if ($user && !isset($validated['password'])) {
            $response['compte_genere'] = [
                'email'    => $user->email,
                'password' => $password ?? null,
                'message'  => 'Compte créé automatiquement. Veuillez communiquer ces identifiants au médecin.',
            ];
        }

        return response()->json($response, 201);
    }

    public function show(Medecin $medecin)
    {
        return response()->json($medecin->load('user'));
    }

    public function update(Request $request, Medecin $medecin)
    {
        $validated = $request->validate([
            'nom'          => 'sometimes|required|string|max:255',
            'prenom'       => 'sometimes|required|string|max:255',
            'specialite'   => 'sometimes|required|string|max:255',
            'telephone'    => 'nullable|string|max:255',
            'email'        => 'nullable|email|unique:medecins,email,' . $medecin->id . '|max:255',
            'numero_ordre' => 'nullable|string|unique:medecins,numero_ordre,' . $medecin->id . '|max:255',
        ]);

        $medecin->update($validated);

        // Synchroniser le nom/prénom du User lié si existant
        if ($medecin->user_id && $medecin->user) {
            $medecin->user->update([
                'nom'    => $validated['nom'] ?? $medecin->user->nom,
                'prenom' => $validated['prenom'] ?? $medecin->user->prenom,
            ]);
        }

        return response()->json($medecin->load('user'));
    }

    public function destroy(Medecin $medecin)
    {
        // Désactiver le compte User lié sans le supprimer
        if ($medecin->user_id && $medecin->user) {
            $medecin->user->update(['statut' => 'inactif']);
        }

        $medecin->delete();
        return response()->json(['message' => 'Médecin supprimé avec succès']);
    }
}
