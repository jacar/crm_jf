const ftp = require("basic-ftp");
const path = require("path");

async function run() {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    try {
        await client.access({
            host: "mecanicoenmedellin.com",
            user: "mecanico",
            password: "Forastero_938@@",
            secure: false
        });
        console.log("Connected to FTP!");

        // Upload Vehiculo.php
        await client.cd("public_html/jf/app/Models");
        await client.uploadFrom("../laravel_core/app/Models/Vehiculo.php", "Vehiculo.php");
        console.log("Uploaded Vehiculo.php");

        // Upload VehiculoController.php
        await client.cd("/public_html/jf/app/Http/Controllers");
        await client.uploadFrom("../laravel_core/app/Http/Controllers/VehiculoController.php", "VehiculoController.php");
        console.log("Uploaded VehiculoController.php");

        console.log("Backend update complete!");
    }
    catch(err) {
        console.log("Error:", err);
    }
    client.close();
}
run();
