# How to Use This Project / 使用路径

这份资料库的目标不是替代招聘平台或企业名录，而是把昆明和云南本地技术生态里的公开线索整理成可以搜索、复核和继续维护的数据。

## 学生

适合用来做三件事：

1. 了解本地有哪些软件开发、系统集成、AI / 大数据、医疗信息化、农业数字化、文旅科技等方向。
2. 在投实习、做课程项目、选毕业设计题目前，先看公司官网、官方页和政府项目入口。
3. 从 `community_pending` 记录里练习信息核验：补官网、补区县、补第二个公开来源。

建议先看：

- [国内站首页](../index.html)
- [提交线索页](../submit.html)
- [`COMPANIES.md`](../COMPANIES.md)
- [`data/companies.csv`](../data/companies.csv)
- [`docs/data-standard.md`](data-standard.md)

## 开发者 / 求职者

适合用来快速排查本地技术团队和公开入口：

- 用页面搜索公司名、方向、区县或标签。
- 优先查看 `verified` 和 `official_page` 记录。
- 如果只看到招聘平台搜索页，不要直接判断为正在招聘，应继续打开公司官网、官方招聘页或公开招聘主页核验。

建议关注字段：

- `website`
- `source_url`
- `verification_status`
- `last_checked`
- `confidence_score`
- `opportunities`

## 自由职业者 / 创业者

适合用作本地行业研究和客户线索地图：

- 通过系统集成、政企信息化、农业数字化、医疗信息化、文旅科技等方向理解本地数字化需求。
- 通过 `data/gov-projects.csv` 观察政府采购、公共资源交易和项目入口。
- 通过 `data/source-leads.csv` 找到继续查找候选公司的公开入口。

注意：本项目不声明某家公司正在采购、外包或合作。`outsourcing`、`partnership` 只是阅读提示。

## 企业 / 机构

如果希望本地开发者、学生或合作方更容易找到你，可以补充公开入口：

- 官网或产品官网。
- 官方招聘页或公开招聘主页。
- 官方公众号文章、技术博客、开源主页。
- 所在城市 / 区县。
- 主要技术方向和公开业务说明。

不会提交 Pull Request 也可以使用 [`submit.html`](../submit.html) 在线提交公开来源；表单不可用时再复制模板，通过维护者微信提交。会 GitHub 的用户仍可使用 Issue 模板。

## 外地读者 / Non-local Readers

If you are outside Yunnan, use this project as a first map of the local technology ecosystem:

- `verified` records are backed by company or product websites.
- `official_page` records are backed by official pages or public notices.
- `community_pending` records are leads that still need stronger public verification.
- CSV and JSON files can be reused for research, mapping, or local ecosystem analysis, as long as source links and verification dates are preserved.

Recommended starting points:

- [`README.en.md`](../README.en.md)
- [`docs/project-brief.md`](project-brief.md)
- [`docs/reuse-and-citation.md`](reuse-and-citation.md)
