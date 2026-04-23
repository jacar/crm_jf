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
    $stmt = $pdo->query("DESCRIBE mantenimientos");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch(Exception $e) { echo $e->getMessage(); }
