<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Infirmier extends Model
{
    protected $fillable = [
        'user_id',
        'nom',
        'prenom',
        'service',
        'telephone',
        'email',
        'numero_badge',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
