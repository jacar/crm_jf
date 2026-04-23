-- Database Schema for CRM JF Fleet Management

CREATE TABLE IF NOT EXISTS sedes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) CHECK (rol IN ('admin', 'operador')) DEFAULT 'operador',
    sede_id INT REFERENCES sedes(id)
);

CREATE TABLE IF NOT EXISTS vehiculos (
    id SERIAL PRIMARY KEY,
    placa VARCHAR(20) UNIQUE NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- Van, Bus, Sedan, etc.
    marca VARCHAR(50),
    modelo VARCHAR(50),
    vin VARCHAR(50) UNIQUE,
    sede_id INT REFERENCES sedes(id),
    km_actual INT DEFAULT 0,
    proximo_mantenimiento_km INT DEFAULT 5000, -- Default limit for alert
    estado VARCHAR(20) DEFAULT 'activo'
);

CREATE TABLE IF NOT EXISTS mantenimientos (
    id SERIAL PRIMARY KEY,
    vehiculo_id INT REFERENCES vehiculos(id) ON DELETE CASCADE,
    tipo_mantenimiento VARCHAR(100) NOT NULL, -- Aceite, Filtros, etc.
    tipo_taller VARCHAR(20) CHECK (tipo_taller IN ('interno', 'externo')),
    fecha DATE DEFAULT CURRENT_DATE,
    km_realizado INT NOT NULL,
    costo DECIMAL(10, 2),
    ruc_nit VARCHAR(50), -- Only for external
    url_factura VARCHAR(255),
    notas TEXT
);

CREATE TABLE IF NOT EXISTS documentos (
    id SERIAL PRIMARY KEY,
    vehiculo_id INT REFERENCES vehiculos(id) ON DELETE CASCADE,
    tipo_doc VARCHAR(50) NOT NULL, -- Seguro, Titulo, etc.
    url_archivo VARCHAR(255) NOT NULL,
    fecha_vencimiento DATE
);

CREATE TABLE IF NOT EXISTS lecturas_km (
    id SERIAL PRIMARY KEY,
    vehiculo_id INT REFERENCES vehiculos(id) ON DELETE CASCADE,
    operador_id INT REFERENCES usuarios(id),
    km_leido INT NOT NULL,
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
