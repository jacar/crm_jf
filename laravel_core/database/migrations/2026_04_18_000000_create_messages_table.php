<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('mensajes', function (Blueprint \) {
            \->id();
            \->foreignId('user_id')->constrained();
            \->text('contenido');
            \->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('mensajes');
    }
};
