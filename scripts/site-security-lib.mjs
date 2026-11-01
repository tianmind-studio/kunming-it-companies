export function rewriteDocumentHref(href, context = "docs") {
  // Remote Markdown is a real source file, not one of our generated pages.
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//")) return href;
  const parts = href.match(/^([^?#]*)(.*)$/);
  if (!parts) return "";
  const [, pathname, suffix = ""] = parts;
  if (pathname === "../COMPANIES.md" || pathname === "COMPANIES.md") {
    return context === "root" ? "index.html#directory" : "../index.html#directory";
  }
  return pathname.replace(/\.md$/, ".html") + suffix;
}

export function safeDocumentHref(rawHref, context = "docs") {
  const href = rewriteDocumentHref(String(rawHref || "").trim(), context);
  if (!href || /[\u0000-\u001f\u007f\\]/.test(href) || href.startsWith("//")) return "";
  if (/^https?:\/\//i.test(href)) {
    try {
      const url = new URL(href);
      return url.username || url.password ? "" : href;
    } catch { return ""; }
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return "";
  return /^[^:\s][^\u0000-\u001f\u007f\\]*$/.test(href) ? href : "";
}
