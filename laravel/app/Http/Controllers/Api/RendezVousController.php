<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RendezVous;
use Illuminate\Http\Request;

class RendezVousController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return \App\Http\Resources\RendezVousResource::collection(RendezVous::all());
    }

    /**
     * Store a newly created resource in storage.
     */
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
