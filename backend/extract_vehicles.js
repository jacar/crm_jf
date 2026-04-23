const XLSX = require('xlsx');
const fs = require('fs');

const dir = './bd empresa';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.xlsx'));
let allVehicles = [];

files.forEach(f => {
    try {
        const workbook = XLSX.readFile(dir + '/' + f);
        workbook.SheetNames.forEach(sheetName => {
            const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {header: 1});
            
            // Guess columns
            data.forEach((row, rowIndex) => {
                let placa = null;
                let modelo = '';
                let km = 0;
                
                // Identify by Regex: typically plates are something like AB123CD or 3581
                for(let i=0; i<row.length; i++) {
                    let cell = String(row[i]).trim();
                    if (/^[A-Z0-9]{3,7}$/i.test(cell) && (cell.match(/[A-Z]/i) || cell.length >= 4)) {
                        // Looks like a plate
                        placa = cell;
                    }
                }
                
                if (f.includes('YUTONG')) {
                    if (row[3]) placa = String(row[3]).trim();
                    if (row[1]) modelo = String(row[1]).trim();
                    km = 0; // The KM column is 4 but it was empty in the samples
                } else if (f.includes('JAC')) {
                    if (row[1]) placa = String(row[1]).trim();
                    if (row[2]) km = parseInt(row[2]) || 0;
                    modelo = 'JAC';
                }
                
                if (placa && placa !== 'PLACAS' && placa !== 'SEDE' && placa.length > 2) {
                    allVehicles.push({
                        placa: placa.toUpperCase(),
                        marca: f.includes('YUTONG') ? 'YUTONG' : (f.includes('JAC') ? 'JAC' : 'FLOTA'),
                        modelo: modelo || 'Desconocido',
                        km_actual: km
                    });
                }
            });
        });
    } catch(e) {}
});

// Remove duplicates
const uniqueVehicles = [];
const seen = new Set();
for (let v of allVehicles) {
    if (!seen.has(v.placa)) {
        seen.add(v.placa);
        uniqueVehicles.push(v);
    }
}

fs.writeFileSync('vehicles.json', JSON.stringify(uniqueVehicles, null, 2));
console.log('Total identified vehicles:', uniqueVehicles.length);
