<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Http\Request;

class AuditLog extends Model
{
    protected $fillable = [
        'user_id', 'user_name', 'user_role',
        'action', 'entity_type', 'entity_id', 'entity_label',
        'changes', 'ip_address', 'user_agent',
    ];

    protected $casts = [
        'changes' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Helper statique pour enregistrer rapidement une action.
     * Échec silencieux : un audit raté ne doit jamais casser le flux principal.
     */
    public static function record(array $data): ?self
    {
        try {
            $request = request();
            $user = $request?->user();

            return self::create(array_merge([
                'user_id'    => $user?->id,
                'user_name'  => $user ? trim(($user->prenom ?? '') . ' ' . ($user->nom ?? $user->name ?? '')) : null,
                'user_role'  => $user?->role,
                'ip_address' => $request?->ip(),
                'user_agent' => substr((string) $request?->userAgent(), 0, 255),
            ], $data));
        } catch (\Throwable $e) {
            \Log::error('Audit log failed: ' . $e->getMessage());
            return null;
        }
    }
}
