<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class TeamController extends Controller
{
    public function getStaff()
    {
        return DB::table('users')
            ->leftJoin('equipos', 'users.equipo_id', '=', 'equipos.id')
            ->select('users.id', 'users.name', 'users.email', 'users.cargo', 'users.rol_interno', 'equipos.nombre as equipo_nombre')
            ->get();
    }

    public function getTeams()
    {
        return DB::table('equipos')->get();
    }

    public function createTeam(Request $request)
    {
        $id = DB::table('equipos')->insertGetId([
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion,
            'created_at' => now()
        ]);
        return response()->json(['id' => $id]);
    }

    public function storeUser(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
        ]);

        $id = DB::table('users')->insertGetId([
            'name' => $request->name,
            'email' => $request->email,
            'password' => \Hash::make($request->password),
            'cargo' => $request->cargo ?? 'Colaborador',
            'equipo_id' => $request->equipo_id,
            'rol_interno' => $request->rol_interno ?? 'usuario',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['id' => $id, 'message' => 'Usuario creado']);
    }

    public function updateUser(Request $request, $id)
    {
        DB::table('users')->where('id', $id)->update([
            'cargo' => $request->cargo,
            'equipo_id' => $request->equipo_id,
            'rol_interno' => $request->rol_interno
        ]);
        return response()->json(['message' => 'Actualizado']);
    }
}
