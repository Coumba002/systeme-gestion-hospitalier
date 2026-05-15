<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\PrescriptionController;
use App\Http\Controllers\Api\RendezVousController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\MedecinController;
use App\Http\Controllers\Api\InfirmierController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ConsultationController;
use App\Http\Controllers\Api\HospitalisationController;
use App\Http\Controllers\Api\FactureController;

// ─── Auth (public) ────────────────────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// ─── Routes protégées (token Sanctum requis) ──────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // ── Ressources CRUD standard ──────────────────────────────────────────────
    Route::apiResource('patients',      PatientController::class);
    Route::apiResource('prescriptions', PrescriptionController::class);
    Route::apiResource('rendezvous',    RendezVousController::class);
    Route::apiResource('users',         UserController::class);
    Route::apiResource('medecins',      MedecinController::class);
    Route::apiResource('infirmiers',    InfirmierController::class);
    Route::apiResource('consultations', ConsultationController::class);
    Route::apiResource('hospitalisations', HospitalisationController::class);
    Route::apiResource('factures',      FactureController::class);
    Route::apiResource('messages',      \App\Http\Controllers\MessageController::class);
    Route::apiResource('resultats',     \App\Http\Controllers\ResultatExamenController::class);

    // ── Routes supplémentaires ────────────────────────────────────────────────
    // Enregistrer la sortie d'un patient hospitalisé
    Route::post('hospitalisations/{hospitalisation}/sortie', [HospitalisationController::class, 'sortie']);

    // Enregistrer un paiement sur une facture
    Route::post('factures/{facture}/paiements', [FactureController::class, 'enregistrerPaiement']);

    // Marquer un message comme lu
    Route::post('messages/{message}/lu', [\App\Http\Controllers\MessageController::class, 'markAsRead']);

    // ── Statistiques & Rapports ───────────────────────────────────────────────
    Route::get('stats/dashboard', function () {
        return response()->json([
            'patients'         => \App\Models\Patient::count(),
            'medecins'         => \App\Models\Medecin::count(),
            'infirmiers'       => \App\Models\Infirmier::count(),
            'consultations'    => \App\Models\Consultation::count(),
            'hospitalisations_en_cours' => \App\Models\Hospitalisation::where('statut', 'en_cours')->count(),
            'factures_en_attente'       => \App\Models\Facture::where('statut', 'en_attente')->count(),
            'rendezvous_aujourd_hui'    => \App\Models\RendezVous::whereDate('date_heure', today())->count(),
        ]);
    });

    Route::get('stats/medecin', function (\Illuminate\Http\Request $request) {
        $user = $request->user();
        if ($user->role !== 'medecin') return response()->json(['error' => 'Unauthorized'], 403);
        $medecin = \App\Models\Medecin::where('user_id', $user->id)->first();
        if (!$medecin) return response()->json(['error' => 'Medecin not found'], 404);

        $rdvs = \App\Models\RendezVous::where('medecin_id', $medecin->id)->whereDate('date_heure', '>=', today())->count();
        $patients = \App\Models\Consultation::where('medecin_id', $medecin->id)->distinct('patient_id')->count('patient_id');
        $ordonnances = \App\Models\Prescription::where('medecin_id', $medecin->id)->count();

        return response()->json([
            'rdv_a_venir' => $rdvs,
            'patients_suivis' => $patients,
            'ordonnances_emis' => $ordonnances,
            'cas_urgents' => 0 // A calculer si on a une notion d'urgence
        ]);
    });

    Route::get('stats/patient', function (\Illuminate\Http\Request $request) {
        $user = $request->user();
        if ($user->role !== 'patient') return response()->json(['error' => 'Unauthorized'], 403);
        $patient = \App\Models\Patient::where('user_id', $user->id)->first();
        
        // Un user patient pourrait ne pas avoir de profil patient créé encore s'il s'inscrit sans l'Admin
        $patient_id = $patient ? $patient->id : -1; 

        $rdvs = \App\Models\RendezVous::where('patient_id', $patient_id)->whereDate('date_heure', '>=', today())->count();
        $ordonnances = \App\Models\Prescription::where('patient_id', $patient_id)->count();
        $resultats = \App\Models\ResultatExamen::where('patient_id', $patient_id)->count();

        return response()->json([
            'rdv_a_venir' => $rdvs,
            'ordonnances_actives' => $ordonnances,
            'resultats_dispos' => $resultats,
        ]);
    });
});