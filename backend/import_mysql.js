const mysql = require('mysql2/promise');
const fs = require('fs');

async function main() {
    try {
        const con = await mysql.createConnection({host: 'localhost', user: 'root', password: '', database: 'crm_jf'});
        await con.query('SET FOREIGN_KEY_CHECKS=0;');
        await con.query('TRUNCATE TABLE vehiculos;');
        await con.query('TRUNCATE TABLE mantenimientos;');
        await con.query('TRUNCATE TABLE lecturas_km;');
        await con.query('SET FOREIGN_KEY_CHECKS=1;');

        const data = JSON.parse(fs.readFileSync('real_vehicles.json', 'utf8'));
        let imported = 0;
        for (const v of data) {
            const placa = v.placa ? String(v.placa).trim() : null;
            if(!placa) continue;
            let marca = v.marca ? String(v.marca).trim() : 'N/A';
            let modelo = v.modelo ? String(v.modelo).trim() : '';
            if (v.ano) modelo += ' - ' + v.ano;
            if (v.color) modelo += ' (' + v.color + ')';
            if (!modelo) modelo = 'N/A';
            const vin = v.vin ? String(v.vin).trim() : null;
            let estado = v.estado ? String(v.estado).toLowerCase().trim() : 'activo';
            if(!['activo','taller','inactivo'].includes(estado)) estado = 'activo';
            
            // Check if exists
            const [rows] = await con.query('SELECT id FROM vehiculos WHERE placa = ?', [placa]);
            if (rows.length > 0) {
                continue; // Duplicate
            }

            try {
                await con.query('INSERT INTO vehiculos (placa, marca, modelo, vin, km_actual, km_proximo_mantenimiento, estado, created_at, updated_at) VALUES (?, ?, ?, ?, 0, 5000, ?, NOW(), NOW())', [placa, marca, modelo, vin, estado]);
                imported++;
            } catch(e) {
                console.log("Error inserting " + placa + ": " + e.message);
            }
        }
        console.log("Successfully imported " + imported + " vehicles!");
        process.exit(0);
    } catch(e) {
        console.error("Fatal Error: " + e.message);
        process.exit(1);
    }
}
main();
