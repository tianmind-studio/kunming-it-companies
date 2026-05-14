import { execFileSync } from "node:child_process";

const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

const output = execFileSync("git", ["ls-files"], { encoding: "utf8" });
const paths = output.split(/\r?\n/).filter(Boolean);
const seen = new Map();

for (const filePath of paths) {
  const key = filePath.toLowerCase();
  const existing = seen.get(key);
  assert(!existing, `Case-insensitive path collision: ${existing} and ${filePath}.`);
  seen.set(key, filePath);
}

if (errors.length) {
  console.error(`Repository path validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Repository path validation passed: no case-insensitive collisions.");
