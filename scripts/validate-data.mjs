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
const privateContactPattern = /(1[3-9]\d{9}|微信号|私人微信|手机号|QQ群|QQ[:：]?\s*\d{5,}|wechat|weixin|二维码|qr\s*code|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/iu;

function assert(condition, message) {
  if (!condition) errors.push(message);
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

const verificationMap = {
  official_site: "verified",
  official_profile: "official_page",
  community_pending: "community_pending"
};

assert(dataset && typeof dataset === "object", "Dataset must be an object.");
assert(dataset.meta && typeof dataset.meta === "object", "Missing meta object.");
assert(Array.isArray(dataset.companies), "Missing companies array.");

if (dataset.meta) {
  assert(isDate(dataset.meta.updated_at), "meta.updated_at must use a valid YYYY-MM-DD date.");
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
  assert(isDate(company.last_checked), `${label}: last_checked must use a valid YYYY-MM-DD date.`);
  assert(ALLOWED_SOURCE_TYPES.has(company.source_type), `${label}: invalid source_type value.`);
  assert(ALLOWED_VERIFICATION_STATUS.has(company.verification_status), `${label}: invalid verification_status value.`);
  assert(Array.isArray(company.source_urls) && company.source_urls.length > 0, `${label}: source_urls must be a non-empty array.`);
  if (Array.isArray(company.source_urls)) {
    for (const url of company.source_urls) assert(isHttpUrl(url), `${label}: source_urls contains invalid URL ${url}.`);
    assert(company.source_urls.includes(company.source_url), `${label}: source_url must also appear in source_urls.`);
  }
  if (company.source_type === "official_site") {
    assert(Boolean(company.website), `${label}: official_site records must have website.`);
    assert(company.website === company.source_url, `${label}: official_site records should use website as source_url.`);
  }
  assert(Array.isArray(company.opportunities) && company.opportunities.length > 0, `${label}: opportunities must be a non-empty array.`);
  for (const opportunity of company.opportunities) {
    assert(ALLOWED_OPPORTUNITIES.has(opportunity), `${label}: invalid opportunity value ${opportunity}.`);
  }
  if (company.verification_status === "community_pending") {
    assert(company.opportunities.length === 1 && company.opportunities[0] === "unknown", `${label}: community_pending records must keep opportunities=["unknown"].`);
    assert(company.confidence_score <= 3, `${label}: community_pending confidence_score must be <= 3.`);
  }
  if (["government_public_list", "community_list"].includes(company.source_type)) {
    assert(company.confidence_score <= 2, `${label}: weak list-only sources must keep confidence_score <= 2 until upgraded.`);
  }
  assert(Number.isInteger(company.confidence_score) && company.confidence_score >= 1 && company.confidence_score <= 5, `${label}: confidence_score must be 1-5.`);
  for (const field of ["suitable_for_students", "suitable_for_freelancers", "suitable_for_job_seekers", "suitable_for_founders"]) {
    assert(typeof company[field] === "boolean", `${label}: ${field} must be boolean.`);
  }

  if (company.name_zh !== undefined) assert(company.name === company.name_zh, `${label}: name must match legacy name_zh while both fields exist.`);
  if (company.name_en !== undefined) assert(company.english_name === company.name_en, `${label}: english_name must match legacy name_en while both fields exist.`);
  if (company.summary_zh !== undefined) assert(company.notes === company.summary_zh, `${label}: notes must match legacy summary_zh while both fields exist.`);
  if (company.source_checked_at !== undefined) assert(company.last_checked === company.source_checked_at, `${label}: last_checked must match legacy source_checked_at while both fields exist.`);
  if (company.verification !== undefined && verificationMap[company.verification]) {
    assert(company.verification_status === verificationMap[company.verification], `${label}: verification_status must match legacy verification.`);
  }

  assert(!privateContactPattern.test(company.notes), `${label}: notes may contain private contact-like text.`);
}

if (errors.length) {
  console.error(`Data validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Data validation passed: ${companies.length} companies.`);
