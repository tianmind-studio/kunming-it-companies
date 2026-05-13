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
  ],
  "data/source-leads.csv": [
    "id",
    "direction",
    "source_title",
    "source_type",
    "source_url",
    "city",
    "keyword",
    "last_checked",
    "status",
    "notes"
  ]
};

const REQUIRED_SOURCE_LEADS_PER_DIRECTION = 5;
const SOURCE_LEAD_DIRECTIONS = [
  "软件开发 / 外包",
  "系统集成 / 政企信息化",
  "AI / 大数据",
  "农业数字化",
  "医疗信息化",
  "文旅科技",
  "金融科技",
  "网络安全",
  "通信 / ICT"
];

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

function isDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function rowObject(header, cells) {
  return Object.fromEntries(header.map((name, index) => [name, cells[index] || ""]));
}

const sourceLeadCounts = new Map(SOURCE_LEAD_DIRECTIONS.map((direction) => [direction, 0]));
const privateContactPattern = /(1[3-9]\d{9}|微信号|私人微信|手机号|QQ群|QQ：|QQ:)/;

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
    const lineNo = index + 2;
    if (cells.length !== expectedHeader.length) {
      errors.push(`${file}:${lineNo}: expected ${expectedHeader.length} columns, got ${cells.length}`);
      continue;
    }

    const row = rowObject(expectedHeader, cells);
    if (!row.id.trim()) errors.push(`${file}:${lineNo}: missing id.`);
    if (row.source_url && !isHttpUrl(row.source_url)) errors.push(`${file}:${lineNo}: source_url must be HTTP(S).`);
    if (row.last_checked && !isDate(row.last_checked)) errors.push(`${file}:${lineNo}: last_checked must use YYYY-MM-DD.`);
    if (row.posted_at && !isDate(row.posted_at)) errors.push(`${file}:${lineNo}: posted_at must use YYYY-MM-DD.`);
    if (row.date && row.date !== "unknown" && !isDate(row.date)) errors.push(`${file}:${lineNo}: date must use YYYY-MM-DD or unknown.`);
    if (row.publish_date && row.publish_date !== "unknown" && !isDate(row.publish_date)) errors.push(`${file}:${lineNo}: publish_date must use YYYY-MM-DD or unknown.`);

    const privateContactText = [row.notes, row.contact_method, row.organizer, row.company_name].filter(Boolean).join(" ");
    if (privateContactPattern.test(privateContactText)) errors.push(`${file}:${lineNo}: row may contain private contact-like text.`);

    if (file === "data/source-leads.csv") {
      if (!SOURCE_LEAD_DIRECTIONS.includes(row.direction)) errors.push(`${file}:${lineNo}: unsupported direction ${row.direction}.`);
      if (row.direction && sourceLeadCounts.has(row.direction)) sourceLeadCounts.set(row.direction, sourceLeadCounts.get(row.direction) + 1);
      if (row.status !== "seed_source") errors.push(`${file}:${lineNo}: source leads must use status=seed_source.`);
      if (row.source_type !== "recruiting_platform" && row.source_type !== "official_portal" && row.source_type !== "government_portal" && row.source_type !== "event_platform") {
        errors.push(`${file}:${lineNo}: unsupported source_type ${row.source_type}.`);
      }
    }
  }
}

for (const [direction, count] of sourceLeadCounts) {
  if (count < REQUIRED_SOURCE_LEADS_PER_DIRECTION) {
    errors.push(`data/source-leads.csv: ${direction} needs at least ${REQUIRED_SOURCE_LEADS_PER_DIRECTION} source leads, got ${count}.`);
  }
}

if (errors.length) {
  console.error(`CSV validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`CSV validation passed: ${Object.keys(datasets).length} datasets.`);
