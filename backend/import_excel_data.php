<?php
$envVars = [];
$envLines = file(__DIR__.'/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
foreach($envLines as $line) {
    if (strpos(trim($line), '#') === 0) continue;
    $parts = explode('=', $line, 2);
    if(count($parts) == 2) $envVars[trim($parts[0])] = trim($parts[1]);
}

$host = $envVars['DB_HOST'] ?? '127.0.0.1';
$db   = $envVars['DB_DATABASE'];
$user = $envVars['DB_USERNAME'];
$pass = $envVars['DB_PASSWORD'];

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Disable FK checks and truncate
    $pdo->exec("SET FOREIGN_KEY_CHECKS=0;");
    $pdo->exec("TRUNCATE TABLE vehiculos;");
    $pdo->exec("TRUNCATE TABLE mantenimientos;");
    $pdo->exec("TRUNCATE TABLE lecturas_km;");
    $pdo->exec("SET FOREIGN_KEY_CHECKS=1;");
    
    $json = file_get_contents(__DIR__.'/real_vehicles.json');
    $vehicles = json_decode($json, true);
    
    $imported = 0;
    foreach ($vehicles as $v) {
        $placa = trim($v['placa']);
        $marca = mb_substr(trim($v['marca']), 0, 255);
        if (empty($marca)) $marca = 'N/A';
        $modelo = trim($v['modelo']);
        if (!empty($v['ano'])) $modelo .= ' - ' . $v['ano'];
        if (!empty($v['color'])) $modelo .= ' (' . $v['color'] . ')';
        $modelo = mb_substr($modelo, 0, 255);
        if (empty($modelo)) $modelo = 'N/A';
        $vin = !empty($v['vin']) ? trim($v['vin']) : null;
        
        $estado = mb_strtolower(trim($v['estado']));
        if (!in_array($estado, ['activo', 'taller', 'inactivo'])) {
            $estado = 'activo';
        }
        
        if (!empty($placa)) {
            $stmt = $pdo->prepare("INSERT INTO vehiculos (placa, marca, modelo, vin, km_actual, km_proximo_mantenimiento, estado, created_at, updated_at) VALUES (?, ?, ?, ?, 0, 5000, ?, NOW(), NOW())");
            try {
                $stmt->execute([$placa, $marca, $modelo, $vin, $estado]);
                $imported++;
            } catch(Exception $e) {
                // Ignore duplicates or other row errors
                echo "Skipped: $placa (Duplicate or error)\n";
            }
        }
    }
    
    echo "SUCCESS: Imported $imported vehicles.\n";
} catch(Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
