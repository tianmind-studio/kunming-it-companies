import { readDataset } from "./companies-lib.mjs";
import { validateDataset } from "./company-validation-lib.mjs";

const dataset = readDataset();
const errors = validateDataset(dataset);
if (errors.length) {
  console.error(`Data validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Data validation passed: ${dataset.companies.length} companies.`);
