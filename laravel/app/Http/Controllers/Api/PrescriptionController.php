<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prescription;
use Illuminate\Http\Request;

class PrescriptionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return \App\Http\Resources\PrescriptionResource::collection(Prescription::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'medecin_id' => 'required|exists:medecins,id',
            'date_prescription' => 'required|date',
            'medications' => 'required|string',
            'dosage' => 'required|string',
            'frequency' => 'required|string',
            'duration' => 'required|string',
            'instructions' => 'nullable|string',
            'status' => 'required|string',
        ]);

        $prescription = Prescription::create($validated);
        return new \App\Http\Resources\PrescriptionResource($prescription);
    }

    /**
     * Display the specified resource.
     */
    public function show(Prescription $prescription)
    {
        return new \App\Http\Resources\PrescriptionResource($prescription);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Prescription $prescription)
    {
        $validated = $request->validate([
            'patient_id' => 'sometimes|required|exists:patients,id',
            'medecin_id' => 'sometimes|required|exists:medecins,id',
            'date_prescription' => 'sometimes|required|date',
            'medications' => 'sometimes|required|string',
            'dosage' => 'sometimes|required|string',
            'frequency' => 'sometimes|required|string',
            'duration' => 'sometimes|required|string',
            'instructions' => 'nullable|string',
            'status' => 'sometimes|required|string',
        ]);

        $prescription->update($validated);
        return new \App\Http\Resources\PrescriptionResource($prescription);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Prescription $prescription)
    {
        $prescription->delete();
        return response()->json(['message' => 'Prescription deleted successfully'], 200);
    }
}
