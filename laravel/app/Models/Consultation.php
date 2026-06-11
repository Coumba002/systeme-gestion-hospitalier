<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Model;

class Consultation extends Model
{
    use Auditable;
    protected $auditExclude = ['updated_at'];

    public function getAuditLabel(): string
    {
        $when = $this->date_consultation ? \Carbon\Carbon::parse($this->date_consultation)->format('d/m/Y') : '?';
        return "Consult. #{$this->id} · Patient #{$this->patient_id} · {$when}";
    }
    protected $fillable = [
        'patient_id',
        'medecin_id',
        'date_consultation',
        'motif',
        'diagnostic',
        'notes',
        'statut',
    ];

    protected $casts = [
        'date_consultation' => 'datetime',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function medecin()
    {
        return $this->belongsTo(Medecin::class);
    }

    public function prescriptions()
    {
        return $this->hasMany(Prescription::class);
    }

    public function facture()
    {
        return $this->hasOne(Facture::class);
    }
}
