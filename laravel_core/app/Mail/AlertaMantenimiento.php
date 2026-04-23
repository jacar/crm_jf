<?php

namespace App\Mail;

use App\Models\Vehiculo;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AlertaMantenimiento extends Mailable
{
    use Queueable, SerializesModels;

    public $vehiculo;

    public function __construct(Vehiculo $vehiculo)
    {
        $this->vehiculo = $vehiculo;
    }

    public function build()
    {
        return $this->subject('🚨 ALERTA ROJA: Mantenimiento Requerido - ' . $this->vehiculo->placa)
                    ->view('emails.alerta_mantenimiento')
                    ->with([
                        'placa' => $this->vehiculo->placa,
                        'km' => $this->vehiculo->km_actual,
                        'limite' => $this->vehiculo->km_proximo_mantenimiento,
                    ]);
    }
}
