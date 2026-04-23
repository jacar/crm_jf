<?php

namespace App\Http\Controllers;

use App\Models\Vehiculo;
use App\Models\LecturaKm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\AlertaMantenimiento;

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
            'km_proximo_mantenimiento' => 'nullable|integer'
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
            'km_proximo_mantenimiento' => 'nullable|integer'
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

    /**
     * Actualiza el kilometraje y verifica alertas.
     */
    public function updateKm(Request $request, $id)
    {
        $request->validate([
            'km_leido' => 'required|integer|min:0',
        ]);

        $vehiculo = Vehiculo::findOrFail($id);
        
        // 1. Registrar lectura
        LecturaKm::create([
            'vehiculo_id' => $vehiculo->id,
            'user_id' => $request->user() ? $request->user()->id : 1,
            'km_leido' => $request->km_leido
        ]);

        // 2. Actualizar vehículo
        $vehiculo->km_actual = $request->km_leido;

        $mantenimientosRealizados = [];

        // Lógica de reseteo si se marcó que se hizo el servicio
        if ($request->realizo_mantenimiento) {
            $vehiculo->km_proximo_mantenimiento = $vehiculo->km_actual + 5000;
            \App\Models\Mantenimiento::create([
                'vehiculo_id' => $vehiculo->id,
                'tipo_mantenimiento' => 'Mantenimiento Preventivo (Aceite)',
                'tipo_taller' => 'interno',
                'fecha_mantenimiento' => now(),
                'notas' => 'Registrado por operador en toma de KM'
            ]);
            $mantenimientosRealizados[] = 'Cambio de Aceite';
        }

        if ($request->realizo_rotacion) {
            $vehiculo->km_proxima_rotacion = $vehiculo->km_actual + 10000;
            \App\Models\Mantenimiento::create([
                'vehiculo_id' => $vehiculo->id,
                'tipo_mantenimiento' => 'Rotación de Cauchos',
                'tipo_taller' => 'interno',
                'fecha_mantenimiento' => now(),
                'notas' => 'Registrado por operador en toma de KM'
            ]);
            $mantenimientosRealizados[] = 'Rotación de Cauchos';
        }

        if ($request->realizo_lavado) {
            $vehiculo->km_proximo_lavado = $vehiculo->km_actual + 2000;
            \App\Models\Mantenimiento::create([
                'vehiculo_id' => $vehiculo->id,
                'tipo_mantenimiento' => 'Lavado de Chasis',
                'tipo_taller' => 'interno',
                'fecha_mantenimiento' => now(),
                'notas' => 'Registrado por operador en toma de KM'
            ]);
            $mantenimientosRealizados[] = 'Lavado de Chasis';
        }

        $vehiculo->save();

        // 3. Verificar Alertas para respuesta
        $alertas = [];
        if ($vehiculo->km_actual >= $vehiculo->km_proximo_mantenimiento) $alertas[] = 'Mantenimiento General';
        if ($vehiculo->km_actual >= $vehiculo->km_proxima_rotacion) $alertas[] = 'Rotación de Cauchos';
        if ($vehiculo->km_actual >= $vehiculo->km_proximo_lavado) $alertas[] = 'Lavado de Chasis';

        if (count($alertas) > 0) {
             try {
                Mail::to('ingenieria@webcincodev.com')->send(new AlertaMantenimiento($vehiculo));
             } catch(\Exception $e) {
                \Log::error("Error enviando correo: " . $e->getMessage());
             }

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
                ? 'Kilometraje y mantenimientos (' . implode(', ', $mantenimientosRealizados) . ') registrados.'
                : 'Kilometraje actualizado correctamente.',
            'data' => $vehiculo,
            'alert' => false
        ]);
    }

    public function stats()
    {
        return response()->json([
            'totalVehicles' => Vehiculo::count(),
            'criticalAlerts' => Vehiculo::whereColumn('km_actual', '>=', 'km_proximo_mantenimiento')->count(),
            'upToDate' => Vehiculo::whereColumn('km_actual', '<', 'km_proximo_mantenimiento')->count(),
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

        $health = [
            'critical' => Vehiculo::whereColumn('km_actual', '>=', 'km_proximo_mantenimiento')->count(),
            'warning' => Vehiculo::whereRaw('km_proximo_mantenimiento - km_actual <= 500')
                            ->whereRaw('km_proximo_mantenimiento - km_actual > 0')->count(),
            'good' => Vehiculo::whereRaw('km_proximo_mantenimiento - km_actual > 500')->count()
        ];

        return response()->json([
            'spendingTrend' => $last6Months,
            'healthStats' => $health,
            'topMileage' => Vehiculo::orderBy('km_actual', 'desc')->limit(5)->get(['placa', 'km_actual']),
            'suggestions' => [
                'Renovar flota con más de 200,000 KM para reducir costos de correctivos.',
                'Incrementar frecuencia de preventivos en sede con mayor reporte de fallas.',
                'Digitalizar facturas de talleres externos para mejor auditoría fiscal.'
            ]
        ]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:csv,txt'
        ]);

        $file = $request->file('file');
        $csvData = file_get_contents($file);
        $rows = array_map("str_getcsv", explode("\n", $csvData));
        $header = array_shift($rows);

        $imported = 0;
        foreach ($rows as $row) {
            if (count($row) >= 4) { // Basic validation
                $placa = $row[0];
                if(trim($placa) != '') {
                    Vehiculo::updateOrCreate(
                        ['placa' => trim($placa)],
                        [
                            'marca' => trim($row[1]),
                            'modelo' => trim($row[2]),
                            'sede_id' => trim($row[3]) ?: null,
                            'km_actual' => isset($row[4]) ? (int)trim($row[4]) : 0,
                        ]
                    );
                    $imported++;
                }
            }
        }

        return response()->json(['message' => "$imported vehículos importados exitosamente.", 'imported' => $imported]);
    }
}
