# 昆明 IT 公司 / 昆明互联网公司地图

> Kunming IT Directory: 昆明 IT 公司、昆明互联网公司、软件公司、系统集成、AI、云服务、医疗信息化、行业数字化公司开放清单。

一个面向求职者、开发者、创业者和外地团队的昆明 IT / 互联网 / 数字化公司开放清单。

This is a public, source-backed directory of IT, internet, software, digital service, and tech-enabled companies in Kunming, Yunnan.

## 快速入口

- [公司索引 / Company Index](COMPANIES.md)
- [贡献说明 / Contributing](CONTRIBUTING.md)
- [数据源 / Open Data](data/companies.json)
- [字段说明 / Data Schema](docs/data-schema.md)

## 为什么做这个

GitHub 上已有一个老项目 [bigzhubak/KM-IT](https://github.com/bigzhubak/KM-IT) 收集昆明 IT 公司，但它只有单个 README，数据结构、来源校验、贡献流程和页面浏览体验都比较早期。其他城市有类似 [xian-IT](https://github.com/madawei2699/xian-IT) 的清单，但昆明缺少一个可持续维护、可搜索、可审计的版本。

这个项目不做排名、不做黑名单、不做未经核实的评价。首要目标是把“昆明有哪些技术相关公司”整理成可维护的数据。

## 当前内容

- `data/companies.json`: 公司数据源，所有页面和统计都从这里读取。
- `COMPANIES.md`: GitHub 直接可读、可搜索的公司索引。
- `index.html`: 可直接部署到 GitHub Pages 的静态目录页面。
- `docs/data-schema.md`: 数据字段说明。
- `.github/ISSUE_TEMPLATE/`: 新增公司、纠错和补充来源的 issue 模板。
- `scripts/validate-data.mjs`: 本地数据校验脚本。

## 公司索引预览

| 公司 | 方向 | 区域 | 来源 |
| --- | --- | --- | --- |
| 昆明海天信息技术集团有限公司 | 系统集成 / 工业数字化 | 高新区 | [官网](https://www.ynhitech.com/) |
| 昆明博程科技有限公司 | 软件开发 / 互联网服务 | 官渡区 | [官网](https://www.yunk.com.cn/) |
| 昆明昌昱信息科技有限公司 | 云服务 / 产业数字化 | 官渡区 | [官网](https://www.chanetsoft.com/) |
| 昆明软佳科技有限公司 | 医疗信息化 | 待补 | [官网](https://www.katesoft.com/) |
| 盛云科技集团 | 数字建造 / 智慧城市 | 待补 | [官网](https://ynshine.com/) |
| 昆明道实科技有限公司 | 软件开发 / 系统集成 | 五华区 | [官网](https://kmdskj.icu/) |
| 云南软加科技有限公司 | 软件开发 / AI 应用 | 待补 | [官网](https://www.softplus.dev/) |

## 本地预览

```bash
npm run validate
npm run serve
```

打开 `http://127.0.0.1:4178`。

## 收录标准

优先收录符合任一条件的昆明本地或在昆明有明确团队/分支的公司：

- 软件开发、互联网产品、SaaS、AI、云计算、数据服务
- 信息化、系统集成、工业互联网、智慧城市、医疗/农业/文旅等行业数字化
- 游戏、网络服务、开发者工具、技术服务

每条公司记录至少需要一个公开来源，例如官网、官方公众号、招聘主页、工商公开页、可信媒体报道等。

## GitHub 搜索关键词

昆明 IT 公司、昆明互联网公司、昆明软件公司、昆明科技公司、昆明程序员、昆明开发者、云南 IT 公司、云南互联网公司、Kunming IT companies, Kunming software companies, Yunnan tech companies.

## 贡献方式

最简单的方式是开 issue：

- 新增公司：使用 `Add company` 模板
- 修改信息：使用 `Update company` 模板

也欢迎直接提交 PR，修改 `data/companies.json` 后运行：

```bash
npm run validate
```

## 信息边界

- 不收录个人手机号、私人微信、未公开邮箱等隐私信息。
- 不发布未经核实的薪资、裁员、加班、争议评价。
- 不把“公司还存在”当作永久事实。每条数据都有 `source_checked_at`，欢迎定期复核。

## English Summary

Kunming has many software, system integration, digital transformation, and vertical-industry technology companies, but public discovery is fragmented. This repo turns that local knowledge into a small open dataset plus a searchable static site.

The project is intentionally conservative: source-backed facts first, opinions later only if a future review policy is designed.

## License

Code is released under the MIT License. Company data contributions are intended for public reuse under CC0-1.0 unless a contributor states otherwise in a PR.
