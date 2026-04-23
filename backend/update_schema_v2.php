<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

try {
    Schema::table('vehiculos', function (Blueprint $table) {
        if (!Schema::hasColumn('vehiculos', 'has_gps')) {
            $table->boolean('has_gps')->default(false);
        }
        if (!Schema::hasColumn('vehiculos', 'has_starlink')) {
            $table->boolean('has_starlink')->default(false);
        }
        if (!Schema::hasColumn('vehiculos', 'has_capta_huellas')) {
            $table->boolean('has_capta_huellas')->default(false);
        }
        if (!Schema::hasColumn('vehiculos', 'observaciones')) {
            $table->text('observaciones')->nullable();
        }
        if (!Schema::hasColumn('vehiculos', 'serial_motor')) {
            $table->string('serial_motor')->nullable();
        }
        if (!Schema::hasColumn('vehiculos', 'n_chasis')) {
            $table->string('n_chasis')->nullable();
        }
    });
    echo "✅ Schema updated with device flags and observation fields.";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage();
}
