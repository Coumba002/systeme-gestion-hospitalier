<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RendezVous extends Model
{
    protected $fillable = [
        'patient_id',
        'medecin_id',
        'date_rendez_vous',
        'heure_rendez_vous',
        'motif',
        'status',
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
