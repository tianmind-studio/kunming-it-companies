import fs from "node:fs";
import path from "node:path";
import { getCompanies, readDataset, sourceTypeLabel } from "./companies-lib.mjs";
import { safeDocumentHref } from "./site-security-lib.mjs";
import { safeJsonForHtml } from "./site-data-lib.mjs";

const root = process.cwd();
const outDir = path.join(root, "dist");
const indexNowKey = "7b2f684dc42149d8a7e103c36f2a90be";

const rootFiles = [
  "index.html",
  "favicon.svg",
  "guides.html",
  "submit.html",
  "styles.css",
  "script.js",
  "submit.js",
  "COMPANIES.md",
  "CONTRIBUTING.md",
  "README.md",
  "README.en.md",
  "SUPPORT.md",
  "LICENSE",
  `${indexNowKey}.txt`,
  "robots.txt",
  "sitemap.xml"
];

const dirs = ["assets", "data", "docs"];

const docsToRender = [
  "community-guidelines.md",
  "contribution-guide.md",
  "data-change-summary.md",
  "data-cleanup-plan.md",
  "data-quality-report.md",
  "data-schema.md",
  "data-standard.md",
  "domestic-site-deploy.md",
  "kunming-it-map.md",
  "opportunity-radar.md",
  "promotion.md",
  "project-brief.md",
  "reuse-and-citation.md",
  "search-guide.md",
  "source-research-playbook.md",
  "takedown-and-correction.md",
  "use-cases.md",
  "why-kunming-tech-radar.md"
];

const rootMarkdownToRender = [
  "CONTRIBUTING.md",
  "README.md",
  "README.en.md",
  "SUPPORT.md"
];

function shouldSkip(name) {
  return name === ".DS_Store" || name.startsWith("._");
}

function copyFile(relativePath) {
  const source = path.join(root, relativePath);
  const target = path.join(outDir, relativePath);
  if (!fs.existsSync(source)) throw new Error(`Missing required site file: ${relativePath}`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function copyDir(relativeDir) {
  const sourceDir = path.join(root, relativeDir);
  const targetDir = path.join(outDir, relativeDir);
  if (!fs.existsSync(sourceDir)) throw new Error(`Missing required site directory: ${relativeDir}`);

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    if (shouldSkip(entry.name)) continue;
    const childRelative = path.join(relativeDir, entry.name);
    const childSource = path.join(root, childRelative);
    const childTarget = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyDir(childRelative);
    } else if (entry.isFile()) {
      fs.mkdirSync(path.dirname(childTarget), { recursive: true });
      fs.copyFileSync(childSource, childTarget);
    }
  }
}

function removeJunkFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (shouldSkip(entry.name)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    } else if (entry.isDirectory()) {
      removeJunkFiles(fullPath);
    }
  }
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

function countCsvRows(relativePath) {
  const content = fs.readFileSync(path.join(root, relativePath), "utf8").trim();
  if (!content) return 0;
  const lines = content.split(/\r?\n/);
  const header = parseCsvLine(lines[0] || "");
  if (!header.length) return 0;
  return lines.slice(1).filter((line) => line.trim()).length;
}

function getStaticStats() {
  const dataset = readDataset();
  const companies = getCompanies(dataset);
  const strongSources = companies.filter((company) => ["verified", "official_page"].includes(company.verification_status)).length;
  const pending = companies.filter((company) => company.verification_status === "community_pending").length;
  const missingDistricts = companies.filter((company) => !company.district).length;
  const weakSources = companies.filter((company) => Number(company.confidence_score || 0) <= 2).length;
  const verifiedRatio = companies.length ? `${Math.round((strongSources / companies.length) * 100)}%` : "0%";

  return {
    heroUpdatedAt: dataset.meta?.updated_at || "-",
    heroCompanyCount: companies.length,
    heroSourceLeadCount: countCsvRows("data/source-leads.csv"),
    heroStrongSourceCount: strongSources,
    heroPendingCount: pending,
    companyCount: companies.length,
    strongSourceCount: strongSources,
    pendingCount: pending,
    sourceLeadCount: countCsvRows("data/source-leads.csv"),
    communityCount: countCsvRows("data/communities.csv"),
    eventCount: countCsvRows("data/events.csv"),
    projectCount: countCsvRows("data/gov-projects.csv"),
    sourceDate: dataset.meta?.updated_at || "-",
    verifiedRatio,
    missingDistrictCount: missingDistricts,
    weakSourceCount: weakSources
  };
}

function replaceStat(html, id, value) {
  const pattern = new RegExp(`(<strong id="${id}">)([^<]*)(</strong>)`, "g");
  return html.replace(pattern, `$1${escapeHtml(String(value))}$3`);
}

function injectStaticStatsIntoIndex() {
  const indexPath = path.join(outDir, "index.html");
  let html = fs.readFileSync(indexPath, "utf8");
  const stats = getStaticStats();
  for (const [id, value] of Object.entries(stats)) {
    html = replaceStat(html, id, value);
  }
  const styles = fs.readFileSync(path.join(outDir, "styles.css"), "utf8");
  const script = fs.readFileSync(path.join(outDir, "script.js"), "utf8");
  html = html.replace('    <link rel="stylesheet" href="styles.css">\n', `    <style>\n${styles}\n    </style>\n`);
  html = html.replace(/\n\s*<link rel="modulepreload" href="script\.js">\n/, "\n");
  html = html.replace(/\n\s*<link id="siteDataPreload"[^>]+>\n/, "\n");
  html = html.replace(
    "    <!-- KTR_BOOTSTRAP_DATA -->",
    `    <script id="kunmingSiteData" type="application/json">${safeJsonForHtml()}</script>`
  );
  html = html.replace('    <script src="script.js" type="module"></script>', `    <script type="module">\n${script}\n    </script>`);
  fs.writeFileSync(indexPath, html);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function uniqueHttpUrls(company) {
  return [...new Set([
    company.website,
    company.source_url,
    ...(Array.isArray(company.source_urls) ? company.source_urls : [])
  ].filter(isHttpUrl))];
}

function companyPageFile(company) {
  if (!/^[a-z0-9-]+$/.test(company.id || "")) {
    throw new Error(`Unsafe company id for static page: ${company.id || "(missing)"}`);
  }
  return `${company.id}.html`;
}

function verificationLabel(status) {
  return {
    verified: "官网已核验",
    official_page: "官方页核验"
  }[status] || "状态待复核";
}

function safeJsonLd(value) {
  return JSON.stringify(value, null, 2).replaceAll("<", "\\u003c");
}

function renderCompanyPage(company) {
  const file = companyPageFile(company);
  const canonical = `https://kunming.tianmind.com/companies/${file}`;
  const sources = uniqueHttpUrls(company);
  const summary = company.summary_zh || company.notes || "该记录等待更多公开来源补充。";
  const name = company.name_zh || company.name;
  const tags = Array.isArray(company.tags) ? company.tags : [];
  const dateModified = company.last_checked || company.source_checked_at || "2026-08-03";
  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${name}公开来源记录`,
    url: canonical,
    dateModified,
    isPartOf: {
      "@type": "Dataset",
      name: "昆明技术机会雷达 / Kunming Tech Radar",
      url: "https://kunming.tianmind.com/"
    },
    mainEntity: {
      "@type": "Organization",
      ...(isHttpUrl(company.entity_id) ? { "@id": company.entity_id } : {}),
      name,
      ...(company.name_en ? { alternateName: company.name_en } : {}),
      ...(isHttpUrl(company.entity_id)
        ? { url: new URL(company.entity_id).origin + "/" }
        : isHttpUrl(company.website) ? { url: company.website } : {}),
      description: summary,
      ...(tags.length ? { knowsAbout: tags } : {}),
      ...(sources.length ? {
        subjectOf: sources.map((url) => ({
          "@type": "WebPage",
          url
        }))
      } : {})
    }
  };
  const sourceList = sources.length
    ? sources.map((url, index) => `<li><a href="${escapeHtml(url)}" rel="noopener">${index === 0 ? "主来源" : `补充来源 ${index}`}</a></li>`).join("\n")
    : "<li>尚无可直接打开的公开来源。</li>";
  const tagList = tags.length
    ? `<div class="tags">${tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>`
    : "";

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(name)}｜公开来源记录｜昆明技术机会雷达</title>
    <meta name="description" content="${escapeHtml(`${name}的公开来源、业务方向、核验状态与最近核验时间。${summary}`)}">
    <meta name="robots" content="index,follow,max-snippet:-1">
    <link rel="canonical" href="${canonical}">
    <link rel="icon" href="../favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="../styles.css">
    <script type="application/ld+json">${safeJsonLd(schema)}</script>
  </head>
  <body class="doc-page">
    <nav class="topbar" aria-label="主导航">
      <a class="brand" href="../index.html">
        <strong>昆明技术机会雷达</strong>
        <span>Kunming Tech Radar</span>
      </a>
      <div class="topbar-links">
        <a href="./">已核验记录</a>
        <a href="../index.html#directory">查全部公司</a>
        <a href="../submit.html">补充来源</a>
      </div>
    </nav>
    <main class="doc-shell">
      <article class="doc-article">
        <p class="kicker">Verified public record · ${escapeHtml(dateModified)}</p>
        <h1>${escapeHtml(name)}</h1>
        ${company.name_en ? `<p>${escapeHtml(company.name_en)}</p>` : ""}
        <p>${escapeHtml(summary)}</p>
        ${tagList}
        <h2>记录信息</h2>
        <div class="doc-table-wrap">
          <table>
            <tbody>
              <tr><th>所在城市</th><td>${escapeHtml(company.city || "昆明")}</td></tr>
              <tr><th>区县</th><td>${escapeHtml(company.district || "公开来源暂未明确")}</td></tr>
              <tr><th>业务方向</th><td>${escapeHtml(company.category || "待补")}</td></tr>
              <tr><th>核验状态</th><td>${escapeHtml(verificationLabel(company.verification_status))}</td></tr>
              <tr><th>来源类型</th><td>${escapeHtml(sourceTypeLabel(company.source_type))}</td></tr>
              <tr><th>最近核验</th><td>${escapeHtml(dateModified)}</td></tr>
              <tr><th>可信度</th><td>${escapeHtml(String(company.confidence_score || 1))} / 5</td></tr>
            </tbody>
          </table>
        </div>
        <h2>公开来源</h2>
        <ul>${sourceList}</ul>
        <h2>使用边界</h2>
        <p>本页由公开来源整理，只用于检索和事实核验，不构成公司排名、商业推荐、招聘承诺或第三方背书。发现名称、业务或来源过期时，可通过补充来源入口提交更正。</p>
        <p><a href="./">返回全部已核验记录</a> · <a href="../submit.html?company=${encodeURIComponent(name)}&amp;type=update">提交更正来源</a></p>
      </article>
    </main>
  </body>
</html>
`;
}

function renderCompanyIndexPage(companies) {
  const items = companies.map((company) => {
    const name = company.name_zh || company.name;
    const summary = company.summary_zh || company.notes || "等待更多公开来源补充。";
    return `<a href="${escapeHtml(companyPageFile(company))}">
      <span>${escapeHtml(verificationLabel(company.verification_status))}</span>
      <strong>${escapeHtml(name)}</strong>
      <p>${escapeHtml(company.category || "方向待补")} · ${escapeHtml(company.district || company.city || "区域待补")}</p>
      <p>${escapeHtml(summary)}</p>
    </a>`;
  }).join("\n");
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "昆明技术机会雷达已核验公司记录",
    numberOfItems: companies.length,
    itemListElement: companies.map((company, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: company.name_zh || company.name,
      url: `https://kunming.tianmind.com/companies/${companyPageFile(company)}`
    }))
  };
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>已核验公司公开记录｜昆明技术机会雷达</title>
    <meta name="description" content="昆明技术机会雷达中由公司官网、官方页面或政府公开来源支持的公司记录，每条均提供独立详情页和来源链接。">
    <meta name="robots" content="index,follow,max-snippet:-1">
    <link rel="canonical" href="https://kunming.tianmind.com/companies/">
    <link rel="icon" href="../favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="../styles.css">
    <script type="application/ld+json">${safeJsonLd(itemList)}</script>
  </head>
  <body class="doc-page">
    <nav class="topbar" aria-label="主导航">
      <a class="brand" href="../index.html">
        <strong>昆明技术机会雷达</strong>
        <span>Kunming Tech Radar</span>
      </a>
      <div class="topbar-links">
        <a href="../index.html#directory">查全部公司</a>
        <a href="../guides.html">使用指南</a>
        <a href="../submit.html">提交线索</a>
      </div>
    </nav>
    <main class="guide-shell">
      <header class="guide-hero">
        <p class="kicker">Source-backed records</p>
        <h1>已核验公司公开记录</h1>
        <p>这里只列出有公司官网、官方页面或政府公开来源支持的记录。独立页面用于稳定引用与事实核验，不代表排名、推荐或商业背书。</p>
      </header>
      <section class="guide-grid" aria-label="已核验公司列表">${items}</section>
    </main>
  </body>
</html>
`;
}

function updateBuiltSitemap(companies, indexLastModified) {
  const sitemapPath = path.join(outDir, "sitemap.xml");
  let sitemap = fs.readFileSync(sitemapPath, "utf8");
  const indexEntry = /(<loc>https:\/\/kunming\.tianmind\.com\/companies\/<\/loc>\s*<lastmod>)[^<]+(<\/lastmod>)/;
  if (!indexEntry.test(sitemap)) throw new Error("Sitemap is missing the company index entry.");
  sitemap = sitemap.replace(indexEntry, `$1${indexLastModified}$2`);
  const entries = companies.map((company) => `  <url>
    <loc>https://kunming.tianmind.com/companies/${companyPageFile(company)}</loc>
    <lastmod>${escapeHtml(company.last_checked || company.source_checked_at || "2026-08-03")}</lastmod>
  </url>`).join("\n");
  sitemap = sitemap.replace("</urlset>", `${entries}\n</urlset>`);
  fs.writeFileSync(sitemapPath, sitemap);
}

function generateCompanyPages() {
  const dataset = readDataset();
  const companies = getCompanies(dataset)
    .filter((company) => ["verified", "official_page"].includes(company.verification_status))
    .sort((a, b) => (a.name_zh || a.name).localeCompare(b.name_zh || b.name, "zh-CN"));
  const companyOut = path.join(outDir, "companies");
  fs.mkdirSync(companyOut, { recursive: true });
  fs.writeFileSync(path.join(companyOut, "index.html"), renderCompanyIndexPage(companies));
  for (const company of companies) {
    fs.writeFileSync(path.join(companyOut, companyPageFile(company)), renderCompanyPage(company));
  }
  updateBuiltSitemap(companies, dataset.meta?.updated_at || "2026-08-03");
}

function renderInline(markdown, context = "docs") {
  let text = escapeHtml(markdown);
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    const safeHref = escapeHtml(safeDocumentHref(href, context));
    if (!safeHref) return label;
    return `<a href="${safeHref}">${label}</a>`;
  });
  text = text.replace(/\.md(<\/code>)/g, ".html$1");
  return text;
}

function renderTable(lines, context = "docs") {
  const rows = lines.map((line) => line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()));
  const [header, , ...body] = rows;
  const head = header.map((cell) => `<th>${renderInline(cell, context)}</th>`).join("");
  const bodyHtml = body.map((row) => `<tr>${row.map((cell) => `<td>${renderInline(cell, context)}</td>`).join("")}</tr>`).join("\n");
  return `<div class="doc-table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`;
}

function renderMarkdown(markdown, context = "docs") {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  let paragraph = [];
  let list = [];
  let orderedList = [];
  let code = [];
  let inCode = false;
  let table = [];

  function flushParagraph() {
    if (!paragraph.length) return;
    html.push(`<p>${renderInline(paragraph.join(" "), context)}</p>`);
    paragraph = [];
  }

  function flushList() {
    if (list.length) {
      html.push(`<ul>${list.map((item) => `<li>${renderInline(item, context)}</li>`).join("")}</ul>`);
      list = [];
    }
    if (orderedList.length) {
      html.push(`<ol>${orderedList.map((item) => `<li>${renderInline(item, context)}</li>`).join("")}</ol>`);
      orderedList = [];
    }
  }

  function flushTable() {
    if (!table.length) return;
    html.push(renderTable(table, context));
    table = [];
  }

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (inCode) {
        html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
        code = [];
        inCode = false;
      } else {
        flushParagraph();
        flushList();
        flushTable();
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      code.push(line);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      flushTable();
      continue;
    }

    if (/^\|.+\|$/.test(line.trim())) {
      flushParagraph();
      flushList();
      table.push(line);
      continue;
    }

    flushTable();

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      html.push(`<h${level}>${renderInline(heading[2], context)}</h${level}>`);
      continue;
    }

    const unordered = line.match(/^\s*[-*]\s+(.+)$/);
    if (unordered) {
      flushParagraph();
      orderedList = [];
      list.push(unordered[1]);
      continue;
    }

    const ordered = line.match(/^\s*\d+\.\s+(.+)$/);
    if (ordered) {
      flushParagraph();
      list = [];
      orderedList.push(ordered[1]);
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();
  flushTable();
  return html.join("\n");
}

function pageTitle(markdown, fallback) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback;
}

function renderDocPage(relativeMd) {
  const source = path.join(root, "docs", relativeMd);
  const markdown = fs.readFileSync(source, "utf8");
  const title = pageTitle(markdown, relativeMd.replace(/\.md$/, ""));
  const body = renderMarkdown(markdown, "docs");
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)} / 昆明技术机会雷达</title>
    <meta name="description" content="昆明技术机会雷达文档：${escapeHtml(title)}">
    <link rel="canonical" href="https://kunming.tianmind.com/docs/${relativeMd.replace(/\.md$/, ".html")}">
    <link rel="icon" href="../favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="../styles.css">
  </head>
  <body class="doc-page">
    <nav class="topbar" aria-label="主导航">
      <a class="brand" href="../index.html">
        <strong>昆明技术机会雷达</strong>
        <span>Kunming Tech Radar</span>
      </a>
      <div class="topbar-links">
        <a href="../index.html#directory">查公司</a>
        <a href="../guides.html">使用指南</a>
        <a href="../submit.html">提交线索</a>
        <a href="../data/companies.csv">下载数据</a>
      </div>
    </nav>
    <main class="doc-shell">
      <article class="doc-article">
        ${body}
      </article>
    </main>
  </body>
</html>
`;
}

function renderRootMarkdownPage(relativeMd) {
  const source = path.join(root, relativeMd);
  const markdown = fs.readFileSync(source, "utf8");
  const title = pageTitle(markdown, relativeMd.replace(/\.md$/, ""));
  const body = renderMarkdown(markdown, "root");
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)} / 昆明技术机会雷达</title>
    <meta name="description" content="昆明技术机会雷达：${escapeHtml(title)}">
    <link rel="canonical" href="https://kunming.tianmind.com/${relativeMd.replace(/\.md$/, ".html")}">
    <link rel="icon" href="favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="styles.css">
  </head>
  <body class="doc-page">
    <nav class="topbar" aria-label="主导航">
      <a class="brand" href="index.html">
        <strong>昆明技术机会雷达</strong>
        <span>Kunming Tech Radar</span>
      </a>
      <div class="topbar-links">
        <a href="index.html#directory">查公司</a>
        <a href="guides.html">使用指南</a>
        <a href="submit.html">提交线索</a>
        <a href="data/companies.csv">下载数据</a>
      </div>
    </nav>
    <main class="doc-shell">
      <article class="doc-article">
        ${body}
      </article>
    </main>
  </body>
</html>
`;
}

function generateMarkdownPages() {
  const docsOut = path.join(outDir, "docs");
  fs.mkdirSync(docsOut, { recursive: true });
  for (const file of docsToRender) {
    const html = renderDocPage(file);
    fs.writeFileSync(path.join(docsOut, file.replace(/\.md$/, ".html")), html);
  }
  for (const file of rootMarkdownToRender) {
    const html = renderRootMarkdownPage(file);
    fs.writeFileSync(path.join(outDir, file.replace(/\.md$/, ".html")), html);
  }
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const file of rootFiles) copyFile(file);
for (const dir of dirs) copyDir(dir);
injectStaticStatsIntoIndex();
generateMarkdownPages();
generateCompanyPages();
removeJunkFiles(outDir);

console.log(`Static site built into ${path.relative(root, outDir)}/`);
