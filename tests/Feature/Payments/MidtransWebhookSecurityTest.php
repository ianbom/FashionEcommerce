<?php

use Illuminate\Support\Facades\Log;

test('midtrans webhook does not log the raw payload before validation', function () {
    config(['services.midtrans.server_key' => 'server-key']);
    Log::spy();

    $payload = [
        'order_id' => 'ORDER-1',
        'status_code' => '200',
        'gross_amount' => '10000.00',
        'signature_key' => 'invalid',
        'transaction_status' => 'settlement',
    ];

    $this->postJson(route('payments.midtrans.notification'), $payload)
        ->assertForbidden();

    Log::shouldNotHaveReceived('info', ['Midtrans Webhook received', $payload]);
});
