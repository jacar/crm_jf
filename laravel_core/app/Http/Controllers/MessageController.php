<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MessageController extends Controller
{
    public function index()
    {
        try {
            // Ensure table exists
            if (!Schema::hasTable('mensajes')) {
                DB::statement("
                    CREATE TABLE IF NOT EXISTS mensajes (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        user_id BIGINT UNSIGNED NOT NULL,
                        contenido TEXT NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )
                ");
            }

            // Check if users table has 'cargo' column
            $hasCargo = Schema::hasColumn('users', 'cargo');
            
            $query = DB::table('mensajes')
                ->join('users', 'mensajes.user_id', '=', 'users.id')
                ->select('mensajes.*', 'users.name as user_name');
            
            if ($hasCargo) {
                $query->addSelect('users.cargo as user_cargo');
            } else {
                $query->selectRaw("'Equipo' as user_cargo");
            }
            
            return $query
                ->orderBy('mensajes.created_at', 'asc')
                ->latest('mensajes.created_at')
                ->take(50)
                ->get()
                ->sortBy('created_at')
                ->values();

        } catch (\Exception $e) {
            return response()->json([], 200);
        }
    }

    public function store(Request $request)
    {
        $request->validate(['contenido' => 'required|string|max:1000']);
        
        // Get user ID from auth or fallback
        $userId = 1;
        if ($request->user()) {
            $userId = $request->user()->id;
        } elseif ($request->header('X-User-Id')) {
            $userId = (int) $request->header('X-User-Id');
        }

        try {
            // Ensure table exists
            if (!Schema::hasTable('mensajes')) {
                DB::statement("
                    CREATE TABLE IF NOT EXISTS mensajes (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        user_id BIGINT UNSIGNED NOT NULL,
                        contenido TEXT NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )
                ");
            }

            $id = DB::table('mensajes')->insertGetId([
                'user_id' => $userId,
                'contenido' => $request->contenido,
                'created_at' => now(),
            ]);

            // Return the message with user info
            $userName = DB::table('users')->where('id', $userId)->value('name') ?? 'Usuario';

            return response()->json([
                'id' => $id, 
                'contenido' => $request->contenido,
                'user_id' => $userId,
                'user_name' => $userName,
                'user_cargo' => 'Equipo',
                'created_at' => now()->toISOString(),
                'message' => 'Enviado'
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al enviar mensaje: ' . $e->getMessage()], 500);
        }
    }
}
