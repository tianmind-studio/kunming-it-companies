# Kunming Tech Radar

[![validate](https://github.com/tianmind-studio/kunming-it-companies/actions/workflows/validate.yml/badge.svg)](https://github.com/tianmind-studio/kunming-it-companies/actions/workflows/validate.yml)
[中文](README.md) · [Search online](https://kunming.tianmind.com/) · [Download CSV](data/companies.csv) · [Contribute](CONTRIBUTING.md)

A public dataset of technology companies, software teams, communities, events, and digital-project source leads in Kunming and Yunnan, China. Each company record retains its public source, verification status, and check date so you can verify it before use.

Use it to research local teams, technical fields, and public contact or discovery pages. Check original announcements for current jobs, events, and cooperation terms. Inclusion and search tags do not imply a ranking, employment guarantee, or endorsement.

## Start Here

| Goal | Entry point |
| --- | --- |
| Search companies, fields, districts, and verification status | [Website](https://kunming.tianmind.com/) / [GitHub Pages backup](https://tianmind-studio.github.io/kunming-it-companies/) |
| Browse records on GitHub | [Company index](COMPANIES.md) |
| Download or integrate data | [Primary JSON](data/companies.json) / [CSV export](data/companies.csv) |
| Assess sources and data gaps | [Quality report](docs/data-quality-report.md) / [Data standard](docs/data-standard.md) |
| Find public source pages | [Communities](data/communities.csv) / [Events](data/events.csv) / [Government project portals](data/gov-projects.csv) |
| Submit or correct a lead | [Online submission](https://kunming.tianmind.com/submit.html) / [GitHub Issue](https://github.com/tianmind-studio/kunming-it-companies/issues/new/choose) |
| Help verify records | [Review priorities](docs/data-cleanup-plan.md) |

## Current Data

<!-- DATA_SUMMARY_START -->

Dataset updated: `2026-09-14`. Source: [data/companies.json](data/companies.json).

| Metric | Status |
| --- | --- |
| Companies / organizations | 75 |
| Verified official websites | 26 |
| Verified official pages | 2 |
| Community pending records | 47 |
| Weak-source records | 43 |
| Missing district records | 41 |
| Strong-source ratio | 37% |
| Source leads | 45 public entry points across 9 directions |

<!-- DATA_SUMMARY_END -->

**The dataset update date is not a full recheck date.** The `last_checked` values for 73 company records are still in May 2026. Read the date on each record and open the original source before relying on current status. The [quality report](docs/data-quality-report.md) includes the full check-date distribution.

Coverage includes software development, system integration, AI/data, agricultural technology, healthcare IT, tourism technology, fintech, cybersecurity, and ICT. Some records still lack a district or a verified field. Record counts do not measure the size of the local industry.

## Reading a Record

| Field | Meaning |
| --- | --- |
| `source_url` / `source_urls` | Original public sources; check the organization and the specific claim. |
| `source_type` | Official site, official profile, government list, recruiting platform, media, or community list. |
| `verification_status` | `verified`: official website checked; `official_page`: official profile checked; `community_pending`: needs review. A past check does not establish current validity. |
| `last_checked` | Date that this record was last checked. |
| `confidence_score` | Source strength from 1 to 5, not a rating of the company. |
| `opportunities` / `suitable_for_*` | Search and reading hints; these do not establish active hiring, outsourcing, or cooperation. |

Source leads, recruiting search pages, and government portals are places to continue research. Current opportunities require specific announcements. OPC (one-person company) resources provide startup context; confirm current eligibility, space availability, and events with the operator.

## Who Can Use It

- Students and job seekers can research local technical fields, then verify roles with the company.
- Developers can find teams, technical pages, open-source projects, and public events.
- Freelancers and founders can research industries and service areas before checking needs and cooperation terms.
- Companies and community maintainers can contribute official websites, recruiting pages, technical blogs, events, and corrections.

See [use cases](docs/use-cases.md) and the [search guide](docs/search-guide.md) for examples. Most records and guides are in Chinese.

## Run Locally

Use **Node.js 22, npm, and Python 3**. The site uses plain HTML, CSS, and JavaScript and currently has no third-party npm dependencies. Browsing needs no database or account. Python serves the local preview and checks the existing API file's syntax.

```bash
git clone https://github.com/tianmind-studio/kunming-it-companies.git
cd kunming-it-companies
npm run validate
npm run serve
```

Open [http://127.0.0.1:4178](http://127.0.0.1:4178). `serve` builds `dist/` and starts a static server bound to the local machine; stop it with `Ctrl+C`.

```bash
npm run build:site
```

`dist/` contains the homepage, data, guides, and static detail pages for verified records. Relative paths support both a domain root and a GitHub Pages project subpath. Search and filtering need JavaScript; data downloads and static detail pages remain accessible without it.

The local static server does not run the lead-submission API. Online form submissions require a configured backend; the page also provides a copyable template and a GitHub Issue route. See the [deployment guide](docs/domestic-site-deploy.md). Repository checks do not establish live service health.

## Contributing

Priorities are official sources for `community_pending` records, missing districts, second sources for weak records, public events, and corrections. You can use the [online form](https://kunming.tianmind.com/submit.html) without a GitHub account, or [open an Issue](https://github.com/tianmind-studio/kunming-it-companies/issues/new/choose).

Edit `data/companies.json` for company records. Do not edit the generated company index, CSV export, bundled site data, or quality reports by hand. After changing data, run:

```bash
npm run generate:companies
npm run export:csv
npm run generate:data-quality
npm run generate:site-data
npm run data:diff -- --base-ref origin/main
npm run validate
npm run build:site
```

Include sources and the affected generated files in your PR. `data:diff` writes `docs/data-change-summary.md`. For site, documentation, or script changes, run `npm run validate` and `npm run build:site`. See [CONTRIBUTING.md](CONTRIBUTING.md), the [data standard](docs/data-standard.md), and the [schema](docs/data-schema.md) for field requirements.

Use public, reviewable sources. Do not submit third-party private contact details, chat screenshots, contracts, payment records, rumors, or unverified salary, layoff, overtime, or dispute claims.

## Reuse and Corrections

Keep the original source links, verification status, and check dates when citing or reorganizing data. Include this project and your access date. Read the [reuse guide](docs/reuse-and-citation.md), [correction process](docs/takedown-and-correction.md), and [community guidelines](docs/community-guidelines.md).

The dataset does not guarantee completeness, accuracy, or real-time status. Verify company, job, event, and project information with the original publisher before acting.

## License

Code is [MIT licensed](LICENSE). Data is intended for public collaboration and non-commercial research reference. Respect original source terms and retain source links and verification dates.
