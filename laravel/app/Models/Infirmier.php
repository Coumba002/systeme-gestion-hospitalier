<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Model;

class Infirmier extends Model
{
    use Auditable;
    protected $auditExclude = ['updated_at'];
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
