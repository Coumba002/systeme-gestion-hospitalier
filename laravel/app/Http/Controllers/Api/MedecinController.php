<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medecin;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class MedecinController extends Controller
{
    #[OA\Get(
        path: "/medecins",
        operationId: "getMedecinsList",
        tags: ["Medecins"],
        summary: "Get list of medecins",
        description: "Returns list of medecins"
    )]
    #[OA\Response(response: 200, description: "Successful operation")]
    public function index()
    {
        return \App\Http\Resources\MedecinResource::collection(Medecin::all());
    }

    #[OA\Post(
        path: "/medecins",
        operationId: "storeMedecin",
        tags: ["Medecins"],
        summary: "Create a new medecin",
        description: "Creates a new medecin record",
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["nom", "prenom", "specialite"],
            properties: [
                new OA\Property(property: "nom", type: "string", example: "Doe"),
                new OA\Property(property: "prenom", type: "string", example: "Jane"),
                new OA\Property(property: "specialite", type: "string", example: "Cardiologie"),
                new OA\Property(property: "telephone", type: "string", example: "0600000000"),
                new OA\Property(property: "email", type: "string", format: "email", example: "jane@hospital.com"),
                new OA\Property(property: "numero_ordre", type: "string", example: "123456")
            ]
        )
    )]
    #[OA\Response(response: 201, description: "Medecin created")]
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
