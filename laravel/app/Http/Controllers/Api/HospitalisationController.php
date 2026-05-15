<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hospitalisation;
use Illuminate\Http\Request;

class HospitalisationController extends Controller
{
    public function index(Request $request)
    {
        $query = Hospitalisation::with(['patient', 'medecin']);

        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }
        if ($request->has('medecin_id')) {
            $query->where('medecin_id', $request->medecin_id);
        }
        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        return response()->json($query->orderByDesc('date_entree')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id'         => 'required|exists:patients,id',
            'medecin_id'         => 'required|exists:medecins,id',
            'chambre'            => 'nullable|string|max:50',
            'lit'                => 'nullable|string|max:20',
            'date_entree'        => 'required|date',
            'date_sortie_prevue' => 'nullable|date|after_or_equal:date_entree',
            'motif'              => 'nullable|string|max:500',
            'notes'              => 'nullable|string',
            'statut'             => 'nullable|in:en_cours,sortie,transfere',
        ]);

        $hospitalisation = Hospitalisation::create($validated);
        return response()->json($hospitalisation->load(['patient', 'medecin']), 201);
    }

    public function show(Hospitalisation $hospitalisation)
    {
        return response()->json($hospitalisation->load(['patient', 'medecin', 'facture']));
    }

    public function update(Request $request, Hospitalisation $hospitalisation)
    {
        $validated = $request->validate([
            'patient_id'          => 'sometimes|exists:patients,id',
            'medecin_id'          => 'sometimes|exists:medecins,id',
            'chambre'             => 'nullable|string|max:50',
            'lit'                 => 'nullable|string|max:20',
            'date_entree'         => 'sometimes|date',
            'date_sortie_prevue'  => 'nullable|date',
            'date_sortie_reelle'  => 'nullable|date',
            'motif'               => 'nullable|string|max:500',
            'notes'               => 'nullable|string',
            'statut'              => 'nullable|in:en_cours,sortie,transfere',
        ]);

        $hospitalisation->update($validated);
        return response()->json($hospitalisation->load(['patient', 'medecin']));
    }

    /**
     * Enregistrer la sortie d'un patient hospitalisé.
     * POST /api/hospitalisations/{id}/sortie
     */
    public function sortie(Request $request, Hospitalisation $hospitalisation)
    {
        $validated = $request->validate([
            'date_sortie_reelle' => 'required|date',
            'notes'              => 'nullable|string',
        ]);

        $hospitalisation->update([
            'date_sortie_reelle' => $validated['date_sortie_reelle'],
            'notes'              => $validated['notes'] ?? $hospitalisation->notes,
            'statut'             => 'sortie',
        ]);

        return response()->json([
            'message'         => 'Sortie enregistrée avec succès',
            'hospitalisation' => $hospitalisation->load(['patient', 'medecin']),
        ]);
    }

    public function destroy(Hospitalisation $hospitalisation)
    {
        $hospitalisation->delete();
        return response()->json(['message' => 'Hospitalisation supprimée avec succès']);
    }
}
