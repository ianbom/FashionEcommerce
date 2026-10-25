<?php

namespace App\Http\Requests\Admin;

use App\Services\Settings\SiteSettingService;
use Illuminate\Foundation\Http\FormRequest;

class SettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin' && (bool) $this->user()?->is_active;
    }

    /**
     * @return array<string, list<mixed>>
     */
    public function rules(): array
    {
        $phone = ['nullable', 'string', 'max:30', function (string $attribute, mixed $value, \Closure $fail): void {
            if (! is_string($value) || SiteSettingService::normalizePhone($value) === null) {
                $fail('Nomor telepon tidak valid. Gunakan nomor lokal atau kode negara, 8-15 digit.');
            }
        }];

        return [
            'store_name' => ['nullable', 'string', 'max:150'],
            'store_email' => ['nullable', 'email', 'max:191'],
            'store_phone' => $phone,
            'instagram_url' => ['nullable', 'url:http,https', 'max:255'],
            'tiktok_url' => ['nullable', 'url:http,https', 'max:255'],
            'footer_text' => ['nullable', 'string', 'max:500'],
            'store_latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'store_longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'contact_maps_url' => ['nullable', 'url:http,https', 'max:255'],
            'business_hours' => ['nullable', 'string', 'max:255'],
            'bank_name' => ['nullable', 'string', 'max:100'],
            'bank_account_number' => ['nullable', 'string', 'max:50'],
            'bank_account_name' => ['nullable', 'string', 'max:150'],
            'payment_service_fee' => ['nullable', 'numeric', 'min:0'],
            'payment_expiry_duration' => ['sometimes', 'required', 'integer', 'between:1,10080'],
            'origin_address' => ['nullable', 'string', 'max:2000'],
            'origin_province' => ['nullable', 'string', 'max:100'],
            'origin_city' => ['nullable', 'string', 'max:100'],
            'origin_district' => ['nullable', 'string', 'max:100'],
            'store_postal_code' => ['nullable', 'string', 'max:20'],
            'origin_biteship_area_id' => ['nullable', 'string', 'max:100'],
            'shipping_couriers' => ['nullable', 'string', 'max:255'],
        ];
    }
}
