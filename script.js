const els = {
  search: document.querySelector("#searchInput"),
  category: document.querySelector("#categorySelect"),
  district: document.querySelector("#districtSelect"),
  verification: document.querySelector("#verificationSelect"),
  companyCount: document.querySelector("#companyCount"),
  verifiedCount: document.querySelector("#verifiedCount"),
  pendingCount: document.querySelector("#pendingCount"),
  sourceLeadCount: document.querySelector("#sourceLeadCount"),
  communityCount: document.querySelector("#communityCount"),
  eventCount: document.querySelector("#eventCount"),
  projectCount: document.querySelector("#projectCount"),
  sourceDate: document.querySelector("#sourceDate"),
  resultSummary: document.querySelector("#resultSummary"),
  list: document.querySelector("#companyList"),
  sourceLeadList: document.querySelector("#sourceLeadList"),
  communityList: document.querySelector("#communityList"),
  eventList: document.querySelector("#eventList"),
  projectList: document.querySelector("#projectList")
};

let companies = [];
let sourceLeads = [];
let communities = [];
let events = [];
let projects = [];
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

function safeHref(value) {
  try {
    const url = new URL(value, window.location.href);
    if (url.protocol === "http:" || url.protocol === "https:") return url.href;
  } catch {
    return "";
  }
  return "";
}

function node(tag, options = {}, children = []) {
  const element = document.createElement(tag);
  if (options.className) element.className = options.className;
  if (options.text !== undefined) element.textContent = options.text;
  if (options.href) {
    const href = safeHref(options.href);
    if (href) {
      element.href = href;
      element.target = "_blank";
      element.rel = "noreferrer";
    }
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

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current);
  return cells;
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const header = parseCsvLine(lines[0] || "");
  return lines.slice(1).filter(Boolean).map((line) => {
    const cells = parseCsvLine(line);
    return Object.fromEntries(header.map((field, index) => [field, cells[index] || ""]));
  });
}

async function loadCsv(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}`);
  return parseCsv(await response.text());
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
  els.sourceLeadCount.textContent = String(sourceLeads.length);
  els.communityCount.textContent = String(communities.length);
  els.eventCount.textContent = String(events.length);
  els.projectCount.textContent = String(projects.length);
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

function renderSourceLeadSummary() {
  const counts = new Map();
  for (const lead of sourceLeads) counts.set(lead.direction, (counts.get(lead.direction) || 0) + 1);

  els.sourceLeadList.replaceChildren();
  for (const [direction, count] of [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0], "zh-CN"))) {
    const example = sourceLeads.find((lead) => lead.direction === direction);
    const card = node("article", { className: "resource-card compact" }, [
      node("strong", { text: direction }),
      node("p", { text: `${count} 个公开来源入口，用于继续发现候选公司和官方招聘主页。` }),
      example?.source_url ? node("a", { href: example.source_url, text: "打开示例入口" }) : node("span", { text: "待补来源" })
    ]);
    els.sourceLeadList.append(card);
  }
}

function renderResourceCards(container, rows, options) {
  container.replaceChildren();
  const visible = rows.slice(0, options.limit || rows.length);

  if (!visible.length) {
    container.append(node("p", { className: "empty mini", text: "暂无公开入口，欢迎补充。" }));
    return;
  }

  for (const row of visible) {
    const title = row[options.titleField] || row.name || row.project_name || "未命名入口";
    const meta = options.metaFields
      .map((field) => row[field])
      .filter(Boolean)
      .join(" · ");
    const children = [
      node("strong", { text: title }),
      meta ? node("span", { className: "resource-meta", text: meta }) : node("span", { className: "resource-meta", text: "公开入口" }),
      node("p", { text: row.notes || "公开来源入口，等待进一步复核。" })
    ];

    if (row.source_url) children.push(node("a", { href: row.source_url, text: "查看来源" }));
    container.append(node("article", { className: "resource-card" }, children));
  }
}

function renderResourcePanels() {
  renderSourceLeadSummary();
  renderResourceCards(els.communityList, communities, {
    titleField: "name",
    metaFields: ["community_type", "city", "status"],
    limit: 8
  });
  renderResourceCards(els.eventList, events, {
    titleField: "name",
    metaFields: ["event_type", "city", "status"],
    limit: 8
  });
  renderResourceCards(els.projectList, projects, {
    titleField: "project_name",
    metaFields: ["project_type", "city", "status"],
    limit: 8
  });
}

async function init() {
  const [dataset, sourceLeadRows, communityRows, eventRows, projectRows] = await Promise.all([
    fetch("data/companies.json").then((response) => response.json()),
    loadCsv("data/source-leads.csv"),
    loadCsv("data/communities.csv"),
    loadCsv("data/events.csv"),
    loadCsv("data/gov-projects.csv")
  ]);

  companies = dataset.companies.map(normalize).sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
  sourceLeads = sourceLeadRows;
  communities = communityRows;
  events = eventRows;
  projects = projectRows;
  meta = dataset.meta;

  populateFilters();
  renderStats();
  render();
  renderResourcePanels();

  els.search.addEventListener("input", render);
  els.category.addEventListener("change", render);
  els.district.addEventListener("change", render);
  els.verification.addEventListener("change", render);
}

init().catch((error) => {
  els.resultSummary.textContent = "数据加载失败，请确认通过本地服务器或 GitHub Pages 打开。";
  console.error(error);
});
