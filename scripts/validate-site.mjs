import fs from "node:fs";

const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function read(path) {
  return fs.readFileSync(path, "utf8");
}

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
  const header = parseCsvLine(lines[0]);
  return lines.slice(1).filter(Boolean).map((line) => {
    const cells = parseCsvLine(line);
    return Object.fromEntries(header.map((field, index) => [field, cells[index] || ""]));
  });
}

const index = read("index.html");
const script = read("script.js");

assert(index.includes("assets/social-card.svg"), "index.html should include a non-private social preview image.");
assert(index.includes("昆明 IT 公司") && index.includes("Kunming tech companies"), "index.html should expose human-readable search intent copy.");
assert(index.includes("<link rel=\"canonical\" href=\"https://kunming.tianmind.com/\">"), "index.html should include the domestic canonical URL.");
assert(index.includes("application/ld+json") && index.includes("\"@type\": \"Dataset\""), "index.html should expose Dataset structured data.");
assert(index.includes("docs/use-cases.md"), "index.html should link to role-based usage guidance.");
assert(index.includes("docs/search-guide.md"), "index.html should link to search guidance.");
assert(index.includes("docs/reuse-and-citation.md"), "index.html should link to reuse/citation guidance.");
assert(index.includes("docs/takedown-and-correction.md"), "index.html should link to correction guidance.");
assert(index.includes("submit.html"), "index.html should link to the low-friction submission page.");
assert(index.includes("assets/wechat-qr.jpg") && index.includes("beizhushaonlan"), "index.html should expose the approved maintainer WeChat community contact.");
assert(fs.existsSync("robots.txt"), "robots.txt should exist for indexing.");
assert(fs.existsSync("sitemap.xml") && read("sitemap.xml").includes("docs/search-guide.md"), "sitemap.xml should include public guidance pages.");

const requiredIds = [
  "sourceLeadCount",
  "communityCount",
  "eventCount",
  "projectCount",
  "sourceLeadList",
  "communityList",
  "eventList",
  "projectList",
  "verifiedRatio",
  "missingDistrictCount",
  "weakSourceCount"
];

for (const id of requiredIds) {
  assert(index.includes(`id=\"${id}\"`), `index.html missing #${id}.`);
  assert(script.includes(id), `script.js does not reference #${id}.`);
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const sourceLeads = parseCsv(read("data/source-leads.csv"));
const communities = parseCsv(read("data/communities.csv"));
const events = parseCsv(read("data/events.csv"));
const projects = parseCsv(read("data/gov-projects.csv"));

assert(sourceLeads.length >= 45, "source-leads should keep at least 45 seed entries.");
assert(communities.length >= 8, "communities should include the community pilot entry.");
assert(events.length >= 6, "events should include public event source entries.");
assert(projects.length >= 3, "gov-projects should include public project source entries.");
assert(script.includes("renderSourceLeadSummary"), "script.js should render source lead summary.");
assert(script.includes("renderResourceCards"), "script.js should render resource cards.");
assert(script.includes("safeHref"), "script.js should guard dynamic href values.");
assert(script.includes("applyIntent"), "script.js should wire search-intent shortcuts.");
assert(script.includes("queryTokens.every"), "script.js should support multi-token search.");
assert(!index.includes("docs/share-kit.md"), "index.html should not link owner-facing share kit content.");
assert(index.includes("docs/project-brief.md"), "index.html should link the public project brief.");
assert(script.includes("weakSourceCount"), "script.js should render data quality metrics.");

for (const [label, rows] of [
  ["source-leads", sourceLeads],
  ["communities", communities],
  ["events", events],
  ["gov-projects", projects]
]) {
  for (const row of rows) {
    assert(isHttpUrl(row.source_url), `${label}:${row.id || row.name || row.project_name}: source_url must be HTTP(S).`);
  }
}

if (errors.length) {
  console.error(`Site validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Site validation passed: resource panels, search intents, and submission entry are wired.");
