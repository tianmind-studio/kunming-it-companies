import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { getCompanies, readDataset } from "./companies-lib.mjs";

const root = process.cwd();
const dist = path.join(root, "dist");
const errors = [];
const indexNowKey = "7b2f684dc42149d8a7e103c36f2a90be";

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(dist, relativePath), "utf8");
}

// Replacement-string tokens such as $& in source code must stay literal when
// assets are inlined; checking source files alone cannot catch a corrupted build.
const home = read("index.html");
const inlineModule = home.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
assert(inlineModule?.trim() === read("script.js").trim(), "built inline module must exactly preserve script.js, including replacement-string tokens.");
const inlineStyle = home.match(/<style>([\s\S]*?)<\/style>/)?.[1];
assert(inlineStyle?.trim() === read("styles.css").trim(), "built inline CSS must exactly preserve styles.css.");
if (inlineModule) {
  const parsed = spawnSync(process.execPath, ["--input-type=module", "--check"], { input:inlineModule, encoding:"utf8", timeout:10000 });
  assert(parsed.status === 0, "built inline JavaScript must parse as an ES module.");
}

const dataset = readDataset();
const companies = getCompanies(dataset)
  .filter((company) => ["verified", "official_page"].includes(company.verification_status));
const companyDir = path.join(dist, "companies");
const generatedPages = fs.existsSync(companyDir)
  ? fs.readdirSync(companyDir).filter((file) => file.endsWith(".html") && file !== "index.html")
  : [];
const sitemap = read("sitemap.xml");
const index = read("companies/index.html");
const indexNowKeyText = read(`${indexNowKey}.txt`);
const sitemapLocs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const companySitemapLocs = sitemapLocs.filter((url) => url.startsWith("https://kunming.tianmind.com/companies/"));
const expectedCompanyLocs = [
  "https://kunming.tianmind.com/companies/",
  ...companies.map((company) => `https://kunming.tianmind.com/companies/${company.id}.html`)
];
const indexLastmodMatch = sitemap.match(/<loc>https:\/\/kunming\.tianmind\.com\/companies\/<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/);

assert(generatedPages.length === companies.length, `expected ${companies.length} company pages, found ${generatedPages.length}.`);
assert(indexNowKeyText.trim() === indexNowKey, "IndexNow verification file name and content should match.");
assert(index.includes("已核验公司公开记录") && index.includes('"@type": "ItemList"'), "company index should expose visible context and ItemList JSON-LD.");
assert(new Set(companySitemapLocs).size === companySitemapLocs.length, "company sitemap URLs must not contain duplicates.");
assert(companySitemapLocs.length === expectedCompanyLocs.length, "company sitemap URL count should match the company index plus generated detail pages.");
assert(expectedCompanyLocs.every((url) => companySitemapLocs.includes(url)), "company sitemap must contain the exact generated company URL set.");
assert(companySitemapLocs.every((url) => expectedCompanyLocs.includes(url)), "company sitemap must not contain orphan company URLs.");
assert(indexLastmodMatch?.[1] === dataset.meta?.updated_at, "company index sitemap lastmod must match meta.updated_at.");

for (const company of companies) {
  const file = `${company.id}.html`;
  const relativePath = `companies/${file}`;
  assert(generatedPages.includes(file), `${relativePath} is missing.`);
  if (!generatedPages.includes(file)) continue;
  const html = read(relativePath);
  const name = company.name_zh || company.name;
  assert(html.includes(name), `${relativePath} should include the company name.`);
  assert(html.includes(`https://kunming.tianmind.com/${relativePath}`), `${relativePath} should include its canonical URL.`);
  assert(html.includes('"@type": "ProfilePage"') && html.includes('"@type": "Organization"'), `${relativePath} should include ProfilePage and Organization JSON-LD.`);
  assert(!html.includes(`<td>${company.source_type}</td>`), `${relativePath} should render a human source-type label, not the raw enum.`);
  assert(html.includes("不构成公司排名、商业推荐、招聘承诺或第三方背书"), `${relativePath} should include the public-record boundary.`);
  assert(sitemap.includes(`https://kunming.tianmind.com/${relativePath}`), `sitemap should include ${relativePath}.`);
}

const target = read("companies/kunming-bianyi-xianshi-tech.html");
const targetJsonLdText = target.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
const targetJsonLd = targetJsonLdText ? JSON.parse(targetJsonLdText) : null;
assert(target.includes("昆明编译现实科技有限公司"), "target company page should include the exact company name.");
assert(target.includes("GEO") && target.includes("AI 搜索可见性"), "target company page should include its source-backed GEO service terms.");
assert(target.includes("https://tianmind.com/company/") && target.includes("https://tianmind.com/geo-kunming/"), "target company page should link the official company and GEO sources.");
assert(targetJsonLd?.mainEntity?.["@id"] === "https://tianmind.com/#organization", "target Organization should reuse the canonical entity @id.");
assert(targetJsonLd?.mainEntity?.url === "https://tianmind.com/", "target Organization URL should point to the organization homepage.");

for (const relativePath of ["README.html", "SUPPORT.html", ...fs.readdirSync(path.join(dist, "docs")).filter((file) => file.endsWith(".html")).map((file) => `docs/${file}`)]) {
  const html = read(relativePath);
  assert(!/href=["']\s*(?:javascript|data|vbscript):/i.test(html), `${relativePath} must not contain an active dangerous link protocol.`);
}

function listHtmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? listHtmlFiles(file) : entry.name.endsWith(".html") ? [file] : [];
  });
}

// Check the actual publication artifact, including generated docs and detail pages.
// This is local-only: external source URLs are not fetched or treated as live checks.
const htmlFiles = listHtmlFiles(dist);
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  const relative = path.relative(dist, file);
  for (const [, rawHref] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const href = rawHref.replaceAll("&amp;", "&");
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href)) continue;
    let url;
    let target;
    try {
      url = new URL(href, `https://build.invalid/${relative}`);
      target = path.resolve(dist, `.${decodeURIComponent(url.pathname)}`);
    } catch {
      assert(false, `${relative}: malformed internal URL.`);
      continue;
    }
    if (target !== dist && !target.startsWith(dist + path.sep)) {
      assert(false, `${relative}: internal URL escapes the built site.`);
      continue;
    }
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, "index.html");
    assert(fs.existsSync(target), `${relative}: missing local link or asset ${href}.`);
    if (url.hash && fs.existsSync(target) && target.endsWith(".html")) {
      let fragment;
      try { fragment = decodeURIComponent(url.hash.slice(1)); }
      catch { assert(false, `${relative}: malformed URL fragment.`); continue; }
      const targetHtml = fs.readFileSync(target, "utf8");
      assert(targetHtml.includes(`id="${fragment}"`), `${relative}: missing anchor target ${href}.`);
    }
  }
}

if (errors.length) {
  console.error(`Built-site validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Built-site validation passed: ${companies.length} verified company pages; local links, assets and anchors checked across ${htmlFiles.length} HTML files.`);
