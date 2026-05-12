# Contributing

感谢你补充昆明和云南的技术机会信息。

这个项目收录公开信息，不做排名，不做背书，也不收未经核实的负面爆料。提交内容时，请尽量提供可公开访问的来源链接。

## 可以贡献什么

| 类型 | 文件 |
| --- | --- |
| 公司、机构、技术团队 | `data/companies.csv` |
| 招聘岗位 | `data/jobs.csv` |
| 技术活动 | `data/events.csv` |
| 社群和组织 | `data/communities.csv` |
| 政府数字化项目线索 | `data/gov-projects.csv` |

早期公司索引仍保留在 `data/companies.json` 和 `COMPANIES.md`。如果你只是在补已有公司索引，可以继续修改 JSON 并运行 `npm run generate:companies`。

## 来源要求

优先使用这些公开来源：

- 公司官网、官方公众号、官方招聘页
- Boss 直聘、拉勾、脉脉等公开招聘页
- Luma、活动行、公众号文章、园区或高校活动页
- 政府采购网、公共资源交易平台、政府部门公告
- 可信媒体报道、企业公开资料、公司 GitHub/Gitee 主页

不要提交：

- 私人手机号、私人微信
- 未经核实的负面爆料
- 没有来源的薪资、裁员、加班信息
- “保证就业”“内部机会”“资源保真”等无法验证的承诺

## CSV 填写规则

- 日期统一使用 `YYYY-MM-DD`
- 多个标签用英文分号分隔，例如 `AI;软件开发;昆明`
- 不确定的字段可以留空，不要猜
- `notes` 只写事实，不写主观评价
- `source_url` 尽量指向原始来源，而不是二次搬运内容

## 提交方式

1. Fork 仓库。
2. 修改对应 CSV 或 JSON 文件。
3. 如果修改了 `data/companies.json`，运行 `npm run generate:companies`。
4. 运行 `npm test`。
5. 提交 Pull Request，并在说明里附上来源。

如果你不熟悉 GitHub，可以直接开 Issue，把信息和来源链接贴出来。
