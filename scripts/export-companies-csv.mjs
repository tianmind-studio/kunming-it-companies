import fs from "node:fs";
import { CSV_FILE, getCompanies, readDataset, toCsv } from "./companies-lib.mjs";

const companies = getCompanies(readDataset());
const next = toCsv(companies);

if (process.argv.includes("--check")) {
  const current = fs.existsSync(CSV_FILE) ? fs.readFileSync(CSV_FILE, "utf8") : "";
  if (current !== next) {
    console.error("data/companies.csv is out of date. Run `npm run export:csv`.");
    process.exit(1);
  }
  console.log("data/companies.csv is up to date.");
} else {
  fs.writeFileSync(CSV_FILE, next);
  console.log(`Exported data/companies.csv with ${companies.length} companies.`);
}
