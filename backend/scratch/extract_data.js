const XLSX = require('xlsx');
const fs = require('fs');

const filePath = 'C:\\Users\\TERA\\Documents\\CRM JF\\frontend\\src\\assets\\RELACIÒN DE FLOTA ENUMERACIÒN PLACA Y MODELO 15-1-26.xlsx';

try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets['FLOTA COMPLETA'];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    // Header is on row 5 (index 4)
    const vehicles = [];
    data.slice(5).forEach(row => {
        if (row[2] && row[2].toString().trim() !== '') { // Has Placa
            vehicles.push({
                placa: row[2].toString().trim(),
                n_interno: row[1] ? row[1].toString().trim() : null,
                modelo: row[3] ? row[3].toString().trim() : 'Desconocido',
                tipo: row[4] ? row[4].toString().trim() : null,
                marca: row[5] ? row[5].toString().trim() : 'Desconocido',
                propietario: row[11] ? row[11].toString().trim() : null,
                combustible: row[17] ? row[17].toString().trim() : null,
                empresa: row[29] ? row[29].toString().trim() : 'Corporación JF',
                // For dates, we need to handle Excel date numbers if present
                fecha_vencimiento_poliza: row[13] ? formatExcelDate(row[13]) : null,
                fecha_vencimiento_roct: row[15] ? formatExcelDate(row[15]) : null,
                fecha_vencimiento_impuesto: row[23] ? formatExcelDate(row[23]) : null
            });
        }
    });

    fs.writeFileSync('vehicles_data.json', JSON.stringify(vehicles.slice(0, 300))); // limit to 300 for now
    console.log(`Extracted ${vehicles.length} vehicles.`);
} catch (e) {
    console.error(e);
}

function formatExcelDate(val) {
    if (!val) return null;
    if (typeof val === 'number') {
        const date = new Date((val - 25569) * 86400 * 1000);
        return date.toISOString().split('T')[0];
    }
    // If it's a string like "VENCIDA", "NO TIENE", etc, we treat as expired (yesterday)
    if (val.toString().toLowerCase().includes('vencid') || val.toString().toLowerCase().includes('no tiene')) {
        return '2024-01-01'; 
    }
    return null;
}
