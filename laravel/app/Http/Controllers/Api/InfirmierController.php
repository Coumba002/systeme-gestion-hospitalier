<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Infirmier;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class InfirmierController extends Controller
{
    #[OA\Get(
        path: "/infirmiers",
        operationId: "getInfirmiersList",
        tags: ["Infirmiers"],
        summary: "Get list of infirmiers",
        description: "Returns list of infirmiers"
    )]
    #[OA\Response(response: 200, description: "Successful operation")]
    public function index()
    {
        return \App\Http\Resources\InfirmierResource::collection(Infirmier::all());
    }

    #[OA\Post(
        path: "/infirmiers",
        operationId: "storeInfirmier",
        tags: ["Infirmiers"],
        summary: "Create a new infirmier",
        description: "Creates a new infirmier record",
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["nom", "prenom"],
            properties: [
                new OA\Property(property: "nom", type: "string", example: "Smith"),
                new OA\Property(property: "prenom", type: "string", example: "Anna"),
                new OA\Property(property: "telephone", type: "string", example: "0600000000"),
                new OA\Property(property: "email", type: "string", format: "email", example: "anna@hospital.com")
            ]
        )
    )]
    #[OA\Response(response: 201, description: "Infirmier created")]
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
