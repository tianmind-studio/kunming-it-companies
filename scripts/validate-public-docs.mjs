import fs from "node:fs";
import path from "node:path";
import { readDataset, getCompanies, stats, districtBucket } from "./companies-lib.mjs";

const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function listMarkdownFiles(dir) {
  return fs.readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => path.join(dir, name));
}

function listAssetFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).map((name) => path.join(dir, name));
}

const blockedFiles = [
  "docs/share-kit.md",
  "assets/wechat-qr.png",
  "assets/wechat-qr.webp"
];

const allowedMaintainerContactAssets = new Set([
  "assets/wechat-qr.jpg"
]);

for (const filePath of blockedFiles) {
  assert(!fs.existsSync(filePath), `${filePath} should not be kept in the public repository.`);
}

for (const filePath of listAssetFiles("assets")) {
  const lower = path.basename(filePath).toLowerCase();
  const isContactAsset = /(wechat|weixin|qr)/.test(lower);
  assert(!isContactAsset || allowedMaintainerContactAssets.has(filePath), `${filePath}: contact/QR assets should not be committed publicly unless it is the maintainer-approved community contact asset.`);
}

const publicDocs = [
  "AGENTS.md",
  "README.md",
  "README.en.md",
  "ROADMAP.md",
  "CONTRIBUTING.md",
  "index.html",
  "data/communities.csv",
  "data/events.csv",
  "data/gov-projects.csv",
  ...listMarkdownFiles("docs")
];

const blockedMarkers = [
  "传播文案",
  "朋友圈文案",
  "小红书文案",
  "怎么发到群",
  "社区传播",
  "求 star",
  "话术",
  "我整理了",
  "已有读者",
  "线上入口联系维护者",
  "X / Twitter 文案"
];

const maintainerContactMarkers = [
  "微信号：",
  "assets/wechat-qr",
  "wechat-qr.jpg",
  "beizhushaonlan"
];

const maintainerContactFiles = new Set([
  "README.md",
  "index.html"
]);

const directPhonePattern = /(^|[^\d])1[3-9]\d{9}([^\d]|$)/;

for (const filePath of publicDocs) {
  const body = read(filePath);
  for (const marker of blockedMarkers) {
    assert(!body.includes(marker), `${filePath} contains public-doc boundary marker: ${marker}`);
  }
  for (const marker of maintainerContactMarkers) {
    const containsMarker = body.includes(marker);
    assert(!containsMarker || maintainerContactFiles.has(filePath), `${filePath} contains maintainer contact marker outside the approved contact surfaces: ${marker}`);
  }
  assert(!directPhonePattern.test(body), `${filePath} appears to contain a direct mobile phone number.`);
}

// README snapshots must stay aligned with the generated reports and primary JSON.
const dataset = readDataset();
const companies = getCompanies(dataset);
const summary = stats(companies);
const sourceLeads = read("data/source-leads.csv").trim().split(/\r?\n/).length - 1;
const expectedSummary = [
  ["已收录公司 / 机构", "Companies / organizations", summary.total],
  ["官网已核验", "Verified official websites", summary.verified],
  ["官方页核验", "Verified official pages", summary.officialPage],
  ["社区待复核", "Community pending records", summary.pending],
  ["弱来源记录", "Weak-source records", companies.filter(company => company.confidence_score <= 2).length],
  ["缺区县记录", "Missing district records", companies.filter(company => districtBucket(company) === "待补区域").length],
  ["强来源占比", "Strong-source ratio", `${summary.total ? Math.round((summary.verified + summary.officialPage) / summary.total * 100) : 0}%`],
  ["来源种子池", "Source leads", sourceLeads]
];
for (const [file, language] of [["README.md", 0], ["README.en.md", 1]]) {
  const section = read(file).match(/<!-- DATA_SUMMARY_START -->([\s\S]*?)<!-- DATA_SUMMARY_END -->/)?.[1] || "";
  assert(Boolean(section), `${file} must delimit its dataset summary.`);
  assert(section.includes(`\`${dataset.meta.updated_at}\``), `${file} dataset date must match meta.updated_at.`);
  const rows = section.split(/\r?\n/).filter(line => line.startsWith("|")).map(line => line.split("|").slice(1, -1).map(cell => cell.trim()));
  for (const entry of expectedSummary) {
    const row = rows.find(cells => cells[0] === entry[language]);
    const actual = row?.[1]?.match(/^\d+%?/u)?.[0];
    assert(actual === String(entry[2]), `${file}: ${entry[language]} must match data/companies.json (${entry[2]}).`);
  }
}

const index = read("index.html");
const readme = read("README.md");
const agents = read("AGENTS.md");
assert(index.includes("beizhushaonlan") && index.includes("assets/wechat-qr.jpg"), "index.html should expose the approved maintainer WeChat community contact.");
assert(readme.includes("beizhushaonlan") && readme.includes("assets/wechat-qr.jpg"), "README.md should expose the approved maintainer WeChat community contact.");
assert(agents.includes("data/companies.json") && agents.includes("npm run validate"), "AGENTS.md should name the primary data source and required validation command.");
assert(agents.includes("Do not invent") && agents.includes("private"), "AGENTS.md should preserve public-source and privacy boundaries for future agents.");
assert(fs.existsSync(".github/ISSUE_TEMPLATE/bug-report.yml"), "Bug report issue template should exist.");
assert(fs.existsSync(".github/ISSUE_TEMPLATE/data-correction-privacy-request.yml"), "Data correction / privacy request issue template should exist.");
assert(fs.existsSync("docs/data-cleanup-plan.md"), "Data cleanup plan should exist.");
assert(fs.existsSync("docs/data-change-summary.md"), "Data change summary should exist.");
assert(read("package.json").includes("data:diff") && fs.existsSync("scripts/report-data-changes.mjs"), "Data diff script should be exposed in package.json.");
assert(read("package.json").includes("generate:data-cleanup") && fs.existsSync("scripts/generate-data-cleanup-plan.mjs"), "Data cleanup generator should be exposed in package.json.");

if (errors.length) {
  console.error(`Public documentation validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Public documentation validation passed: owner-facing markers are bounded and maintainer community contact is explicit.");
