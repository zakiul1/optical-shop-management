<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->firstOrCreate(
            ['email' => 'admin@optical.test'],
            [
                'name' => 'Shop Admin',
                'phone' => '01700000000',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'is_active' => true,
            ]
        );

        collect([
            ['name' => 'Medicine', 'type' => 'medicine'],
            ['name' => 'Eye Drop', 'type' => 'medicine'],
            ['name' => 'Eye Ointment', 'type' => 'medicine'],
            ['name' => 'Glass', 'type' => 'glass'],
            ['name' => 'Frame', 'type' => 'glass'],
            ['name' => 'Lens', 'type' => 'glass'],
            ['name' => 'Sunglass', 'type' => 'glass'],
            ['name' => 'Reading Glass', 'type' => 'glass'],
        ])->each(function (array $category): void {
            Category::query()->firstOrCreate(
                ['slug' => Str::slug($category['name'])],
                [
                    'name' => $category['name'],
                    'type' => $category['type'],
                    'is_active' => true,
                ]
            );
        });
    }
}
