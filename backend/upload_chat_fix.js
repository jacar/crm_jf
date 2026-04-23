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

        // Upload MessageController
        await client.cd("public_html/jf/app/Http/Controllers");
        await client.uploadFrom("../laravel_core/app/Http/Controllers/MessageController.php", "MessageController.php");
        console.log("Uploaded MessageController.php");

        console.log("Backend chat fix complete!");
    }
    catch(err) {
        console.log("Error:", err);
    }
    client.close();
}
run();
