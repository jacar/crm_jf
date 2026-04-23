<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LecturaKm extends Model
{
    use HasFactory;

    protected $table = 'lecturas_km';

    protected $fillable = [
        'vehiculo_id',
        'user_id',
        'km_leido',
    ];

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class);
    }

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }
}
