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

        // Upload .htaccess to root
        await client.cd("public_html");
        await client.uploadFrom("../backend/new_root_htaccess.txt", ".htaccess");
        console.log("Uploaded .htaccess to root");

        console.log("Subdomain routing complete!");
    }
    catch(err) {
        console.log("Error:", err);
    }
    client.close();
}
run();
