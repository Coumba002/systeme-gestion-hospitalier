<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Prescription extends Model
{
    //
    protected $fillable = [
        'patient_id',
        'medecin_id',
        'date_prescription',
        'medications',
        'dosage',
        'frequency',
        'duration',
        'instructions',
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

    public function facture()
    {
        return $this->hasOne(Facture::class);
    }
}
