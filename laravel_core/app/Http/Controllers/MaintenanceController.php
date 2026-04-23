<?php

namespace App\Http\Controllers;

use App\Models\Mantenimiento;
use App\Models\Vehiculo;
use Illuminate\Http\Request;

class MaintenanceController extends Controller
{
    public function index()
    {
        return Mantenimiento::with('vehiculo')->latest()->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'vehiculo_id' => 'required|exists:vehiculos,id',
            'tipo_mantenimiento' => 'required|string',
            'tipo_taller' => 'required|in:interno,externo',
            'km_realizado' => 'required|integer',
            'costo' => 'nullable|numeric',
            'fecha_mantenimiento' => 'nullable|date',
            'km_proximo_mantenimiento' => 'nullable|integer',
            'km_proxima_rotacion' => 'nullable|integer',
            'km_proximo_lavado' => 'nullable|integer',
        ]);

        $mantenimiento = Mantenimiento::create([
            'vehiculo_id' => $request->vehiculo_id,
            'tipo_mantenimiento' => $request->tipo_mantenimiento,
            'tipo_taller' => $request->tipo_taller,
            'km_realizado' => $request->km_realizado,
            'costo' => $request->costo,
            'ruc_nit' => $request->ruc_nit,
            'notas' => $request->notas,
            'fecha_mantenimiento' => $request->fecha_mantenimiento ?: now(),
        ]);

        $vehiculo = Vehiculo::find($request->vehiculo_id);
        
        // Update vehicle thresholds if provided in the request
        if ($request->km_proximo_mantenimiento) {
            $vehiculo->km_proximo_mantenimiento = $request->km_proximo_mantenimiento;
        }
        if ($request->km_proxima_rotacion) {
            $vehiculo->km_proxima_rotacion = $request->km_proxima_rotacion;
        }
        if ($request->km_proximo_lavado) {
            $vehiculo->km_proximo_lavado = $request->km_proximo_lavado;
        }
        
        $vehiculo->save();

        return response()->json($mantenimiento, 201);
    }
}
