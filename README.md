# Kunming Tech Radar / 昆明技术机会雷达

> 收集昆明及云南范围内的技术公司、招聘机会、技术活动、创业社群和政府数字化项目线索，帮助本地学生、开发者、创业者更容易发现机会。

Kunming Tech Radar 是一个公开维护的本地技术机会资料库。它不做排名，不承诺就业，不提供所谓内部资源，只整理公开信息，并尽量标明来源和更新时间。

## 适合谁使用

- 在昆明或云南找实习、校招、社招机会的学生和开发者
- 想了解本地 AI、软件、信息化、数字化企业的技术从业者
- 正在昆明创业、接项目、找合作方的创业者和自由职业者
- 希望被本地开发者发现的企业负责人、招聘负责人、技术团队
- 关注云南数字经济、政府数字化项目和产业机会的人

## 收录内容

当前项目会逐步整理五类信息：

| 数据集 | 文件 | 内容 |
| --- | --- | --- |
| 公司与机构 | [`data/companies.csv`](data/companies.csv) | IT 公司、AI/软件企业、系统集成商、数字化服务商、技术团队 |
| 招聘机会 | [`data/jobs.csv`](data/jobs.csv) | 实习、校招、社招、远程/混合办公、本地技术岗位 |
| 技术活动 | [`data/events.csv`](data/events.csv) | 技术分享、创业活动、黑客松、线下 meetup、校园活动 |
| 社群与组织 | [`data/communities.csv`](data/communities.csv) | 本地开发者群、创业社群、高校社团、开源组织 |
| 政府项目线索 | [`data/gov-projects.csv`](data/gov-projects.csv) | 政府采购、数字化建设、智慧城市、产业政策相关公开线索 |

仓库里仍保留早期整理的 [`COMPANIES.md`](COMPANIES.md) 和 [`data/companies.json`](data/companies.json)，用于承接已有公司索引。后续会逐步把数据整理到 CSV 结构里。

## 数据字段说明

### companies.csv

| 字段 | 说明 |
| --- | --- |
| `id` | 稳定 ID，建议使用英文 slug |
| `name` | 公司或机构名称 |
| `city` / `district` | 城市和区县 |
| `category` | 公司类型，例如 AI、软件开发、系统集成、医疗信息化 |
| `tags` | 关键词，多个标签用分号分隔 |
| `website` | 官网或官方主页 |
| `source_url` | 可核验来源 |
| `source_type` | 来源类型，例如 official_site、official_profile、public_list |
| `status` | active、pending、closed、unknown |
| `last_checked` | 最近核验日期 |
| `notes` | 简短备注，避免主观评价 |

### jobs.csv

| 字段 | 说明 |
| --- | --- |
| `id` | 岗位记录 ID |
| `company_name` | 公司名称 |
| `role` | 岗位名称 |
| `job_type` | internship、campus、full_time、part_time、remote、contract |
| `city` / `district` | 工作地点 |
| `salary_range` | 公开薪资范围，没有公开就留空 |
| `source_url` | 招聘页或公开来源 |
| `posted_at` | 发布时间 |
| `last_checked` | 最近核验日期 |
| `status` | open、closed、unknown |
| `notes` | 简短备注 |

### events.csv

| 字段 | 说明 |
| --- | --- |
| `id` | 活动记录 ID |
| `name` | 活动名称 |
| `event_type` | meetup、workshop、hackathon、conference、campus、startup |
| `date` | 活动日期 |
| `city` / `venue` | 城市和场地 |
| `organizer` | 主办方 |
| `source_url` | 活动页或公开来源 |
| `status` | upcoming、past、cancelled、unknown |
| `notes` | 简短备注 |

### communities.csv

| 字段 | 说明 |
| --- | --- |
| `id` | 社群记录 ID |
| `name` | 社群或组织名称 |
| `community_type` | developer、startup、campus、open_source、industry |
| `city` | 所在城市或主要覆盖区域 |
| `contact_method` | 公开联系方式或加入方式 |
| `source_url` | 公开介绍页或来源 |
| `status` | active、inactive、unknown |
| `notes` | 简短备注 |

### gov-projects.csv

| 字段 | 说明 |
| --- | --- |
| `id` | 项目线索 ID |
| `project_name` | 项目名称 |
| `buyer` | 采购人或发布单位 |
| `project_type` | 智慧城市、政务系统、数据平台、行业数字化等 |
| `city` | 项目所在地 |
| `budget` | 公开预算，没有公开就留空 |
| `publish_date` | 发布日期 |
| `source_url` | 政府采购网、公共资源交易平台或官方公告链接 |
| `status` | open、awarded、closed、unknown |
| `notes` | 简短备注 |

## 如何贡献

欢迎补充公司、岗位、活动、社群和政府项目线索。贡献时请尽量提供公开来源，不要只写口头信息。

可以用三种方式参与：

1. 直接提交 Pull Request，修改对应 CSV 文件。
2. 使用 GitHub Issue 提供线索，维护者会再整理进数据集。
3. 对已有记录补充官网、招聘页、活动页、官方公告等来源。

贡献前请先看：

- [贡献指南](docs/contribution-guide.md)
- [昆明 IT 地图说明](docs/kunming-it-map.md)
- [机会雷达说明](docs/opportunity-radar.md)

## 联系我

如果你是昆明或云南的开发者、学生、创业者、企业负责人，欢迎通过微信联系我：

微信号：`beizhushaonlan`

<img src="assets/wechat-qr.jpg" alt="Junius 微信二维码" width="260">

添加时可以备注：`昆明技术机会雷达`。

## 社群说明

项目计划围绕这个方向建立一个“昆明技术机会雷达社群”，用于交流本地技术机会、招聘信息、项目线索、活动信息和创业资源。

社群初期免费。后续如果信息质量和参与人数足够，可能开放高质量付费内圈、线下活动或整理版资源库。所有后续安排都会保持透明，不会承诺就业、承诺资源或承诺所谓内部机会。

## 免责声明

- 本项目只整理公开信息，不保证信息完整、实时或绝对准确。
- 招聘岗位、活动、项目预算和公司状态都可能变化，请以原始来源为准。
- 本项目不提供就业担保、资源担保、投资建议或商业背书。
- 不收录私人手机号、私人微信、未经核实的负面爆料和无法核验的薪资/裁员信息。
- 如果你发现信息错误、过期或不适合公开展示，可以提交 Issue 或 PR 修正。

## License

代码采用 MIT License。数据内容默认用于公开协作和非商业研究参考，后续会根据贡献情况补充更清晰的数据许可说明。
