<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Infirmier;
use Illuminate\Http\Request;

class InfirmierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return \App\Http\Resources\InfirmierResource::collection(Infirmier::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'service' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:infirmiers,email|max:255',
            'numero_badge' => 'nullable|string|unique:infirmiers,numero_badge|max:255',
        ]);

        $infirmier = Infirmier::create($validated);
        return new \App\Http\Resources\InfirmierResource($infirmier);
    }

    /**
     * Display the specified resource.
     */
    public function show(Infirmier $infirmier)
    {
        return new \App\Http\Resources\InfirmierResource($infirmier);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Infirmier $infirmier)
    {
        $validated = $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'prenom' => 'sometimes|required|string|max:255',
            'service' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:infirmiers,email,' . $infirmier->id . '|max:255',
            'numero_badge' => 'nullable|string|unique:infirmiers,numero_badge,' . $infirmier->id . '|max:255',
        ]);

        $infirmier->update($validated);
        return new \App\Http\Resources\InfirmierResource($infirmier);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Infirmier $infirmier)
    {
        $infirmier->delete();
        return response()->json(['message' => 'Infirmier supprimé avec succès'], 200);
    }
}
