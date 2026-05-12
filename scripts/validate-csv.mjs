import fs from "node:fs";
import { DATA_FIELDS } from "./companies-lib.mjs";

const datasets = {
  "data/companies.csv": DATA_FIELDS,
  "data/jobs.csv": [
    "id",
    "company_name",
    "role",
    "job_type",
    "city",
    "district",
    "salary_range",
    "source_url",
    "posted_at",
    "last_checked",
    "status",
    "notes"
  ],
  "data/events.csv": [
    "id",
    "name",
    "event_type",
    "date",
    "city",
    "venue",
    "organizer",
    "source_url",
    "status",
    "notes"
  ],
  "data/communities.csv": [
    "id",
    "name",
    "community_type",
    "city",
    "contact_method",
    "source_url",
    "status",
    "notes"
  ],
  "data/gov-projects.csv": [
    "id",
    "project_name",
    "buyer",
    "project_type",
    "city",
    "budget",
    "publish_date",
    "source_url",
    "status",
    "notes"
  ]
};

const errors = [];

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current);
  return cells;
}

for (const [file, expectedHeader] of Object.entries(datasets)) {
  if (!fs.existsSync(file)) {
    errors.push(`${file}: missing file`);
    continue;
  }

  const content = fs.readFileSync(file, "utf8").trimEnd();
  const lines = content.split(/\r?\n/);
  const header = parseCsvLine(lines[0] || "");

  if (header.join(",") !== expectedHeader.join(",")) {
    errors.push(`${file}: header mismatch. Expected ${expectedHeader.join(",")}`);
    continue;
  }

  for (const [index, line] of lines.slice(1).entries()) {
    if (!line.trim()) continue;
    const cells = parseCsvLine(line);
    if (cells.length !== expectedHeader.length) {
      errors.push(`${file}:${index + 2}: expected ${expectedHeader.length} columns, got ${cells.length}`);
    }
  }
}

if (errors.length) {
  console.error(`CSV validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`CSV validation passed: ${Object.keys(datasets).length} datasets.`);
