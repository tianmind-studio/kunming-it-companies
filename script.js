const els = {
  search: document.querySelector("#searchInput"),
  category: document.querySelector("#categorySelect"),
  verification: document.querySelector("#verificationSelect"),
  companyCount: document.querySelector("#companyCount"),
  categoryCount: document.querySelector("#categoryCount"),
  sourceDate: document.querySelector("#sourceDate"),
  resultSummary: document.querySelector("#resultSummary"),
  list: document.querySelector("#companyList")
};

let companies = [];
let meta = {};

function node(tag, options = {}, children = []) {
  const element = document.createElement(tag);
  if (options.className) element.className = options.className;
  if (options.text) element.textContent = options.text;
  if (options.href) {
    element.href = options.href;
    element.target = "_blank";
    element.rel = "noreferrer";
  }
  for (const child of children) element.append(child);
  return element;
}

function searchableText(company) {
  return [
    company.name_zh,
    company.name_en,
    company.city,
    company.district,
    company.category,
    company.summary_zh,
    company.summary_en,
    ...(company.tags || [])
  ].join(" ").toLowerCase();
}

function populateFilters() {
  const categories = [...new Set(companies.map((company) => company.category))].sort((a, b) => a.localeCompare(b, "zh-CN"));
  for (const category of categories) {
    els.category.append(node("option", { text: category }));
  }
}

function renderStats() {
  const categories = new Set(companies.map((company) => company.category));
  els.companyCount.textContent = String(companies.length);
  els.categoryCount.textContent = String(categories.size);
  els.sourceDate.textContent = meta.updated_at || "-";
}

function render() {
  const query = els.search.value.trim().toLowerCase();
  const category = els.category.value;
  const verification = els.verification.value;

  const filtered = companies.filter((company) => {
    const matchesQuery = !query || searchableText(company).includes(query);
    const matchesCategory = !category || company.category === category;
    const matchesVerification = !verification || company.verification === verification;
    return matchesQuery && matchesCategory && matchesVerification;
  });

  els.resultSummary.textContent = `显示 ${filtered.length} / ${companies.length} 条记录`;
  els.list.replaceChildren();

  if (!filtered.length) {
    els.list.append(node("p", { className: "empty", text: "没有匹配记录。可以换个关键词，或通过 GitHub issue 补充公司。" }));
    return;
  }

  for (const company of filtered) {
    const title = node("h3", { text: company.name_zh });
    const district = node("span", { className: "district", text: company.district || "区域待补" });
    const top = node("div", { className: "card-top" }, [title, district]);

    const tags = node("div", { className: "tags" });
    for (const tag of company.tags) tags.append(node("span", { className: "tag", text: tag }));

    const footer = node("div", { className: "card-footer" }, [
      node("span", { className: "source", text: `来源核验：${company.source_checked_at}` }),
      node("a", { className: "visit", href: company.website || company.source_urls[0], text: "查看来源" })
    ]);

    const card = node("article", { className: "company-card" }, [
      top,
      node("div", { className: "category", text: company.category }),
      node("p", { className: "summary", text: company.summary_zh }),
      tags,
      footer
    ]);

    els.list.append(card);
  }
}

async function init() {
  const response = await fetch("data/companies.json");
  const dataset = await response.json();
  companies = dataset.companies;
  meta = dataset.meta;

  populateFilters();
  renderStats();
  render();

  els.search.addEventListener("input", render);
  els.category.addEventListener("change", render);
  els.verification.addEventListener("change", render);
}

init().catch((error) => {
  els.resultSummary.textContent = "数据加载失败，请确认通过本地服务器或 GitHub Pages 打开。";
  console.error(error);
});
