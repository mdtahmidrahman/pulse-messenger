<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class TestUsersSeeder extends Seeder
{
    public function run(): void
    {
        // Admin User
        User::updateOrCreate(
            ['email' => 'admin@user.com'],
            [
                'name' => 'Admin User',
                'email_verified_at' => Carbon::now(),
                'password' => Hash::make('12345678'),
                'is_admin' => true,
                'approved_at' => Carbon::now(),
            ]
        );

        // Normal User
        User::updateOrCreate(
            ['email' => 'normal@user.com'],
            [
                'name' => 'Normal User',
                'email_verified_at' => Carbon::now(),
                'password' => Hash::make('12345678'),
                'is_admin' => false,
                'approved_at' => Carbon::now(),
            ]
        );
        
        $this->command->info('Test users created successfully!');
    }
}
