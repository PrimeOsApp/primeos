import FtpDeploy from "ftp-deploy";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually
const envFile = readFileSync(resolve(__dirname, "../.env"), "utf-8");
const env = Object.fromEntries(
  envFile.split("\n")
    .filter(line => line && !line.startsWith("#"))
    .map(line => {
      const [key, ...rest] = line.split("=");
      return [key.trim(), rest.join("=").trim()];
    })
);

// Create .htaccess for SPA routing
const htaccess = `Options -Indexes
RewriteEngine On
RewriteBase /
RewriteRule ^index\\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]`;

writeFileSync(resolve(__dirname, "../dist/.htaccess"), htaccess);
console.log("✅ .htaccess created\n");

const ftpDeploy = new FtpDeploy();

const config = {
  user: "u188684587",
  password: env.FTP_PASSWORD,
  host: "89.117.7.117",
  port: 21,
  localRoot: resolve(__dirname, "../dist"),
  remoteRoot: "/public_html/primeos/",
  include: ["*", "**/*", ".htaccess"],
  exclude: [],
  deleteRemote: false,
  forcePasv: true,
  sftp: false,
};

console.log("🚀 Deploying to primeos.primeodontologia.com.br...\n");
console.log(`   Host: ${config.host}`);
console.log(`   User: ${config.user}`);
console.log(`   Port: ${config.port}`);
console.log(`   Dir:  ${config.remoteRoot}\n`);

ftpDeploy.on("uploading", ({ transferredFileCount, totalFilesCount, filename }) => {
  console.log(`[${transferredFileCount}/${totalFilesCount}] ${filename}`);
});

ftpDeploy.on("log", (data) => console.log(data));

ftpDeploy
  .deploy(config)
  .then(() => console.log("\n✅ Deploy complete! https://primeos.primeodontologia.com.br"))
  .catch(err => console.error("❌ Deploy failed:", err));
  