const ftp = require("basic-ftp");

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

        // Upload Mantenimiento.php
        await client.cd("/public_html/jf/app/Models");
        await client.uploadFrom("../laravel_core/app/Models/Mantenimiento.php", "Mantenimiento.php");
        console.log("Uploaded Mantenimiento.php");

        // Upload MaintenanceController.php
        await client.cd("/public_html/jf/app/Http/Controllers");
        await client.uploadFrom("../laravel_core/app/Http/Controllers/MaintenanceController.php", "MaintenanceController.php");
        console.log("Uploaded MaintenanceController.php");

        console.log("Backend update complete!");
    }
    catch(err) {
        console.log("Error:", err);
    }
    client.close();
}
run();
