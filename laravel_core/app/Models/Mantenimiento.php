<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mantenimiento extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehiculo_id',
        'tipo_mantenimiento',
        'tipo_taller',
        'km_realizado',
        'costo',
        'ruc_nit',
        'factura_path',
        'notas',
        'fecha_mantenimiento',
    ];

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class);
    }
}
