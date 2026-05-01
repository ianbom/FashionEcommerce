<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
        return [
            'store_name' => ['nullable', 'string', 'max:150'],
            'store_email' => ['nullable', 'email', 'max:191'],
            'store_phone' => ['nullable', 'string', 'max:30'],
            'whatsapp_number' => ['nullable', 'string', 'max:30'],
            'store_address' => ['nullable', 'string', 'max:2000'],
            'store_logo' => ['nullable', 'url', 'max:255'],
            'store_favicon' => ['nullable', 'url', 'max:255'],
            'instagram_url' => ['nullable', 'url', 'max:255'],
            'tiktok_url' => ['nullable', 'url', 'max:255'],
            'footer_text' => ['nullable', 'string', 'max:500'],
            'default_meta_title' => ['nullable', 'string', 'max:255'],
            'default_meta_description' => ['nullable', 'string', 'max:500'],
            'open_graph_image' => ['nullable', 'url', 'max:255'],
            'default_keywords' => ['nullable', 'string', 'max:500'],
            'midtrans_environment' => ['nullable', Rule::in(['sandbox', 'production'])],
            'midtrans_client_key' => ['nullable', 'string', 'max:255'],
            'payment_expiry_duration' => ['nullable', 'integer', 'min:1', 'max:10080'],
            'payment_service_fee' => ['nullable', 'numeric', 'min:0'],
            'origin_address' => ['nullable', 'string', 'max:2000'],
            'origin_province' => ['nullable', 'string', 'max:100'],
            'origin_city' => ['nullable', 'string', 'max:100'],
            'origin_district' => ['nullable', 'string', 'max:100'],
            'origin_postal_code' => ['nullable', 'string', 'max:20'],
            'origin_biteship_area_id' => ['nullable', 'string', 'max:100'],
            'shipper_name' => ['nullable', 'string', 'max:150'],
            'shipper_phone' => ['nullable', 'string', 'max:30'],
            'enabled_couriers' => ['nullable', 'string', 'max:255'],
        ];
    }
}
