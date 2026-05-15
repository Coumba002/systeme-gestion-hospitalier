<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Inscription d'un nouvel utilisateur.
     * POST /api/register
     */
    public function register(Request $request)
{
    $validated = $request->validate([
        'name'      => 'required|string|max:255',
        'email'     => 'required|string|email|max:255|unique:users',
        'password'  => 'required|string|min:8',
        'prenom'    => 'nullable|string|max:100',
        'nom'       => 'nullable|string|max:100',
        'telephone' => 'nullable|string|max:20',
    ]);

    $patientRoleId = \Illuminate\Support\Facades\DB::table('roles')->where('nom', 'patient')->value('id');

    $user = User::create([
        'nom'      => $validated['nom'] ?? $validated['name'],
        'prenom'   => $validated['prenom'] ?? '',
        'email'    => $validated['email'],
        'password' => Hash::make($validated['password']),
        'telephone'=> $validated['telephone'] ?? null,
        'role_id'  => $patientRoleId ?? 3, // patient
        'role'     => 'patient',
    ]);

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'token' => $token,
        'user'  => [
            'id'    => $user->id,
            'nom'   => $user->nom,
            'prenom'=> $user->prenom,
            'email' => $user->email,
            'role'  => 'patient',
        ],
    ], 201);
}
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Identifiants incorrects.'],
            ]);
        }

        // Révoquer les anciens tokens (une session à la fois)
        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'    => $user->id,
                'nom'  => $user->name,
                'prenom' => $user->prenom,
                'email' => $user->email,
                'role'  => $user->role,
            ],
        ]);
    }

    /**
     * Déconnexion.
     * POST /api/logout  (nécessite auth:sanctum)
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté avec succès']);
    }

    /**
     * Utilisateur connecté.
     * GET /api/me  (nécessite auth:sanctum)
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}