export function rewriteDocumentHref(href, context = "docs") {
  if (href === "../COMPANIES.md" || href === "COMPANIES.md") {
    return context === "root" ? "index.html#directory" : "../#directory";
  }
  if (href.endsWith(".md")) return href.replace(/\.md(#.*)?$/, ".html$1");
  return href;
}

export function safeDocumentHref(rawHref, context = "docs") {
  const href = rewriteDocumentHref(String(rawHref || "").trim(), context);
  if (!href || /[\u0000-\u001f\u007f\\]/.test(href) || href.startsWith("//")) return "";
  if (/^https?:\/\//i.test(href)) return href;
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return "";
  return /^[^:\s][^\u0000-\u001f\u007f\\]*$/.test(href) ? href : "";
}
