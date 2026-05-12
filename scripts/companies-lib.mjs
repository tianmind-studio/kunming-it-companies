import fs from "node:fs";

export const DATA_FILE = new URL("../data/companies.json", import.meta.url);
export const CSV_FILE = new URL("../data/companies.csv", import.meta.url);
export const COMPANIES_MD_FILE = new URL("../COMPANIES.md", import.meta.url);

export const DATA_FIELDS = [
  "id",
  "name",
  "english_name",
  "city",
  "district",
  "category",
  "tags",
  "website",
  "source_url",
  "source_type",
  "verification_status",
  "last_checked",
  "notes",
  "opportunities",
  "confidence_score",
  "suitable_for_students",
  "suitable_for_freelancers",
  "suitable_for_job_seekers",
  "suitable_for_founders"
];

export const ALLOWED_VERIFICATION_STATUS = new Set([
  "verified",
  "official_page",
  "community_pending",
  "outdated",
  "unknown"
]);

export const ALLOWED_SOURCE_TYPES = new Set([
  "official_site",
  "official_profile",
  "government_public_list",
  "community_list",
  "recruiting_platform",
  "media_database",
  "public_web",
  "unknown"
]);

export const ALLOWED_OPPORTUNITIES = new Set([
  "internship",
  "hiring",
  "outsourcing",
  "partnership",
  "unknown"
]);

export const DIRECTION_BUCKETS = [
  "软件开发 / 外包",
  "系统集成 / 政企信息化",
  "AI / 大数据",
  "农业数字化",
  "医疗信息化",
  "文旅科技",
  "金融科技",
  "网络安全",
  "通信 / ICT",
  "待核验 / 其他"
];

export const DISTRICT_BUCKETS = [
  "五华区",
  "盘龙区",
  "官渡区",
  "西山区",
  "呈贡区",
  "高新区",
  "安宁 / 其他",
  "待补区域"
];

export function readDataset() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

export function normalizeCompany(company) {
  const sourceUrls = Array.isArray(company.source_urls) ? company.source_urls : [];
  const sourceUrl = company.source_url || sourceUrls[0] || company.website || "";
  const verificationStatus = company.verification_status || {
    official_site: "verified",
    official_profile: "official_page",
    community_pending: "community_pending"
  }[company.verification] || "unknown";

  return {
    ...company,
    name: company.name || company.name_zh || "",
    english_name: company.english_name || company.name_en || "",
    tags: Array.isArray(company.tags) ? company.tags : [],
    website: company.website || "",
    source_url: sourceUrl,
    source_type: company.source_type || "unknown",
    verification_status: verificationStatus,
    last_checked: company.last_checked || company.source_checked_at || "",
    notes: company.notes || company.summary_zh || "",
    opportunities: Array.isArray(company.opportunities) ? company.opportunities : [company.opportunities || "unknown"],
    confidence_score: Number(company.confidence_score || 1),
    suitable_for_students: Boolean(company.suitable_for_students),
    suitable_for_freelancers: Boolean(company.suitable_for_freelancers),
    suitable_for_job_seekers: Boolean(company.suitable_for_job_seekers),
    suitable_for_founders: Boolean(company.suitable_for_founders)
  };
}

export function getCompanies(dataset = readDataset()) {
  return [...dataset.companies]
    .map(normalizeCompany)
    .sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
}

export function esc(value) {
  return String(value ?? "")
    .replaceAll("|", "\\|")
    .replace(/\s+/g, " ")
    .trim();
}

export function sourceLabel(company) {
  if (company.verification_status === "verified") return "官网";
  if (company.verification_status === "official_page") return "官方页";
  return "公开来源";
}

export function sourceLink(company) {
  const url = company.website || company.source_url;
  return url ? `[${sourceLabel(company)}](${url})` : "待补";
}

export function verificationLabel(status) {
  return {
    verified: "官网已核验",
    official_page: "官方页核验",
    community_pending: "社区待复核",
    outdated: "疑似过期",
    unknown: "状态未知"
  }[status] || "状态未知";
}

export function sourceTypeLabel(type) {
  return {
    official_site: "官网",
    official_profile: "官方主页 / 官方文章",
    government_public_list: "政府公开名单 / 公告",
    community_list: "社区历史清单",
    recruiting_platform: "招聘平台公开页",
    media_database: "媒体 / 项目数据库",
    public_web: "公开网页",
    unknown: "未知来源"
  }[type] || type;
}

export function peopleLabels(company) {
  const labels = [];
  if (company.suitable_for_students) labels.push("学生");
  if (company.suitable_for_job_seekers) labels.push("求职者");
  if (company.suitable_for_freelancers) labels.push("自由职业者");
  if (company.suitable_for_founders) labels.push("创业者");
  return labels.length ? labels : ["待判断"];
}

export function opportunityLabels(company) {
  const map = {
    internship: "实习线索",
    hiring: "招聘线索",
    outsourcing: "外包/交付",
    partnership: "合作/客户线索",
    unknown: "待判断"
  };
  return company.opportunities.map((item) => map[item] || item);
}

export function directionBucket(company) {
  const text = `${company.category} ${(company.tags || []).join(" ")} ${company.notes}`;
  const category = company.category || "";

  // Generic technology-SME candidates should not be over-classified by words in
  // boilerplate notes such as “信息、网络、智能、通信”. Keep them in the review queue
  // until a stronger official source confirms the real direction.
  if (/^(IT 候选|信息技术 \/ 待核验|智能科技 \/ 待核验)/.test(category)) return "待核验 / 其他";

  if (/医疗|医院|HIS/.test(text)) return "医疗信息化";
  if (/农业|农村电商|乡村|云品/.test(text)) return "农业数字化";
  if (/金融/.test(text)) return "金融科技";
  if (/网络安全|信息安全|安全服务|安全防护/.test(text)) return "网络安全";
  if (/通信|ICT|呼叫中心|电信/.test(text)) return "通信 / ICT";
  if (/旅游|文旅|文化|游戏|VR|AR/.test(text)) return "文旅科技";
  if (/AI|人工智能|大数据|云服务|智能科技|物联网|3S|区块链|元宇宙/.test(text)) return "AI / 大数据";
  if (/系统集成|政企|信息化|智慧城市|数字建造|民生|电力信息化|工业数字化|数字认证/.test(text)) return "系统集成 / 政企信息化";
  if (/软件|外包|网站建设|小程序|APP|ERP|互联网服务|企业服务/.test(text)) return "软件开发 / 外包";
  return "待核验 / 其他";
}

export function districtBucket(company) {
  const district = company.district || "";
  if (["五华区", "盘龙区", "官渡区", "西山区", "呈贡区", "高新区"].includes(district)) return district;
  if (/安宁|安宁市|其他/.test(district)) return "安宁 / 其他";
  return "待补区域";
}

export function stats(companies) {
  const districts = new Set(companies.map((company) => districtBucket(company)));
  const directions = new Set(companies.map((company) => directionBucket(company)));
  return {
    total: companies.length,
    verified: companies.filter((company) => company.verification_status === "verified").length,
    officialPage: companies.filter((company) => company.verification_status === "official_page").length,
    pending: companies.filter((company) => company.verification_status === "community_pending").length,
    outdated: companies.filter((company) => company.verification_status === "outdated").length,
    unknown: companies.filter((company) => company.verification_status === "unknown").length,
    websiteCount: companies.filter((company) => company.website).length,
    missingWebsite: companies.filter((company) => !company.website).length,
    districtCount: districts.size,
    directionCount: directions.size
  };
}

export function csvEscape(value) {
  if (Array.isArray(value)) value = value.join(";");
  if (typeof value === "boolean") value = value ? "true" : "false";
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) return `"${str.replaceAll('"', '""')}"`;
  return str;
}

export function toCsv(companies) {
  const rows = [DATA_FIELDS.join(",")];
  for (const company of companies) {
    rows.push(DATA_FIELDS.map((field) => csvEscape(company[field])).join(","));
  }
  return `${rows.join("\n")}\n`;
}
