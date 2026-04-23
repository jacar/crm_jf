# CRM JF - Sistema de Gestión de Flota

Este es un sistema integral para el control de inventario de vehículos, mantenimientos preventivos y alertas automáticas por kilometraje.

## Tecnologías
- **Frontend**: React, Vite, Lucide Icons.
- **Backend**: Node.js, Express, PostgreSQL, Nodemailer.

## Guía de Configuración

### 1. Backend
1. Ir a la carpeta `backend`.
2. Ejecutar `npm install`.
3. Crear un archivo `.env` basado en `.env.example` con tus credenciales de Base de Datos y Correo.
4. Ejecutar el script `schema.sql` en tu base de datos PostgreSQL.
5. Iniciar con `npm run dev` (o `node index.js`).

### 2. Frontend
1. Ir a la carpeta `frontend`.
2. Ejecutar `npm install`.
3. Ejecutar `npm run dev`.

## Características Principales
- **Gestión de Sedes**: Control total por sucursales.
- **Alertas Rojas**: Notificaciones automáticas por correo cuando un vehículo alcanza su límite de KM.
- **Interfaz Operador**: Diseño simplificado para carga rápida de datos desde móviles.
- **Reportes de Costos**: Visualización de gastos en talleres internos y externos.

---
**Desarrollado con estética corporativa y profesional.**
