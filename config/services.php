<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'biteship' => [
        'api_key' => env('BITESHIP_API_KEY'),
        'webhook_secret' => env('BITESHIP_WEBHOOK_SECRET'),
        'webhook_allow_test_bypass' => env('BITESHIP_WEBHOOK_ALLOW_TEST_BYPASS', false),
        'shipper_name' => env('BITESHIP_SHIPPER_NAME'),
        'shipper_phone' => env('BITESHIP_SHIPPER_PHONE'),
        'shipper_email' => env('BITESHIP_SHIPPER_EMAIL'),
        'origin_contact_name' => env('BITESHIP_ORIGIN_CONTACT_NAME'),
        'origin_contact_phone' => env('BITESHIP_ORIGIN_CONTACT_PHONE'),
        'origin_contact_email' => env('BITESHIP_ORIGIN_CONTACT_EMAIL'),
        'origin_address' => env('BITESHIP_ORIGIN_ADDRESS'),
        'origin_note' => env('BITESHIP_ORIGIN_NOTE'),
        'origin_postal_code' => env('BITESHIP_ORIGIN_POSTAL_CODE'),
        'origin_area_id' => env('BITESHIP_ORIGIN_AREA_ID'),
    ],

    'midtrans' => [
        'server_key' => env('MIDTRANS_SERVER_KEY'),
        'client_key' => env('MIDTRANS_CLIENT_KEY'),
    ],

    'checkout' => [
        'shipping_rate_ttl_minutes' => env('CHECKOUT_SHIPPING_RATE_TTL_MINUTES', 15),
        'session_ttl_minutes' => env('CHECKOUT_SESSION_TTL_MINUTES', 30),
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI'),
    ],

];
