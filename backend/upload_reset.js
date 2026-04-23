const ftp = require("basic-ftp");

async function run() {
    const client = new ftp.Client();
    client.ftp.verbose = false;
    try {
        await client.access({
            host: "mecanicoenmedellin.com",
            user: "mecanico",
            password: "Forastero_938@@",
            secure: false
        });
        
        await client.cd("public_html/jf/public");
        await client.uploadFrom("reset_pass.php", "reset_pass.php");
        console.log("Uploaded successfully!");
    }
    catch(err) {
        console.log("Error:", err);
    }
    client.close();
}
run();
