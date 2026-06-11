<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Model;

class Prescription extends Model
{
    use Auditable;
    protected $auditExclude = ['updated_at'];

    public function getAuditLabel(): string
    {
        return "Ordonnance #{$this->id} · " . mb_substr((string)$this->medicaments, 0, 50);
    }
    protected $fillable = [
        'patient_id',
        'medecin_id',
        'consultation_id',
        'date_prescription',
        'medicaments',
        'dosage',
        'frequence',
        'duree',
        'instructions',
        'statut',
    ];

    protected $casts = [
        'date_prescription' => 'date',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function medecin()
    {
        return $this->belongsTo(Medecin::class);
    }

    public function consultation()
    {
        return $this->belongsTo(Consultation::class);
    }
}
