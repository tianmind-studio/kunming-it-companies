import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

export const SITE_DATA_FILE = path.join(root, "data/site-data.json");

const csvResources = [
  ["sourceLeads", "data/source-leads.csv"],
  ["communities", "data/communities.csv"],
  ["events", "data/events.csv"],
  ["projects", "data/gov-projects.csv"]
];

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

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const header = parseCsvLine(lines[0] || "");
  if (!header.length) return [];
  return lines.slice(1).filter(Boolean).map((line) => {
    const cells = parseCsvLine(line);
    return Object.fromEntries(header.map((field, index) => [field, cells[index] || ""]));
  });
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function readCsv(relativePath) {
  return parseCsv(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

export function createSiteDataPayload() {
  const payload = {
    dataset: readJson("data/companies.json")
  };

  for (const [field, relativePath] of csvResources) {
    payload[field] = readCsv(relativePath);
  }

  return payload;
}

export function stableSiteDataJson(payload = createSiteDataPayload()) {
  return `${JSON.stringify(payload, null, 2)}\n`;
}

export function safeJsonForHtml(payload = createSiteDataPayload()) {
  return JSON.stringify(payload)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}
