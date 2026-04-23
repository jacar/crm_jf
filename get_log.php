<?php
$logFile = __DIR__.'/../storage/logs/laravel.log';
if (file_exists($logFile)) {
    // Get last 50 lines
    $file = file($logFile);
    $lines = array_slice($file, -50);
    echo implode("", $lines);
} else {
    echo "No log file found.";
}
