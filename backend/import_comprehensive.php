<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\Sede;

set_time_limit(300);

// Clear data
DB::statement('SET FOREIGN_KEY_CHECKS=0;');
DB::table('mantenimientos')->truncate();
DB::table('lecturas_km')->truncate();
DB::table('vehiculos')->truncate();
DB::statement('SET FOREIGN_KEY_CHECKS=1;');

$jsonData = file_get_contents('vehicles_real_data.json');
$vehicles = json_decode($jsonData, true);

// Cache Sedes
$sedes = Sede::all()->pluck('id', 'nombre')->toArray();

$rows = [];
$now = now();

foreach ($vehicles as $v) {
    $sede_id = $sedes[$v['sede_nombre']] ?? ($sedes['BARCELONA'] ?? 1);
    
    $rows[] = [
        'placa' => $v['placa'],
        'n_interno' => $v['n_interno'] ?? null,
        'modelo' => $v['modelo'] ?? 'Desconocido',
        'tipo' => $v['tipo'] ?? null,
        'marca' => $v['marca'] ?? 'Desconocido',
        'propietario' => $v['propietario'] ?? null,
        'combustible' => $v['combustible'] ?? null,
        'empresa' => $v['empresa'] ?? 'Corporación JF',
        'fecha_vencimiento_poliza' => $v['fecha_vencimiento_poliza'] ?? null,
        'fecha_vencimiento_roct' => $v['fecha_vencimiento_roct'] ?? null,
        'fecha_vencimiento_impuesto' => $v['fecha_vencimiento_impuesto'] ?? null,
        'has_gps' => ($v['has_gps'] ?? false) ? 1 : 0,
        'has_starlink' => ($v['has_starlink'] ?? false) ? 1 : 0,
        'has_capta_huellas' => ($v['has_capta_huellas'] ?? false) ? 1 : 0,
        'observaciones' => $v['observaciones'] ?? null,
        'sede_id' => $sede_id,
        'km_actual' => 0,
        'km_proximo_mantenimiento' => 5000,
        'km_proximo_aceite' => 5000,
        'km_proximo_filtro_aire' => 10000,
        'km_proximo_filtro_combustible' => 5000,
        'km_proxima_rotacion' => 10000,
        'km_proximo_lavado' => 2000,
        'created_at' => $now,
        'updated_at' => $now
    ];
}

$chunks = array_chunk($rows, 100);
foreach ($chunks as $chunk) {
    DB::table('vehiculos')->insert($chunk);
}

echo "✅ Importación exitosa con Sedes reales: " . count($rows) . " unidades cargadas.";
