import fs from "node:fs";
import path from "node:path";
import { getCompanies, readDataset } from "./companies-lib.mjs";
import { safeJsonForHtml } from "./site-data-lib.mjs";

const root = process.cwd();
const outDir = path.join(root, "dist");

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

function rewriteHref(href, context = "docs") {
  if (href === "../COMPANIES.md" || href === "COMPANIES.md") {
    return context === "root" ? "index.html#directory" : "../#directory";
  }
  if (href.endsWith(".md")) return href.replace(/\.md(#.*)?$/, ".html$1");
  return href;
}

function renderInline(markdown, context = "docs") {
  let text = escapeHtml(markdown);
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    const safeHref = escapeHtml(rewriteHref(href.trim(), context));
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
removeJunkFiles(outDir);

console.log(`Static site built into ${path.relative(root, outDir)}/`);
