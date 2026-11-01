import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const mainSource = fs.readFileSync(new URL("../script.js", import.meta.url), "utf8");
const submitSource = fs.readFileSync(new URL("../submit.js", import.meta.url), "utf8");

function directoryContext(overrides = {}) {
  const location = { href: "https://example.com/radar/?entry=hero", search: "?entry=hero", pathname: "/radar/", hash: "#directory" };
  const context = vm.createContext({
    URL, URLSearchParams, console: { warn() {} },
    document: { querySelector: () => null, querySelectorAll: () => [] },
    window: { location, history: { replaceState(_a, _b, url) { location.replaced = url; } } },
    ...overrides
  });
  // Leave bootstrap out: these tests exercise real helpers without a browser or network.
  vm.runInContext(mainSource.slice(0, mainSource.indexOf("// Contact stays usable")), context);
  return context;
}

function jsonResult(context, expression) {
  return JSON.parse(vm.runInContext(`JSON.stringify(${expression})`, context));
}

test("English names retain embedded intent words and stop words", () => {
  const context = directoryContext();
  for (const name of ["GitLab", "Chain", "Fairdata", "Listify", "IndexLab"]) {
    assert.deepEqual(jsonResult(context, `buildQueryGroups(${JSON.stringify(name)})`), [[name.toLowerCase()]]);
    assert.equal(vm.runInContext(`matchesQueryGroups(${JSON.stringify(name.toLowerCase())}, buildQueryGroups(${JSON.stringify(name)}))`, context), true);
  }
  assert.equal(vm.runInContext('matchesQueryGroups("blockchain gitlab", buildQueryGroups("AI"))', context), false);
  assert.equal(vm.runInContext('matchesQueryGroups("人工智能", buildQueryGroups("AI"))', context), true);
  assert.equal(vm.runInContext('matchesQueryGroups("软件开发", buildQueryGroups("昆明 IT 公司"))', context), true);
  assert.equal(vm.runInContext('matchesQueryGroups("南天电子信息产业", buildQueryGroups("云南南天电子信息产业股份有限公司"))', context), true);
  assert.equal(vm.runInContext('matchesQueryGroups("c++ .net", [["c++"], [".net"]])', context), true);
});

test("CSV fallback preserves BOM, quoted newlines, commas and escaped quotes", () => {
  const context = directoryContext();
  const csv = '\uFEFFname,notes\r\n"公开入口","第一行\n第二行,含逗号与""引号"""\r\n';
  context.csv = csv;
  assert.deepEqual(jsonResult(context, "parseCsv(csv)"), [{ name: "公开入口", notes: '第一行\n第二行,含逗号与"引号"' }]);
  assert.throws(() => vm.runInContext('parseCsv(\'name,notes\\nentry,"broken\')', context), /unterminated/);
});

test("filter links preserve unrelated entry markers and remove cleared filters", () => {
  const context = directoryContext();
  vm.runInContext('syncUrl({q:"AI", category:"", sort:"relevance"})', context);
  assert.equal(context.window.location.replaced, "/radar/?entry=hero&q=AI#directory");
  context.window.location.search = "?q=old&category=old&entry=nav";
  vm.runInContext('syncUrl({q:"", category:"", sort:"relevance"})', context);
  assert.equal(context.window.location.replaced, "/radar/?entry=nav#directory");
});

test("malformed inline data falls back to combined JSON", async () => {
  const payload = { dataset: { companies: [], meta: {} }, sourceLeads: [] };
  const paths = [];
  const context = directoryContext({
    document: { querySelector: (selector) => selector === "#kunmingSiteData" ? { textContent: "{broken" } : null, querySelectorAll: () => [] },
    fetch: async (path) => { paths.push(path); return { ok: true, json: async () => payload }; }
  });
  const result = await vm.runInContext("loadSiteData()", context);
  assert.equal(result.dataset.companies.length, 0);
  assert.deepEqual(paths, ["data/site-data.json"]);
  assert.equal(vm.runInContext('normalizeSiteDataPayload({dataset:{companies:{}}})', context), null);
});

function submissionContext(response, search = "") {
  const status = { dataset: {} };
  const button = { disabled: false };
  const form = {
    elements: { city: { value: "昆明" }, title: { value: "" }, lead_type: { value: "company" } },
    reportValidity: () => true, querySelector: () => button, addEventListener() {},
    resetCount: 0, reset() { this.resetCount += 1; }
  };
  const context = vm.createContext({
    URL, URLSearchParams, AbortController, navigator: {},
    document: { querySelectorAll: () => [], getElementById: (id) => id === "leadForm" ? form : status },
    window: { location: { hostname: "localhost", search }, setTimeout: () => 1, clearTimeout() {} },
    FormData: class { get(name) { return { title: "公开示例", source_url: "https://example.com/source", lead_type: "company", city: "昆明", reason: "公开来源" }[name] || ""; } },
    fetch: async () => response
  });
  vm.runInContext(submitSource, context);
  return { context, form, status, button };
}

test("company correction links prefill only the intended public fields", () => {
  const { form } = submissionContext(null, "?company=%E5%85%AC%E5%BC%80%E7%A4%BA%E4%BE%8B&type=update");
  assert.equal(form.elements.title.value, "公开示例");
  assert.equal(form.elements.lead_type.value, "correction");
});

test("successful HTTP without a valid receipt never clears the user's draft", async () => {
  for (const response of [
    { ok: true, json: async () => { throw new SyntaxError("HTML response"); } },
    { ok: true, json: async () => ({ ok: true }) },
    { ok: true, json: async () => ({ ok: false, id: "KMR-EXAMPLE" }) }
  ]) {
    const { context, form, status, button } = submissionContext(response);
    await vm.runInContext("submitLead({preventDefault(){}})", context);
    assert.equal(form.resetCount, 0);
    assert.equal(status.dataset.state, "error");
    assert.match(status.textContent || "", /回执|保留/);
    assert.equal(button.disabled, false);
  }
});

test("verified receipt resets once and reports its actual identifier", async () => {
  const { context, form, status, button } = submissionContext({ ok: true, json: async () => ({ ok: true, id: "KMR-20261101-120000-ABC123" }) });
  status.dataset = {};
  await vm.runInContext("submitLead({preventDefault(){}})", context);
  assert.equal(form.resetCount, 1);
  assert.match(status.textContent, /KMR-20261101-120000-ABC123/);
  assert.equal(button.disabled, false);
});


test("a second submit during the first request does not send a duplicate", async () => {
  const { context, form } = submissionContext(null);
  let finish;
  let calls = 0;
  context.fetch = () => { calls += 1; return new Promise((resolve) => { finish = resolve; }); };
  const first = vm.runInContext("submitLead({preventDefault(){}})", context);
  await vm.runInContext("submitLead({preventDefault(){}})", context);
  assert.equal(calls, 1);
  finish({ ok: true, json: async () => ({ ok: true, id: "KMR-EXAMPLE" }) });
  await first;
  assert.equal(form.resetCount, 1);
});


test("scripted section navigation respects reduced motion", () => {
  const context = directoryContext();
  context.window.matchMedia = () => ({ matches: true });
  assert.equal(vm.runInContext("preferredScrollBehavior()", context), "auto");
  context.window.matchMedia = () => ({ matches: false });
  assert.equal(vm.runInContext("preferredScrollBehavior()", context), "smooth");
});
