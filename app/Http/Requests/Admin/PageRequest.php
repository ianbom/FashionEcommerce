<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PageRequest extends FormRequest
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
        $page = $this->route('page');

        return [
            'title' => ['required', 'string', 'max:180'],
            'slug' => ['required', 'string', 'max:180', Rule::unique('pages', 'slug')->ignore($page)],
            'content' => ['required', 'string'],
            'type' => ['required', Rule::in(['about', 'contact', 'faq', 'terms_conditions', 'privacy_policy', 'shipping_policy', 'no_return_refund_policy', 'size_guide'])],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
