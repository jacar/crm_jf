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
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Adding columns to vehiculos table...\n";
    
    $pdo->exec("ALTER TABLE vehiculos ADD COLUMN IF NOT EXISTS km_proxima_rotacion INT DEFAULT 10000");
    $pdo->exec("ALTER TABLE vehiculos ADD COLUMN IF NOT EXISTS km_proximo_lavado INT DEFAULT 2000");
    
    echo "Success! Columns added.";
} catch(PDOException $e) {
    echo "PDO ERROR: " . $e->getMessage();
}
