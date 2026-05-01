<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class ShippingRateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'customer_address_id' => ['required_without:shipping_rate_id', 'integer'],
            'shipping_rate_id' => ['required_without:customer_address_id', 'string'],
        ];
    }
}
