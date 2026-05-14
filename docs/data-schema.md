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
| `data/source-leads.csv` | 每个方向的公开来源种子池；只用于发现候选，不直接生成公司/岗位结论 |

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

## Source leads CSV fields

`data/source-leads.csv` 用来沉淀“下一步应该去哪里查”的公开入口。它不是公司数据、不是岗位数据，也不代表某个方向已经有确定机会。

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | 稳定 slug。 |
| `direction` | string | yes | 必须属于 9 个方向之一。 |
| `source_title` | string | yes | 入口名称，例如 BOSS 直聘昆明关键词页。 |
| `source_type` | string | yes | `recruiting_platform` / `official_portal` / `government_portal` / `public_resource_portal` / `university_portal` / `event_platform` / `industry_association` / `incubator_or_park` / `open_source` / `media_database` / `search_engine_query`。 |
| `source_url` | string | yes | 公开可访问链接。 |
| `city` | string | yes | 通常为 `昆明` 或 `云南`。 |
| `keyword` | string | yes | 用来发现候选的关键词。 |
| `last_checked` | string | yes | `YYYY-MM-DD`。 |
| `status` | string | yes | 当前统一为 `seed_source`。 |
| `notes` | string | yes | 必须说明“不代表存在岗位/活动/合作”。 |

校验脚本会要求每个方向至少 5 条来源入口。

## Other CSV fields

其他 CSV 目前是轻量候选表：

- `data/jobs.csv`：只放公开招聘主页或候选岗位来源；不要写无法核验的岗位。
- `data/events.csv`：可放活动详情页，也可放活动平台搜索入口；搜索入口必须标 `source_search_page`。
- `data/communities.csv`：可放高校、社群、园区、开发者组织的公开主页；不要放私人群二维码。
- `data/gov-projects.csv`：可放具体政府数字化项目公告；只有门户页时标 `source_homepage`，不要编造项目名称和预算。

## Commands

```bash
npm run generate:companies
npm run export:csv
npm run validate:data
npm run validate
```

详情见：[`docs/data-standard.md`](data-standard.md)。
