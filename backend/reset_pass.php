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
    
    $email = 'ovalle_938@hotmail.com';
    $password = 'admin123';
    $pwHash = password_hash($password, PASSWORD_BCRYPT);
    
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if($stmt->fetch()) {
        $pdo->prepare("UPDATE users SET password = ? WHERE email = ?")->execute([$pwHash, $email]);
        echo "Password reset for $email to admin123";
    } else {
        $pdo->prepare("INSERT INTO users (name, email, password, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())")
             ->execute(['Usuario Ovalle', $email, $pwHash]);
        echo "User created: $email with pass admin123";
    }
} catch(PDOException $e) {
    echo "PDO ERROR: " . $e->getMessage();
}
