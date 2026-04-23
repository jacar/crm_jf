<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Message; // I should create the model too, or use DB

class MessageController extends Controller
{
    public function index()
    {
        return DB::table('mensajes')
            ->join('users', 'mensajes.user_id', '=', 'users.id')
            ->select('mensajes.*', 'users.name as user_name', 'users.cargo as user_cargo')
            ->orderBy('mensajes.created_at', 'asc')
            ->get();
    }

    public function store(Request $request)
    {
        $request->validate(['contenido' => 'required']);
        
        $id = DB::table('mensajes')->insertGetId([
            'user_id' => $request->user()->id,
            'contenido' => $request->contenido,
            'created_at' => now(),
        ]);

        return response()->json(['id' => $id, 'message' => 'Enviado']);
    }
}
