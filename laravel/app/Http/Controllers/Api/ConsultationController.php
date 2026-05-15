<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use Illuminate\Http\Request;

class ConsultationController extends Controller
{
    public function index(Request $request)
    {
        $query = Consultation::with(['patient', 'medecin']);

        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }
        if ($request->has('medecin_id')) {
            $query->where('medecin_id', $request->medecin_id);
        }
        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        return response()->json($query->orderByDesc('date_consultation')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id'       => 'required|exists:patients,id',
            'medecin_id'       => 'required|exists:medecins,id',
            'date_consultation' => 'required|date',
            'motif'            => 'nullable|string|max:500',
            'diagnostic'       => 'nullable|string',
            'notes'            => 'nullable|string',
            'statut'           => 'nullable|in:planifiee,realisee,annulee',
        ]);

        $consultation = Consultation::create($validated);
        return response()->json($consultation->load(['patient', 'medecin']), 201);
    }

    public function show(Consultation $consultation)
    {
        return response()->json($consultation->load(['patient', 'medecin', 'prescriptions']));
    }

    public function update(Request $request, Consultation $consultation)
    {
        $validated = $request->validate([
            'patient_id'       => 'sometimes|exists:patients,id',
            'medecin_id'       => 'sometimes|exists:medecins,id',
            'date_consultation' => 'sometimes|date',
            'motif'            => 'nullable|string|max:500',
            'diagnostic'       => 'nullable|string',
            'notes'            => 'nullable|string',
            'statut'           => 'nullable|in:planifiee,realisee,annulee',
        ]);

        $consultation->update($validated);
        return response()->json($consultation->load(['patient', 'medecin']));
    }

    public function destroy(Consultation $consultation)
    {
        $consultation->delete();
        return response()->json(['message' => 'Consultation supprimée avec succès']);
    }
}
