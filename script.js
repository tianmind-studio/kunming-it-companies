const els = {
  heroSearchForm: document.querySelector("#heroSearchForm"),
  heroSearch: document.querySelector("#heroSearchInput"),
  heroCompanyCount: document.querySelector("#heroCompanyCount"),
  heroSourceLeadCount: document.querySelector("#heroSourceLeadCount"),
  heroStrongSourceCount: document.querySelector("#heroStrongSourceCount"),
  heroPendingCount: document.querySelector("#heroPendingCount"),
  heroUpdatedAt: document.querySelector("#heroUpdatedAt"),
  homeResultSummary: document.querySelector("#homeResultSummary"),
  featuredList: document.querySelector("#featuredCompanyList"),
  search: document.querySelector("#searchInput"),
  category: document.querySelector("#categorySelect"),
  district: document.querySelector("#districtSelect"),
  verification: document.querySelector("#verificationSelect"),
  audience: document.querySelector("#audienceSelect"),
  opportunity: document.querySelector("#opportunitySelect"),
  sort: document.querySelector("#sortSelect"),
  activeFilters: document.querySelector("#activeFilters"),
  resetFilters: document.querySelector("#resetFilters"),
  copySearchLink: document.querySelector("#copySearchLink"),
  downloadResultCsv: document.querySelector("#downloadResultCsv"),
  shareStatus: document.querySelector("#shareStatus"),
  companyCount: document.querySelector("#companyCount"),
  strongSourceCount: document.querySelector("#strongSourceCount"),
  pendingCount: document.querySelector("#pendingCount"),
  sourceLeadCount: document.querySelector("#sourceLeadCount"),
  communityCount: document.querySelector("#communityCount"),
  eventCount: document.querySelector("#eventCount"),
  projectCount: document.querySelector("#projectCount"),
  sourceDate: document.querySelector("#sourceDate"),
  verifiedRatio: document.querySelector("#verifiedRatio"),
  missingDistrictCount: document.querySelector("#missingDistrictCount"),
  weakSourceCount: document.querySelector("#weakSourceCount"),
  resultSummary: document.querySelector("#resultSummary"),
  list: document.querySelector("#companyList"),
  sourceLeadList: document.querySelector("#sourceLeadList"),
  communityList: document.querySelector("#communityList"),
  eventList: document.querySelector("#eventList"),
  projectList: document.querySelector("#projectList"),
  directionTotal: document.querySelector("#directionTotal"),
  districtTotal: document.querySelector("#districtTotal"),
  directionBreakdown: document.querySelector("#directionBreakdown"),
  districtBreakdown: document.querySelector("#districtBreakdown"),
  reviewQueueList: document.querySelector("#reviewQueueList"),
  companyDialog: document.querySelector("#companyDialog"),
  companyDialogBody: document.querySelector("#companyDialogBody"),
  closeCompanyDialog: document.querySelector("#closeCompanyDialog"),
  intentButtons: document.querySelectorAll("[data-query], [data-scroll]")
};

let companies = [];
let sourceLeads = [];
let communities = [];
let events = [];
let projects = [];
let meta = {};
let currentFiltered = [];
let lastDialogTrigger = null;

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

const audienceText = {
  suitable_for_students: "学生",
  suitable_for_job_seekers: "求职者",
  suitable_for_freelancers: "自由职业者",
  suitable_for_founders: "创业者"
};

const sourceTypeText = {
  official_site: "官网",
  official_profile: "官方页",
  government_public_list: "政府公开名单",
  community_list: "社区历史清单",
  recruiting_platform: "招聘平台公开页",
  media_database: "媒体 / 数据库",
  public_web: "公开网页",
  unknown: "未知来源"
};

const queryIntentPatterns = [
  { patterns: ["软件", "software"], terms: ["软件", "外包", "小程序", "app", "erp"] },
  { patterns: ["it", "信息技术"], terms: ["it", "信息技术", "软件", "系统集成", "互联网服务"] },
  { patterns: ["ai", "人工智能"], terms: ["ai", "人工智能", "大数据", "智能科技"] },
  { patterns: ["大数据", "data"], terms: ["大数据", "数据"] },
  { patterns: ["系统集成"], terms: ["系统集成"] },
  { patterns: ["政企"], terms: ["政企", "政府", "信息化"] },
  { patterns: ["数字化"], terms: ["数字化", "信息化", "智慧"] },
  { patterns: ["高新区"], terms: ["高新区"] },
  { patterns: ["五华"], terms: ["五华区"] },
  { patterns: ["盘龙"], terms: ["盘龙区"] },
  { patterns: ["官渡"], terms: ["官渡区"] },
  { patterns: ["西山"], terms: ["西山区"] },
  { patterns: ["呈贡"], terms: ["呈贡区"] },
  { patterns: ["安宁"], terms: ["安宁"] },
  { patterns: ["招聘", "岗位", "工作", "hiring", "job"], terms: ["招聘", "hiring"] },
  { patterns: ["实习", "internship"], terms: ["实习", "internship"] },
  { patterns: ["外包", "交付"], terms: ["外包", "outsourcing"] },
  { patterns: ["合作", "客户"], terms: ["合作", "partnership"] },
  { patterns: ["待复核", "复核"], terms: ["待复核", "社区待复核", "community_pending"] },
  { patterns: ["官网"], terms: ["官网", "official_site"] },
  { patterns: ["官方页"], terms: ["官方页", "official_page"] }
];

const queryStopWords = [
  "昆明",
  "云南",
  "本地",
  "公司",
  "企业",
  "团队",
  "机构",
  "技术",
  "机会",
  "雷达",
  "地图",
  "索引",
  "目录",
  "名单",
  "查询",
  "搜索",
  "看看",
  "哪些",
  "有哪些",
  "有限责任公司",
  "股份有限公司",
  "有限公司",
  "集团",
  "kunming",
  "yunnan",
  "local",
  "company",
  "companies",
  "map",
  "list",
  "directory",
  "index",
  "search"
];

function safeHref(value) {
  try {
    const url = new URL(value, window.location.href);
    if (url.protocol === "http:" || url.protocol === "https:") return url.href;
  } catch {
    return "";
  }
  return "";
}

function normalizedQuery(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[，,。.;；:：/、|]+/g, " ")
    .replace(/\s+/g, " ");
}

function hasPattern(normalized, compact, pattern) {
  const lowerPattern = pattern.toLowerCase();
  return normalized.includes(lowerPattern) || compact.includes(lowerPattern.replace(/\s+/g, ""));
}

function buildQueryGroups(rawQuery) {
  const normalized = normalizedQuery(rawQuery);
  if (!normalized) return [];

  const compact = normalized.replace(/\s+/g, "");
  const groups = [];
  const seen = new Set();
  let leftover = ` ${normalized} `;

  function addGroup(terms) {
    const group = terms.map((term) => term.toLowerCase()).filter(Boolean);
    const key = group.join("|");
    if (!group.length || seen.has(key)) return;
    groups.push(group);
    seen.add(key);
  }

  for (const intent of queryIntentPatterns) {
    if (intent.patterns.some((pattern) => hasPattern(normalized, compact, pattern))) {
      addGroup(intent.terms);
      for (const pattern of intent.patterns) {
        leftover = leftover.replaceAll(pattern.toLowerCase(), " ");
      }
    }
  }

  for (const stopWord of queryStopWords) {
    const lowerStopWord = stopWord.toLowerCase();
    leftover = leftover.replaceAll(lowerStopWord, " ");
  }

  for (const token of leftover.split(/\s+/).map((item) => item.trim()).filter(Boolean)) {
    addGroup([token]);
  }

  return groups;
}

function matchesQueryGroups(text, groups) {
  return !groups.length || groups.every((group) => group.some((term) => text.includes(term)));
}

function fieldValue(field) {
  return field?.value || "";
}

function currentSearchState() {
  return {
    q: fieldValue(els.search).trim(),
    category: fieldValue(els.category),
    district: fieldValue(els.district),
    verification: fieldValue(els.verification),
    audience: fieldValue(els.audience),
    opportunity: fieldValue(els.opportunity),
    sort: fieldValue(els.sort) || "relevance"
  };
}

function setField(field, value) {
  if (field) field.value = value || "";
}

function applySearchState(state) {
  setField(els.search, state.q);
  setField(els.heroSearch, state.q);
  setField(els.category, state.category);
  setField(els.district, state.district);
  setField(els.verification, state.verification);
  setField(els.audience, state.audience);
  setField(els.opportunity, state.opportunity);
  setField(els.sort, state.sort || "relevance");
}

function readSearchStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return {
    q: params.get("q") || "",
    category: params.get("category") || "",
    district: params.get("district") || "",
    verification: params.get("verification") || "",
    audience: params.get("audience") || "",
    opportunity: params.get("opportunity") || "",
    sort: params.get("sort") || "relevance"
  };
}

function syncUrl(state) {
  const params = new URLSearchParams();
  const defaults = { sort: "relevance" };
  for (const [key, value] of Object.entries(state)) {
    if (!value || defaults[key] === value) continue;
    params.set(key, value);
  }
  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash || ""}`;
  window.history.replaceState(null, "", nextUrl);
}

function sourceUrlFor(company) {
  return company.website || company.source_url || "";
}

function confidence(company) {
  return Number(company.confidence_score || 0);
}

function reviewReasons(company) {
  const reasons = [];
  if (company.verification_status === "community_pending") reasons.push("社区待复核");
  if (confidence(company) <= 2) reasons.push("弱来源");
  if (!company.district) reasons.push("缺区县");
  if (!company.website) reasons.push("缺官网");
  if ((company.opportunities || []).includes("unknown")) reasons.push("机会提示待判断");
  return reasons;
}

function reviewScore(company) {
  let score = 0;
  if (company.verification_status === "community_pending") score += 30;
  if (confidence(company) <= 2) score += 30;
  if (!company.district) score += 20;
  if (!company.website) score += 12;
  if ((company.opportunities || []).includes("unknown")) score += 8;
  return score;
}

function verificationWeight(company) {
  return {
    verified: 5,
    official_page: 4,
    community_pending: 2,
    outdated: 1,
    unknown: 0
  }[company.verification_status] || 0;
}

function sortCompanies(rows, mode) {
  return [...rows].sort((a, b) => {
    if (mode === "trust") {
      return verificationWeight(b) - verificationWeight(a) || confidence(b) - confidence(a) || a.name.localeCompare(b.name, "zh-CN");
    }
    if (mode === "review") {
      return reviewScore(b) - reviewScore(a) || a.name.localeCompare(b.name, "zh-CN");
    }
    if (mode === "recent") {
      return (b.last_checked || "").localeCompare(a.last_checked || "") || a.name.localeCompare(b.name, "zh-CN");
    }
    if (mode === "name") {
      return a.name.localeCompare(b.name, "zh-CN");
    }
    return verificationWeight(b) - verificationWeight(a)
      || Number(Boolean(b.district)) - Number(Boolean(a.district))
      || confidence(b) - confidence(a)
      || a.name.localeCompare(b.name, "zh-CN");
  });
}

function node(tag, options = {}, children = []) {
  const element = document.createElement(tag);
  if (options.id) element.id = options.id;
  if (options.className) element.className = options.className;
  if (options.style) element.setAttribute("style", options.style);
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

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}`);
  return response.json();
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
    sourceTypeText[company.source_type],
    ...peopleLabels(company),
    ...(company.opportunities || []).map((item) => opportunityText[item] || item),
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
  const verifiedTotal = companies.filter((company) => ["verified", "official_page"].includes(company.verification_status)).length;
  const missingDistricts = companies.filter((company) => !company.district).length;
  const weakSources = companies.filter((company) => Number(company.confidence_score || 0) <= 2).length;
  const verifiedRatio = companies.length ? `${Math.round((verifiedTotal / companies.length) * 100)}%` : "0%";

  els.companyCount.textContent = String(companies.length);
  els.strongSourceCount.textContent = String(verifiedTotal);
  els.pendingCount.textContent = String(companies.filter((company) => company.verification_status === "community_pending").length);
  els.sourceLeadCount.textContent = String(sourceLeads.length);
  els.communityCount.textContent = String(communities.length);
  els.eventCount.textContent = String(events.length);
  els.projectCount.textContent = String(projects.length);
  els.sourceDate.textContent = meta.updated_at || "-";
  els.verifiedRatio.textContent = verifiedRatio;
  els.missingDistrictCount.textContent = String(missingDistricts);
  els.weakSourceCount.textContent = String(weakSources);

  if (els.heroCompanyCount) els.heroCompanyCount.textContent = String(companies.length);
  if (els.heroSourceLeadCount) els.heroSourceLeadCount.textContent = String(sourceLeads.length);
  if (els.heroStrongSourceCount) els.heroStrongSourceCount.textContent = String(verifiedTotal);
  if (els.heroPendingCount) els.heroPendingCount.textContent = String(companies.filter((company) => company.verification_status === "community_pending").length);
  if (els.heroUpdatedAt) els.heroUpdatedAt.textContent = meta.updated_at || "-";
}

function countBy(rows, getKey) {
  const counts = new Map();
  for (const row of rows) {
    const key = getKey(row) || "待补";
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-CN"));
}

function renderBarList(container, rows, total) {
  if (!container) return;
  container.replaceChildren();
  for (const [label, count] of rows.slice(0, 8)) {
    const pct = total ? Math.round((count / total) * 100) : 0;
    container.append(node("div", { className: "bar-row" }, [
      node("div", { className: "bar-row-top" }, [
        node("span", { text: label }),
        node("strong", { text: String(count) })
      ]),
      node("div", { className: "bar-track" }, [
        node("span", { className: "bar-fill", style: `width: ${pct}%` })
      ])
    ]));
  }
}

function renderInsights() {
  const directionRows = countBy(companies, (company) => company.category || "方向待补");
  const districtRows = countBy(companies, (company) => company.district || "区域待补");
  const reviewRows = sortCompanies(companies.filter((company) => reviewScore(company) > 0), "review").slice(0, 6);

  if (els.directionTotal) els.directionTotal.textContent = String(directionRows.length);
  if (els.districtTotal) els.districtTotal.textContent = String(districtRows.length);
  renderBarList(els.directionBreakdown, directionRows, companies.length);
  renderBarList(els.districtBreakdown, districtRows, companies.length);

  if (!els.reviewQueueList) return;
  els.reviewQueueList.replaceChildren();
  for (const company of reviewRows) {
    const trigger = node("button", { text: company.name });
    trigger.addEventListener("click", () => openCompanyDialog(company, trigger));
    els.reviewQueueList.append(node("div", { className: "review-queue-item" }, [
      trigger,
      node("span", { text: reviewReasons(company).slice(0, 3).join(" · ") || "常规复核" })
    ]));
  }
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

function optionLabel(select, value) {
  if (!select || !value) return "";
  for (const optionItem of select.options) {
    if (optionItem.value === value) return optionItem.textContent || value;
  }
  return value;
}

function resetOneFilter(key) {
  const state = currentSearchState();
  state[key] = key === "sort" ? "relevance" : "";
  applySearchState(state);
  render();
}

function renderActiveFilters(state, resultCount) {
  if (!els.activeFilters) return;
  els.activeFilters.replaceChildren();
  const chips = [
    ["q", "关键词", state.q],
    ["category", "方向", optionLabel(els.category, state.category)],
    ["district", "区域", optionLabel(els.district, state.district)],
    ["verification", "状态", optionLabel(els.verification, state.verification)],
    ["audience", "人群", optionLabel(els.audience, state.audience)],
    ["opportunity", "机会", optionLabel(els.opportunity, state.opportunity)],
    ["sort", "排序", state.sort !== "relevance" ? optionLabel(els.sort, state.sort) : ""]
  ].filter(([, , value]) => value);

  els.activeFilters.append(node("span", { className: "result-count-pill", text: `${resultCount} 条结果` }));
  for (const [key, label, value] of chips) {
    const chip = node("button", { className: "filter-chip", text: `${label}: ${value} ×` });
    chip.type = "button";
    chip.addEventListener("click", () => resetOneFilter(key));
    els.activeFilters.append(chip);
  }
  if (!chips.length) {
    els.activeFilters.append(node("span", { className: "filter-hint", text: "当前显示全部公开记录" }));
  }
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function downloadCurrentCsv() {
  const headers = ["name", "district", "category", "verification_status", "source_type", "confidence_score", "last_checked", "source_url"];
  const rows = currentFiltered.map((company) => headers.map((field) => {
    if (field === "source_url") return sourceUrlFor(company);
    return company[field] ?? "";
  }));
  const csv = `${headers.join(",")}\n${rows.map((row) => row.map(csvEscape).join(",")).join("\n")}\n`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "kunming-tech-radar-filtered.csv";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setShareStatus(`已导出 ${currentFiltered.length} 条当前结果。`);
}

function setShareStatus(message) {
  if (!els.shareStatus) return;
  els.shareStatus.textContent = message;
  window.clearTimeout(setShareStatus.timer);
  setShareStatus.timer = window.setTimeout(() => {
    if (els.shareStatus?.textContent === message) els.shareStatus.textContent = "";
  }, 3200);
}

async function copyCurrentLink() {
  const url = window.location.href;
  try {
    await navigator.clipboard.writeText(url);
    setShareStatus("已复制当前筛选链接。");
  } catch {
    setShareStatus("当前浏览器不允许自动复制，可直接复制地址栏链接。");
  }
}

function resetFilters() {
  applySearchState({ sort: "relevance" });
  render();
  els.search?.focus();
}

function detailRows(company) {
  return [
    ["区域", company.district || "区域待补"],
    ["方向", company.category || "方向待补"],
    ["核验状态", verificationText[company.verification_status] || "状态未知"],
    ["来源类型", sourceTypeText[company.source_type] || company.source_type || "来源待补"],
    ["可信度", `${confidence(company) || 1}/5`],
    ["最近核验", company.last_checked || "待补"],
    ["适合查看", peopleLabels(company).join("、")],
    ["机会提示", (company.opportunities || ["unknown"]).map((item) => opportunityText[item] || item).join("、")]
  ];
}

function openCompanyDialog(company, trigger) {
  if (!els.companyDialog || !els.companyDialogBody) return;
  lastDialogTrigger = trigger || document.activeElement;
  const badge = verificationMeta(company);
  const sourceUrl = sourceUrlFor(company);
  const sourceUrls = [...new Set([sourceUrl, ...(Array.isArray(company.source_urls) ? company.source_urls : [])].filter(Boolean))];

  const titleRow = node("div", { className: "dialog-title-row" }, [
    node("div", {}, [
      node("p", { className: "kicker", text: "Company detail" }),
      node("h2", { id: "dialogCompanyName", text: company.name })
    ]),
    node("span", badge)
  ]);

  const rows = detailRows(company).map(([label, value]) => node("div", { className: "detail-row" }, [
    node("span", { text: label }),
    node("strong", { text: value })
  ]));

  const sourceLinks = sourceUrls.length
    ? sourceUrls.map((url, index) => node("a", { href: url, text: index === 0 ? "主来源" : `补充来源 ${index}` }))
    : [node("span", { text: "待补公开来源" })];

  const submitUrl = `submit.html?company=${encodeURIComponent(company.name)}&type=update`;
  els.companyDialogBody.replaceChildren(
    titleRow,
    node("p", { className: "dialog-summary", text: company.notes || "暂无摘要，等待公开来源补充。" }),
    node("div", { className: "detail-grid" }, rows),
    node("div", { className: "dialog-section" }, [
      node("strong", { text: "公开来源" }),
      node("div", { className: "dialog-links" }, sourceLinks)
    ]),
    node("div", { className: "dialog-section" }, [
      node("strong", { text: "复核提示" }),
      node("p", { text: reviewReasons(company).join("、") || "暂无高优先级复核项。" })
    ]),
    node("div", { className: "dialog-actions" }, [
      sourceUrl ? node("a", { href: sourceUrl, text: company.website ? "访问官网" : "查看来源" }) : node("span", { text: "来源待补" }),
      node("a", { href: submitUrl, text: "补充公开来源" })
    ])
  );

  if (typeof els.companyDialog.showModal === "function") {
    els.companyDialog.showModal();
  } else {
    els.companyDialog.setAttribute("open", "");
  }
}

function closeCompanyDialog() {
  if (!els.companyDialog) return;
  if (els.companyDialog.open && typeof els.companyDialog.close === "function") {
    els.companyDialog.close();
  } else {
    els.companyDialog.removeAttribute("open");
  }
  lastDialogTrigger?.focus?.();
}

function renderFeatured(companiesToShow) {
  if (!els.featuredList) return;

  els.featuredList.replaceChildren();
  const visible = companiesToShow.slice(0, 6);
  if (els.homeResultSummary) {
    els.homeResultSummary.textContent = `显示 ${companiesToShow.length} / ${companies.length} 条，预览前 ${visible.length} 条`;
  }

  if (!visible.length) {
    els.featuredList.append(node("p", { className: "empty", text: "没有匹配记录。换个关键词，或提交公开来源补充线索。" }));
    return;
  }

  for (const company of visible) {
    const badge = verificationMeta(company);
    const sourceUrl = company.website || company.source_url;
    const cardChildren = [
      node("div", { className: "featured-top" }, [
        node("h3", { text: company.name }),
        node("span", badge)
      ]),
      node("p", { text: company.notes }),
      node("div", { className: "featured-meta" }, [
        node("span", { text: company.district || "区域待补" }),
        node("span", { text: company.category || "方向待补" }),
        node("span", { text: `可信度 ${company.confidence_score || 1}/5` })
      ])
    ];
    const detailButton = node("button", { className: "card-action secondary", text: "查看详情" });
    detailButton.type = "button";
    detailButton.addEventListener("click", () => openCompanyDialog(company, detailButton));
    const actions = [detailButton];
    if (sourceUrl) actions.push(node("a", { href: sourceUrl, text: company.website ? "访问官网" : "查看来源" }));
    cardChildren.push(node("div", { className: "inline-actions" }, actions));
    els.featuredList.append(node("article", { className: "featured-card" }, cardChildren));
  }
}

function render(options = {}) {
  const state = currentSearchState();
  const queryGroups = buildQueryGroups(state.q);
  const category = state.category;
  const district = state.district;
  const verification = state.verification;
  const audience = state.audience;
  const opportunity = state.opportunity;

  const filtered = sortCompanies(companies.filter((company) => {
    const normalizedDistrict = company.district || "待补区域";
    const text = searchableText(company);
    const matchesQuery = matchesQueryGroups(text, queryGroups);
    const matchesCategory = !category || company.category === category;
    const matchesDistrict = !district || normalizedDistrict === district;
    const matchesVerification = !verification || company.verification_status === verification;
    const matchesAudience = !audience || Boolean(company[audience]);
    const matchesOpportunity = !opportunity || (company.opportunities || []).includes(opportunity);
    return matchesQuery && matchesCategory && matchesDistrict && matchesVerification && matchesAudience && matchesOpportunity;
  }), state.sort);

  currentFiltered = filtered;
  if (options.syncUrl !== false) syncUrl(state);
  renderActiveFilters(state, filtered.length);
  renderFeatured(filtered);
  els.resultSummary.textContent = `显示 ${filtered.length} / ${companies.length} 条记录`;
  els.list.replaceChildren();

  if (!filtered.length) {
    els.list.append(node("p", { className: "empty", text: "没有匹配记录。可以换个关键词，或打开提交线索页补充公开来源。" }));
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

    const detailButton = node("button", { className: "visit secondary", text: "详情" });
    detailButton.type = "button";
    detailButton.addEventListener("click", () => openCompanyDialog(company, detailButton));
    const footerChildren = [
      node("span", { className: "source", text: `核验：${company.last_checked || "待补"} · 可信度 ${company.confidence_score || 1}/5` }),
      node("div", { className: "card-actions" }, [detailButton])
    ];
    if (sourceUrl) footerChildren[1].append(node("a", { className: "visit", href: sourceUrl, text: company.website ? "访问官网" : "查看来源" }));

    const card = node("article", { className: "company-card" }, [
      top,
      node("div", { className: "meta-row" }, [
        node("div", { className: "category", text: company.category }),
        node("span", badge),
        node("span", { className: "source-type", text: sourceTypeText[company.source_type] || company.source_type || "来源待补" })
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

function applyIntent(event) {
  const target = event.currentTarget;
  const query = target.dataset.query;
  const verification = target.dataset.verification;
  const scrollTarget = target.dataset.scroll;

  if (query !== undefined) els.search.value = query;
  if (query !== undefined && els.heroSearch) els.heroSearch.value = query;
  if (verification !== undefined) els.verification.value = verification;
  els.category.value = "";
  els.district.value = "";
  els.audience.value = "";
  els.opportunity.value = "";
  els.sort.value = "relevance";
  render();

  if (scrollTarget) {
    document.querySelector(scrollTarget)?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    loadJson("data/companies.json"),
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
  applySearchState(readSearchStateFromUrl());
  renderStats();
  renderInsights();
  render({ syncUrl: false });
  renderResourcePanels();

  els.search.addEventListener("input", () => {
    if (els.heroSearch) els.heroSearch.value = els.search.value;
    render();
  });
  els.heroSearch?.addEventListener("input", () => {
    els.search.value = els.heroSearch.value;
    render();
  });
  els.heroSearchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    els.search.value = els.heroSearch?.value || "";
    els.category.value = "";
    els.district.value = "";
    els.verification.value = "";
    els.audience.value = "";
    els.opportunity.value = "";
    els.sort.value = "relevance";
    render();
    document.querySelector("#directory")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  els.category.addEventListener("change", render);
  els.district.addEventListener("change", render);
  els.verification.addEventListener("change", render);
  els.audience.addEventListener("change", render);
  els.opportunity.addEventListener("change", render);
  els.sort.addEventListener("change", render);
  els.resetFilters?.addEventListener("click", resetFilters);
  els.copySearchLink?.addEventListener("click", copyCurrentLink);
  els.downloadResultCsv?.addEventListener("click", downloadCurrentCsv);
  els.closeCompanyDialog?.addEventListener("click", closeCompanyDialog);
  els.companyDialog?.addEventListener("click", (event) => {
    if (event.target === els.companyDialog) closeCompanyDialog();
  });
  els.companyDialog?.addEventListener("close", () => lastDialogTrigger?.focus?.());
  for (const button of els.intentButtons) button.addEventListener("click", applyIntent);
}

init().catch((error) => {
  const message = "数据加载失败，请确认通过国内站点、GitHub Pages 或本地服务器打开。仍可直接下载 JSON / CSV。";
  if (els.resultSummary) els.resultSummary.textContent = message;
  if (els.homeResultSummary) els.homeResultSummary.textContent = message;
  els.list?.replaceChildren(node("p", { className: "empty", text: message }));
  els.featuredList?.replaceChildren(node("p", { className: "empty", text: message }));
  console.error(error);
});
