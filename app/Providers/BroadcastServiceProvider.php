<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class BroadcastServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Custom broadcasting auth route is defined in routes/web.php
        // This just loads the channel definitions
        require base_path('routes/channels.php');
    }
}
