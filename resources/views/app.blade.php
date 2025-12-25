<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" data-theme="dark" class="dark">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Pulse Messenger') }}</title>

        <!-- Favicon -->
        <link rel="icon" type="image/png" href="/favicon.png">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        <script>
            window.ReverbConfig = {!! json_encode([
                'key' => env('REVERB_APP_KEY'),
                'host' => env('VITE_REVERB_HOST', parse_url(env('APP_URL'), PHP_URL_HOST)),
                'port' => env('VITE_REVERB_PORT', 443),
                'scheme' => env('VITE_REVERB_SCHEME', 'https'),
            ]) !!};
        </script>
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
