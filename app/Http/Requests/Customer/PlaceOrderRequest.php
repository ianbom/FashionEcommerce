<?php

namespace App\Http\Requests\Customer;

use App\Enums\MidtransPaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'idempotency_key' => ['required', 'string', 'max:100'],
            'payment_method' => ['required', 'string', Rule::in(MidtransPaymentMethod::values())],
            'voucher_code' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'no_return_refund_agreed' => ['accepted'],
        ];
    }
}
