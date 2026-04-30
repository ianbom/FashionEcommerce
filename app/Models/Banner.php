<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'title',
    'subtitle',
    'image_desktop_url',
    'image_mobile_url',
    'button_text',
    'button_url',
    'placement',
    'sort_order',
    'is_active',
    'starts_at',
    'ends_at',
])]
class Banner extends Model
{
    protected function casts(): array
    {
        return [
            'ends_at' => 'datetime',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'starts_at' => 'datetime',
        ];
    }
}
