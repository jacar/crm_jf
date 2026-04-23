<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehiculos', function (Blueprint $table) {
            $table->id();
            $table->string('placa')->unique();
            $table->string('marca');
            $table->string('modelo');
            $table->string('vin')->unique()->nullable();
            $table->integer('km_actual')->default(0);
            $table->integer('km_proximo_mantenimiento')->default(5000);
            $table->enum('estado', ['activo', 'taller', 'inactivo'])->default('activo');
            $table->foreignId('sede_id')->nullable();
            $table->timestamps();
        });

        Schema::create('mantenimientos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehiculo_id')->constrained()->onDelete('cascade');
            $table->string('tipo_mantenimiento');
            $table->enum('tipo_taller', ['interno', 'externo']);
            $table->decimal('costo', 10, 2)->nullable();
            $table->string('ruc_nit')->nullable();
            $table->string('factura_path')->nullable();
            $table->text('notas')->nullable();
            $table->date('fecha_mantenimiento');
            $table->timestamps();
        });

        Schema::create('lecturas_km', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehiculo_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id'); // Operador
            $table->integer('km_leido');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lecturas_km');
        Schema::dropIfExists('mantenimientos');
        Schema::dropIfExists('vehiculos');
    }
};
