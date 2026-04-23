<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Sede;
use Illuminate\Support\Facades\DB;

$sedes = [
    'BARCELONA', 'CARACAS', 'MARACAIBO', 'VALENCIA', 'EL TIGRE', 
    'PARIAGUAN', 'PIRITU', 'COLINAS', 'PARTICULAR', 'ALQUILADO', 'VENDIDO'
];

foreach ($sedes as $s) {
    Sede::firstOrCreate(['nombre' => $s], ['ubicacion' => 'Venezuela']);
}

echo "✅ Sedes sincronizadas.";
