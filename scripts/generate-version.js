#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const versionFile = path.join(__dirname, "../src/lib/version.ts");

try {
  const gitHash = execSync("git rev-parse --short HEAD").toString().trim();
  const gitBranch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
  const buildTime = new Date().toISOString();
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../package.json"), "utf8")
  );
  const version = packageJson.version;

  const versionContent = `// Auto-generated version file
export const VERSION = "${version}";
export const GIT_HASH = "${gitHash}";
export const GIT_BRANCH = "${gitBranch}";
export const BUILD_TIME = "${buildTime}";
export const BUILD_DATE = "${new Date().toLocaleDateString()}";
export const BUILD_TIME_LOCAL = "${new Date().toLocaleString()}";

export const getVersionString = () => \`v\${VERSION} (\${GIT_HASH}) - \${BUILD_DATE}\`;
export const getFullVersionString = () => \`v\${VERSION} on \${GIT_BRANCH} (\${GIT_HASH}) - Built \${BUILD_TIME_LOCAL}\`;
`;

  fs.writeFileSync(versionFile, versionContent);
  console.log(`✓ Generated version file: ${versionFile}`);
  console.log(`  Version: ${version}`);
  console.log(`  Git Hash: ${gitHash}`);
  console.log(`  Git Branch: ${gitBranch}`);
  console.log(`  Build Time: ${buildTime}`);
} catch (error) {
  console.error("Error generating version file:", error.message);
  process.exit(1);
}
