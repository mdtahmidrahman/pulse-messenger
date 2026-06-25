<?php
// Simple storage diagnostics script for shared hosting

header('Content-Type: text/plain');

echo "=== STORAGE DIAGNOSTICS ===\n\n";

$basePath = realpath(__DIR__ . '/../pulse-core');
if (!$basePath) {
    echo "ERROR: Could not resolve base path to pulse-core.\n";
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
