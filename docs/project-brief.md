# Project Brief / 项目简介

Kunming Tech Radar / 昆明技术机会雷达是一个面向昆明与云南的开源技术机会数据库。

它整理公开来源中的公司、招聘入口、活动、社群和政府数字化项目线索，帮助学生、开发者、自由职业者、创业者和企业更容易发现本地技术生态中的节点。

## What It Is

- A source-backed local technology opportunity map.
- A structured dataset that can be searched, reviewed, and improved.
- A public contribution surface for official websites, recruiting pages, event pages, communities, and government project portals.

## What It Is Not

- Not a company ranking.
- Not a job board or recruiting service.
- Not a blacklist or complaint database.
- Not a guarantee that a company is hiring, cooperating, or commercially reliable.

## Main Data Files

| File | Purpose |
| --- | --- |
| `data/companies.json` | Primary company dataset maintained by contributors. |
| `COMPANIES.md` | Generated human-readable company index. |
| `data/companies.csv` | Generated table export for spreadsheets. |
| `data/source-leads.csv` | Public source entry points for future verification. |
| `data/communities.csv` | Public community and organization entry points. |
| `data/events.csv` | Public event and activity entry points. |
| `data/gov-projects.csv` | Government procurement and digital project portals. |

## Data Quality Rules

Every record should be traceable to a public source. When the source is weak, the record should stay marked as `community_pending` or use a lower `confidence_score`.

The project does not copy private contact details, private chat records, screenshots, unverified salary claims, or negative rumors. If a public source contains private contact details, keep the source URL but do not duplicate the private details into the dataset.

## Best First Contributions

1. Add official websites for `community_pending` companies.
2. Add official recruiting pages without claiming active hiring.
3. Add missing district information.
4. Add source corrections for outdated or broken links.
5. Add public pages for local university tech groups, developer meetups, park activities, and digital-government portals.

## Maintainer Workflow

```bash
npm run generate:companies
npm run export:csv
npm run validate
```

`data/companies.json` is the source of truth for company data. Do not hand-edit generated company tables unless the generator is also updated.
