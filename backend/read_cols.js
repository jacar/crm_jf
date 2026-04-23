const XLSX = require('xlsx');
const fs = require('fs');

const dir = './bd empresa';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.xlsx'));

files.forEach(f => {
    const workbook = XLSX.readFile(dir + '/' + f);
    const sheet_name_list = workbook.SheetNames;
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {header: 1});
    console.log('FILE:', f);
    // Print lines 10 to 20 to see the actual headers and data for files that have metadata at top
    for(let i=5; i<Math.min(15, data.length); i++) {
        if(data[i] && data[i].length > 0)
            console.log("R"+i+":", data[i].slice(0, 8));
    }
    console.log('------------------');
});
