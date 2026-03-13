<?php

namespace App\Traits;

use App\Helpers\IdEncoder;

trait HasEncryptedRouteKey
{
    /**
     * Get the value of the model's route key (encrypted).
     */
    public function getRouteKey(): string
    {
        return IdEncoder::encode($this->getKey());
    }

    /**
     * Retrieve the model for a bound value (decrypt then find).
     */
    public function resolveRouteBinding($value, $field = null): ?self
    {
        // If value is numeric, resolve normally (backward compat)
        if (is_numeric($value)) {
            return $this->resolveRouteBindingQuery($this, $value, $field)->first();
        }

        // Otherwise, decrypt
        $id = IdEncoder::decode($value);
        return $this->resolveRouteBindingQuery($this, $id, $field)->first();
    }

    /**
     * Get the encrypted ID attribute for Inertia/frontend use.
     */
    public function getEncryptedIdAttribute(): string
    {
        return IdEncoder::encode($this->getKey());
    }
}
