# GitHub Visibility Notes

这个项目的主阵地是 GitHub 搜索，而不是单独网站流量。

## Repository Surface

建议仓库名：

- `kunming-it-directory`
- `kunming-it-companies`
- `awesome-kunming-it`

建议仓库描述：

```text
昆明 IT 公司 / 昆明互联网公司开放清单：软件、AI、云服务、系统集成、医疗信息化、行业数字化公司地图。
```

建议 topics：

```text
kunming, yunnan, awesome-list, it-companies, software-companies, china-tech, developer-community, open-data
```

## Search Strategy

GitHub 搜索主要会命中仓库名、描述、topics、README 和 Markdown 文件，所以这里优先维护：

- `README.md`：入口、项目定位、关键词
- `COMPANIES.md`：完整公司索引
- `data/companies.json`：结构化数据源

## Growth Loop

1. 先发布一个干净可贡献的公开仓库。
2. 在 README 里保留明确关键词：昆明 IT 公司、昆明互联网公司、昆明软件公司。
3. 每新增公司都要求来源，避免变成主观评价贴。
4. 等 GitHub 上有人 star/issue 后，再考虑 Pages、地图、自动化抓取。
