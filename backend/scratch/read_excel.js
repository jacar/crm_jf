const XLSX = require('xlsx');
const path = require('path');

const filePath = 'C:\\Users\\TERA\\Documents\\CRM JF\\frontend\\src\\assets\\RELACIÒN DE FLOTA ENUMERACIÒN PLACA Y MODELO 15-1-26.xlsx';

try {
    const workbook = XLSX.readFile(filePath);
    console.log('Sheets:', workbook.SheetNames);

    workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        console.log(`\n--- Sheet: ${sheetName} ---`);
        console.log('Columns:', data[0]);
        console.log('First 5 rows:');
        data.slice(1, 6).forEach(row => console.log(JSON.stringify(row)));
    });
} catch (e) {
    console.error('Error reading file:', e.message);
}
