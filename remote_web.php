<?php
use Illuminate\Support\Facades\Route;

Route::any('{any}', function () {
    $path = public_path('index.html');
        if (file_exists($path)) {
                return file_get_contents($path);
                    }
                        return "Error: index.html no encontrado en " . $path;
                        })->where('any', '.*');