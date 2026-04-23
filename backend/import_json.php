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
    
    $json = file_get_contents(__DIR__.'/vehicles.json');
    $vehicles = json_decode($json, true);
    
    $imported = 0;
    foreach ($vehicles as $v) {
        $placa = trim($v['placa']);
        if (!empty($placa)) {
            $stmt = $pdo->prepare("SELECT id FROM vehiculos WHERE placa = ?");
            $stmt->execute([$placa]);
            if ($stmt->fetch()) {
                // Update
                $pdo->prepare("UPDATE vehiculos SET marca=?, modelo=?, km_actual=?, updated_at=NOW() WHERE placa=?")
                     ->execute([$v['marca'], $v['modelo'], $v['km_actual'], $placa]);
            } else {
                // Insert
                $pdo->prepare("INSERT INTO vehiculos (placa, marca, modelo, km_actual, estado, created_at, updated_at) VALUES (?, ?, ?, ?, 'activo', NOW(), NOW())")
                     ->execute([$placa, $v['marca'], $v['modelo'], $v['km_actual']]);
            }
            $imported++;
        }
    }
    
    echo "SUCCESS: $imported";
} catch(Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
