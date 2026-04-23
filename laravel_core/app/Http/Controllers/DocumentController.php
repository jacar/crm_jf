<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function index()
    {
        return DB::table('documentos')
            ->leftJoin('vehiculos', 'documentos.vehiculo_id', '=', 'vehiculos.id')
            ->select('documentos.*', 'vehiculos.placa')
            ->orderBy('fecha_vencimiento', 'asc')
            ->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB limit
            'tipo_doc' => 'required',
            'vehiculo_id' => 'required',
            'fecha_vencimiento' => 'nullable|date'
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $path = $file->move(public_path('uploads/documents'), $fileName);
            $url = '/uploads/documents/' . $fileName;

            $id = DB::table('documentos')->insertGetId([
                'vehiculo_id' => $request->vehiculo_id,
                'tipo_doc' => $request->tipo_doc,
                'url_archivo' => $url,
                'fecha_vencimiento' => $request->fecha_vencimiento,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json(['id' => $id, 'message' => 'Documento subido']);
        }

        return response()->json(['error' => 'Error al subir'], 400);
    }

    public function destroy($id)
    {
        $doc = DB::table('documentos')->where('id', $id)->first();
        if ($doc) {
            $filePath = public_path($doc->url_archivo);
            if (file_exists($filePath)) {
                @unlink($filePath);
            }
            DB::table('documentos')->where('id', $id)->delete();
            return response()->json(['message' => 'Eliminado']);
        }
        return response()->json(['error' => 'No encontrado'], 404);
    }
}
