<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

try {
    Schema::table('vehiculos', function (Blueprint $table) {
        // KM based alerts
        if (!Schema::hasColumn('vehiculos', 'km_proximo_aceite')) {
            $table->integer('km_proximo_aceite')->default(5000);
        }
        if (!Schema::hasColumn('vehiculos', 'km_proximo_filtro_aire')) {
            $table->integer('km_proximo_filtro_aire')->default(10000);
        }
        if (!Schema::hasColumn('vehiculos', 'km_proximo_filtro_combustible')) {
            $table->integer('km_proximo_filtro_combustible')->default(5000);
        }
        if (!Schema::hasColumn('vehiculos', 'km_proxima_rotacion')) {
            $table->integer('km_proxima_rotacion')->default(10000);
        }
        if (!Schema::hasColumn('vehiculos', 'km_proximo_lavado')) {
            $table->integer('km_proximo_lavado')->default(2000);
        }
        if (!Schema::hasColumn('vehiculos', 'km_proximas_correas')) {
            $table->integer('km_proximas_correas')->default(50000);
        }
        if (!Schema::hasColumn('vehiculos', 'km_proximas_pastillas')) {
            $table->integer('km_proximas_pastillas')->default(20000);
        }

        // Date based alerts
        if (!Schema::hasColumn('vehiculos', 'fecha_vencimiento_poliza')) {
            $table->date('fecha_vencimiento_poliza')->nullable();
        }
        if (!Schema::hasColumn('vehiculos', 'fecha_vencimiento_roct')) {
            $table->date('fecha_vencimiento_roct')->nullable();
        }
        if (!Schema::hasColumn('vehiculos', 'fecha_vencimiento_impuesto')) {
            $table->date('fecha_vencimiento_impuesto')->nullable();
        }
        if (!Schema::hasColumn('vehiculos', 'fecha_vencimiento_bateria')) {
            $table->date('fecha_vencimiento_bateria')->nullable();
        }
        
        // Additional info
        if (!Schema::hasColumn('vehiculos', 'propietario')) {
            $table->string('propietario')->nullable();
        }
        if (!Schema::hasColumn('vehiculos', 'combustible')) {
            $table->string('combustible')->nullable();
        }
        if (!Schema::hasColumn('vehiculos', 'n_interno')) {
            $table->string('n_interno')->nullable();
        }
        if (!Schema::hasColumn('vehiculos', 'tipo')) {
            $table->string('tipo')->nullable();
        }
        if (!Schema::hasColumn('vehiculos', 'empresa')) {
            $table->string('empresa')->nullable();
        }
    });
    echo "✅ Tabla vehiculos actualizada con nuevas columnas de alerta.";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage();
}
