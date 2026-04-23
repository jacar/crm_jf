const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const files = [
    'C:\\Users\\TERA\\Documents\\CRM JF\\backend\\bd empresa\\1. CONTROL DE MTTO PREVENTIVO FLOTA YUTONG.xlsx',
    'C:\\Users\\TERA\\Documents\\CRM JF\\backend\\bd empresa\\2. CONTROL DE MTTO PREVENTIVO FLOTA PESADA (2).xlsx',
    'C:\\Users\\TERA\\Documents\\CRM JF\\backend\\bd empresa\\3. CONTROL DE MTTO PREVENTIVO FLOTA LIVIANA (3).xlsx',
    'C:\\Users\\TERA\\Documents\\CRM JF\\backend\\bd empresa\\4. CONTROL DE MTTO PREVENTIVO FLOTA JAC (2).xlsx'
];

files.forEach(filePath => {
    try {
        const workbook = XLSX.readFile(filePath);
        console.log(`\n\n========== FILE: ${path.basename(filePath)} ==========`);
        workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            console.log(`\n--- Sheet: ${sheetName} ---`);
            // Find header (first row with more than 3 columns)
            let headerRowIndex = data.findIndex(row => row && row.filter(c => c !== null).length > 3);
            if (headerRowIndex === -1) headerRowIndex = 0;
            
            console.log('Header:', data[headerRowIndex]);
            console.log('Data Preview:');
            data.slice(headerRowIndex + 1, headerRowIndex + 5).forEach(row => console.log(JSON.stringify(row)));
        });
    } catch (e) {
        console.error(`Error reading ${filePath}:`, e.message);
    }
});
