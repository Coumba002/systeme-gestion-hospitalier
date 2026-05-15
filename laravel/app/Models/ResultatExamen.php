<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResultatExamen extends Model
{
    protected $fillable = [
        'patient_id', 'medecin_id', 'nom_examen', 'valeur', 'unite',
        'valeurs_reference', 'interpretation', 'date_examen'
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function medecin()
    {
        return $this->belongsTo(Medecin::class);
    }
}
