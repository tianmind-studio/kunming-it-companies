# Data Schema

数据源文件：`data/companies.json`

## Top-level

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `meta` | object | yes | Dataset metadata |
| `companies` | array | yes | Company records |

## Company Record

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

## Style Rules

- Keep descriptions factual and neutral.
- Do not copy marketing paragraphs wholesale from company websites.
- Do not add personal contact details unless they are clearly public business contacts and necessary.
- If a district, team size, product name, or funding claim is not source-backed, leave it out.
