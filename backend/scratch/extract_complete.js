const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const assetDir = 'C:\\Users\\TERA\\Documents\\CRM JF\\frontend\\src\\';
const files = fs.readdirSync(assetDir);
const targetFile = files.find(f => f.startsWith('RELACI') && f.endsWith('.xlsx'));

if (!targetFile) {
    console.error('File not found in', assetDir);
    process.exit(1);
}

const filePath = path.join(assetDir, targetFile);
console.log('Reading:', filePath);

try {
    const workbook = XLSX.readFile(filePath);
    const vehicleMap = {};

    function processSheet(sheetName) {
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) return;
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        data.forEach(row => {
            if (!row || row.length < 3) return;
            if (row.some(c => c && c.toString().toUpperCase() === 'PLACA')) return;

            let placa = null;
            let n_interno = null;

            if (sheetName.startsWith('FLOTA COMPLETA')) {
                placa = row[2];
                n_interno = row[1];
            } else if (sheetName === 'GPS' || sheetName === 'STAR LINK' || sheetName === 'CAPTA HUELLAS' || sheetName === 'POLIZAS QUE FALTAN ') {
                placa = row[2] || row[1];
                n_interno = row[1];
            }

            if (!placa || placa.toString().length < 5 || placa.toString().toUpperCase() === 'PLACA') return;
            
            placa = placa.toString().trim().toUpperCase();

            if (!vehicleMap[placa]) {
                vehicleMap[placa] = {
                    placa: placa,
                    km_actual: 0,
                    has_gps: false,
                    has_starlink: false,
                    has_capta_huellas: false,
                    empresa: 'Corporación JF',
                    modelo: 'Desconocido',
                    marca: 'Desconocido',
                    sede_nombre: 'BARCELONA' // Default
                };
            }

            const v = vehicleMap[placa];

            if (sheetName.startsWith('FLOTA COMPLETA')) {
                v.n_interno = n_interno || v.n_interno;
                v.modelo = row[3] || v.modelo;
                v.tipo = row[4] || v.tipo;
                v.marca = row[5] || v.marca;
                v.propietario = row[11] || v.propietario;
                v.fecha_vencimiento_poliza = parseExcelDate(row[13]) || v.fecha_vencimiento_poliza;
                v.fecha_vencimiento_roct = parseExcelDate(row[15]) || v.fecha_vencimiento_roct;
                v.combustible = row[17] || v.combustible;
                v.fecha_vencimiento_impuesto = parseExcelDate(row[23]) || v.fecha_vencimiento_impuesto;
                v.empresa = row[29] || v.empresa;
                v.observaciones = row[24] || v.observaciones;
                
                // Sede Mapping
                if (row[27]) {
                    const s = row[27].toString().trim().toUpperCase();
                    if (s === 'BNA' || s === 'PLC') v.sede_nombre = 'BARCELONA';
                    else if (s === 'MCBO') v.sede_nombre = 'MARACAIBO';
                    else if (s === 'COLINA') v.sede_nombre = 'COLINAS';
                    else v.sede_nombre = s;
                }
            }

            if (sheetName === 'GPS') v.has_gps = true;
            if (sheetName === 'STAR LINK') v.has_starlink = true;
            if (sheetName === 'CAPTA HUELLAS') v.has_capta_huellas = true;
        });
    }

    processSheet('FLOTA COMPLETA');
    processSheet('GPS');
    processSheet('STAR LINK');
    processSheet('CAPTA HUELLAS');
    processSheet('FLOTA COMPLETA (2)');
    processSheet('POLIZAS QUE FALTAN ');

    const finalVehicles = Object.values(vehicleMap);
    fs.writeFileSync('vehicles_real_data.json', JSON.stringify(finalVehicles));
    console.log(`Successfully merged ${finalVehicles.length} unique vehicles.`);

} catch (e) {
    console.error('Extraction error:', e);
}

function parseExcelDate(val) {
    if (!val) return null;
    if (typeof val === 'number') {
        const date = new Date((val - 25569) * 86400 * 1000);
        return date.toISOString().split('T')[0];
    }
    const str = val.toString().toUpperCase();
    if (str.includes('VENCID') || str.includes('FALTA') || str.includes('NO TIENE')) {
        return '2024-01-01';
    }
    return null;
}
