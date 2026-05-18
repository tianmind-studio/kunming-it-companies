# Reuse and Citation / 复用与引用

昆明技术机会雷达 / Kunming Tech Radar 是一个公开协作的数据项目。欢迎引用、转载、二次整理或用于非商业研究，但请保留来源和不确定性。

## 推荐引用格式

```text
昆明技术机会雷达 / Kunming Tech Radar，tianmind-studio/kunming-it-companies，访问日期：YYYY-MM-DD，https://github.com/tianmind-studio/kunming-it-companies
```

如果引用单条公司或活动记录，请同时保留：

- 原始 `source_url`；
- `last_checked` 或对应 CSV 的检查日期；
- `verification_status` / `status`；
- 本项目链接。

## 推荐保留字段

如果把数据导入表格、知识库、地图或研究笔记，至少保留这些字段，避免把线索误读成确定事实：

| 字段 | 为什么要保留 |
| --- | --- |
| `name` | 公司或公开品牌名。 |
| `city` / `district` | 本地生态分析需要保留地理信息；不确定时不要猜。 |
| `category` / `tags` | 说明记录为什么和技术、软件、数据或数字化有关。 |
| `source_url` | 原始来源，复核时最重要。 |
| `source_type` | 区分官网、官方页、政府名单、招聘平台、社区清单等来源类型。 |
| `verification_status` | 表示核验强度，不能省略。 |
| `last_checked` | 记录最近复核日期。 |
| `confidence_score` | 来源强度评分，不是公司排名。 |

机器读取建议优先用 JSON：

```text
https://tianmind-studio.github.io/kunming-it-companies/data/companies.json
```

表格工具建议用 CSV：

```text
https://tianmind-studio.github.io/kunming-it-companies/data/companies.csv
```

## 可以做什么

- 在文章、报告、课堂项目或研究笔记中引用本项目。
- 基于公开数据做可视化、统计或本地技术生态分析。
- 在保留来源和日期的前提下二次整理。
- 提交 Issue 或 PR 修正过期信息。

## 不要做什么

- 不要把 `community_pending` 记录说成已核验公司。
- 不要把招聘平台搜索入口说成“正在招聘”。
- 不要移除原始来源和核验日期。
- 不要添加私人联系方式、截图、传闻、薪资、裁员或无法公开复核的信息。
- 不要把本项目包装成招聘担保、公司排名、商业背书或投资建议。

## 数据许可说明

代码采用 MIT License。数据内容来自公开来源和社区协作，适合公开协作、学习和非商业研究参考。使用数据时请尊重原始来源网站的条款。
