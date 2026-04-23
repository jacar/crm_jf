<?php
define('LARAVEL_START', microtime(true));
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;

try {
    if (Schema::hasColumn('sedes', 'direccion')) {
        Schema::table('sedes', function (Blueprint $table) {
            $table->renameColumn('direccion', 'ubicacion');
        });
        echo "Columna direccion renombrada a ubicacion con exito.<br>";
    } else {
        echo "La columna direccion no existe.<br>";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage();
}
