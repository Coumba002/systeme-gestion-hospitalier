<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Model;

class RendezVous extends Model
{
    use Auditable;
    protected $table = 'rendez_vous';
    protected $auditExclude = ['updated_at'];

    public function getAuditLabel(): string
    {
        $when = $this->date_heure ? \Carbon\Carbon::parse($this->date_heure)->format('d/m/Y H:i') : '?';
        return "RDV #{$this->id} · Patient #{$this->patient_id} · {$when}";
    }

    protected $fillable = [
        'patient_id',
        'medecin_id',
        'date_heure',
        'motif',
        'statut',
        'notes',
    ];

    protected $casts = [
        'date_heure' => 'datetime',
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
        return $this->hasOne(Consultation::class);
    }
}
