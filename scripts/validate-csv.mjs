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

const SOURCE_LEAD_SOURCE_TYPES = new Set([
  "recruiting_platform",
  "official_portal",
  "government_portal",
  "public_resource_portal",
  "university_portal",
  "event_platform",
  "industry_association",
  "incubator_or_park",
  "open_source",
  "media_database",
  "search_engine_query"
]);

const STATUS_BY_FILE = {
  "data/source-leads.csv": new Set(["seed_source"]),
  "data/communities.csv": new Set(["source_homepage", "source_search_page", "pilot_active", "unknown"]),
  "data/events.csv": new Set(["source_homepage", "source_search_page", "upcoming", "past", "canceled", "unknown"]),
  "data/gov-projects.csv": new Set(["source_homepage", "source_notice", "awarded", "closed", "unknown"]),
  "data/jobs.csv": new Set(["source_homepage", "source_search_page", "open", "closed", "unknown"])
};

const errors = [];
const privateContactPattern = /(1[3-9]\d{9}|微信号|私人微信|手机号|QQ群|QQ[:：]?\s*\d{5,}|wechat|weixin|二维码|qr\s*code|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/iu;

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
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
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

function nonUrlText(row) {
  return Object.entries(row)
    .filter(([key]) => !key.endsWith("url") && key !== "source_url" && key !== "website")
    .map(([, value]) => value)
    .filter(Boolean)
    .join(" ");
}

const sourceLeadCounts = new Map(SOURCE_LEAD_DIRECTIONS.map((direction) => [direction, 0]));

for (const [file, expectedHeader] of Object.entries(datasets)) {
  if (!fs.existsSync(file)) {
    errors.push(`${file}: missing file`);
    continue;
  }

  const content = fs.readFileSync(file, "utf8").trimEnd();
  const lines = content.split(/\r?\n/);
  const header = parseCsvLine(lines[0] || "");
  const ids = new Set();

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
    if (row.id && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.id)) errors.push(`${file}:${lineNo}: id must be a lowercase slug.`);
    if (row.id && ids.has(row.id)) errors.push(`${file}:${lineNo}: duplicate id ${row.id}.`);
    if (row.id) ids.add(row.id);

    if (expectedHeader.includes("source_url") && !row.source_url) errors.push(`${file}:${lineNo}: missing source_url.`);
    if (row.source_url && !isHttpUrl(row.source_url)) errors.push(`${file}:${lineNo}: source_url must be HTTP(S).`);
    if (row.last_checked && !isDate(row.last_checked)) errors.push(`${file}:${lineNo}: last_checked must use a valid YYYY-MM-DD date.`);
    if (row.posted_at && !isDate(row.posted_at)) errors.push(`${file}:${lineNo}: posted_at must use a valid YYYY-MM-DD date.`);
    if (row.date && row.date !== "unknown" && !isDate(row.date)) errors.push(`${file}:${lineNo}: date must use YYYY-MM-DD or unknown.`);
    if (row.publish_date && row.publish_date !== "unknown" && !isDate(row.publish_date)) errors.push(`${file}:${lineNo}: publish_date must use YYYY-MM-DD or unknown.`);

    if (privateContactPattern.test(nonUrlText(row))) errors.push(`${file}:${lineNo}: row may contain private contact-like text.`);

    if (row.status && STATUS_BY_FILE[file] && !STATUS_BY_FILE[file].has(row.status)) {
      errors.push(`${file}:${lineNo}: unsupported status ${row.status}.`);
    }

    if (file === "data/source-leads.csv") {
      if (!SOURCE_LEAD_DIRECTIONS.includes(row.direction)) errors.push(`${file}:${lineNo}: unsupported direction ${row.direction}.`);
      if (row.direction && sourceLeadCounts.has(row.direction)) sourceLeadCounts.set(row.direction, sourceLeadCounts.get(row.direction) + 1);
      if (!SOURCE_LEAD_SOURCE_TYPES.has(row.source_type)) errors.push(`${file}:${lineNo}: unsupported source_type ${row.source_type}.`);
    }

    if (file === "data/events.csv" && row.status === "source_search_page") {
      if (row.date !== "unknown") errors.push(`${file}:${lineNo}: source_search_page events must use date=unknown.`);
      const impliesConfirmedEvent = /已确认|正在举办|报名中/.test(row.notes) || (/当前有/.test(row.notes) && !/不代表当前有/.test(row.notes));
      if (impliesConfirmedEvent) errors.push(`${file}:${lineNo}: search-page event notes must not imply a confirmed event.`);
    }

    if (file === "data/gov-projects.csv" && row.status === "source_homepage") {
      if (row.budget) errors.push(`${file}:${lineNo}: source_homepage gov project rows must leave budget empty.`);
      if (row.publish_date !== "unknown") errors.push(`${file}:${lineNo}: source_homepage gov project rows must use publish_date=unknown.`);
    }

    if (file === "data/jobs.csv" && ["source_homepage", "source_search_page"].includes(row.status)) {
      if (row.salary_range) errors.push(`${file}:${lineNo}: source homepage/search job rows must leave salary_range empty.`);
      if (row.status === "source_search_page" && row.posted_at && row.posted_at !== "unknown") errors.push(`${file}:${lineNo}: source_search_page job rows must not invent posted_at.`);
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
