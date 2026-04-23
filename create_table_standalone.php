<?php
try {
    \ = new PDO('mysql:host=localhost;dbname=mecanico_larav89', 'mecanico_larav89', '8![Wxm8p1-CZ(RS[');
    \->setAttribute(PDO::ATTR_ERR_ERRORMODE, PDO::ERRMODE_EXCEPTION);
    
    \->exec(\"
        CREATE TABLE IF NOT EXISTS mensajes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT UNSIGNED NOT NULL,
            contenido TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    \");
    echo 'Mensajes table created successfully';
} catch (Exception \) {
    echo 'Error: ' . \->getMessage();
}
