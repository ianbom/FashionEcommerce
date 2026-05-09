<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'admin',
                'password' => 'admin123',
                'role' => 'admin',
                'is_active' => true,
                'email_verified_at' => now(),
            ],
        );
        User::query()->updateOrCreate(
            ['email' => 'i.alehansyah@gmail.com'],
            [
                'name' => 'Ian A',
                'password' => 'ianbom123',
                'role' => 'customer',
                'is_active' => true,
                'email_verified_at' => now(),
            ],
        );
    }
}
