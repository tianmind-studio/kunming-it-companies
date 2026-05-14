import fs from "node:fs";
import path from "node:path";

const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function listMarkdownFiles(dir) {
  return fs.readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => path.join(dir, name));
}

const blockedFiles = [
  "docs/share-kit.md"
];

for (const filePath of blockedFiles) {
  assert(!fs.existsSync(filePath), `${filePath} should not be kept in the public repository.`);
}

const publicDocs = [
  "README.md",
  "README.en.md",
  "ROADMAP.md",
  "index.html",
  "data/communities.csv",
  "data/events.csv",
  "data/gov-projects.csv",
  ...listMarkdownFiles("docs")
];

const blockedMarkers = [
  "传播文案",
  "朋友圈文案",
  "小红书文案",
  "怎么发到群",
  "社区传播",
  "求 star",
  "话术",
  "我整理了",
  "已有读者",
  "线上入口联系维护者",
  "X / Twitter 文案"
];

for (const filePath of publicDocs) {
  const body = read(filePath);
  for (const marker of blockedMarkers) {
    assert(!body.includes(marker), `${filePath} contains public-doc boundary marker: ${marker}`);
  }
}

if (errors.length) {
  console.error(`Public documentation validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Public documentation validation passed: no owner-facing promotion markers found.");
