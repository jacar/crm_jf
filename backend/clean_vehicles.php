<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    // Desactivar foreign keys temporalmente
    DB::statement('SET FOREIGN_KEY_CHECKS=0');
    
    $deleted_lecturas = DB::table('lecturas_km')->delete();
    echo "Lecturas KM eliminadas: $deleted_lecturas\n";
    
    $deleted_mant = DB::table('mantenimientos')->delete();
    echo "Mantenimientos eliminados: $deleted_mant\n";
    
    $deleted_vehicles = DB::table('vehiculos')->delete();
    echo "Vehículos eliminados: $deleted_vehicles\n";
    
    // Resetear auto-increment
    DB::statement('ALTER TABLE vehiculos AUTO_INCREMENT = 1');
    DB::statement('ALTER TABLE mantenimientos AUTO_INCREMENT = 1');
    DB::statement('ALTER TABLE lecturas_km AUTO_INCREMENT = 1');
    
    // Reactivar foreign keys
    DB::statement('SET FOREIGN_KEY_CHECKS=1');
    
    echo "\n✅ Base de datos limpia. Lista para importar nuevos vehículos.";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage();
}
