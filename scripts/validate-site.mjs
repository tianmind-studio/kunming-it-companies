import fs from "node:fs";
import { getCompanies, readDataset } from "./companies-lib.mjs";

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
assert(index.includes("guides.html"), "index.html should link to a user-facing guides page.");
assert(index.includes("docs/use-cases.html"), "index.html should link to role-based usage guidance as HTML.");
assert(index.includes("docs/search-guide.html"), "index.html should link to search guidance as HTML.");
assert(index.includes("docs/reuse-and-citation.html"), "index.html should link to reuse/citation guidance as HTML.");
assert(index.includes("docs/takedown-and-correction.html"), "index.html should link to correction guidance as HTML.");
assert(index.includes("submit.html"), "index.html should link to the low-friction submission page.");
assert(index.includes("assets/wechat-qr.jpg") && index.includes("beizhushaonlan"), "index.html should expose the approved maintainer WeChat community contact.");
assert(index.includes('id="heroSearchForm"') && index.includes('id="directory"'), "index.html should expose a first-screen search flow and directory preview.");
assert(fs.existsSync("robots.txt"), "robots.txt should exist for indexing.");
assert(fs.existsSync("sitemap.xml") && read("sitemap.xml").includes("docs/search-guide.html"), "sitemap.xml should include public HTML guidance pages.");
assert(read("guides.html").includes("docs/promotion.html"), "guides.html should expose the public sharing copy page.");
assert(read("guides.html").includes("docs/data-cleanup-plan.html"), "guides.html should expose the data cleanup plan page.");
assert(read("guides.html").includes("docs/data-change-summary.html"), "guides.html should expose the data change summary page.");
assert(read("sitemap.xml").includes("docs/promotion.html"), "sitemap.xml should include the public sharing copy page.");
assert(read("sitemap.xml").includes("docs/data-cleanup-plan.html"), "sitemap.xml should include the data cleanup plan page.");
assert(read("sitemap.xml").includes("docs/data-change-summary.html"), "sitemap.xml should include the data change summary page.");

const requiredIds = [
  "sourceLeadCount",
  "communityCount",
  "eventCount",
  "projectCount",
  "sourceLeadList",
  "communityList",
  "eventList",
  "projectList",
  "heroCompanyCount",
  "heroSourceLeadCount",
  "heroStrongSourceCount",
  "heroPendingCount",
  "strongSourceCount",
  "verifiedRatio",
  "missingDistrictCount",
  "weakSourceCount",
  "audienceSelect",
  "opportunitySelect",
  "sortSelect",
  "activeFilters",
  "resetFilters",
  "copySearchLink",
  "downloadResultCsv",
  "directionBreakdown",
  "districtBreakdown",
  "reviewQueueList",
  "companyDialog",
  "companyDialogBody"
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
const dataset = readDataset();
const companies = getCompanies(dataset);
const strongSourceCount = companies.filter((company) => ["verified", "official_page"].includes(company.verification_status)).length;
const pendingCount = companies.filter((company) => company.verification_status === "community_pending").length;
const missingDistrictCount = companies.filter((company) => !company.district).length;
const weakSourceCount = companies.filter((company) => Number(company.confidence_score || 0) <= 2).length;
const verifiedRatio = companies.length ? `${Math.round((strongSourceCount / companies.length) * 100)}%` : "0%";

function assertStaticStat(id, expected) {
  assert(index.includes(`id="${id}">${expected}</strong>`), `index.html static fallback for #${id} should be ${expected}.`);
}

assert(sourceLeads.length >= 45, "source-leads should keep at least 45 seed entries.");
assert(communities.length >= 8, "communities should include the community pilot entry.");
assert(events.length >= 6, "events should include public event source entries.");
assert(projects.length >= 3, "gov-projects should include public project source entries.");
assertStaticStat("heroCompanyCount", companies.length);
assertStaticStat("heroSourceLeadCount", sourceLeads.length);
assertStaticStat("heroStrongSourceCount", strongSourceCount);
assertStaticStat("heroPendingCount", pendingCount);
assertStaticStat("heroUpdatedAt", dataset.meta?.updated_at || "-");
assertStaticStat("companyCount", companies.length);
assertStaticStat("strongSourceCount", strongSourceCount);
assertStaticStat("pendingCount", pendingCount);
assertStaticStat("sourceLeadCount", sourceLeads.length);
assertStaticStat("communityCount", communities.length);
assertStaticStat("eventCount", events.length);
assertStaticStat("projectCount", projects.length);
assertStaticStat("sourceDate", dataset.meta?.updated_at || "-");
assertStaticStat("verifiedRatio", verifiedRatio);
assertStaticStat("missingDistrictCount", missingDistrictCount);
assertStaticStat("weakSourceCount", weakSourceCount);
assert(script.includes("renderSourceLeadSummary"), "script.js should render source lead summary.");
assert(script.includes("renderResourceCards"), "script.js should render resource cards.");
assert(script.includes("safeHref"), "script.js should guard dynamic href values.");
assert(script.includes("loadJson"), "script.js should check JSON fetch responses before rendering.");
assert(script.includes("applyIntent"), "script.js should wire search-intent shortcuts.");
assert(script.includes("renderFeatured"), "script.js should render first-screen company previews.");
assert(script.includes("buildQueryGroups") && script.includes("matchesQueryGroups"), "script.js should support natural-language search intent matching.");
assert(script.includes("queryIntentPatterns") && script.includes("queryStopWords"), "script.js should normalize local search phrases such as Kunming software company.");
assert(script.includes("currentSearchState") && script.includes("syncUrl"), "script.js should keep shareable filter state in the URL.");
assert(script.includes("downloadCurrentCsv"), "script.js should export the current filtered result set.");
assert(script.includes("openCompanyDialog"), "script.js should expose company detail dialogs.");
assert(script.includes("renderInsights"), "script.js should render dataset insight panels.");
assert(script.includes("matchesAudience") && script.includes("matchesOpportunity"), "script.js should filter by audience and opportunity hints.");
assert(script.includes("sourceTypeText"), "script.js should render source type labels.");
assert(!index.includes("docs/share-kit.md"), "index.html should not link owner-facing share kit content.");
assert(!index.includes("docs/search-guide.md") && !index.includes("docs/use-cases.md"), "index.html should not expose Markdown docs as the main user path.");
assert(index.includes("docs/project-brief.html"), "index.html should link the public project brief as HTML.");
assert(read("scripts/build-static-site.mjs").includes("generateMarkdownPages"), "build script should generate HTML pages from public Markdown docs.");
assert(read("scripts/build-static-site.mjs").includes("promotion.md"), "build script should render the public sharing copy page.");
assert(read("scripts/build-static-site.mjs").includes("data-cleanup-plan.md"), "build script should render the data cleanup plan page.");
assert(read("scripts/build-static-site.mjs").includes("data-change-summary.md"), "build script should render the data change summary page.");
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
