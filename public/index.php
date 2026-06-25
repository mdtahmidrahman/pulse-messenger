<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine the paths based on whether we are in a split directory structure (shared hosting)
if (file_exists(__DIR__.'/../pulse-core/vendor/autoload.php')) {
    // Shared hosting structure A: core is outside htdocs/
    if (file_exists($maintenance = __DIR__.'/../pulse-core/storage/framework/maintenance.php')) {
        require $maintenance;
    }
    require __DIR__.'/../pulse-core/vendor/autoload.php';
    /** @var Application $app */
    $app = require_once __DIR__.'/../pulse-core/bootstrap/app.php';
    // Set the public path to the current htdocs directory
    $app->usePublicPath(__DIR__);
} elseif (file_exists(__DIR__.'/pulse-core/vendor/autoload.php')) {
    // Shared hosting structure B: core is inside htdocs/pulse-core/ (for filemanager.ai restriction)
    if (file_exists($maintenance = __DIR__.'/pulse-core/storage/framework/maintenance.php')) {
        require $maintenance;
    }
    require __DIR__.'/pulse-core/vendor/autoload.php';
    /** @var Application $app */
    $app = require_once __DIR__.'/pulse-core/bootstrap/app.php';
    // Set the public path to the current htdocs directory
    $app->usePublicPath(__DIR__);
} else {
    // Standard local Laravel structure
    if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
        require $maintenance;
    }
    require __DIR__.'/../vendor/autoload.php';
    /** @var Application $app */
    $app = require_once __DIR__.'/../bootstrap/app.php';
}

$app->handleRequest(Request::capture());

