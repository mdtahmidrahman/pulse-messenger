<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class AdminUserSeeder extends Seeder
{
    /**
     * Create an admin user from environment variables.
     * This seeder is safe to run in production.
     */
    public function run(): void
    {
        $email = env('ADMIN_EMAIL');
        $password = env('ADMIN_PASSWORD');
        $name = env('ADMIN_NAME', 'Admin');

        if (empty($email) || empty($password)) {
            $this->command->warn('ADMIN_EMAIL or ADMIN_PASSWORD not set. Skipping admin user creation.');
            return;
        }

        User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'email_verified_at' => Carbon::now(),
                'password' => Hash::make($password),
                'is_admin' => true,
            ]
        );

        $this->command->info("Admin user '{$email}' created or updated.");
    }
}
