<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CollectionRequest extends FormRequest
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
        $collection = $this->route('collection');

        return [
            'name' => ['required', 'string', 'max:150'],
            'slug' => ['required', 'string', 'max:180', Rule::unique('collections', 'slug')->ignore($collection)],
            'description' => ['nullable', 'string', 'max:2000'],
            'banner_desktop' => ['nullable', 'file', 'image', 'max:4096'],
            'banner_mobile' => ['nullable', 'file', 'image', 'max:2048'],
            'is_featured' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
