const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const assetDir = 'C:\\Users\\TERA\\Documents\\CRM JF\\frontend\\src\\';
const files = fs.readdirSync(assetDir);
const targetFile = files.find(f => f.startsWith('RELACI') && f.endsWith('.xlsx'));

const filePath = path.join(assetDir, targetFile);

try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets['FLOTA COMPLETA'];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    const sedes = new Set();
    data.slice(5).forEach(row => {
        if (row[27]) {
            sedes.add(row[27].toString().trim().toUpperCase());
        }
    });

    console.log('Unique Sedes found:', Array.from(sedes));
    fs.writeFileSync('sedes_found.json', JSON.stringify(Array.from(sedes)));
} catch (e) {
    console.error(e);
}
