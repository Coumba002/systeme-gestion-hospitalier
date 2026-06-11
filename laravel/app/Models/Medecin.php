<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Model;

class Medecin extends Model
{
    use Auditable;
    protected $auditExclude = ['updated_at'];
    protected $fillable = [
        'user_id',
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

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
