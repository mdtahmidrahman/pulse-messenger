<?php
// Simple storage diagnostics script for shared hosting

header('Content-Type: text/plain');

echo "=== STORAGE DIAGNOSTICS ===\n\n";

$basePath = realpath(__DIR__ . '/pulse-core');
if (!$basePath) {
    echo "ERROR: Could not resolve base path to pulse-core (tried " . __DIR__ . "/pulse-core).\n";
    exit;
}

echo "Base Path: " . $basePath . "\n";

$storagePath = $basePath . '/storage/app/public';
echo "Storage Public Path: " . $storagePath . "\n";
echo "Exists: " . (file_exists($storagePath) ? 'YES' : 'NO') . "\n";
echo "Is Directory: " . (is_dir($storagePath) ? 'YES' : 'NO') . "\n";
echo "Is Writable: " . (is_writable($storagePath) ? 'YES' : 'NO') . "\n\n";

// Check for bootstrap/cache files
$cachePath = $basePath . '/bootstrap/cache';
echo "=== BOOTSTRAP CACHE CHECK ===\n";
if (file_exists($cachePath)) {
    $files = scandir($cachePath);
    foreach ($files as $file) {
        if ($file !== '.' && $file !== '..') {
            echo " - " . $file . " (" . filesize($cachePath . '/' . $file) . " bytes)\n";
        }
    }
} else {
    echo "Cache path does not exist.\n";
}
echo "\n";

// List contents of storage/app/public/
echo "=== PUBLIC STORAGE CONTENTS ===\n";
if (file_exists($storagePath) && is_dir($storagePath)) {
    listDirectory($storagePath);
} else {
    echo "Cannot read storage public directory.\n";
}

function listDirectory($dir, $prefix = '') {
    $files = scandir($dir);
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') continue;
        
        $path = $dir . '/' . $file;
        if (is_dir($path)) {
            echo $prefix . "[DIR] " . $file . "\n";
            listDirectory($path, $prefix . "  ");
        } else {
            echo $prefix . "[FILE] " . $file . " (" . filesize($path) . " bytes)\n";
        }
    }
}

// Boot Laravel to test configurations
echo "\n=== LARAVEL CONFIGURATION CHECK ===\n";
try {
    require $basePath . '/vendor/autoload.php';
    
    // Create and bootstrap the application
    $app = require_once $basePath . '/bootstrap/app.php';
    
    // We need to resolve the console kernel to bootstrap the application components
    $kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();

    echo "Laravel Version: " . app()->version() . "\n";
    echo "Filesystem Default Disk: " . config('filesystems.default') . "\n";
    
    $publicDisk = config('filesystems.disks.public');
    echo "Public Disk Config:\n";
    echo " - Driver: " . ($publicDisk['driver'] ?? 'N/A') . "\n";
    echo " - Root: " . ($publicDisk['root'] ?? 'N/A') . "\n";
    echo " - URL: " . ($publicDisk['url'] ?? 'N/A') . "\n";
    
    $cloudinaryDisk = config('filesystems.disks.cloudinary');
    echo "Cloudinary Disk Config:\n";
    echo " - Driver: " . ($cloudinaryDisk['driver'] ?? 'N/A') . "\n";
    
    $cloudinaryUrl = $cloudinaryDisk['url'] ?? null;
    if ($cloudinaryUrl) {
        $maskedUrl = substr($cloudinaryUrl, 0, 20) . '...' . substr($cloudinaryUrl, -10);
        echo " - URL: " . $maskedUrl . "\n";
    } else {
        echo " - URL: NOT SET\n";
    }
    
    echo "Raw ENV CLOUDINARY_URL: ";
    $rawEnv = env('CLOUDINARY_URL');
    if ($rawEnv) {
        echo substr($rawEnv, 0, 20) . '...' . substr($rawEnv, -10) . "\n";
    } else {
        echo "NOT SET\n";
    }

} catch (\Exception $e) {
    echo "ERROR Booting Laravel / Initializing Config: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
}

