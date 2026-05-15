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

function listAssetFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).map((name) => path.join(dir, name));
}

const blockedFiles = [
  "docs/share-kit.md",
  "assets/wechat-qr.png",
  "assets/wechat-qr.webp"
];

const allowedMaintainerContactAssets = new Set([
  "assets/wechat-qr.jpg"
]);

for (const filePath of blockedFiles) {
  assert(!fs.existsSync(filePath), `${filePath} should not be kept in the public repository.`);
}

for (const filePath of listAssetFiles("assets")) {
  const lower = path.basename(filePath).toLowerCase();
  const isContactAsset = /(wechat|weixin|qr)/.test(lower);
  assert(!isContactAsset || allowedMaintainerContactAssets.has(filePath), `${filePath}: contact/QR assets should not be committed publicly unless it is the maintainer-approved community contact asset.`);
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

const maintainerContactMarkers = [
  "微信号：",
  "assets/wechat-qr",
  "wechat-qr.jpg",
  "beizhushaonlan"
];

const maintainerContactFiles = new Set([
  "README.md",
  "index.html"
]);

const directPhonePattern = /(^|[^\d])1[3-9]\d{9}([^\d]|$)/;

for (const filePath of publicDocs) {
  const body = read(filePath);
  for (const marker of blockedMarkers) {
    assert(!body.includes(marker), `${filePath} contains public-doc boundary marker: ${marker}`);
  }
  for (const marker of maintainerContactMarkers) {
    const containsMarker = body.includes(marker);
    assert(!containsMarker || maintainerContactFiles.has(filePath), `${filePath} contains maintainer contact marker outside the approved contact surfaces: ${marker}`);
  }
  assert(!directPhonePattern.test(body), `${filePath} appears to contain a direct mobile phone number.`);
}

const index = read("index.html");
const readme = read("README.md");
assert(index.includes("beizhushaonlan") && index.includes("assets/wechat-qr.jpg"), "index.html should expose the approved maintainer WeChat community contact.");
assert(readme.includes("beizhushaonlan") && readme.includes("assets/wechat-qr.jpg"), "README.md should expose the approved maintainer WeChat community contact.");

if (errors.length) {
  console.error(`Public documentation validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Public documentation validation passed: owner-facing markers are bounded and maintainer community contact is explicit.");
