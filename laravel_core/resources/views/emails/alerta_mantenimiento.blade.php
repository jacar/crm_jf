<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #f8fafc; padding: 20px; }
        .container { background-color: #ffffff; border-radius: 12px; padding: 40px; border-top: 8px solid #ef4444; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .header { color: #0f172a; font-size: 24px; font-weight: 700; margin-bottom: 20px; }
        .details { margin-top: 20px; color: #64748b; }
        .data-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .data-table td { padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
        .label { font-weight: 600; color: #0f172a; }
        .footer { margin-top: 30px; font-size: 12px; color: #94a3b8; text-align: center; }
    </style>
</head>
<body>
    <div class="container" style="border-top: 8px solid #0359c6;">
        <div style="text-align: center; margin-bottom: 20px;">
             <img src="https://www.webcincodev.com/blog/wp-content/uploads/2026/04/CRM.png" width="150" alt="Corporación JF">
        </div>
        <div class="header">Alerta Crítica de Mantenimiento</div>
        <p>El sistema de gestión de <strong>Corporación JF</strong> ha detectado un vehículo que requiere atención inmediata.</p>
        
        <table class="data-table">
            <tr>
                <td class="label">Vehículo / Placa:</td>
                <td>{{ $vehiculo->marca }} {{ $vehiculo->modelo }} ({{ $vehiculo->placa }})</td>
            </tr>
            <tr>
                <td class="label">Kilometraje Actual:</td>
                <td style="color: #ef4444; font-weight: 700;">{{ number_format($vehiculo->km_actual) }} KM</td>
            </tr>
            <tr>
                <td class="label">Límite Programado:</td>
                <td>{{ number_format($vehiculo->km_proximo_mantenimiento) }} KM</td>
            </tr>
        </table>

        <p class="details">Es imperativo coordinar la revisión técnica de esta unidad para garantizar la seguridad operativa y la vida útil del motor.</p>
        
        <div class="footer">
            Todos los derechos reservados Corporación JF &copy; {{ date('Y') }}<br>
            Sede: {{ $vehiculo->sede->nombre ?? 'N/A' }}
        </div>
    </div>
</body>
</html>
