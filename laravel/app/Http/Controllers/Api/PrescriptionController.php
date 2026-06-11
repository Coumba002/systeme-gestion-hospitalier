<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prescription;
use App\Models\Patient;
use App\Models\Medecin;
use Illuminate\Http\Request;

class PrescriptionController extends Controller
{
    public function index(Request $request)
    {
        $query = Prescription::with(['patient', 'medecin']);
        $user = $request->user();

        if ($user && $user->role === 'medecin') {
            $medecin = Medecin::where('user_id', $user->id)->first();
            if ($medecin) $query->where('medecin_id', $medecin->id);
        } elseif ($user && $user->role === 'patient') {
            $patient = Patient::where('user_id', $user->id)->first();
            if ($patient) $query->where('patient_id', $patient->id);
        }

        return response()->json($query->orderByDesc('id')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id'        => 'required|exists:patients,id',
            'medecin_id'        => 'nullable|exists:medecins,id',
            'consultation_id'   => 'nullable|exists:consultations,id',
            'date_prescription' => 'nullable|date',
            'medicaments'       => 'required|string',
            'dosage'            => 'nullable|string|max:100',
            'frequence'         => 'nullable|string|max:100',
            'duree'             => 'nullable|string|max:100',
            'instructions'      => 'nullable|string',
            'statut'            => 'nullable|in:active,terminee,annulee',
        ]);

        if (empty($validated['medecin_id']) && $request->user()) {
            $medecin = Medecin::where('user_id', $request->user()->id)->first();
            if ($medecin) $validated['medecin_id'] = $medecin->id;
        }
        if (empty($validated['date_prescription'])) {
            $validated['date_prescription'] = now()->toDateString();
        }

        $prescription = Prescription::create($validated);
        return response()->json($prescription->load(['patient', 'medecin']), 201);
    }

    public function show(Prescription $prescription)
    {
        return response()->json($prescription->load(['patient', 'medecin', 'consultation']));
    }

    public function update(Request $request, Prescription $prescription)
    {
        $validated = $request->validate([
            'patient_id'        => 'sometimes|exists:patients,id',
            'medecin_id'        => 'sometimes|exists:medecins,id',
            'consultation_id'   => 'nullable|exists:consultations,id',
            'date_prescription' => 'nullable|date',
            'medicaments'       => 'sometimes|string',
            'dosage'            => 'nullable|string|max:100',
            'frequence'         => 'nullable|string|max:100',
            'duree'             => 'nullable|string|max:100',
            'instructions'      => 'nullable|string',
            'statut'            => 'sometimes|in:active,terminee,annulee',
        ]);

        $prescription->update($validated);
        return response()->json($prescription->load(['patient', 'medecin']));
    }

    public function destroy(Prescription $prescription)
    {
        $prescription->delete();
        return response()->json(['message' => 'Prescription supprimée'], 200);
    }
}
