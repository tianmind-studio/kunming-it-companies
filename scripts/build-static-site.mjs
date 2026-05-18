import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "dist");

const rootFiles = [
  "index.html",
  "submit.html",
  "styles.css",
  "script.js",
  "submit.js",
  "COMPANIES.md",
  "README.md",
  "README.en.md",
  "SUPPORT.md",
  "LICENSE",
  "robots.txt",
  "sitemap.xml"
];

const dirs = ["assets", "data", "docs"];

function shouldSkip(name) {
  return name === ".DS_Store" || name.startsWith("._");
}

function copyFile(relativePath) {
  const source = path.join(root, relativePath);
  const target = path.join(outDir, relativePath);
  if (!fs.existsSync(source)) throw new Error(`Missing required site file: ${relativePath}`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function copyDir(relativeDir) {
  const sourceDir = path.join(root, relativeDir);
  const targetDir = path.join(outDir, relativeDir);
  if (!fs.existsSync(sourceDir)) throw new Error(`Missing required site directory: ${relativeDir}`);

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    if (shouldSkip(entry.name)) continue;
    const childRelative = path.join(relativeDir, entry.name);
    const childSource = path.join(root, childRelative);
    const childTarget = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyDir(childRelative);
    } else if (entry.isFile()) {
      fs.mkdirSync(path.dirname(childTarget), { recursive: true });
      fs.copyFileSync(childSource, childTarget);
    }
  }
}

function removeJunkFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (shouldSkip(entry.name)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    } else if (entry.isDirectory()) {
      removeJunkFiles(fullPath);
    }
  }
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const file of rootFiles) copyFile(file);
for (const dir of dirs) copyDir(dir);
removeJunkFiles(outDir);

console.log(`Static site built into ${path.relative(root, outDir)}/`);
