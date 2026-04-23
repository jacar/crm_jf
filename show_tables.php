<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=mecanico_larav89', 'mecanico_larav89', '8![Wxm8p1-CZ(RS[');
    $res = $pdo->query("SHOW TABLES");
    while($row = $res->fetch()) {
        echo $row[0] . "\n";
    }
} catch (Exception $e) { echo $e->getMessage(); }
