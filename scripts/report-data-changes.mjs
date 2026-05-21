import fs from "node:fs";
import { execFileSync } from "node:child_process";
import {
  DATA_FIELDS,
  getCompanies,
  readDataset,
  sourceTypeLabel,
  verificationLabel
} from "./companies-lib.mjs";

const DEFAULT_OUTPUT = "docs/data-change-summary.md";
const args = process.argv.slice(2);
const checkMode = args.includes("--check");
const stdoutOnly = args.includes("--stdout");

function argValue(name, fallback = "") {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] || fallback : fallback;
}

function git(argsForGit, options = {}) {
  return execFileSync("git", argsForGit, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], ...options }).trim();
}

function canResolve(ref) {
  try {
    git(["rev-parse", "--verify", ref]);
    return true;
  } catch {
    return false;
  }
}

function baseRef() {
  const explicit = argValue("--base-ref", process.env.DATA_DIFF_BASE || "");
  if (explicit) return explicit;
  if (canResolve("origin/main:data/companies.json")) return "origin/main";
  if (canResolve("HEAD:data/companies.json")) return "HEAD";
  return "";
}

function readDatasetFromGit(ref) {
  if (!ref) return { meta: {}, companies: [] };
  try {
    return JSON.parse(git(["show", `${ref}:data/companies.json`]));
  } catch {
    return { meta: {}, companies: [] };
  }
}

function readCurrentDataset() {
  return readDataset();
}

function indexById(companies) {
  return new Map(companies.map((company) => [company.id, company]));
}

function sourceStrength(company) {
  const verificationRank = {
    unknown: 0,
    outdated: 0,
    community_pending: 1,
    official_page: 3,
    verified: 4
  }[company.verification_status] ?? 0;
  const sourceRank = {
    unknown: 0,
    community_list: 1,
    government_public_list: 1,
    public_web: 2,
    media_database: 2,
    recruiting_platform: 2,
    official_profile: 3,
    official_site: 4
  }[company.source_type] ?? 0;
  return verificationRank + sourceRank + Number(company.confidence_score || 0);
}

function missingFields(company) {
  return DATA_FIELDS.filter((field) => {
    const value = company[field];
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "string") return value.trim() === "";
    return value === undefined || value === null;
  });
}

function esc(value) {
  return String(value ?? "").replaceAll("|", "\\|").replace(/\s+/g, " ").trim();
}

function table(headers, rows) {
  if (!rows.length) return "No changes.";
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(esc).join(" | ")} |`)
  ].join("\n");
}

function changedFieldList(before, after) {
  const fields = [...new Set([...DATA_FIELDS, "source_urls"])];
  return fields.filter((field) => JSON.stringify(before[field] ?? "") !== JSON.stringify(after[field] ?? ""));
}

const outputPath = argValue("--output", DEFAULT_OUTPUT);
const ref = baseRef();
const beforeDataset = readDatasetFromGit(ref);
const afterDataset = readCurrentDataset();
const beforeCompanies = getCompanies(beforeDataset);
const afterCompanies = getCompanies(afterDataset);
const beforeById = indexById(beforeCompanies);
const afterById = indexById(afterCompanies);

const added = afterCompanies
  .filter((company) => !beforeById.has(company.id))
  .map((company) => [company.id, company.name, verificationLabel(company.verification_status), sourceTypeLabel(company.source_type), company.source_url]);

const deleted = beforeCompanies
  .filter((company) => !afterById.has(company.id))
  .map((company) => [company.id, company.name, verificationLabel(company.verification_status), sourceTypeLabel(company.source_type), company.source_url]);

const common = afterCompanies.filter((company) => beforeById.has(company.id));

const sourceUpgrades = [];
const sourceDowngrades = [];
const missingFieldChanges = [];
const changedRecords = [];

for (const after of common) {
  const before = beforeById.get(after.id);
  const beforeStrength = sourceStrength(before);
  const afterStrength = sourceStrength(after);
  const changedFields = changedFieldList(before, after);

  if (changedFields.length) {
    changedRecords.push([after.id, after.name, changedFields.join(", ")]);
  }

  if (afterStrength > beforeStrength) {
    sourceUpgrades.push([
      after.id,
      after.name,
      `${verificationLabel(before.verification_status)} / ${sourceTypeLabel(before.source_type)} / ${before.confidence_score}`,
      `${verificationLabel(after.verification_status)} / ${sourceTypeLabel(after.source_type)} / ${after.confidence_score}`,
      after.source_url
    ]);
  } else if (afterStrength < beforeStrength) {
    sourceDowngrades.push([
      after.id,
      after.name,
      `${verificationLabel(before.verification_status)} / ${sourceTypeLabel(before.source_type)} / ${before.confidence_score}`,
      `${verificationLabel(after.verification_status)} / ${sourceTypeLabel(after.source_type)} / ${after.confidence_score}`,
      after.source_url
    ]);
  }

  const beforeMissing = new Set(missingFields(before));
  const afterMissing = new Set(missingFields(after));
  const newlyFilled = [...beforeMissing].filter((field) => !afterMissing.has(field));
  const newlyMissing = [...afterMissing].filter((field) => !beforeMissing.has(field));
  if (newlyFilled.length || newlyMissing.length) {
    missingFieldChanges.push([
      after.id,
      after.name,
      newlyFilled.join(", ") || "-",
      newlyMissing.join(", ") || "-"
    ]);
  }
}

const body = `# Data Change Summary / 数据变更摘要

> Generated from \`data/companies.json\`. Use \`npm run data:diff\` or \`npm run report:data-changes\` to refresh this report.

Base ref: \`${ref || "none"}\`

Current dataset update: \`${afterDataset.meta?.updated_at || "unknown"}\`

## Summary

${table(["Metric", "Count"], [
  ["Added records", added.length],
  ["Deleted records", deleted.length],
  ["Changed existing records", changedRecords.length],
  ["Source upgrades", sourceUpgrades.length],
  ["Source downgrades", sourceDowngrades.length],
  ["Missing-field changes", missingFieldChanges.length]
])}

## Added records

${table(["ID", "Name", "Status", "Source type", "Source"], added)}

## Deleted records

${table(["ID", "Name", "Previous status", "Previous source type", "Previous source"], deleted)}

## Source upgrades

Source upgrade means the verification status, source type, or confidence score became stronger according to the repository's internal ranking. It is not a company-quality ranking.

${table(["ID", "Name", "Before", "After", "Current source"], sourceUpgrades)}

## Source downgrades

Source downgrade means a record became more conservative, weaker, or less verified. This can be correct when a previous source was overconfident.

${table(["ID", "Name", "Before", "After", "Current source"], sourceDowngrades)}

## Missing-field changes

${table(["ID", "Name", "Fields filled", "Fields newly missing"], missingFieldChanges)}

## Changed existing records

${table(["ID", "Name", "Changed fields"], changedRecords)}

## Review notes

- This report only compares structured data. It does not verify whether external pages are still reachable.
- Opportunity hints remain search hints only; they do not prove active hiring, outsourcing, or partnership.
- If \`Base ref\` is \`HEAD\`, the report is most useful before committing local data changes. For PR review, prefer \`npm run data:diff -- --base-ref origin/main\`.
`;

if (checkMode) {
  const existing = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, "utf8") : "";
  if (existing !== body) {
    console.error(`${outputPath} is out of date. Run npm run report:data-changes.`);
    process.exit(1);
  }
  console.log(`${outputPath} is up to date.`);
} else if (stdoutOnly) {
  process.stdout.write(body);
} else {
  fs.writeFileSync(outputPath, body);
  console.log(`Generated ${outputPath}.`);
}
