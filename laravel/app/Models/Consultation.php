<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Consultation extends Model
{
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
