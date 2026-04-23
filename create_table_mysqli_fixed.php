<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
try {
    $conn = mysqli_connect('localhost', 'mecanico_larav89', '8![Wxm8p1-CZ(RS[', 'mecanico_larav89');
    if (!$conn) { throw new Exception(mysqli_connect_error()); }
    
    $sql = "CREATE TABLE IF NOT EXISTS mensajes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        contenido TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    
    if (mysqli_query($conn, $sql)) {
        echo "TABLE OK";
    } else {
        echo "ERROR: " . mysqli_error($conn);
    }
} catch (Exception $e) {
    echo "EXCEPTION: " . $e->getMessage();
}
