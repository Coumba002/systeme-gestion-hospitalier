<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Medecin extends Model
{
    protected $fillable = [
        'nom',
        'prenom',
        'specialite',
        'telephone',
        'email',
        'numero_ordre',
    ];

    public function prescriptions()
    {
        return $this->hasMany(Prescription::class);
    }

    public function rendezVous()
    {
        return $this->hasMany(RendezVous::class);
    }
}
