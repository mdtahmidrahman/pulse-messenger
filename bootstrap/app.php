<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\AdminUser;
use App\Http\Middleware\CheckBlockedUser;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        // channels loaded in BroadcastServiceProvider to avoid auto-registering broadcast routes
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Trust all proxies (Render terminates SSL at load balancer)
        $middleware->trustProxies(at: '*');

        // Exclude broadcasting auth from CSRF verification
        $middleware->validateCsrfTokens(except: [
            'broadcasting/auth',
        ]);

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            CheckBlockedUser::class,
        ]);

        $middleware->alias([
            'admin' => AdminUser::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e, \Illuminate\Http\Request $request) {
            if ($request->is('api/*')) {
                return null;
            }

            return \Inertia\Inertia::render('Error', [
                'status' => 404,
            ])->toResponse($request)->setStatusCode(404);
        });
    })->create();
