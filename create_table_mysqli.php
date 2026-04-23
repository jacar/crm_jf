<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
try {
    \ = mysqli_connect('localhost', 'mecanico_larav89', '8![Wxm8p1-CZ(RS[', 'mecanico_larav89');
    if (!\) { throw new Exception(mysqli_connect_error()); }
    
    \ = \"CREATE TABLE IF NOT EXISTS mensajes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        contenido TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )\";
    
    if (mysqli_query(\, \)) {
        echo \"TABLE OK\";
    } else {
        echo \"ERROR: \" . mysqli_error(\);
    }
} catch (Exception \) {
    echo \"EXCEPTION: \" . \->getMessage();
}
