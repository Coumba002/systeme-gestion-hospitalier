<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RendezVous;
use App\Models\Patient;
use App\Models\Medecin;
use App\Models\User;
use App\Mail\RendezVousNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class RendezVousController extends Controller
{
    public function index(Request $request)
    {
        $query = RendezVous::with(['patient', 'medecin']);
        $user = $request->user();

        if ($user && $user->role === 'medecin') {
            $medecin = Medecin::where('user_id', $user->id)->first();
            if ($medecin) $query->where('medecin_id', $medecin->id);
        } elseif ($user && $user->role === 'patient') {
            $patient = Patient::where('user_id', $user->id)->first();
            if ($patient) $query->where('patient_id', $patient->id);
        }

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }
        if ($request->filled('medecin_id')) {
            $query->where('medecin_id', $request->medecin_id);
        }
        if ($request->filled('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        return response()->json($query->orderBy('date_heure', 'asc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'medecin_id' => 'required|exists:medecins,id',
            'date_heure' => 'required|date',
            'motif'      => 'nullable|string|max:500',
            'statut'     => 'nullable|in:en_attente,confirme,annule,realise',
            'notes'      => 'nullable|string',
        ]);

        $conflit = RendezVous::where('medecin_id', $validated['medecin_id'])
            ->where('date_heure', $validated['date_heure'])
            ->whereIn('statut', ['en_attente', 'confirme'])
            ->exists();

        if ($conflit) {
            return response()->json([
                'message' => 'Conflit : un autre rendez-vous existe déjà avec ce médecin à cette heure.'
            ], 409);
        }

        $rdv = RendezVous::create($validated);
        $rdv->load(['patient', 'medecin']);

        // Notification email au patient
        $this->notifyPatient($rdv, 'cree');

        return response()->json($rdv, 201);
    }

    /**
     * Envoie un email au patient si un email valide est disponible.
     * Échec silencieux : un problème de mail ne doit pas casser le flux.
     */
    private function notifyPatient(RendezVous $rdv, string $action): void
    {
        try {
            $email = $rdv->patient->email ?? null;
            // Si le patient n'a pas d'email direct, tenter via user lié
            if (!$email && $rdv->patient && $rdv->patient->user_id) {
                $user = User::find($rdv->patient->user_id);
                $email = $user?->email;
            }
            if ($email && filter_var($email, FILTER_VALIDATE_EMAIL)) {
                Mail::to($email)->send(new RendezVousNotification($rdv, $action));
                Log::info("Email RDV [{$action}] envoyé à {$email} (rdv #{$rdv->id})");
            } else {
                Log::warning("Pas d'email valide pour notifier patient RDV #{$rdv->id} (action: {$action})");
            }
        } catch (\Throwable $e) {
            Log::error("Erreur envoi email RDV #{$rdv->id} : " . $e->getMessage());
        }
    }

    public function show(RendezVous $rendezvous)
    {
        return response()->json($rendezvous->load(['patient', 'medecin']));
    }

    public function update(Request $request, RendezVous $rendezvous)
    {
        $validated = $request->validate([
            'patient_id' => 'sometimes|exists:patients,id',
            'medecin_id' => 'sometimes|exists:medecins,id',
            'date_heure' => 'sometimes|date',
            'motif'      => 'nullable|string|max:500',
            'statut'     => 'sometimes|in:en_attente,confirme,annule,realise',
            'notes'      => 'nullable|string',
        ]);

        $ancienStatut = $rendezvous->statut;
        $rendezvous->update($validated);
        $rendezvous->load(['patient', 'medecin']);

        // Email si annulation ou modification (mais pas pour passage à "realise")
        if (isset($validated['statut']) && $validated['statut'] === 'annule' && $ancienStatut !== 'annule') {
            $this->notifyPatient($rendezvous, 'annule');
        } elseif (isset($validated['date_heure']) || isset($validated['medecin_id'])) {
            $this->notifyPatient($rendezvous, 'modifie');
        }

        return response()->json($rendezvous);
    }

    public function destroy(RendezVous $rendezvous)
    {
        $rendezvous->load(['patient', 'medecin']);
        $this->notifyPatient($rendezvous, 'annule');
        $rendezvous->delete();
        return response()->json(['message' => 'Rendez-vous supprimé'], 200);
    }
}
