<?php
try {
    $conn = mysqli_connect('localhost', 'mecanico_larav89', '8![Wxm8p1-CZ(RS[', 'mecanico_larav89');
    if (!$conn) { throw new Exception(mysqli_connect_error()); }
    
    // Create teams table
    mysqli_query($conn, "CREATE TABLE IF NOT EXISTS equipos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    // Add columns to users table
    mysqli_query($conn, "ALTER TABLE users ADD COLUMN IF NOT EXISTS cargo VARCHAR(100) DEFAULT 'Colaborador'");
    mysqli_query($conn, "ALTER TABLE users ADD COLUMN IF NOT EXISTS equipo_id INT DEFAULT NULL");
    mysqli_query($conn, "ALTER TABLE users ADD COLUMN IF NOT EXISTS rol_interno VARCHAR(50) DEFAULT 'usuario'");

    echo "DATABASE UPDATED FOR TEAMS";
} catch (Exception $e) {
    echo "EXCEPTION: " . $e->getMessage();
}
