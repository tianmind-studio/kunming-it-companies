import fs from "node:fs";

const dataFile = new URL("../data/companies.json", import.meta.url);
const outputFile = new URL("../COMPANIES.md", import.meta.url);
const dataset = JSON.parse(fs.readFileSync(dataFile, "utf8"));

function esc(value) {
  return String(value || "")
    .replaceAll("|", "\\|")
    .replace(/\s+/g, " ")
    .trim();
}

function sourceLink(company) {
  const url = company.website || company.source_urls?.[0] || "";
  const label = company.verification === "official_site"
    ? "官网"
    : company.verification === "official_profile"
      ? "官方页"
      : "公开来源";
  return url ? `[${label}](${url})` : "待补";
}

const companies = [...dataset.companies].sort((a, b) => {
  const cityCompare = esc(a.city).localeCompare(esc(b.city), "zh-CN");
  if (cityCompare) return cityCompare;
  return esc(a.name_zh).localeCompare(esc(b.name_zh), "zh-CN");
});

const categories = new Map();
for (const company of companies) {
  if (!categories.has(company.category)) categories.set(company.category, []);
  categories.get(company.category).push(company);
}

const lines = [
  "# 公司索引 / Company Index",
  "",
  `这里是 GitHub 直接可读、可搜索的昆明 IT 公司索引。当前共收录 ${companies.length} 条记录。结构化数据以 [\`data/companies.json\`](data/companies.json) 为准。`,
  "",
  "> This file is generated from `data/companies.json`. Update the JSON first, then run `npm run generate:companies`.",
  "",
  "## 昆明 IT 公司",
  "",
  "| 公司 | 英文名 / 品牌 | 方向 | 区域 | 标签 | 公开来源 | 核验日期 |",
  "| --- | --- | --- | --- | --- | --- | --- |"
];

for (const company of companies) {
  lines.push(
    `| ${esc(company.name_zh)} | ${esc(company.name_en) || "待补"} | ${esc(company.category)} | ${esc(company.district) || "待补"} | ${(company.tags || []).map(esc).join("、")} | ${sourceLink(company)} | ${esc(company.source_checked_at)} |`
  );
}

lines.push("", "## 按方向浏览", "");

for (const [category, group] of [...categories.entries()].sort((a, b) => a[0].localeCompare(b[0], "zh-CN"))) {
  lines.push(`### ${category}`, "");
  for (const company of group) {
    lines.push(`- ${company.name_zh}: ${company.summary_zh}`);
  }
  lines.push("");
}

lines.push(
  "## 待补充方向",
  "",
  "- 昆明游戏公司",
  "- 昆明 AI / 大模型应用公司",
  "- 昆明工业软件公司",
  "- 昆明网络安全公司",
  "- 昆明本地开源团队",
  "- 昆明有技术团队的传统行业数字化公司",
  "",
  "欢迎通过 issue 或 PR 补充来源明确的新公司。",
  ""
);

const next = lines.join("\n");

if (process.argv.includes("--check")) {
  const current = fs.existsSync(outputFile) ? fs.readFileSync(outputFile, "utf8") : "";
  if (current !== next) {
    console.error("COMPANIES.md is out of date. Run `npm run generate:companies`.");
    process.exit(1);
  }
  console.log("COMPANIES.md is up to date.");
} else {
  fs.writeFileSync(outputFile, next);
  console.log(`Generated COMPANIES.md with ${companies.length} companies.`);
}
