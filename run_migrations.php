<?php
define('LARAVEL_START', microtime(true));
require __DIR__.'/../vendor/autoload.php';
\ = require_once __DIR__.'/../bootstrap/app.php';
\ = \->make(Illuminate\Contracts\Console\Kernel::class);

echo "<pre>";
\ = \->call('migrate', ['--force' => true]);
echo \->output();
echo "\nExit Code: " . \;
