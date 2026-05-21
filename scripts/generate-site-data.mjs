import fs from "node:fs";
import { SITE_DATA_FILE, stableSiteDataJson } from "./site-data-lib.mjs";

const next = stableSiteDataJson();
const check = process.argv.includes("--check");
const current = fs.existsSync(SITE_DATA_FILE) ? fs.readFileSync(SITE_DATA_FILE, "utf8") : "";

if (check) {
  if (current !== next) {
    console.error("data/site-data.json is out of date. Run: node scripts/generate-site-data.mjs");
    process.exit(1);
  }
  console.log("data/site-data.json is up to date.");
} else {
  fs.writeFileSync(SITE_DATA_FILE, next);
  console.log("Generated data/site-data.json");
}
