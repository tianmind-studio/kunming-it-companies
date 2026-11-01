import { safeDocumentHref } from "./site-security-lib.mjs";

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

export function renderInline(markdown, context = "docs") {
  const tokens = /`([^`]+)`|!\[([^\]]*)\]\(([^)]+)\)|\[((?:!\[[^\]]*\]\([^)]+\)|[^\]])+)\]\(([^)]+)\)|<((?:https?:\/\/)[^<>]+)>|\*\*([^*]+)\*\*/g;
  let html = "";
  let cursor = 0;
  for (const match of markdown.matchAll(tokens)) {
    html += escapeHtml(markdown.slice(cursor, match.index));
    if (match[1] !== undefined) html += `<code>${escapeHtml(match[1])}</code>`;
    else if (match[2] !== undefined) {
      const src = safeDocumentHref(match[3], context);
      html += src ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(match[2])}" loading="lazy">` : escapeHtml(match[2]);
    } else if (match[4] !== undefined) {
      const href = safeDocumentHref(match[5], context);
      const label = renderInline(match[4], context);
      html += href ? `<a href="${escapeHtml(href)}">${label}</a>` : label;
    } else if (match[6] !== undefined) {
      const href = safeDocumentHref(match[6], context);
      html += href ? `<a href="${escapeHtml(href)}">${escapeHtml(match[6])}</a>` : escapeHtml(match[6]);
    } else html += `<strong>${escapeHtml(match[7])}</strong>`;
    cursor = match.index + match[0].length;
  }
  return html + escapeHtml(markdown.slice(cursor));
}

export function headingSlug(text) {
  return text.toLowerCase().replace(/`([^`]+)`/g, "$1")
    .replace(/[^\p{L}\p{M}\p{N}_ -]/gu, "").trim().replace(/ /g, "-") || "section";
}

function renderTable(lines, context = "docs") {
  const rows = lines.map((line) => line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()));
  const [header, , ...body] = rows;
  const head = header.map((cell) => `<th>${renderInline(cell, context)}</th>`).join("");
  const bodyHtml = body.map((row) => `<tr>${row.map((cell) => `<td>${renderInline(cell, context)}</td>`).join("")}</tr>`).join("\n");
  return `<div class="doc-table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`;
}

export function renderMarkdown(markdown, context = "docs") {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  const headingIds = new Map();
  let paragraph = [];
  let list = [];
  let orderedList = [];
  let code = [];
  let inCode = false;
  let inComment = false;
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
    if (!inCode && (inComment || line.trim().startsWith("<!--"))) {
      inComment = !line.includes("-->");
      continue;
    }
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
      const base = headingSlug(heading[2]);
      const count = headingIds.get(base) || 0;
      headingIds.set(base, count + 1);
      const id = count ? `${base}-${count}` : base;
      html.push(`<h${level} id="${escapeHtml(id)}">${renderInline(heading[2], context)}</h${level}>`);
      continue;
    }

    const unordered = line.match(/^\s*[-*]\s+(.+)$/);
    if (unordered) {
      flushParagraph();
      if (orderedList.length) flushList();
      list.push(unordered[1]);
      continue;
    }

    const ordered = line.match(/^\s*\d+\.\s+(.+)$/);
    if (ordered) {
      flushParagraph();
      if (list.length) flushList();
      orderedList.push(ordered[1]);
      continue;
    }

    paragraph.push(line.trim());
  }

  if (inCode) html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
  flushParagraph();
  flushList();
  flushTable();
  return html.join("\n");
}

