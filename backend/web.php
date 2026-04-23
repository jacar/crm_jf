<?php
use Illuminate\Support\Facades\Route;

Route::any('{any}', function () {
    $path = public_path('index.html');
    if (file_exists($path)) {
        return response()->file($path, [
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0'
        ]);
    }
    return "Error: index.html no encontrado en " . $path;
})->where('any', '.*');
