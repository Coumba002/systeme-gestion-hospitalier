<?php

namespace App\Http\Controllers;

use App\Models\ResultatExamen;
use Illuminate\Http\Request;

class ResultatExamenController extends Controller
{
    public function index(Request $request)
    {
        $query = ResultatExamen::with(['patient', 'medecin']);
        
        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }
        
        if ($request->user()->role === 'patient') {
            $patient = \App\Models\Patient::where('user_id', $request->user()->id)->first();
            if ($patient) {
                $query->where('patient_id', $patient->id);
            }
        }

        return response()->json($query->orderBy('date_examen', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'medecin_id' => 'nullable|exists:medecins,id',
            'nom_examen' => 'required|string',
            'valeur' => 'required|string',
            'unite' => 'nullable|string',
            'valeurs_reference' => 'nullable|string',
            'interpretation' => 'nullable|in:normal,a_surveiller,anormal',
            'date_examen' => 'required|date',
        ]);

        $resultat = ResultatExamen::create($validated);
        return response()->json($resultat->load(['patient', 'medecin']), 201);
    }
}
