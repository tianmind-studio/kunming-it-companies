# Contributing

感谢你补充昆明和云南的技术机会信息。

这个项目只整理公开信息，不做排名，不做商业背书，也不收未经核实的负面爆料。提交内容时，请尽量提供可公开访问的来源链接。

## 可以贡献什么

| 类型 | 文件 |
| --- | --- |
| 公司、机构、技术团队 | `data/companies.json` |
| 招聘岗位候选线索 | `data/jobs.csv` |
| 技术活动 | `data/events.csv` |
| 社群和组织 | `data/communities.csv` |
| 政府数字化项目线索 | `data/gov-projects.csv` |
| 来源种子 / 后续核验入口 | `data/source-leads.csv` |

公司数据以 `data/companies.json` 为主，`COMPANIES.md` 和 `data/companies.csv` 由脚本生成。来源种子只是“下一步去哪里查”，不能直接当作公司或岗位事实。

## 来源要求

优先使用这些公开来源：

- 公司官网、产品官网、官方公众号文章、官方招聘页。
- 政府采购网、公共资源交易平台、政府部门公告、科技型中小企业名单。
- Luma、活动行、园区或高校活动页。
- 可信媒体报道、企业公开资料、公司 GitHub/Gitee 主页。
- 招聘平台公开公司主页；如果只是搜索页，先放入 `data/source-leads.csv`，不要直接写成岗位。

不要提交：

- 私人手机号、私人微信、私人聊天记录。
- 未经核实的负面爆料。
- 没有来源的薪资、裁员、加班信息。
- “保证就业”“内部机会”“资源保真”等无法验证的承诺。

## 公司数据修改流程

1. 修改 `data/companies.json`。
2. 运行：

```bash
npm run generate:companies
npm run export:csv
npm run validate
```

3. 提交 PR，并在说明里附上来源。

如果你不熟悉 GitHub，可以直接开 Issue，把公司名、官网或公开来源、所在区县、主要方向贴出来。

## 字段和边界

请先阅读：[`docs/data-standard.md`](docs/data-standard.md)。

关键原则：

- 不确定的字段可以留空，不要猜。
- `notes` 只写事实，不写主观评价。
- 没有明确招聘页时，不要编造实习或招聘信息。
- 发现信息过期时，优先标记 `outdated`，不要直接删除已有有效数据。
