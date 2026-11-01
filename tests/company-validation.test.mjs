import test from "node:test";
import assert from "node:assert/strict";
import { validateDataset } from "../scripts/company-validation-lib.mjs";
import { csvEscape } from "../scripts/companies-lib.mjs";

function fixture() {
  return {
    meta: { updated_at: "2026-09-14", primary_source: "data/companies.json" },
    companies: [{
      id: "example-team", name: "示例技术团队", english_name: "Example", city: "昆明",
      district: "", category: "软件开发", tags: ["软件", "技术"], website: "https://example.org/",
      source_url: "https://example.org/", source_urls: ["https://example.org/"],
      source_type: "official_site", verification_status: "verified", last_checked: "2026-09-14",
      notes: "官方网页提供技术服务介绍。", opportunities: ["unknown"], confidence_score: 4,
      suitable_for_students: false, suitable_for_freelancers: false,
      suitable_for_job_seekers: false, suitable_for_founders: false
    }]
  };
}
const check = (value) => validateDataset(value, { today: "2026-11-01" });

test("valid raw records pass without changing any values", () => {
  const value = fixture();
  const before = JSON.stringify(value);
  assert.deepEqual(check(value), []);
  assert.equal(JSON.stringify(value), before);
});

test("validation rejects coercible values instead of silently normalizing them", () => {
  for (const mutation of [
    { suitable_for_students: "false" }, { suitable_for_students: undefined },
    { confidence_score: "4" }, { confidence_score: 0 }, { opportunities: "unknown" },
    { tags: "软件,技术" }, { verification_status: undefined }, { name: "" },
    { source_url: undefined }, { last_checked: undefined }
  ]) {
    const value = fixture();
    Object.assign(value.companies[0], mutation);
    assert.ok(check(value).length > 0, JSON.stringify(mutation));
  }
});

test("malformed envelopes and records yield validation errors rather than TypeErrors", () => {
  for (const value of [null, [], {}, { companies: [] }, { meta: {}, companies: {} },
    { meta: {}, companies: [null, [], 42, {}, { tags: {}, aliases: {}, opportunities: {} }] }]) {
    assert.ok(check(value).length > 0);
  }
});

test("invalid calendar dates, future dates and duplicate identities are rejected", () => {
  for (const date of ["2026-02-30", "2026-13-01", "2026-11-02", 20260914]) {
    const value = fixture();
    value.companies[0].last_checked = date;
    assert.ok(check(value).length > 0);
  }
  const value = fixture();
  value.companies.push(structuredClone(value.companies[0]));
  assert.ok(check(value).some((error) => error.includes("duplicate id")));
  const future = fixture();
  future.meta.updated_at = "2026-11-02";
  assert.ok(check(future).some((error) => error.includes("future")));
});

test("public source URLs reject active protocols, credentials and embedded controls", () => {
  for (const url of ["javascript:alert(1)", "https:example.org", "https://user:example@example.org/", "https://example.org/\nprivate", "not a URL"]) {
    const value = fixture();
    value.companies[0].source_urls.push(url);
    assert.ok(check(value).length > 0);
  }
});

test("community pending records cannot claim verified confidence or hiring", () => {
  const value = fixture();
  Object.assign(value.companies[0], { verification_status: "community_pending", confidence_score: 5, opportunities: ["hiring"] });
  assert.ok(check(value).some((error) => error.includes('opportunities=["unknown"]')));
  assert.ok(check(value).some((error) => error.includes("<= 3")));
});

test("CSV export neutralizes spreadsheet formulas and preserves quoted values", () => {
  for (const value of ["=1+1", "+SUM(A1)", "-2+1", "@SUM(A1)", " \t=1", "\tvalue"]) {
    assert.ok(csvEscape(value).startsWith("'"));
  }
  assert.equal(csvEscape('a,"b"'), '\"a,\"\"b\"\"\"');
});

test("malformed optional text and JSON objects cannot crash validators through coercion", () => {
  const hostile = { toString: null, valueOf: null };
  for (const field of ["district", "english_name", "id", "name", "city", "last_checked", "confidence_score", "verification", "tags", "aliases", "opportunities"]) {
    const value = fixture();
    value.companies[0][field] = field === "tags" || field === "aliases" || field === "opportunities" ? [hostile] : hostile;
    // Legacy verification is not a required field; a malformed value must still be harmless.
    const errors = check(value);
    if (field !== "verification") assert.ok(errors.length > 0, field);
  }
  const value = fixture();
  value.meta.updated_at = hostile;
  assert.ok(check(value).length > 0);
});
