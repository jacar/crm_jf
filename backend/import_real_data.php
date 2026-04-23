<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Vehiculo;

$jsonData = file_get_contents('vehicles_data.json');
$vehicles = json_decode($jsonData, true);

$count = 0;
foreach ($vehicles as $v) {
    Vehiculo::updateOrCreate(
        ['placa' => $v['placa']],
        [
            'n_interno' => $v['n_interno'],
            'modelo' => $v['modelo'],
            'tipo' => $v['tipo'],
            'marca' => $v['marca'],
            'propietario' => $v['propietario'],
            'combustible' => $v['combustible'],
            'empresa' => $v['empresa'],
            'fecha_vencimiento_poliza' => $v['fecha_vencimiento_poliza'],
            'fecha_vencimiento_roct' => $v['fecha_vencimiento_roct'],
            'fecha_vencimiento_impuesto' => $v['fecha_vencimiento_impuesto'],
            'sede_id' => 1,
            'km_actual' => rand(0, 15000), // Random KM to trigger some alerts for demo
            'km_proximo_mantenimiento' => 5000,
            'km_proximo_aceite' => 5000,
            'km_proximo_filtro_aire' => 10000,
            'km_proximo_filtro_combustible' => 5000,
            'km_proxima_rotacion' => 10000,
            'km_proximo_lavado' => 2000
        ]
    );
    $count++;
}

echo "✅ Importados $count vehículos con datos reales de la Corporación.";
