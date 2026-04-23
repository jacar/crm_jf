<?php
define('LARAVEL_START', microtime(true));
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

try {
    \Artisan::call('migrate', ['--force' => true]);
    echo "Migraciones ejecutadas correctamente.<br>";
    echo nl2br(\Artisan::output());
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage();
}
