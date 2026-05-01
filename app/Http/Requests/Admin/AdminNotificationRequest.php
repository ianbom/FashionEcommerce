<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminNotificationRequest extends FormRequest
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
            'target' => ['required', Rule::in(['one', 'all', 'active'])],
            'user_id' => ['nullable', 'required_if:target,one', 'integer', 'exists:users,id'],
            'title' => ['required', 'string', 'max:180'],
            'message' => ['required', 'string', 'max:5000'],
            'type' => ['required', Rule::in(['order', 'payment', 'shipping', 'promo', 'system'])],
            'reference_type' => ['nullable', 'string', 'max:100'],
            'reference_id' => ['nullable', 'integer'],
        ];
    }
}
