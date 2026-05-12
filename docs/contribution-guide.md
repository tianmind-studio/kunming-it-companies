# Contribution Guide / 贡献指南

感谢你愿意补充昆明和云南的技术机会信息。

## 可以贡献什么

- 新增公司或机构到 `data/companies.csv`
- 新增招聘信息到 `data/jobs.csv`
- 新增技术活动到 `data/events.csv`
- 新增社群或组织到 `data/communities.csv`
- 新增政府数字化项目线索到 `data/gov-projects.csv`
- 修正过期、错误或缺少来源的记录

## 基本要求

每条记录尽量包含公开来源，例如：

- 公司官网、官方公众号、官方招聘页
- Boss 直聘、拉勾、脉脉等公开招聘页
- Luma、活动行、公众号文章、学校或园区活动页
- 政府采购网、公共资源交易平台、政府部门公告
- 可信媒体报道或企业公开资料

不要提交私人手机号、私人微信、未经核实的负面爆料、无法核验的薪资和所谓内部机会。

## CSV 填写规则

- 多个标签用英文分号分隔，例如 `AI;软件开发;昆明`
- 不确定的字段可以留空，但不要编造
- `status` 建议使用 `active`、`open`、`upcoming`、`pending`、`closed`、`unknown`
- 日期使用 `YYYY-MM-DD`
- 备注保持简短，只写事实，不写评价

## 提交流程

1. Fork 仓库。
2. 修改对应 CSV 文件。
3. 如果修改了早期公司索引，也运行 `npm run generate:companies`。
4. 运行 `npm test`。
5. 提交 Pull Request，并说明来源。

如果你不熟悉 GitHub，可以直接开 Issue，把来源链接贴出来。
