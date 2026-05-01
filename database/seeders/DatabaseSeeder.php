<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $this->call([
            UserSeeder::class,
            CategorySeeder::class,
            CollectionSeeder::class,
            ProductSeeder::class,
            ProductImageSeeder::class,
            ProductVariantSeeder::class,
            BannerSeeder::class,
            PageSeeder::class,
            SiteSettingSeeder::class,
        ]);
    }
}
