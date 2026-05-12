import fs from "node:fs";
import {
  COMPANIES_MD_FILE,
  DISTRICT_BUCKETS,
  DIRECTION_BUCKETS,
  directionBucket,
  districtBucket,
  esc,
  getCompanies,
  peopleLabels,
  readDataset,
  sourceLink,
  sourceTypeLabel,
  stats,
  verificationLabel,
  opportunityLabels
} from "./companies-lib.mjs";

const dataset = readDataset();
const companies = getCompanies(dataset);
const summary = stats(companies);

function tableHeader(columns) {
  return [
    `| ${columns.join(" | ")} |`,
    `| ${columns.map(() => "---").join(" | ")} |`
  ];
}

function companyRow(company) {
  return `| ${esc(company.name)} | ${esc(company.category)} | ${esc(company.district || "待补")} | ${esc(verificationLabel(company.verification_status))} | ${esc(peopleLabels(company).join("、"))} | ${sourceLink(company)} | ${esc(company.last_checked)} |`;
}

const lines = [
  "# Kunming Tech Radar 公司索引",
  "",
  `这里是 GitHub 直接可读、可搜索的昆明技术机会索引。当前共收录 ${summary.total} 条记录，结构化主数据源是 [\`data/companies.json\`](data/companies.json)。`,
  "",
  "> This file is generated from `data/companies.json`. Update the JSON first, then run `npm run generate:companies`.",
  "",
  "## 数据质量摘要",
  "",
  `- 已收录公司 / 机构：${summary.total}`,
  `- 官网已核验：${summary.verified}`,
  `- 官方页核验：${summary.officialPage}`,
  `- 社区待复核：${summary.pending}`,
  `- 已填写官网：${summary.websiteCount}`,
  `- 官网待补：${summary.missingWebsite}`,
  `- 覆盖区域：五华区、盘龙区、官渡区、西山区、呈贡区、高新区、安宁 / 其他、待补区域`,
  `- 覆盖方向：软件开发 / 外包、系统集成 / 政企信息化、AI / 大数据、农业数字化、医疗信息化、文旅科技、金融科技、网络安全、通信 / ICT`,
  "",
  "## 如何阅读这份索引",
  "",
  "- `官网已核验` 表示已找到官网或官方网站入口，不代表商业背书。",
  "- `官方页核验` 表示有官方文章、集团页面、政府公告或其他官方公开页，但仍可能缺少独立官网。",
  "- `社区待复核` 表示来自历史社区清单、政府公开名单、招聘平台或公开网页，需要继续补官网、业务方向和区域。",
  "- `适合人群` 是信息检索提示，不代表该公司正在招聘、正在外包或愿意合作。招聘、外包、合作都必须以原始来源和实际沟通为准。",
  "",
  "## 按方向浏览",
  ""
];

for (const bucket of DIRECTION_BUCKETS) {
  const group = companies.filter((company) => directionBucket(company) === bucket);
  if (!group.length) continue;
  lines.push(`### ${bucket}`, "");
  lines.push(...tableHeader(["公司", "原始分类", "区域", "核验状态", "适合谁看", "公开来源", "核验日期"]));
  for (const company of group) lines.push(companyRow(company));
  lines.push("");
}

lines.push("## 按区域浏览", "");
for (const bucket of DISTRICT_BUCKETS) {
  const group = companies.filter((company) => districtBucket(company) === bucket);
  if (!group.length) continue;
  lines.push(`### ${bucket}`, "");
  lines.push(...tableHeader(["公司", "方向", "核验状态", "机会提示", "公开来源"]));
  for (const company of group) {
    lines.push(`| ${esc(company.name)} | ${esc(company.category)} | ${esc(verificationLabel(company.verification_status))} | ${esc(opportunityLabels(company).join("、"))} | ${sourceLink(company)} |`);
  }
  lines.push("");
}

const priority = companies
  .filter((company) => company.verification_status !== "verified" || !company.website || company.confidence_score <= 3)
  .sort((a, b) => {
    const score = a.confidence_score - b.confidence_score;
    if (score) return score;
    return a.name.localeCompare(b.name, "zh-CN");
  });

lines.push(
  "## 优先核验清单",
  "",
  "这些记录最适合后续 7 天补充官网、官方招聘页、业务方向和区域。不要用无法公开核验的信息补字段。",
  "",
  ...tableHeader(["公司", "当前来源类型", "区域", "缺口", "来源", "可信度"])
);

for (const company of priority) {
  const gaps = [];
  if (!company.website) gaps.push("官网待补");
  if (!company.district) gaps.push("区域待补");
  if (company.verification_status === "community_pending") gaps.push("业务待复核");
  if (company.verification_status === "official_page") gaps.push("独立官网待确认");
  lines.push(`| ${esc(company.name)} | ${esc(sourceTypeLabel(company.source_type))} | ${esc(company.district || "待补")} | ${esc(gaps.join("、") || "待复核")} | ${sourceLink(company)} | ${company.confidence_score}/5 |`);
}

lines.push(
  "",
  "## 机器可读数据",
  "",
  "- 主数据源：[`data/companies.json`](data/companies.json)",
  "- CSV 导出：[`data/companies.csv`](data/companies.csv)",
  "- 静态展示页：[`index.html`](index.html)",
  "",
  "## 待补充方向",
  "",
  "- 昆明 AI / 大模型应用公司",
  "- 昆明有真实技术团队的传统行业数字化公司",
  "- 昆明高校周边实习和项目合作入口",
  "- 云南农业、医疗、文旅、政企数字化项目线索",
  "- 官方招聘页、技术博客、开源仓库、活动页面",
  "",
  "欢迎通过 issue 或 PR 补充来源明确的新公司。"
);

const next = `${lines.join("\n")}\n`;

if (process.argv.includes("--check")) {
  const current = fs.existsSync(COMPANIES_MD_FILE) ? fs.readFileSync(COMPANIES_MD_FILE, "utf8") : "";
  if (current !== next) {
    console.error("COMPANIES.md is out of date. Run `npm run generate:companies`.");
    process.exit(1);
  }
  console.log("COMPANIES.md is up to date.");
} else {
  fs.writeFileSync(COMPANIES_MD_FILE, next);
  console.log(`Generated COMPANIES.md with ${companies.length} companies.`);
}
