<?php
try {
    $conn = mysqli_connect('localhost', 'mecanico_larav89', '8![Wxm8p1-CZ(RS[', 'mecanico_larav89');
    if (!$conn) { throw new Exception(mysqli_connect_error()); }

    mysqli_query($conn, "CREATE TABLE IF NOT EXISTS documentos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehiculo_id INT,
        tipo_doc VARCHAR(100) NOT NULL,
        url_archivo VARCHAR(255) NOT NULL,
        fecha_vencimiento DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");

    echo "DOCUMENTOS TABLE CREATED";
} catch (Exception $e) { echo "EXCEPTION: " . $e->getMessage(); }
