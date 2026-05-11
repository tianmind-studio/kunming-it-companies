# Kunming IT Directory

A source-backed, community-maintained directory of IT, software, internet, and digital service companies in Kunming, Yunnan.

## Why This Exists

There is an older GitHub project called [KM-IT](https://github.com/bigzhubak/KM-IT), but it is a single README and does not provide structured data, source checks, or a searchable site. This repository is a modern successor: data first, public sources first, and contribution-friendly from day one.

## What Is Included

- Structured company data in `data/companies.json`
- A static GitHub Pages site in `index.html`
- Data schema documentation in `docs/data-schema.md`
- GitHub issue templates for adding and correcting entries
- A local validation script

## Run Locally

```bash
npm run validate
npm run serve
```

Then open `http://127.0.0.1:4178`.

## Contribution Policy

Every company entry needs at least one public source. Official websites are preferred, but public recruitment pages, official social accounts, credible media reports, and public company profiles are also acceptable.

The directory is not a ranking, blacklist, or anonymous review board. It is a discovery layer for local technology companies.
