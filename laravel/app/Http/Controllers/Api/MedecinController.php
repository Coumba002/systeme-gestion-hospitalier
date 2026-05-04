<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medecin;
use Illuminate\Http\Request;

class MedecinController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return \App\Http\Resources\MedecinResource::collection(Medecin::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'specialite' => 'required|string|max:255',
            'telephone' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:medecins,email|max:255',
            'numero_ordre' => 'nullable|string|unique:medecins,numero_ordre|max:255',
        ]);

        $medecin = Medecin::create($validated);
        return new \App\Http\Resources\MedecinResource($medecin);
    }

    /**
     * Display the specified resource.
     */
    public function show(Medecin $medecin)
    {
        return new \App\Http\Resources\MedecinResource($medecin);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Medecin $medecin)
    {
        $validated = $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'prenom' => 'sometimes|required|string|max:255',
            'specialite' => 'sometimes|required|string|max:255',
            'telephone' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:medecins,email,' . $medecin->id . '|max:255',
            'numero_ordre' => 'nullable|string|unique:medecins,numero_ordre,' . $medecin->id . '|max:255',
        ]);

        $medecin->update($validated);
        return new \App\Http\Resources\MedecinResource($medecin);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Medecin $medecin)
    {
        $medecin->delete();
        return response()->json(['message' => 'Médecin supprimé avec succès'], 200);
    }
}
