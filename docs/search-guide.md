# Search Guide / 搜索指南

本项目围绕真实检索需求组织页面和数据，但每个关键词都必须落到可核验的数据、公开来源或方法说明上。

## 常见搜索词对应哪里

| 搜索词 | 推荐入口 | 说明 |
| --- | --- | --- |
| 昆明 IT 公司 | [国内站首页](../index.html)、[`COMPANIES.md`](../COMPANIES.md) | 搜索 `IT`、`信息技术`、`系统集成`、`软件` 等词。 |
| 昆明软件公司 | [国内站首页](../index.html)、[`data/companies.csv`](../data/companies.csv) | 搜索 `软件`、`外包`、`ERP`、`App`、`小程序`、`Web`。 |
| 昆明技术公司 | [公司索引](../COMPANIES.md) | 适合先按 `category` 和 `tags` 粗筛，再打开来源复核。 |
| 昆明 AI 公司 | [国内站首页](../index.html)、[`data/source-leads.csv`](../data/source-leads.csv) | 搜索 `AI`、`大数据`、`云服务`、`智能`；弱来源不要直接当作已核验公司。 |
| 云南软件公司 | [`data/companies.json`](../data/companies.json)、[`data/companies.csv`](../data/companies.csv) | 当前以昆明为主，也保留云南其他城市和省级来源。 |
| 云南数字化项目 | [`data/gov-projects.csv`](../data/gov-projects.csv) | 政府采购、公共资源交易和科技项目入口只表示可继续查询，不代表确定合作机会。 |
| 昆明程序员 / 本地开发者社群 | [`data/communities.csv`](../data/communities.csv)、[`data/events.csv`](../data/events.csv) | 只收录公开主页、活动页、组织页或平台入口，不收私人群二维码。 |
| Kunming tech companies | [`README.en.md`](../README.en.md)、[国内站首页](../index.html) | English readers can use verification fields to understand source strength. |

## 页面搜索技巧

- 多词搜索会按空格拆分，例如 `AI 大数据` 会同时匹配两个词。
- 想优先看强来源，筛选 `官网已核验` 或 `官方页核验`。
- 想帮忙补数据，筛选 `社区待复核`，优先补官网、区县和第二来源。
- 想做表格分析，下载 [`data/companies.csv`](../data/companies.csv)。
- 想自动处理数据，读取 [`data/companies.json`](../data/companies.json)。
- 不会 GitHub 也想补线索，打开 [`submit.html`](../submit.html) 复制模板。

## 不要把搜索入口当成结论

这些情况只能作为线索：

- 招聘平台搜索页。
- 活动平台搜索页。
- 政府项目门户首页。
- 社区历史清单。
- 媒体数据库摘要页。

只有打开原始来源并确认公司、业务方向、项目或活动信息后，才能更新为更强核验状态。

## 复用时保留这些字段

转载、引用或二次整理时，至少保留：

- `name`
- `city`
- `district`
- `category`
- `source_url`
- `source_type`
- `verification_status`
- `last_checked`
- `confidence_score`

详细规则见 [`docs/reuse-and-citation.md`](reuse-and-citation.md)。
