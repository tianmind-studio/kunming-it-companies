import fs from "node:fs";

const file = new URL("../data/companies.json", import.meta.url);
const dataset = JSON.parse(fs.readFileSync(file, "utf8"));

const errors = [];
const allowedVerification = new Set([
  "official_site",
  "official_profile",
  "community_pending"
]);

function assert(condition, message) {
  if (!condition) errors.push(message);
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

assert(dataset && typeof dataset === "object", "Dataset must be an object.");
assert(dataset.meta && typeof dataset.meta === "object", "Missing meta object.");
assert(Array.isArray(dataset.companies), "Missing companies array.");

if (dataset.meta) {
  assert(isDate(dataset.meta.updated_at), "meta.updated_at must use YYYY-MM-DD.");
}

const ids = new Set();

for (const company of dataset.companies || []) {
  const label = company.id || company.name_zh || "unknown";

  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(company.id), `${label}: id must be a lowercase slug.`);
  assert(!ids.has(company.id), `${label}: duplicate id.`);
  ids.add(company.id);

  for (const field of ["name_zh", "city", "category", "summary_zh", "source_checked_at", "verification", "status"]) {
    assert(typeof company[field] === "string" && company[field].trim().length > 0, `${label}: missing ${field}.`);
  }

  assert(Array.isArray(company.tags) && company.tags.length >= 2, `${label}: tags must include at least 2 items.`);
  assert(company.tags.every((tag) => typeof tag === "string" && tag.trim()), `${label}: tags must be non-empty strings.`);
  assert(Array.isArray(company.source_urls) && company.source_urls.length > 0, `${label}: source_urls must include at least one URL.`);
  assert(company.source_urls.every(isHttpUrl), `${label}: source_urls must be valid HTTP(S) URLs.`);
  assert(company.website === "" || company.website === undefined || isHttpUrl(company.website), `${label}: website must be a valid HTTP(S) URL or empty.`);
  assert(isDate(company.source_checked_at), `${label}: source_checked_at must use YYYY-MM-DD.`);
  assert(allowedVerification.has(company.verification), `${label}: invalid verification value.`);
}

if (errors.length) {
  console.error(`Data validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Data validation passed: ${dataset.companies.length} companies.`);
