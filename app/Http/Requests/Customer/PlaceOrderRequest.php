<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class PlaceOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'customer_address_id' => ['required', 'integer'],
            'shipping_rate_id' => ['required', 'string'],
            'voucher_code' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'no_return_refund_agreed' => ['accepted'],
        ];
    }
}
