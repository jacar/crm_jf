<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vehiculos', function (Blueprint $table) {
            // KM based alerts
            if (!Schema::hasColumn('vehiculos', 'km_proximo_aceite')) {
                $table->integer('km_proximo_aceite')->default(5000)->after('km_proximo_mantenimiento');
            }
            if (!Schema::hasColumn('vehiculos', 'km_proximo_filtro_aire')) {
                $table->integer('km_proximo_filtro_aire')->default(10000)->after('km_proximo_aceite');
            }
            if (!Schema::hasColumn('vehiculos', 'km_proximo_filtro_combustible')) {
                $table->integer('km_proximo_filtro_combustible')->default(5000)->after('km_proximo_filtro_aire');
            }
            if (!Schema::hasColumn('vehiculos', 'km_proxima_rotacion')) {
                $table->integer('km_proxima_rotacion')->default(10000)->after('km_proximo_filtro_combustible');
            }
            if (!Schema::hasColumn('vehiculos', 'km_proximo_lavado')) {
                $table->integer('km_proximo_lavado')->default(2000)->after('km_proxima_rotacion');
            }
            if (!Schema::hasColumn('vehiculos', 'km_proximas_correas')) {
                $table->integer('km_proximas_correas')->default(50000)->after('km_proximo_lavado');
            }
            if (!Schema::hasColumn('vehiculos', 'km_proximas_pastillas')) {
                $table->integer('km_proximas_pastillas')->default(20000)->after('km_proximas_correas');
            }

            // Date based alerts
            if (!Schema::hasColumn('vehiculos', 'fecha_vencimiento_poliza')) {
                $table->date('fecha_vencimiento_poliza')->nullable()->after('km_proximas_pastillas');
            }
            if (!Schema::hasColumn('vehiculos', 'fecha_vencimiento_roct')) {
                $table->date('fecha_vencimiento_roct')->nullable()->after('fecha_vencimiento_poliza');
            }
            if (!Schema::hasColumn('vehiculos', 'fecha_vencimiento_impuesto')) {
                $table->date('fecha_vencimiento_impuesto')->nullable()->after('fecha_vencimiento_roct');
            }
            if (!Schema::hasColumn('vehiculos', 'fecha_vencimiento_bateria')) {
                $table->date('fecha_vencimiento_bateria')->nullable()->after('fecha_vencimiento_impuesto');
            }
            
            // Additional info from Excel
            if (!Schema::hasColumn('vehiculos', 'propietario')) {
                $table->string('propietario')->nullable();
            }
            if (!Schema::hasColumn('vehiculos', 'combustible')) {
                $table->string('combustible')->nullable();
            }
            if (!Schema::hasColumn('vehiculos', 'n_interno')) {
                $table->string('n_interno')->nullable(); // Para el campo "Nº" del excel
            }
        });
    }

    public function down(): void
    {
        Schema::table('vehiculos', function (Blueprint $table) {
            $table->dropColumn([
                'km_proximo_aceite',
                'km_proximo_filtro_aire',
                'km_proximo_filtro_combustible',
                'km_proxima_rotacion',
                'km_proximo_lavado',
                'km_proximas_correas',
                'km_proximas_pastillas',
                'fecha_vencimiento_poliza',
                'fecha_vencimiento_roct',
                'fecha_vencimiento_impuesto',
                'fecha_vencimiento_bateria',
                'propietario',
                'combustible',
                'n_interno'
            ]);
        });
    }
};
