<?php

namespace App\Http\Controllers;

use App\Models\Vehiculo;
use App\Models\LecturaKm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\AlertaMantenimiento;
use Illuminate\Support\Facades\DB;

class VehiculoController extends Controller
{
    public function index()
    {
        return Vehiculo::with('sede')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'placa' => 'required|unique:vehiculos',
            'marca' => 'required',
            'modelo' => 'required',
            'sede_id' => 'required|exists:sedes,id',
            'n_interno' => 'nullable|string',
            'propietario' => 'nullable|string',
            'combustible' => 'nullable|string',
            'tipo' => 'nullable|string',
            'empresa' => 'nullable|string',
            'km_proximo_mantenimiento' => 'nullable|integer',
            'fecha_vencimiento_poliza' => 'nullable|date',
            'fecha_vencimiento_roct' => 'nullable|date',
            'fecha_vencimiento_impuesto' => 'nullable|date',
            'fecha_vencimiento_bateria' => 'nullable|date',
        ]);

        return Vehiculo::create($validated);
    }

    public function update(Request $request, $id)
    {
        $vehiculo = Vehiculo::findOrFail($id);
        $validated = $request->validate([
            'placa' => 'required|unique:vehiculos,placa,'.$id,
            'marca' => 'required',
            'modelo' => 'required',
            'sede_id' => 'required|exists:sedes,id',
            'n_interno' => 'nullable|string',
            'propietario' => 'nullable|string',
            'combustible' => 'nullable|string',
            'tipo' => 'nullable|string',
            'empresa' => 'nullable|string',
            'km_proximo_mantenimiento' => 'nullable|integer',
            'fecha_vencimiento_poliza' => 'nullable|date',
            'fecha_vencimiento_roct' => 'nullable|date',
            'fecha_vencimiento_impuesto' => 'nullable|date',
            'fecha_vencimiento_bateria' => 'nullable|date',
        ]);

        $vehiculo->update($validated);
        return $vehiculo;
    }

    public function destroy($id)
    {
        $vehiculo = Vehiculo::findOrFail($id);
        $vehiculo->delete();
        return response()->json(['message' => 'Vehículo eliminado correctamente']);
    }

    public function history($id)
    {
        $vehiculo = Vehiculo::findOrFail($id);
        
        $mantenimientos = \App\Models\Mantenimiento::where('vehiculo_id', $id)
                            ->orderBy('fecha_mantenimiento', 'desc')
                            ->get();
                            
        $lecturas = \App\Models\LecturaKm::where('vehiculo_id', $id)
                        ->orderBy('created_at', 'desc')
                        ->limit(20)
                        ->get();

        return response()->json([
            'vehiculo' => $vehiculo,
            'mantenimientos' => $mantenimientos,
            'lecturas' => $lecturas
        ]);
    }

    public function updateKm(Request $request, $id)
    {
        $request->validate([
            'km_leido' => 'required|integer|min:0',
        ]);

        $vehiculo = Vehiculo::findOrFail($id);
        
        LecturaKm::create([
            'vehiculo_id' => $vehiculo->id,
            'user_id' => $request->user() ? $request->user()->id : 1,
            'km_leido' => $request->km_leido
        ]);

        $vehiculo->km_actual = $request->km_leido;
        $mantenimientosRealizados = [];

        // Dynamic Resets
        $resets = [
            'realizo_mantenimiento' => ['km_proximo_mantenimiento', 5000, 'Mantenimiento General'],
            'realizo_aceite' => ['km_proximo_aceite', 5000, 'Cambio de Aceite'],
            'realizo_filtro_aire' => ['km_proximo_filtro_aire', 10000, 'Filtro Aire'],
            'realizo_filtro_combustible' => ['km_proximo_filtro_combustible', 5000, 'Filtro Combustible'],
            'realizo_rotacion' => ['km_proxima_rotacion', 10000, 'Rotación de Cauchos'],
            'realizo_lavado' => ['km_proximo_lavado', 2000, 'Lavado Motor y Chasis'],
            'realizo_correas' => ['km_proximas_correas', 50000, 'Cambio de Correas'],
            'realizo_pastillas' => ['km_proximas_pastillas', 20000, 'Bandas/Pastillas Freno']
        ];

        foreach ($resets as $input => $config) {
            if ($request->$input) {
                $column = $config[0];
                $interval = $config[1];
                $label = $config[2];

                $vehiculo->$column = $vehiculo->km_actual + $interval;
                
                \App\Models\Mantenimiento::create([
                    'vehiculo_id' => $vehiculo->id,
                    'tipo_mantenimiento' => $label,
                    'tipo_taller' => 'interno',
                    'fecha_mantenimiento' => now(),
                    'notas' => 'Registrado automáticamente en toma de KM'
                ]);
                $mantenimientosRealizados[] = $label;
            }
        }

        $vehiculo->save();

        // 3. Verificar Alertas Extendidas
        $alertas = $this->checkVehicleAlerts($vehiculo);

        if (count($alertas) > 0) {
             try {
                Mail::to('ingenieria@webcincodev.com')->send(new AlertaMantenimiento($vehiculo));
             } catch(\Exception $e) { }

            return response()->json([
                'status' => 'alert',
                'message' => '¡Vehículo con alertas pendientes: ' . implode(', ', $alertas) . '!',
                'mantenimientos_registrados' => $mantenimientosRealizados,
                'data' => $vehiculo,
                'alert' => true
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => count($mantenimientosRealizados) > 0 
                ? 'Registros completados: ' . implode(', ', $mantenimientosRealizados)
                : 'Kilometraje actualizado.',
            'data' => $vehiculo,
            'alert' => false
        ]);
    }

    private function checkVehicleAlerts($v)
    {
        $alertas = [];
        $km = $v->km_actual;
        
        // KM Alerts
        if ($km >= ($v->km_proximo_mantenimiento ?: 5000)) $alertas[] = 'Mantenimiento General';
        if ($km >= ($v->km_proximo_aceite ?: 5000)) $alertas[] = 'Aceite';
        if ($km >= ($v->km_proximo_filtro_aire ?: 10000)) $alertas[] = 'Filtro Aire';
        if ($km >= ($v->km_proximo_filtro_combustible ?: 5000)) $alertas[] = 'Filtro Combustible';
        if ($km >= ($v->km_proxima_rotacion ?: 10000)) $alertas[] = 'Rotación Cauchos';
        if ($km >= ($v->km_proximo_lavado ?: 2000)) $alertas[] = 'Lavado Chasis';
        if ($km >= ($v->km_proximas_correas ?: 50000)) $alertas[] = 'Correas';
        if ($km >= ($v->km_proximas_pastillas ?: 20000)) $alertas[] = 'Frenos';

        // Date Alerts
        $today = now();
        if ($v->fecha_vencimiento_poliza && $today->greaterThanOrEqualTo($v->fecha_vencimiento_poliza)) $alertas[] = 'Póliza Vencida';
        if ($v->fecha_vencimiento_roct && $today->greaterThanOrEqualTo($v->fecha_vencimiento_roct)) $alertas[] = 'ROCT Vencido';
        if ($v->fecha_vencimiento_impuesto && $today->greaterThanOrEqualTo($v->fecha_vencimiento_impuesto)) $alertas[] = 'Impuesto Vencido';
        if ($v->fecha_vencimiento_bateria && $today->greaterThanOrEqualTo($v->fecha_vencimiento_bateria)) $alertas[] = 'Batería Vencida';

        return $alertas;
    }

    public function stats()
    {
        $all = Vehiculo::all();
        $criticalCount = 0;
        foreach($all as $v) {
            if (count($this->checkVehicleAlerts($v)) > 0) $criticalCount++;
        }

        return response()->json([
            'totalVehicles' => $all->count(),
            'criticalAlerts' => $criticalCount,
            'upToDate' => $all->count() - $criticalCount,
            'monthlySpending' => \App\Models\Mantenimiento::whereMonth('fecha_mantenimiento', now()->month)->sum('costo')
        ]);
    }

    public function analytics()
    {
        $last6Months = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $last6Months[] = [
                'month' => $month->format('M'),
                'spending' => \App\Models\Mantenimiento::whereMonth('fecha_mantenimiento', $month->month)
                                ->whereYear('fecha_mantenimiento', $month->year)
                                ->sum('costo') ?: 0
            ];
        }

        $all = Vehiculo::all();
        $critical = 0; $warning = 0; $good = 0;
        
        foreach($all as $v) {
            $alertas = $this->checkVehicleAlerts($v);
            if (count($alertas) > 0) {
                $critical++;
            } else {
                // Warning logic: close to any KM limit (within 500km)
                $isWarning = false;
                $km = $v->km_actual;
                $checks = ['km_proximo_mantenimiento', 'km_proximo_aceite', 'km_proximo_filtro_aire', 'km_proximo_filtro_combustible', 'km_proxima_rotacion', 'km_proximo_lavado'];
                foreach($checks as $c) {
                    if ($v->$c && ($v->$c - $km) <= 500 && ($v->$c - $km) > 0) $isWarning = true;
                }
                if ($isWarning) $warning++; else $good++;
            }
        }

        return response()->json([
            'spendingTrend' => $last6Months,
            'healthStats' => ['critical' => $critical, 'warning' => $warning, 'good' => $good],
            'topMileage' => Vehiculo::orderBy('km_actual', 'desc')->limit(5)->get(['placa', 'km_actual']),
            'suggestions' => [
                'Hay ' . $critical . ' vehículos con alertas activas que requieren atención inmediata.',
                'Sugerencia: Revisar vencimientos de pólizas y ROCT para evitar multas.',
                'Los costos de mantenimiento preventivo son un 40% menores que los correctivos.'
            ]
        ]);
    }

    public function import(Request $request)
    {
        $request->validate(['file' => 'required|mimes:csv,txt']);

        $file = $request->file('file');
        $csvData = file_get_contents($file);
        $rows = array_map("str_getcsv", explode("\n", $csvData));
        $header = array_shift($rows);

        $imported = 0;
        foreach ($rows as $row) {
            if (count($row) >= 3) {
                $placa = trim($row[0]);
                if($placa != '') {
                    Vehiculo::updateOrCreate(
                        ['placa' => $placa],
                        [
                            'n_interno' => $row[1] ?? null,
                            'modelo' => $row[2] ?? 'Desconocido',
                            'tipo' => $row[3] ?? null,
                            'marca' => $row[4] ?? 'Desconocido',
                            'km_actual' => isset($row[5]) ? (int)$row[5] : 0,
                            'propietario' => $row[6] ?? null,
                            'empresa' => $row[7] ?? null,
                            'sede_id' => 1 // Default
                        ]
                    );
                    $imported++;
                }
            }
        }

        return response()->json(['message' => "$imported unidades cargadas.", 'imported' => $imported]);
    }
}
