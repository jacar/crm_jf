require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Email Transporter Mock (Need real credentials for production)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: process.env.EMAIL_PORT || 587,
  auth: {
    user: process.env.EMAIL_USER || 'user@example.com',
    pass: process.env.EMAIL_PASS || 'password',
  },
});

// --- API ROUTES ---

// Get all vehicles
app.get('/api/vehicles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vehiculos ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update KM and triggers alerts
app.post('/api/vehicles/:id/update-km', async (req, res) => {
  const { id } = req.params;
  const { km_leido, operador_id } = req.body;

  try {
    // 1. Log the reading
    await pool.query(
      'INSERT INTO lecturas_km (vehiculo_id, operador_id, km_leido) VALUES ($1, $2, $3)',
      [id, operador_id, km_leido]
    );

    // 2. Update vehicle KM
    const vehicle = await pool.query(
      'UPDATE vehiculos SET km_actual = $1 WHERE id = $2 RETURNING *',
      [km_leido, id]
    );

    const v = vehicle.rows[0];

    // 3. Logic: If Km_Actual >= Km_Proximo_Cambio, trigger alert
    if (v.km_actual >= v.proximo_mantenimiento_km) {
      // Trigger Email Alert
      const mailOptions = {
        from: '"CRM JF Alertas" <alertas@crmjf.com>',
        to: 'admin@empresa.com',
        subject: `ALERTA ROJA: Vehículo ${v.placa} requiere mantenimiento`,
        text: `El vehículo con placa ${v.placa} (${v.marca} ${v.modelo}) ha alcanzado ${v.km_actual}km. Límite: ${v.proximo_mantenimiento_km}km.`,
        html: `
          <h2 style="color: #ef4444;">Alerta de Mantenimiento Crítica</h2>
          <p>El vehículo <strong>${v.placa}</strong> ha superado el kilometraje de mantenimiento.</p>
          <ul>
            <li><strong>Marca/Modelo:</strong> ${v.marca} ${v.modelo}</li>
            <li><strong>KM Actual:</strong> ${v.km_actual}</li>
            <li><strong>Límite de mantenimiento:</strong> ${v.proximo_mantenimiento_km}</li>
          </ul>
          <p>Favor de agendar cita en taller interno o externo inmediatamente.</p>
        `,
      };

      // transporter.sendMail(mailOptions); // Uncomment with real config
      console.log(`Alert email sent for vehicle ${v.placa}`);
      
      return res.json({ message: 'KM Updated. Alert triggered!', vehicle: v, alert: true });
    }

    res.json({ message: 'KM Updated successfully', vehicle: v, alert: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating KM' });
  }
});
// Get all maintenance records
app.get('/api/mantenimientos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, v.placa, v.marca, v.modelo 
      FROM mantenimientos m 
      JOIN vehiculos v ON m.vehiculo_id = v.id 
      ORDER BY m.fecha DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching maintenance records' });
  }
});

// Create new maintenance record
app.post('/api/mantenimientos', async (req, res) => {
  const { vehiculo_id, tipo_mantenimiento, tipo_taller, fecha, km_realizado, costo, ruc_nit, url_factura, notas } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO mantenimientos 
       (vehiculo_id, tipo_mantenimiento, tipo_taller, fecha, km_realizado, costo, ruc_nit, url_factura, notas) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [vehiculo_id, tipo_mantenimiento, tipo_taller, fecha || new Date(), km_realizado, costo, ruc_nit, url_factura, notas]
    );

    // After maintenance, we usually reset the next maintenance KM (e.g. +5000km)
    await pool.query(
      'UPDATE vehiculos SET proximo_mantenimiento_km = km_actual + 5000 WHERE id = $1',
      [vehiculo_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating maintenance record' });
  }
});

// Get all sedes
app.get('/api/sedes', async (req, res) => {
  try {
    const result = await pool.query('SELECT s.*, (SELECT COUNT(*) FROM vehiculos WHERE sede_id = s.id) as vehiculo_count FROM sedes s');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching sedes' });
  }
});

// Get global stats for dashboard
app.get('/api/stats', async (req, res) => {
  try {
    const vehiclesCount = await pool.query('SELECT COUNT(*) FROM vehiculos');
    const alertsCount = await pool.query('SELECT COUNT(*) FROM vehiculos WHERE km_actual >= proximo_mantenimiento_km');
    const monthlyCost = await pool.query("SELECT SUM(costo) FROM mantenimientos WHERE fecha >= date_trunc('month', CURRENT_DATE)");
    
    res.json({
      totalVehicles: parseInt(vehiclesCount.rows[0].count),
      criticalAlerts: parseInt(alertsCount.rows[0].count),
      upToDate: parseInt(vehiclesCount.rows[0].count) - parseInt(alertsCount.rows[0].count),
      monthlySpending: parseFloat(monthlyCost.rows[0].sum || 0)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching stats' });
  }
});

app.listen(port, () => {
  console.log(`Backend CRM JF running at http://localhost:${port}`);
});
