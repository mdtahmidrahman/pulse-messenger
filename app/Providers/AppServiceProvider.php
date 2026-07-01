<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use NotificationChannels\WebPush\Events\NotificationSent;
use NotificationChannels\WebPush\Events\NotificationFailed;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Ensure OpenSSL can find openssl.cnf in XAMPP Windows environment
        if (!getenv('OPENSSL_CONF')) {
            putenv('OPENSSL_CONF=d:\Installed_Programs\xampp\apache\conf\openssl.cnf');
        }

// Listen for WebPush events to debug delivery reports
if (config('app.debug')) {
    Event::listen(NotificationSent::class, function (NotificationSent $event) {
        Log::info('WebPush NotificationSent report:', json_decode(json_encode($event->report), true));
    });

    Event::listen(NotificationFailed::class, function (NotificationFailed $event) {
        Log::error('WebPush NotificationFailed report:', json_decode(json_encode($event->report), true));
    });
}
    }
}
