# Data Schema

公司数据的主数据源是 `data/companies.json`。`COMPANIES.md` 和 `data/companies.csv` 都由脚本从 JSON 生成，避免手工维护多份公司数据。

其他数据集仍保留 CSV：

| 文件 | 说明 |
| --- | --- |
| `data/companies.json` | 公司主数据源 |
| `data/companies.csv` | 从 JSON 自动导出的公司 CSV |
| `data/jobs.csv` | 招聘机会候选数据 |
| `data/events.csv` | 技术活动候选数据 |
| `data/communities.csv` | 社群与组织候选数据 |
| `data/gov-projects.csv` | 政府数字化项目线索 |

## Company JSON fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | 稳定 slug，不要随意改名。 |
| `name` | string | yes | 公司或公开品牌名。 |
| `english_name` | string | no | 公开英文名，没有则留空。 |
| `city` | string | yes | 通常为 `昆明`，也可为云南其他城市。 |
| `district` | string | no | 区县；不能确认时留空。 |
| `category` | string | yes | 一个主要方向。 |
| `tags` | array | yes | 2-6 个短标签。 |
| `website` | string | no | 官网；没有则留空。 |
| `source_url` | string | yes | 最主要的公开来源。 |
| `source_type` | string | yes | 见 `docs/data-standard.md`。 |
| `verification_status` | string | yes | `verified` / `official_page` / `community_pending` / `outdated` / `unknown`。 |
| `last_checked` | string | yes | `YYYY-MM-DD`。 |
| `notes` | string | yes | 中性事实说明，不写主观评价。 |
| `opportunities` | array | yes | `internship` / `hiring` / `outsourcing` / `partnership` / `unknown`。 |
| `confidence_score` | number | yes | 1-5，见数据标准。 |
| `suitable_for_students` | boolean | yes | 适合学生阅读。 |
| `suitable_for_freelancers` | boolean | yes | 适合自由职业者阅读。 |
| `suitable_for_job_seekers` | boolean | yes | 适合求职者阅读。 |
| `suitable_for_founders` | boolean | yes | 适合创业者阅读。 |

为了兼容旧页面和历史数据，JSON 中暂时保留 `name_zh`、`name_en`、`summary_zh`、`source_urls`、`source_checked_at`、`verification` 等旧字段。新代码优先读取上表中的字段。

## Commands

```bash
npm run generate:companies
npm run export:csv
npm run validate:data
npm run validate
```

详情见：[`docs/data-standard.md`](data-standard.md)。
