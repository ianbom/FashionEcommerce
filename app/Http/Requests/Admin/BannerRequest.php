<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BannerRequest extends FormRequest
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
        $banner = $this->route('banner');

        return [
            'title' => ['required', 'string', 'max:180'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'image_desktop' => [$banner ? 'nullable' : 'required', 'file', 'image', 'max:4096'],
            'image_mobile' => ['nullable', 'file', 'image', 'max:2048'],
            'button_text' => ['nullable', 'string', 'max:100'],
            'button_url' => ['nullable', 'string', 'max:255'],
            'placement' => ['required', Rule::in(['homepage', 'collection', 'promo'])],
            'sort_order' => ['required', 'integer', 'min:0'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
