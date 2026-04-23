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
        'km_proxima_rotacion',
        'km_proximo_lavado',
        'estado',
        'sede_id',
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
