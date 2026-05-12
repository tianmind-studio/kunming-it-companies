const els = {
  search: document.querySelector("#searchInput"),
  category: document.querySelector("#categorySelect"),
  district: document.querySelector("#districtSelect"),
  verification: document.querySelector("#verificationSelect"),
  companyCount: document.querySelector("#companyCount"),
  verifiedCount: document.querySelector("#verifiedCount"),
  pendingCount: document.querySelector("#pendingCount"),
  sourceDate: document.querySelector("#sourceDate"),
  resultSummary: document.querySelector("#resultSummary"),
  list: document.querySelector("#companyList")
};

let companies = [];
let meta = {};

const verificationText = {
  verified: "官网已核验",
  official_page: "官方页核验",
  community_pending: "社区待复核",
  outdated: "疑似过期",
  unknown: "状态未知"
};

const opportunityText = {
  internship: "实习线索",
  hiring: "招聘线索",
  outsourcing: "外包/交付",
  partnership: "合作/客户线索",
  unknown: "待判断"
};

function node(tag, options = {}, children = []) {
  const element = document.createElement(tag);
  if (options.className) element.className = options.className;
  if (options.text !== undefined) element.textContent = options.text;
  if (options.href) {
    element.href = options.href;
    element.target = "_blank";
    element.rel = "noreferrer";
  }
  for (const child of children) element.append(child);
  return element;
}

function normalize(company) {
  const sourceUrls = Array.isArray(company.source_urls) ? company.source_urls : [];
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
    source_url: company.source_url || sourceUrls[0] || company.website || "",
    verification_status: verificationStatus,
    last_checked: company.last_checked || company.source_checked_at || "",
    notes: company.notes || company.summary_zh || "",
    opportunities: Array.isArray(company.opportunities) ? company.opportunities : ["unknown"]
  };
}

function searchableText(company) {
  return [
    company.name,
    company.english_name,
    company.city,
    company.district,
    company.category,
    company.notes,
    company.source_type,
    verificationText[company.verification_status],
    ...(company.tags || []),
    ...(company.opportunities || [])
  ].join(" ").toLowerCase();
}

function option(value, label) {
  const item = node("option", { text: label || value });
  item.value = value;
  return item;
}

function populateFilters() {
  const categories = [...new Set(companies.map((company) => company.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh-CN"));
  const districts = [...new Set(companies.map((company) => company.district || "待补区域"))].sort((a, b) => a.localeCompare(b, "zh-CN"));
  for (const category of categories) els.category.append(option(category));
  for (const district of districts) els.district.append(option(district));
}

function renderStats() {
  els.companyCount.textContent = String(companies.length);
  els.verifiedCount.textContent = String(companies.filter((company) => company.verification_status === "verified").length);
  els.pendingCount.textContent = String(companies.filter((company) => company.verification_status === "community_pending").length);
  els.sourceDate.textContent = meta.updated_at || "-";
}

function verificationMeta(company) {
  const status = company.verification_status || "unknown";
  const cls = {
    verified: "verified",
    official_page: "profile",
    community_pending: "pending",
    outdated: "outdated",
    unknown: "unknown"
  }[status] || "unknown";
  return { text: verificationText[status] || "状态未知", className: `badge ${cls}` };
}

function peopleLabels(company) {
  const labels = [];
  if (company.suitable_for_students) labels.push("学生");
  if (company.suitable_for_job_seekers) labels.push("求职者");
  if (company.suitable_for_freelancers) labels.push("自由职业者");
  if (company.suitable_for_founders) labels.push("创业者");
  return labels.length ? labels : ["待判断"];
}

function renderTags(items, className = "tag") {
  const wrap = node("div", { className: "tags" });
  for (const item of items) wrap.append(node("span", { className, text: item }));
  return wrap;
}

function render() {
  const query = els.search.value.trim().toLowerCase();
  const category = els.category.value;
  const district = els.district.value;
  const verification = els.verification.value;

  const filtered = companies.filter((company) => {
    const normalizedDistrict = company.district || "待补区域";
    const matchesQuery = !query || searchableText(company).includes(query);
    const matchesCategory = !category || company.category === category;
    const matchesDistrict = !district || normalizedDistrict === district;
    const matchesVerification = !verification || company.verification_status === verification;
    return matchesQuery && matchesCategory && matchesDistrict && matchesVerification;
  });

  els.resultSummary.textContent = `显示 ${filtered.length} / ${companies.length} 条记录`;
  els.list.replaceChildren();

  if (!filtered.length) {
    els.list.append(node("p", { className: "empty", text: "没有匹配记录。可以换个关键词，或通过 GitHub issue 补充公司。" }));
    return;
  }

  for (const company of filtered) {
    const title = node("h3", { text: company.name });
    const district = node("span", { className: "district", text: company.district || "区域待补" });
    const top = node("div", { className: "card-top" }, [title, district]);
    const badge = verificationMeta(company);
    const sourceUrl = company.website || company.source_url;

    const audience = renderTags(peopleLabels(company), "tag audience");
    const opportunities = renderTags((company.opportunities || ["unknown"]).map((item) => opportunityText[item] || item), "tag opportunity");
    const tags = renderTags(company.tags || []);

    const footerChildren = [node("span", { className: "source", text: `核验：${company.last_checked || "待补"} · 可信度 ${company.confidence_score || 1}/5` })];
    if (sourceUrl) footerChildren.push(node("a", { className: "visit", href: sourceUrl, text: company.website ? "访问官网" : "查看来源" }));

    const card = node("article", { className: "company-card" }, [
      top,
      node("div", { className: "meta-row" }, [
        node("div", { className: "category", text: company.category }),
        node("span", badge)
      ]),
      node("p", { className: "summary", text: company.notes }),
      node("div", { className: "label-block" }, [node("strong", { text: "适合查看" }), audience]),
      node("div", { className: "label-block" }, [node("strong", { text: "机会提示" }), opportunities]),
      tags,
      node("div", { className: "card-footer" }, footerChildren)
    ]);

    els.list.append(card);
  }
}

async function init() {
  const response = await fetch("data/companies.json");
  const dataset = await response.json();
  companies = dataset.companies.map(normalize).sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
  meta = dataset.meta;

  populateFilters();
  renderStats();
  render();

  els.search.addEventListener("input", render);
  els.category.addEventListener("change", render);
  els.district.addEventListener("change", render);
  els.verification.addEventListener("change", render);
}

init().catch((error) => {
  els.resultSummary.textContent = "数据加载失败，请确认通过本地服务器或 GitHub Pages 打开。";
  console.error(error);
});
