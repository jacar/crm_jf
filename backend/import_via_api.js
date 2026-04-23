const fs = require('fs');

const API_BASE = 'https://www.mecanicoenmedellin.com/jf/public/api';

async function mapSede(sedeName) {
    if(!sedeName) return 1;
    const name = sedeName.toLowerCase().trim();
    if(name.includes('bna') || name.includes('barcelona')) return 2;
    if(name.includes('caracas')) return 4;
    if(name.includes('maracaibo') || name.includes('mcbo')) return 1;
    if(name.includes('plc') || name.includes('cruz')) return 3;
    if(name.includes('tigre')) return 5;
    return 1;
}

async function run() {
    try {
        console.log("Fetching existing vehicles to delete...");
        const res = await fetch(`${API_BASE}/vehicles`);
        const existing = await res.json();
        
        console.log(`Found ${existing.length} vehicles to delete.`);
        let count = 0;
        for(let v of existing) {
            await fetch(`${API_BASE}/vehicles/${v.id}`, { method: 'DELETE' });
            count++;
            if (count % 20 === 0) process.stdout.write('.');
        }
        console.log("\nDeleted all existing vehicles.");

        console.log("Reading new vehicles...");
        const data = JSON.parse(fs.readFileSync('real_vehicles.json', 'utf8'));
        
        console.log(`Starting import of ${data.length} vehicles...`);
        let imported = 0;
        let c2 = 0;
        for(let v of data) {
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
            const sede_id = await mapSede(v.sede);

            const payload = {
                placa,
                marca: marca.substring(0, 255),
                modelo: modelo.substring(0, 255),
                vin,
                km_actual: 0,
                km_proximo_mantenimiento: 5000,
                estado,
                sede_id
            };

            const postRes = await fetch(`${API_BASE}/vehicles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (postRes.ok) {
                imported++;
                c2++;
                if (c2 % 20 === 0) process.stdout.write('+');
            } else {
                const errText = await postRes.text();
                // Check if it's just a duplicate, which is fine
                if (!errText.includes("has already been taken")) {
                     console.log(`\nFailed for ${placa}:`, errText);
                }
            }
        }
        
        console.log(`\nSUCCESS: Imported ${imported} vehicles to production API.`);
    } catch(err) {
        console.error("Fatal Error:", err);
    }
}
run();
