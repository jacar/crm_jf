<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VehiculoController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\SedeController;

Route::get('/stats', [VehiculoController::class, 'stats']);
Route::get('/vehicles', [VehiculoController::class, 'index']);
Route::post('/vehicles', [VehiculoController::class, 'store']);
Route::post('/vehicles/import', [VehiculoController::class, 'import']);
Route::put('/vehicles/{id}', [VehiculoController::class, 'update']);
Route::delete('/vehicles/{id}', [VehiculoController::class, 'destroy']);
Route::get('/vehicles/{id}/history', [VehiculoController::class, 'history']);
Route::post('/vehicles/{id}/update-km', [VehiculoController::class, 'updateKm']);
Route::get('/reports/analytics', [VehiculoController::class, 'analytics']);

Route::get('/chat', [\App\Http\Controllers\MessageController::class, 'index']);
Route::post('/chat', [\App\Http\Controllers\MessageController::class, 'store']);

Route::get('/staff', [\App\Http\Controllers\TeamController::class, 'getStaff']);
Route::post('/staff', [\App\Http\Controllers\TeamController::class, 'storeUser']);
Route::get('/teams', [\App\Http\Controllers\TeamController::class, 'getTeams']);
Route::post('/teams', [\App\Http\Controllers\TeamController::class, 'createTeam']);
Route::put('/staff/{id}', [\App\Http\Controllers\TeamController::class, 'updateUser']);

Route::get('/documentos', [\App\Http\Controllers\DocumentController::class, 'index']);
Route::post('/documentos', [\App\Http\Controllers\DocumentController::class, 'store']);
Route::delete('/documentos/{id}', [\App\Http\Controllers\DocumentController::class, 'destroy']);

Route::get('/mantenimientos', [MaintenanceController::class, 'index']);
Route::post('/mantenimientos', [MaintenanceController::class, 'store']);

Route::get('/sedes', [SedeController::class, 'index']);
Route::post('/sedes', [SedeController::class, 'store']);
