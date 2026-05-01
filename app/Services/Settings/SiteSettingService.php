<?php

namespace App\Services\Settings;

use App\Models\SiteSetting;

class SiteSettingService
{
    public function get(string $key, ?string $default = null): ?string
    {
        return SiteSetting::query()->where('key', $key)->value('value') ?? $default;
    }

    public function first(array $keys, ?string $default = null): ?string
    {
        foreach ($keys as $key) {
            $value = $this->get($key);

            if (filled($value)) {
                return $value;
            }
        }

        return $default;
    }
}
