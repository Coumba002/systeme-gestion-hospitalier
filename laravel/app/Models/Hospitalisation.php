<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Model;

class Hospitalisation extends Model
{
    use Auditable;
    protected $auditExclude = ['updated_at'];

    public function getAuditLabel(): string
    {
        $p = $this->patient_id ? "Patient #{$this->patient_id}" : "Hospi";
        return "{$p} · Ch. {$this->chambre} {$this->lit}";
    }
    protected $fillable = [
        'patient_id',
        'medecin_id',
        'chambre',
        'lit',
        'date_entree',
        'date_sortie_prevue',
        'date_sortie_reelle',
        'motif',
        'notes',
        'statut',
    ];

    protected $casts = [
        'date_entree'         => 'datetime',
        'date_sortie_prevue'  => 'datetime',
        'date_sortie_reelle'  => 'datetime',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function medecin()
    {
        return $this->belongsTo(Medecin::class);
    }

    public function facture()
    {
        return $this->hasOne(Facture::class);
    }
}
