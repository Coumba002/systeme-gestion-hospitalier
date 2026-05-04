<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return \App\Http\Resources\PatientResource::collection(Patient::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'date_naissance' => 'required|date',
            'sexe' => 'required|string|max:255',
            'adresse' => 'required|string',
            'telephone' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
        ]);

        $patient = Patient::create($validated);
        return new \App\Http\Resources\PatientResource($patient);
    }

    /**
     * Display the specified resource.
     */
    public function show(Patient $patient)
    {
        return new \App\Http\Resources\PatientResource($patient);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'prenom' => 'sometimes|required|string|max:255',
            'date_naissance' => 'sometimes|required|date',
            'sexe' => 'sometimes|required|string|max:255',
            'adresse' => 'sometimes|required|string',
            'telephone' => 'sometimes|required|string|max:255',
            'email' => 'nullable|email|max:255',
        ]);

        $patient->update($validated);
        return new \App\Http\Resources\PatientResource($patient);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Patient $patient)
    {
        $patient->delete();
        return response()->json(['message' => 'Patient deleted successfully'], 200);
    }
}
