# Kunming Tech Radar

Kunming Tech Radar is an open, source-aware local technology opportunity map for Kunming and Yunnan.

It collects public information about technology-related companies, IT companies, software teams, AI/data companies, recruiting pages, events, communities, and government digital project leads. It is not a ranking, a job board, a recruiter, or a guarantee of any opportunity. The project exists to make scattered local signals easier to search, verify, and maintain.

Primary links:

- Mainland-facing website: <https://kunming.tianmind.com/> (prepared for deployment)
- Backup GitHub Pages site: <https://tianmind-studio.github.io/kunming-it-companies/>
- Chinese README: [README.md](README.md)
- Company index: [COMPANIES.md](COMPANIES.md)
- Low-friction submission page: [submit.html](submit.html)
- Use cases: [docs/use-cases.md](docs/use-cases.md)
- Search guide: [docs/search-guide.md](docs/search-guide.md)
- Domestic static deployment notes: [docs/domestic-site-deploy.md](docs/domestic-site-deploy.md)
- Primary dataset: [data/companies.json](data/companies.json)
- Data standard: [docs/data-standard.md](docs/data-standard.md)
- Data quality report: [docs/data-quality-report.md](docs/data-quality-report.md)
- Contribution guide: [CONTRIBUTING.md](CONTRIBUTING.md)

## Who It Helps

Students can use it to understand local industries before applying for internships or choosing project topics.

Developers can use it to discover local teams, public recruiting pages, events, and communities.

Freelancers and founders can use it as a research map for digital transformation needs, system integration work, and industry-specific software opportunities.

Companies and institutions can contribute official websites, recruiting pages, technical blogs, open-source pages, and public activity pages so local developers can find them more easily.

## Current Data

The main company dataset is [data/companies.json](data/companies.json). Generated outputs are [COMPANIES.md](COMPANIES.md) and [data/companies.csv](data/companies.csv).

Current coverage:

| Metric | Status |
| --- | --- |
| Companies / organizations | 73 |
| Verified official websites | 24 |
| Verified official pages | 2 |
| Community pending records | 47 |
| Source leads | 45 public entry points across 9 directions |
| Community and event sources | [data/communities.csv](data/communities.csv), [data/events.csv](data/events.csv) |
| Government project portals | [data/gov-projects.csv](data/gov-projects.csv) |

`community_pending` does not mean a record is invalid. It means the record still needs stronger public sources such as an official website, an official page, a recruiting page, or a government/project source.

## Search Intents Covered

The site and docs are organized around real lookup needs:

- Kunming IT companies
- Kunming software companies
- Kunming AI and data companies
- Yunnan software companies
- Yunnan digital transformation and public project entry points
- Kunming developer communities and events
- Kunming tech companies for non-local readers

Each search intent should map back to existing data, source links, or a documented verification method. The project avoids keyword-only copy that is not backed by data.

## Data Principles

- Keep original public source links whenever possible.
- Mark uncertainty instead of hiding it.
- Do not infer active hiring from recruiting-platform search pages.
- Do not collect private phone numbers, private WeChat IDs, screenshots, rumors, salary claims, layoffs, disputes, or unverified negative information.
- Treat `opportunities` and `suitable_for_*` fields as reading hints, not promises.

## Contributing

The most valuable contributions are:

1. Add official websites or official recruiting pages for `community_pending` companies.
2. Add missing district information.
3. Add a second public source for weak records.
4. Add local university tech groups, developer events, park activities, or government digital project portals.
5. Report outdated links, duplicates, or records outside the collection boundary.

If you do not use GitHub often, use [submit.html](submit.html) first: copy a template, send public source links through the maintainer WeChat route, or use the future form entry once it is enabled. Developers can still open a GitHub issue with the company or event name, location, public source link, and a short explanation of why it is technology-related.

## Reuse, Citation, and Corrections

- If you reuse, cite, translate, or reorganize this dataset, read [docs/reuse-and-citation.md](docs/reuse-and-citation.md).
- If you find private information, outdated records, broken links, or entries outside the collection boundary, follow [docs/takedown-and-correction.md](docs/takedown-and-correction.md).
- For public discussion and contribution norms, see [docs/community-guidelines.md](docs/community-guidelines.md).

## Local Checks

```bash
npm run generate:companies
npm run export:csv
npm run generate:data-quality
npm run build:site
npm run validate
```

## License

Code is MIT licensed. Data is intended for public collaboration and non-commercial research reference. Please keep source links and verification dates when reusing or reorganizing the dataset.
