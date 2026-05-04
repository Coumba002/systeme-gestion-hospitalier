<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;
class PatientController extends Controller
{
    #[OA\Get(
        path: "/patients",
        operationId: "getPatientsList",
        tags: ["Patients"],
        summary: "Get list of patients",
        description: "Returns list of patients"
    )]
    #[OA\Response(
        response: 200,
        description: "Successful operation"
    )]
    public function index()
    {
        return \App\Http\Resources\PatientResource::collection(Patient::all());
    }

    #[OA\Post(
        path: "/patients",
        operationId: "storePatient",
        tags: ["Patients"],
        summary: "Create a new patient",
        description: "Creates a new patient record",
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["nom", "prenom", "date_naissance", "sexe", "adresse", "telephone"],
            properties: [
                new OA\Property(property: "nom", type: "string", example: "Doe"),
                new OA\Property(property: "prenom", type: "string", example: "John"),
                new OA\Property(property: "date_naissance", type: "string", format: "date", example: "1990-01-01"),
                new OA\Property(property: "sexe", type: "string", example: "M"),
                new OA\Property(property: "adresse", type: "string", example: "123 Main St"),
                new OA\Property(property: "telephone", type: "string", example: "0600000000"),
                new OA\Property(property: "email", type: "string", format: "email", example: "john@example.com")
            ]
        )
    )]
    #[OA\Response(response: 201, description: "Patient created")]
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
