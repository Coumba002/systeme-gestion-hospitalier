<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RendezVous;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class RendezVousController extends Controller
{
    #[OA\Get(
        path: "/rendezvous",
        operationId: "getRendezVousList",
        tags: ["RendezVous"],
        summary: "Get list of rendezvous",
        description: "Returns list of rendezvous"
    )]
    #[OA\Response(response: 200, description: "Successful operation")]
    public function index()
    {
        return \App\Http\Resources\RendezVousResource::collection(RendezVous::all());
    }

    #[OA\Post(
        path: "/rendezvous",
        operationId: "storeRendezVous",
        tags: ["RendezVous"],
        summary: "Create a new rendezvous",
        description: "Creates a new rendezvous record",
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["patient_id", "medecin_id", "date_rendez_vous", "heure_rendez_vous"],
            properties: [
                new OA\Property(property: "patient_id", type: "integer", example: 1),
                new OA\Property(property: "medecin_id", type: "integer", example: 1),
                new OA\Property(property: "date_rendez_vous", type: "string", format: "date", example: "2026-05-10"),
                new OA\Property(property: "heure_rendez_vous", type: "string", example: "14:30:00"),
                new OA\Property(property: "motif", type: "string", example: "Consultation générale"),
                new OA\Property(property: "status", type: "string", example: "planifié")
            ]
        )
    )]
    #[OA\Response(response: 201, description: "RendezVous created")]
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'medecin_id' => 'required|exists:medecins,id',
            'date_rendez_vous' => 'required|date',
            'heure_rendez_vous' => 'required|date_format:H:i',
            'motif' => 'required|string',
            'status' => 'required|string',
        ]);

        $rendezVous = RendezVous::create($validated);
        return new \App\Http\Resources\RendezVousResource($rendezVous);
    }

    /**
     * Display the specified resource.
     */
    public function show(RendezVous $rendezVous)
    {
        return new \App\Http\Resources\RendezVousResource($rendezVous);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RendezVous $rendezVous)
    {
        $validated = $request->validate([
            'patient_id' => 'sometimes|required|exists:patients,id',
            'medecin_id' => 'sometimes|required|exists:medecins,id',
            'date_rendez_vous' => 'sometimes|required|date',
            'heure_rendez_vous' => 'sometimes|required|date_format:H:i',
            'motif' => 'sometimes|required|string',
            'status' => 'sometimes|required|string',
        ]);

        $rendezVous->update($validated);
        return new \App\Http\Resources\RendezVousResource($rendezVous);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RendezVous $rendezVous)
    {
        $rendezVous->delete();
        return response()->json(['message' => 'Rendez-vous deleted successfully'], 200);
    }
}
