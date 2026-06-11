<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'      => 'nullable|string|max:255',
            'email'     => 'required|string|email|max:255|unique:users',
            'password'  => 'required|string|min:8',
            'prenom'    => 'nullable|string|max:100',
            'nom'       => 'nullable|string|max:100',
            'telephone' => 'nullable|string|max:20',
        ]);

        $patientRoleId = DB::table('roles')->where('nom', 'patient')->value('id');

        $user = User::create([
            'nom'      => $validated['nom'] ?? $validated['name'] ?? 'Patient',
            'prenom'   => $validated['prenom'] ?? '',
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'telephone'=> $validated['telephone'] ?? null,
            'role_id'  => $patientRoleId ?? 3,
            'role'     => 'patient',
            'statut'   => 'actif',
        ]);

        Patient::create([
            'user_id'   => $user->id,
            'nom'       => $user->nom,
            'prenom'    => $user->prenom,
            'telephone' => $user->telephone,
            'email'     => $user->email,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'     => $user->id,
                'nom'    => $user->nom,
                'prenom' => $user->prenom,
                'email'  => $user->email,
                'role'   => 'patient',
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

        if (!$user || !Hash::check($request->password, $user->password)) {
            AuditLog::record([
                'action'       => 'login_failed',
                'entity_type'  => 'User',
                'entity_label' => $request->email,
            ]);
            throw ValidationException::withMessages([
                'email' => ['Identifiants incorrects.'],
            ]);
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        AuditLog::record([
            'user_id'      => $user->id,
            'user_name'    => trim(($user->prenom ?? '') . ' ' . ($user->nom ?? '')),
            'user_role'    => $user->role,
            'action'       => 'login',
            'entity_type'  => 'User',
            'entity_id'    => $user->id,
            'entity_label' => $user->email,
        ]);

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'     => $user->id,
                'nom'    => $user->nom,
                'prenom' => $user->prenom,
                'email'  => $user->email,
                'role'   => $user->role,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        AuditLog::record([
            'action'       => 'logout',
            'entity_type'  => 'User',
            'entity_id'    => $user?->id,
            'entity_label' => $user?->email,
        ]);
        $user->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté avec succès']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
