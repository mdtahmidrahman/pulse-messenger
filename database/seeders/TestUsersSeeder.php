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
        // User 1
        User::updateOrCreate(
            ['email' => 'user1@user.com'],
            [
                'name' => 'User 1',
                'email_verified_at' => Carbon::now(),
                'password' => Hash::make('12345678'),
                'is_admin' => false,
                'approved_at' => Carbon::now(),
            ]
        );

        // User 2
        User::updateOrCreate(
            ['email' => 'user2@user.com'],
            [
                'name' => 'User 2',
                'email_verified_at' => Carbon::now(),
                'password' => Hash::make('12345678'),
                'is_admin' => false,
                'approved_at' => Carbon::now(),
            ]
        );
        
        $this->command->info('Test users created successfully!');
    }
}
