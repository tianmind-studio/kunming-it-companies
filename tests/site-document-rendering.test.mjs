import test from "node:test";
import assert from "node:assert/strict";
import { safeDocumentHref } from "../scripts/site-security-lib.mjs";
import { renderInline, renderMarkdown } from "../scripts/markdown-lib.mjs";
import { safeJsonForHtml } from "../scripts/site-data-lib.mjs";

test("local Markdown links preserve query strings and fragments while remote source files stay unchanged", () => {
  assert.equal(safeDocumentHref("data-standard.md#来源"), "data-standard.html#来源");
  assert.equal(safeDocumentHref("docs/data-schema.md?lang=zh#fields", "root"), "docs/data-schema.html?lang=zh#fields");
  assert.equal(safeDocumentHref("https://github.com/example/project/blob/main/README.md"), "https://github.com/example/project/blob/main/README.md");
  assert.equal(safeDocumentHref("../COMPANIES.md"), "../index.html#directory");
});

test("document links fail closed for dangerous protocols and credential-bearing URLs", () => {
  for (const href of ["javascript:alert(1)", "data:text/html,<script>", "//example.org", "https://example.org\\evil", "https://user:example@example.org", "https://", "foo.md?x\ny", "java\tscript:alert(1)"]) {
    assert.equal(safeDocumentHref(href), "", href);
  }
  assert.equal(renderInline('[unsafe](javascript:alert)'), "unsafe");
});

test("inline renderer escapes once, preserves queries and keeps code literal", () => {
  assert.equal(renderInline('[source](https://example.org/?a=1&b=2)'), '<a href="https://example.org/?a=1&amp;b=2">source</a>');
  assert.equal(renderInline('`README.md`'), '<code>README.md</code>');
  assert.equal(renderInline('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
  assert.equal(renderInline('[**source**](source.md#check)'), '<a href="source.html#check"><strong>source</strong></a>');
});

test("Markdown headings expose stable Chinese anchors and deduplicate repeated titles", () => {
  const html = renderMarkdown('## 联系 / 本地社群\n\n## 联系 / 本地社群\n\n[联系](#联系--本地社群)');
  assert.ok(html.includes('id="联系--本地社群"'));
  assert.ok(html.includes('id="联系--本地社群-1"'));
  assert.ok(html.includes('href="#联系--本地社群"'));
});

test("switching list types retains preceding items and unterminated code stays escaped", () => {
  const html = renderMarkdown('- one\n1. two\n- three');
  for (const item of ['one', 'two', 'three']) assert.ok(html.includes(`<li>${item}</li>`));
  assert.ok(renderMarkdown('```html\n<script>').includes('&lt;script&gt;'));
});

test("images and badges render as images and embedded JSON cannot close its script element", () => {
  assert.equal(renderInline('![Radar](assets/radar.svg)'), '<img src="assets/radar.svg" alt="Radar" loading="lazy">');
  assert.ok(renderInline('[![validate](https://example.org/badge.svg)](https://example.org/actions)').startsWith('<a href="https://example.org/actions"><img'));
  const payload = { text: '</script><script>alert(1)</script>&\u2028' };
  const output = safeJsonForHtml(payload);
  assert.ok(!output.includes('<'));
  assert.deepEqual(JSON.parse(output), payload);
});

test("maintenance comments stay invisible in the public rendered page", () => {
  assert.equal(renderMarkdown("<!-- DATA_SUMMARY_START -->\nVisible\n<!-- DATA_SUMMARY_END -->"), "<p>Visible</p>");
});
