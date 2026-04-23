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
        console.log("Connected to FTP!");
        
        await client.cd("public_html/jf/public");
        
        console.log("Uploading new frontend build (dist folder)...");
        await client.uploadFromDir("../frontend/dist");
        
        console.log("Upload complete successfully!");
    }
    catch(err) {
        console.log("Error:", err);
    }
    client.close();
}
run();
