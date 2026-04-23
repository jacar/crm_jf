const ftp = require("basic-ftp");

async function run() {
    const client = new ftp.Client();
    client.ftp.verbose = false;
    try {
        await client.access({
            host: "ftp.mecanicoenmedellin.com",
            user: "jf@mecanicoenmedellin.com",
            password: "Forastaero_938",
            secure: false
        });
        console.log("Connected to FTP!");
        
        // Use standard directory switching. Depending on the root, it might be public_html/jf/public or just jf/public
        // Let's list the root directory first to see what's there
        const list = await client.list();
        const hasJf = list.find(l => l.name === 'jf');
        const hasPublicHtml = list.find(l => l.name === 'public_html');
        
        let targetDir = '';
        if (hasJf) {
            targetDir = 'jf/public';
        } else if (hasPublicHtml) {
            targetDir = 'public_html/jf/public';
        } else {
            console.log("Could not find jf or public_html directory. Trying jf/public directly...");
            targetDir = 'jf/public';
        }
        
        console.log("Navigating to", targetDir);
        await client.ensureDir(targetDir);
        await client.uploadFrom("import_remote.php", "import_remote.php");
        console.log("Uploaded successfully!");
    }
    catch(err) {
        console.error("Error:", err);
    }
    client.close();
}
run();
