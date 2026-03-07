import FtpDeploy from "ftp-deploy";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually
const envFile = readFileSync(resolve(__dirname, "../.env"), "utf-8");
const env = Object.fromEntries(
  envFile.split("\n")
    .filter(line => line && !line.startsWith("#"))
    .map(line => line.split("=").map(s => s.trim()))
);

const ftpDeploy = new FtpDeploy();

const config = {
  user: env.FTP_USERNAME,
  password: env.FTP_PASSWORD,
  host: env.FTP_SERVER,
  port: parseInt(env.FTP_PORT || "21"),
  localRoot: resolve(__dirname, "../dist"),
  remoteRoot: env.FTP_REMOTE_DIR || "/public_html/",
  include: ["*", "**/*"],
  exclude: [],
  deleteRemote: true,
  forcePasv: true,
};

ftpDeploy.on("uploading", ({ transferredFileCount, totalFilesCount, filename }) => {
  console.log(`[${transferredFileCount}/${totalFilesCount}] ${filename}`);
});

ftpDeploy.on("log", (data) => console.log(data));

console.log("Deploying to primeos.primeodontologia.com.br...\n");

ftpDeploy
  .deploy(config)
  .then(() => console.log("\nDeploy complete! https://primeos.primeodontologia.com.br"))
  .catch(err => console.error("Deploy failed:", err));