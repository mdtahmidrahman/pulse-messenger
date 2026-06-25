<?php
// Lightweight storage file server for shared hosting
// Handles /storage/ requests directly, bypassing Laravel boot overhead for faster load times.

$path = $_GET['path'] ?? '';

// Sanitize path to prevent directory traversal
$path = str_replace(['..', '\\'], ['', '/'], $path);
$path = ltrim($path, '/');

// Determine base storage path dynamically
if (is_dir(__DIR__ . '/pulse-core')) {
    // Shared hosting structure: core is inside htdocs/pulse-core/
    $storagePath = __DIR__ . '/pulse-core/storage/app/public';
} else {
    // Standard local Laravel structure: core is parallel to public/
    $storagePath = __DIR__ . '/../storage/app/public';
}

$filePath = $storagePath . '/' . $path;

if (empty($path) || !file_exists($filePath) || !is_file($filePath)) {
    header("HTTP/1.1 404 Not Found");
    echo "404 Not Found";
    exit;
}

// Serve the file with proper content-type
$mime = @mime_content_type($filePath);
if (!$mime) {
    $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
    $mimes = [
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png'  => 'image/png',
        'gif'  => 'image/gif',
        'webp' => 'image/webp',
        'svg'  => 'image/svg+xml',
        'mp4'  => 'video/mp4',
        'pdf'  => 'application/pdf',
        'zip'  => 'application/zip',
    ];
    $mime = $mimes[$ext] ?? 'application/octet-stream';
}

header("Content-Type: " . $mime);
header("Content-Length: " . filesize($filePath));
header("X-Storage-Source: Custom PHP Handler");
readfile($filePath);
exit;
