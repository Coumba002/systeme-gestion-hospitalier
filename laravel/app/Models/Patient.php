<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    use Auditable;

    protected $auditExclude = ['updated_at'];
    protected $fillable = [
        'user_id',
        'nom',
        'prenom',
        'date_naissance',
        'sexe',
        'adresse',
        'telephone',
        'email',
        'groupe_sanguin',
        'contact_urgence',
        'numero_securite_sociale',
        'mutuelle',
        'allergies',
        'antecedents',
    ];

    protected $casts = [
        'date_naissance' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function consultations()
    {
        return $this->hasMany(Consultation::class);
    }

    public function prescriptions()
    {
        return $this->hasMany(Prescription::class);
    }

    public function hospitalisations()
    {
        return $this->hasMany(Hospitalisation::class);
    }

    public function rendezVous()
    {
        return $this->hasMany(RendezVous::class);
    }

    public function factures()
    {
        return $this->hasMany(Facture::class);
    }
}
