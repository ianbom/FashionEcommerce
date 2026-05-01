<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategoryRequest extends FormRequest
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
        $category = $this->route('category');

        return [
            'name' => ['required', 'string', 'max:150'],
            'slug' => ['required', 'string', 'max:180', Rule::unique('categories', 'slug')->ignore($category)],
            'description' => ['nullable', 'string', 'max:2000'],
            'image' => ['nullable', 'file', 'image', 'max:2048'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
