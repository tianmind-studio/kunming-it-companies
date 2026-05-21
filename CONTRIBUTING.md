# Contributing / 贡献指南

感谢你补充昆明和云南的技术机会公开信息。这个项目只整理公开来源，不做排名、就业承诺、公司背书或负面爆料归档。

如果你不熟悉 GitHub，优先使用 [`submit.html`](submit.html)：填写在线表单、复制模板，或通过维护者微信提交公开来源。会 GitHub 的贡献者可以直接开 Issue 或提交 PR。

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

公司数据以 `data/companies.json` 为主。`COMPANIES.md` 和 `data/companies.csv` 由脚本生成，不要手工改公司正文。

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

## 直接修改数据

1. 修改 `data/companies.json`。
2. 运行：

```bash
npm run generate:companies
npm run export:csv
npm run generate:data-quality
npm run validate
```

3. 如果改了静态站或文档，再运行：

```bash
npm run build:site
```

4. 提交 PR，并在 PR 里说明改了什么、来源是什么、是否涉及隐私或敏感边界。

## 字段和边界

请先阅读：

- [`docs/data-standard.md`](docs/data-standard.md)
- [`docs/data-schema.md`](docs/data-schema.md)
- [`docs/community-guidelines.md`](docs/community-guidelines.md)
- [`docs/takedown-and-correction.md`](docs/takedown-and-correction.md)

关键原则：

- 不确定的字段可以留空或写 `unknown`，不要猜。
- `notes` 只写事实，不写主观评价。
- 没有明确招聘页时，不要编造实习或招聘信息。
- 发现信息过期时，优先标记 `outdated`，不要直接删除已有有效数据。
- `opportunities` 和 `suitable_for_*` 是检索提示，不是承诺。
