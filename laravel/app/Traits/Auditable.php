<?php

namespace App\Traits;

use App\Models\AuditLog;

/**
 * Trait à attacher aux modèles qu'on veut auditer.
 * Capte les événements Eloquent created/updated/deleted automatiquement.
 *
 * Configuration optionnelle par modèle :
 *   protected $auditExclude = ['updated_at', 'password']; // champs ignorés
 *   public function getAuditLabel(): string { return $this->nom; } // résumé lisible
 */
trait Auditable
{
    public static function bootAuditable(): void
    {
        static::created(function ($model) {
            AuditLog::record([
                'action'       => 'created',
                'entity_type'  => class_basename($model),
                'entity_id'    => $model->getKey(),
                'entity_label' => self::buildLabel($model),
            ]);
        });

        static::updated(function ($model) {
            $excluded = property_exists($model, 'auditExclude') ? $model->auditExclude : ['updated_at', 'remember_token'];
            $changes = collect($model->getChanges())
                ->except($excluded)
                ->mapWithKeys(function ($newVal, $key) use ($model) {
                    return [$key => [
                        'before' => $model->getOriginal($key),
                        'after'  => $newVal,
                    ]];
                })
                ->toArray();

            // Skip si pas de changement significatif
            if (empty($changes)) return;

            AuditLog::record([
                'action'       => 'updated',
                'entity_type'  => class_basename($model),
                'entity_id'    => $model->getKey(),
                'entity_label' => self::buildLabel($model),
                'changes'      => $changes,
            ]);
        });

        static::deleted(function ($model) {
            AuditLog::record([
                'action'       => 'deleted',
                'entity_type'  => class_basename($model),
                'entity_id'    => $model->getKey(),
                'entity_label' => self::buildLabel($model),
            ]);
        });
    }

    /**
     * Construit un label lisible pour l'entité. Override possible via getAuditLabel()
     */
    private static function buildLabel($model): string
    {
        if (method_exists($model, 'getAuditLabel')) {
            return (string) $model->getAuditLabel();
        }
        // Fallback : nom+prenom, ou nom, ou libelle, ou id
        foreach (['nom', 'libelle', 'name', 'titre', 'title'] as $field) {
            if (!empty($model->$field)) {
                $label = (string) $model->$field;
                if (!empty($model->prenom)) $label = $model->prenom . ' ' . $label;
                return mb_substr($label, 0, 200);
            }
        }
        return class_basename($model) . ' #' . $model->getKey();
    }
}
