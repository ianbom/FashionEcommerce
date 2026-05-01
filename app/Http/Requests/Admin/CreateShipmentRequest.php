<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CreateShipmentRequest extends FormRequest
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
            'courier_company' => ['required', 'string', 'max:100'],
            'courier_type' => ['required', 'string', 'max:100'],
            'courier_service_name' => ['nullable', 'string', 'max:150'],
            'waybill_id' => ['nullable', 'string', 'max:150'],
            'estimated_delivery' => ['nullable', 'string', 'max:100'],
            'label_photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }
}
