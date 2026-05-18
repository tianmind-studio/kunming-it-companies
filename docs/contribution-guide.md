# Contribution Guide / 贡献指南

感谢你愿意补充昆明和云南的技术机会信息。这个项目只接收可以公开复核的信息。

## 可以贡献什么

- 新增公司或机构到 `data/companies.json`
- 为 `community_pending` 公司补充官网、官方主页、官方招聘页或政府/媒体公开来源
- 新增来源入口到 `data/source-leads.csv`
- 新增技术活动候选入口到 `data/events.csv`
- 新增社群、园区、高校或组织入口到 `data/communities.csv`
- 新增政府数字化项目入口到 `data/gov-projects.csv`
- 修正过期、错误、重复或缺少来源的记录

`data/companies.csv` 和 `COMPANIES.md` 由脚本从 `data/companies.json` 生成，不要手工编辑。

## 基本要求

每条记录尽量包含公开来源，例如：

- 公司官网、官方公众号文章、官方招聘页
- 招聘平台上的公司公开主页或搜索入口
- 活动行、百格活动、学校、园区或机构活动页
- 政府采购网、公共资源交易平台、政府部门公告
- 可信媒体报道或企业公开资料

不要提交第三方未经授权的私人联系方式、群二维码、聊天截图、未经核实的负面爆料、无法核验的薪资和所谓内部机会。

## 公司数据填写规则

公司主数据源是 `data/companies.json`。新增或更新公司时：

- `id` 使用小写英文 slug，例如 `kunming-example-tech`。
- `source_url` 必须是公开可访问链接。
- `source_urls` 至少包含 `source_url`。
- `last_checked` 使用 `YYYY-MM-DD`。
- `verification_status` 使用 `verified` / `official_page` / `community_pending` / `outdated` / `unknown`。
- 如果只有招聘平台搜索页或弱来源，不要写 `internship` / `hiring`，保守使用 `opportunities: ["unknown"]`。
- `notes` 只写中性事实，不写主观评价、传闻或无法公开复核的判断。

## 其他 CSV 填写规则

- 多个标签或说明保持简短，避免长段主观描述。
- 不确定字段可以留空或写 `unknown`，但不要编造。
- 活动平台搜索入口必须说明“只作为来源种子，不代表当前有具体活动”。
- 政府项目只有门户页时，不填写预算和具体发布日期。

## 提交流程

1. Fork 仓库。
2. 按数据类型修改 `data/companies.json` 或对应 CSV。
3. 如果修改了公司数据，运行：

```bash
npm run generate:companies
npm run export:csv
```

4. 运行完整校验：

```bash
npm run validate
```

5. 提交 Pull Request，并说明公开来源。

如果你不熟悉 GitHub，可以打开 [`../submit.html`](../submit.html) 复制模板，通过维护者微信提交公开来源。会 GitHub 的用户可以直接开 Issue，把名称、城市、公开来源链接和为什么与技术相关写清楚。
