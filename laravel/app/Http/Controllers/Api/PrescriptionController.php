<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prescription;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class PrescriptionController extends Controller
{
    #[OA\Get(
        path: "/prescriptions",
        operationId: "getPrescriptionsList",
        tags: ["Prescriptions"],
        summary: "Get list of prescriptions",
        description: "Returns list of prescriptions"
    )]
    #[OA\Response(response: 200, description: "Successful operation")]
    public function index()
    {
        return \App\Http\Resources\PrescriptionResource::collection(Prescription::all());
    }

    #[OA\Post(
        path: "/prescriptions",
        operationId: "storePrescription",
        tags: ["Prescriptions"],
        summary: "Create a new prescription",
        description: "Creates a new prescription record",
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["patient_id", "medecin_id", "date_prescription", "medications", "dosage", "frequency", "duration"],
            properties: [
                new OA\Property(property: "patient_id", type: "integer", example: 1),
                new OA\Property(property: "medecin_id", type: "integer", example: 1),
                new OA\Property(property: "date_prescription", type: "string", format: "date", example: "2026-05-01"),
                new OA\Property(property: "medications", type: "string", example: "Paracetamol"),
                new OA\Property(property: "dosage", type: "string", example: "1000mg"),
                new OA\Property(property: "frequency", type: "string", example: "3 times a day"),
                new OA\Property(property: "duration", type: "string", example: "5 days"),
                new OA\Property(property: "notes", type: "string", example: "Take after meals"),
                new OA\Property(property: "status", type: "string", example: "active")
            ]
        )
    )]
    #[OA\Response(response: 201, description: "Prescription created")]
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
