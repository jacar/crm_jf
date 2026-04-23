const ftp = require("basic-ftp");

async function run() {
    const client = new ftp.Client();
    try {
        await client.access({
            host: "mecanicoenmedellin.com",
            user: "mecanico",
            password: "Forastero_938@@",
            secure: false
        });
        console.log("Connected to FTP!");

        // Upload Controller
        await client.cd("public_html/jf/app/Http/Controllers");
        await client.uploadFrom("../laravel_core/app/Http/Controllers/VehiculoController.php", "VehiculoController.php");
        console.log("Uploaded VehiculoController.php");

        // Upload Model
        await client.cd("../../Models");
        await client.uploadFrom("../laravel_core/app/Models/Vehiculo.php", "Vehiculo.php");
        console.log("Uploaded Vehiculo.php");

        console.log("Backend update complete!");
    }
    catch(err) {
        console.log("Error:", err);
    }
    client.close();
}
run();
