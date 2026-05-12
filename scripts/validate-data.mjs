import {
  ALLOWED_OPPORTUNITIES,
  ALLOWED_SOURCE_TYPES,
  ALLOWED_VERIFICATION_STATUS,
  getCompanies,
  readDataset
} from "./companies-lib.mjs";

const dataset = readDataset();
const companies = getCompanies(dataset);
const errors = [];

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
  assert(dataset.meta.primary_source === "data/companies.json", "meta.primary_source must be data/companies.json.");
}

const ids = new Set();

for (const company of companies) {
  const label = company.id || company.name || "unknown";

  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(company.id), `${label}: id must be a lowercase slug.`);
  assert(!ids.has(company.id), `${label}: duplicate id.`);
  ids.add(company.id);

  for (const field of ["name", "city", "category", "source_url", "source_type", "verification_status", "last_checked", "notes"]) {
    assert(typeof company[field] === "string" && company[field].trim().length > 0, `${label}: missing ${field}.`);
  }

  assert(Array.isArray(company.tags) && company.tags.length >= 2, `${label}: tags must include at least 2 items.`);
  assert(company.tags.every((tag) => typeof tag === "string" && tag.trim()), `${label}: tags must be non-empty strings.`);
  assert(isHttpUrl(company.source_url), `${label}: source_url must be a valid HTTP(S) URL.`);
  assert(company.website === "" || isHttpUrl(company.website), `${label}: website must be a valid HTTP(S) URL or empty.`);
  assert(isDate(company.last_checked), `${label}: last_checked must use YYYY-MM-DD.`);
  assert(ALLOWED_SOURCE_TYPES.has(company.source_type), `${label}: invalid source_type value.`);
  assert(ALLOWED_VERIFICATION_STATUS.has(company.verification_status), `${label}: invalid verification_status value.`);
  assert(Array.isArray(company.opportunities) && company.opportunities.length > 0, `${label}: opportunities must be a non-empty array.`);
  for (const opportunity of company.opportunities) {
    assert(ALLOWED_OPPORTUNITIES.has(opportunity), `${label}: invalid opportunity value ${opportunity}.`);
  }
  assert(Number.isInteger(company.confidence_score) && company.confidence_score >= 1 && company.confidence_score <= 5, `${label}: confidence_score must be 1-5.`);
  for (const field of ["suitable_for_students", "suitable_for_freelancers", "suitable_for_job_seekers", "suitable_for_founders"]) {
    assert(typeof company[field] === "boolean", `${label}: ${field} must be boolean.`);
  }

  const privateContactPattern = /(1[3-9]\d{9}|微信号|私人微信|手机号|QQ群|QQ：|QQ:)/;
  assert(!privateContactPattern.test(company.notes), `${label}: notes may contain private contact-like text.`);
}

if (errors.length) {
  console.error(`Data validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Data validation passed: ${companies.length} companies.`);
