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

];
