<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Model;

class Facture extends Model
{
    use Auditable;
    protected $auditExclude = ['updated_at'];

    public function getAuditLabel(): string
    {
        return "Facture #{$this->id} · " . number_format((float)$this->montant_total, 0, ',', ' ') . " F";
    }
    protected $fillable = [
        'patient_id',
        'consultation_id',
        'hospitalisation_id',
        'montant_total',
        'montant_paye',
        'statut',
        'description',
        'date_emission',
        'date_echeance',
    ];

    protected $casts = [
        'date_emission'  => 'date',
        'date_echeance'  => 'date',
        'montant_total'  => 'decimal:2',
        'montant_paye'   => 'decimal:2',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function consultation()
    {
        return $this->belongsTo(Consultation::class);
    }

    public function hospitalisation()
    {
        return $this->belongsTo(Hospitalisation::class);
    }

    public function paiements()
    {
        return $this->hasMany(Paiement::class);
    }
}
