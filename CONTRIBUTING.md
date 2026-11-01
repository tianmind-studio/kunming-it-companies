# Contributing / 贡献指南

感谢你补充昆明和云南的技术机会公开信息。这个项目只整理公开来源，不做排名、就业承诺、公司背书或负面爆料归档。

如果你不熟悉 GitHub，优先使用[在线提交页](https://kunming.tianmind.com/submit.html)：填写在线表单、复制模板，或通过维护者微信提交公开来源。会 GitHub 的贡献者可以直接开 Issue 或提交 PR。

## 可以贡献什么

| 贡献类型 | 推荐入口 | 数据文件 |
| --- | --- | --- |
| 补公司 / 技术团队 | [Add company](https://github.com/tianmind-studio/kunming-it-companies/issues/new?template=add-company.yml) | `data/companies.json` |
| 修改已有公司 | [Update company](https://github.com/tianmind-studio/kunming-it-companies/issues/new?template=update-company.yml) | `data/companies.json` |
| 报告过期信息 | [Report outdated info](https://github.com/tianmind-studio/kunming-it-companies/issues/new?template=report-outdated-info.yml) | `data/companies.json` 或相关 CSV |
| 补活动 / 社群 | [Add community or event source](https://github.com/tianmind-studio/kunming-it-companies/issues/new?template=add-community-or-event.yml) | `data/events.csv` / `data/communities.csv` |
| 补来源种子 | [Add source lead](https://github.com/tianmind-studio/kunming-it-companies/issues/new?template=add-source-lead.yml) | `data/source-leads.csv` |
| 报告错误 / 隐私问题 | [Data correction / privacy request](https://github.com/tianmind-studio/kunming-it-companies/issues/new?template=data-correction-privacy-request.yml) | 按实际影响处理 |
| 报告网页或脚本问题 | [Bug report](https://github.com/tianmind-studio/kunming-it-companies/issues/new?template=bug-report.yml) | 静态站、脚本或文档 |

公司数据以 `data/companies.json` 为主。`COMPANIES.md`、`data/companies.csv`、`data/site-data.json`、`docs/data-quality-report.md` 和 `docs/data-cleanup-plan.md` 由脚本生成，不要手工改生成内容。

## 来源要求

优先使用这些公开来源：

- 公司官网、产品官网、官方公众号文章、官方招聘页。
- 政府采购网、公共资源交易平台、政府部门公告、科技型中小企业名单。
- Luma、活动行、园区或高校活动页。
- 可信媒体报道、企业公开资料、公司 GitHub/Gitee 主页。
- 招聘平台公开公司主页；如果只是搜索页，先放入 `data/source-leads.csv`，不要直接写成岗位。

不要提交：

- 第三方未经授权的私人手机号、私人微信、私人邮箱、群二维码或聊天截图。
- 未经核实的负面爆料、薪资、裁员、加班、纠纷信息。
- “保证就业”“内部机会”“资源保真”等无法验证的承诺。
- 只凭印象写出的公司方向、岗位状态、外包需求或合作意向。

## 新手贡献路径

1. 先在首页或 `COMPANIES.md` 搜索，确认不是重复记录。
2. 准备至少一个公开来源链接。
3. 如果不确定公司是否符合边界，先开 Issue，不要直接写入数据。
4. 如果来源较弱，把记录保持为 `community_pending`，`confidence_score` 不要写高。
5. 如果只是来源入口，不要写成确定公司、岗位、活动或项目。

## 本地修改与检查

需要 Node.js 22、npm 和 Python 3。当前没有第三方 npm 依赖，无需配置数据库、账号或服务端凭据。

1. Fork 或克隆仓库，在独立分支修改公司主数据 `data/companies.json` 或对应资源 CSV。
2. 保留已有记录的稳定 `id`，核对主体与重复记录。只更新实际复核过的记录日期；`meta.updated_at` 表示数据集变更日期，不代表全量重新核验。
3. 重新生成受影响的输出并检查：

```bash
npm run generate:companies
npm run export:csv
npm run generate:data-quality
npm run generate:site-data
npm run data:diff -- --base-ref origin/main
npm run validate
npm run build:site
```

`data:diff` 将比较结果写入 `docs/data-change-summary.md`。如果你的数据基线来自其他分支，请把 `origin/main` 换成实际基线。同步 README 中英版本的统计快照，并把相关生成文件与源数据放在同一个 PR。

只修改网页、文档、模板或脚本时，运行 `npm run validate` 和 `npm run build:site`。修改页面交互后，还应通过 `npm run serve` 在桌面与手机尺寸检查搜索、筛选、清空条件、来源链接和错误提示。构建通过不能代替浏览器交互检查，也不能证明在线服务已发布。

PR 请说明具体改动、公开来源、实际核验日期及运行过的检查。新增事实保留可复核链接；来源不足时保持待复核状态。自动化校验通过后，仍由维护者复核事实与收录边界。

## 字段和边界

请先阅读：

- [`docs/data-standard.md`](docs/data-standard.md)
- [`docs/data-schema.md`](docs/data-schema.md)
- [`docs/community-guidelines.md`](docs/community-guidelines.md)
- [`docs/takedown-and-correction.md`](docs/takedown-and-correction.md)

关键原则：

- 字段必须符合[数据结构](docs/data-schema.md)。允许为空的字段留空；支持 `unknown` 的枚举字段可写 `unknown`，不要为通过校验而猜值。
- `notes` 只写公开来源支持的事实，不写主观评价。`confidence_score` 是来源强度，不是公司评分。
- 没有明确招聘页时，不要编造实习或招聘信息。
- 发现信息过期时，优先标记 `outdated`，不要直接删除已有有效数据。
- `opportunities` 和 `suitable_for_*` 是检索提示，不是承诺。
