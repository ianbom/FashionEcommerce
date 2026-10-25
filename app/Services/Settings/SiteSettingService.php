<?php

namespace App\Services\Settings;

use App\Models\SiteSetting;

class SiteSettingService
{
    public static function normalizePhone(?string $value): ?string
    {
        if ($value === null || ! preg_match('/^\+?[0-9\s().-]+$/', trim($value))) {
            return null;
        }
        $digits = preg_replace('/\D+/', '', $value);
        if (str_starts_with($digits, '0')) {
            $digits = '62'.substr($digits, 1);
        }

        return preg_match('/^[1-9][0-9]{7,14}$/', $digits) ? $digits : null;
    }

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
