import fs from "node:fs";

const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function read(path) {
  return fs.readFileSync(path, "utf8");
}

const index = read("index.html");
const submit = read("submit.html");
const submitJs = read("submit.js");
const deploy = JSON.parse(read("deploy.json"));
const robots = read("robots.txt");
const sitemap = read("sitemap.xml");

assert(deploy.domain === "kunming.tianmind.com", "deploy.json should target kunming.tianmind.com.");
assert(deploy.type === "static" && deploy.output === "dist", "deploy.json should deploy the static dist output.");
assert(deploy.build === "npm run build:site", "deploy.json should build the domestic static site.");

assert(index.includes("https://kunming.tianmind.com/"), "index.html should prefer the domestic canonical domain.");
assert(!index.includes("tianmind-studio.github.io"), "index.html should not use GitHub Pages as the primary URL.");
assert(index.includes("submit.html"), "index.html should link the low-friction submission page.");
assert(!index.includes("issues/new/choose"), "index.html should not make GitHub Issues the main submission path.");
assert(index.includes("data/companies.csv") && index.includes("data/companies.json"), "index.html should expose local CSV/JSON downloads.");

assert(submit.includes("beizhushaonlan"), "submit.html should expose the approved WeChat submission route.");
assert(submit.includes("data-copy-target"), "submit.html should include copyable submission templates.");
assert(submit.includes('id="leadForm"'), "submit.html should include the online lead form.");
assert(!submit.includes("表单暂未开放"), "submit.html should not ship the old form placeholder state.");
assert(submit.includes("公开来源"), "submit.html should emphasize public-source-only submission.");
assert(submitJs.includes('primaryHost = "kunming.tianmind.com"'), "submit.js should keep the domestic domain as the primary form host.");
assert(submitJs.includes('"/api/leads"'), "submit.js should post domestic leads to the same-origin intake API.");
assert(submitJs.includes("navigator.clipboard"), "submit.js should keep copyable submission templates working.");

assert(robots.includes("https://kunming.tianmind.com/sitemap.xml"), "robots.txt should point to the domestic sitemap.");
assert(sitemap.includes("https://kunming.tianmind.com/submit.html"), "sitemap.xml should include the submission page.");
assert(!sitemap.includes("tianmind-studio.github.io"), "sitemap.xml should not point to GitHub Pages as primary.");

if (errors.length) {
  console.error(`Domestic site validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Domestic site validation passed: tianmind.com entry and low-friction submission are wired.");
