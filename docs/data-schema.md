# Data Schema

主要数据源是 `data/*.csv`。早期公司索引仍保留在 `data/companies.json`，用于生成 `COMPANIES.md` 和当前 GitHub Pages 页面。

## CSV datasets

| 文件 | 说明 |
| --- | --- |
| `data/companies.csv` | 公司与机构 |
| `data/jobs.csv` | 招聘机会 |
| `data/events.csv` | 技术活动 |
| `data/communities.csv` | 社群与组织 |
| `data/gov-projects.csv` | 政府数字化项目线索 |

CSV 字段以 README 和 `docs/contribution-guide.md` 为准。空字段表示暂未确认，不要用猜测值填充。

## Legacy JSON

数据源文件：`data/companies.json`

### Top-level

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `meta` | object | yes | Dataset metadata |
| `companies` | array | yes | Company records |

### Company Record

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | Stable lowercase slug. Do not rename unless necessary. |
| `name_zh` | string | yes | Chinese company name or public brand name. |
| `name_en` | string | no | English name if public. Empty string is acceptable. |
| `city` | string | yes | Usually `昆明`. |
| `district` | string | no | District or area when source-backed. Leave empty if unclear. |
| `category` | string | yes | One primary business category. |
| `tags` | array | yes | 2-6 short tags. |
| `website` | string | no | Official website when available. |
| `summary_zh` | string | yes | Neutral source-backed description. No ranking or anonymous claims. |
| `summary_en` | string | no | Optional English summary. |
| `source_urls` | array | yes | At least one public source URL. |
| `source_checked_at` | string | yes | `YYYY-MM-DD`, date when the source was checked. |
| `verification` | string | yes | `official_site`, `official_profile`, or `community_pending`. |
| `status` | string | yes | Example: `active-source-found`, `needs-review`, `closed-source-found`. |

### Style Rules

- Keep descriptions factual and neutral.
- Do not copy marketing paragraphs wholesale from company websites.
- Do not add personal contact details unless they are clearly public business contacts and necessary.
- If a district, team size, product name, or funding claim is not source-backed, leave it out.
