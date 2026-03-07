import FtpDeploy from "ftp-deploy";
import 'dotenv/config';

const ftpDeploy = new FtpDeploy();

const config = {
  user: process.env.FTP_USERNAME,
  password: process.env.FTP_PASSWORD,
  host: process.env.FTP_SERVER,
  port: parseInt(process.env.FTP_PORT || "21"),
  localRoot: "./dist",
  remoteRoot: process.env.FTP_REMOTE_DIR || "/public_html/",
  include: ["*", "**/*"],
  exclude: [],
  deleteRemote: true,
  forcePasv: true,
};

ftpDeploy.on("uploading", ({ transferredFileCount, totalFilesCount, filename }) => {
  console.log(`[${transferredFileCount}/${totalFilesCount}] ${filename}`);
});

ftpDeploy.on("uploaded", ({ transferredFileCount, totalFilesCount }) => {
  console.log(`✅ Done: ${transferredFileCount}/${totalFilesCount}`);
});

ftpDeploy.on("log", (data) => console.log(data));

console.log("🚀 Starting FTP deploy to primeos.primeodontologia.com.br...\n");

ftpDeploy
  .deploy(config)
  .then(() => console.log("\n✅ Deploy complete! Visit: https://primeos.primeodontologia.com.br"))
  .catch(err => console.error("❌ Deploy failed:", err));
  