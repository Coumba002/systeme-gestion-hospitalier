<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Facture;
use App\Models\Paiement;
use Illuminate\Http\Request;

class FactureController extends Controller
{
    public function index(Request $request)
    {
        $query = Facture::with(['patient', 'consultation', 'hospitalisation', 'paiements']);

        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }
        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        return response()->json($query->orderByDesc('date_emission')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id'         => 'required|exists:patients,id',
            'consultation_id'    => 'nullable|exists:consultations,id',
            'hospitalisation_id' => 'nullable|exists:hospitalisations,id',
            'montant_total'      => 'required|numeric|min:0',
            'description'        => 'nullable|string',
            'date_emission'      => 'required|date',
            'date_echeance'      => 'nullable|date',
            'statut'             => 'nullable|in:en_attente,payee,partielle,annulee',
        ]);

        $facture = Facture::create($validated);
        return response()->json($facture->load(['patient', 'paiements']), 201);
    }

    public function show(Facture $facture)
    {
        return response()->json($facture->load(['patient', 'consultation', 'hospitalisation', 'paiements']));
    }

    public function update(Request $request, Facture $facture)
    {
        $validated = $request->validate([
            'montant_total' => 'sometimes|numeric|min:0',
            'description'   => 'nullable|string',
            'statut'        => 'nullable|in:en_attente,payee,partielle,annulee',
            'date_echeance' => 'nullable|date',
        ]);

        $facture->update($validated);
        return response()->json($facture->load(['patient', 'paiements']));
    }

    public function destroy(Facture $facture)
    {
        $facture->delete();
        return response()->json(['message' => 'Facture supprimée avec succès']);
    }

    /**
     * Enregistrer un paiement sur une facture.
     * POST /api/factures/{id}/paiements
     */
    public function enregistrerPaiement(Request $request, Facture $facture)
    {
        $validated = $request->validate([
            'montant'        => 'required|numeric|min:0.01',
            'mode'           => 'required|in:especes,carte,assurance,mobile,virement',
            'date_paiement'  => 'required|date',
            'reference'      => 'nullable|string|max:100',
            'notes'          => 'nullable|string',
        ]);

        $paiement = Paiement::create(array_merge($validated, ['facture_id' => $facture->id]));

        // Mettre à jour le montant payé et le statut
        $facture->refresh();
        $totalPaye = $facture->paiements()->sum('montant');
        $facture->montant_paye = $totalPaye;

        if ($totalPaye >= $facture->montant_total) {
            $facture->statut = 'payee';
        } elseif ($totalPaye > 0) {
            $facture->statut = 'partielle';
        }
        $facture->save();

        return response()->json([
            'message'  => 'Paiement enregistré avec succès',
            'paiement' => $paiement,
            'facture'  => $facture->load('paiements'),
        ], 201);
    }
}
