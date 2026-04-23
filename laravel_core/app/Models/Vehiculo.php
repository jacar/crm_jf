<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehiculo extends Model
{
    use HasFactory;

    protected $fillable = [
        'placa',
        'marca',
        'modelo',
        'vin',
        'km_actual',
        'km_proximo_mantenimiento',
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
        'n_interno',
        'tipo',
        'empresa',
        'estado',
        'sede_id',
    ];

    protected $casts = [
        'fecha_vencimiento_poliza' => 'date',
        'fecha_vencimiento_roct' => 'date',
        'fecha_vencimiento_impuesto' => 'date',
        'fecha_vencimiento_bateria' => 'date',
    ];

    public function mantenimientos()
    {
        return $this->hasMany(Mantenimiento::class);
    }

    public function lecturas()
    {
        return $this->hasMany(LecturaKm::class);
    }

    public function sede()
    {
        return $this->belongsTo(Sede::class);
    }
}
