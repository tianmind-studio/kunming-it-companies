# AGENTS.md

## Project Purpose

Kunming Tech Radar is a public, source-backed local technology ecosystem dataset for Kunming and Yunnan. It helps students, developers, freelancers, founders, companies, and community maintainers find public leads for technology companies, software teams, events, communities, and government digital project entry points.

This repository should stay credible, conservative, and easy to verify. Do not turn it into a marketing directory, job board, blacklist, rumor archive, or private contact list.

## Data Boundaries

- Only use public, reviewable sources.
- Do not invent companies, jobs, salaries, internships, outsourcing needs, partnership status, community activity, or government project facts.
- Do not publish private phone numbers, private WeChat IDs, group QR codes, private chat screenshots, tokens, cookies, identity numbers, contracts, payment records, or customer/private material.
- Do not add unverified negative claims, salary claims, layoff claims, overtime claims, disputes, or blacklist-style content.
- Treat `opportunities` and `suitable_for_*` as search and reading hints only. They are not proof that a company is hiring, outsourcing, cooperating, or endorsing this project.
- If a fact cannot be publicly verified, keep it as `community_pending`, lower confidence, add a review note, or leave it out.

## Source Of Truth

- `data/companies.json` is the primary company dataset.
- `COMPANIES.md` and `data/companies.csv` are generated outputs. Do not edit their company body by hand.
- Keep these fields present and consistent for company records: `source_url`, `source_type`, `verification_status`, `last_checked`, `confidence_score`, `opportunities`, and `suitable_for_*`.
- CSV files under `data/` are public-source entry points. A source lead is only a place to continue research; it is not proof of a current opportunity.

## Required Commands

After changing company data, run:

```bash
npm run generate:companies
npm run export:csv
npm run generate:data-quality
npm run data:diff
npm run validate
```

After changing the static site, docs, templates, or validation scripts, run:

```bash
npm run validate
npm run build:site
```

The repository must pass `npm run validate` before a PR is considered ready.

Use `npm run data:diff -- --base-ref origin/main` for PR review when company data changes.

## Static Site Rules

- Prefer pure HTML/CSS/JS. Do not add a large framework unless there is a clear maintenance benefit.
- Keep relative paths working for both GitHub Pages and domestic static deployment.
- Render JSON/CSV text as text nodes, not raw `innerHTML`.
- Validate dynamic URLs and only allow `http:` or `https:`.
- Show a useful user-facing error when data loading fails.
- Keep mobile layout, keyboard navigation, color contrast, and semantic HTML in mind.

## Public Documentation Rules

- Public docs should help outside readers understand, verify, use, reuse, or contribute to the project.
- Keep wording professional and conservative. Avoid claims such as “most complete”, “only”, “guaranteed”, or “authoritative” unless there is evidence.
- It is acceptable to provide public sharing copy when the maintainer explicitly asks for it, but keep it factual and source-bound.
- Do not include internal strategy notes, assistant workflow notes, or private outreach planning in public docs.
