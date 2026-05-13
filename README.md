# Kunming Tech Radar / 昆明技术机会雷达

昆明技术机会雷达是一个开源的本地技术机会数据库，整理昆明及云南范围内的技术公司、岗位、活动、社群与数字化项目线索。

它不是公司黄页，也不做就业承诺。这个项目想解决一个更具体的问题：把散落在官网、招聘平台、政府公告、公众号、PDF 和熟人网络里的本地技术机会，整理成可以检索、可以复核、可以持续维护的开放数据。

## 这个项目帮谁解决什么问题

### 学生

- 找到昆明/云南有哪些真正和技术相关的公司。
- 在投实习、做课程项目、找毕业设计方向前，先了解本地行业分布。
- 看见软件开发、系统集成、AI / 大数据、农业数字化、医疗信息化、文旅科技等方向，不只盯着一线城市。

### 开发者

- 找本地工作、合作方、技术团队和行业入口。
- 快速判断一家公司是官网已核验、官方页核验，还是社区待复核。
- 发现本地技术社群、活动和可能的项目来源。

### 自由职业者 / 创业者

- 从公开信息里发现客户线索、外包方向和产业数字化机会。
- 看到哪些传统行业正在被软件、数据、AI、物联网、系统集成改造。
- 把“昆明有没有技术机会”变成一张可维护的本地雷达图。

### 企业 / 机构

- 提高被本地学生、开发者和技术服务者发现的概率。
- 补充官网、招聘页、技术博客、开源主页、活动页等公开入口。
- 用透明来源让本地生态更容易被看见。

## 当前数据概览

当前主数据源：[`data/companies.json`](data/companies.json)。

| 指标 | 当前状态 |
| --- | --- |
| 已收录公司 / 机构 | 73 |
| 官网已核验 | 24 |
| 官方页核验 | 2 |
| 社区待复核 | 47 |
| 已导出 CSV | [`data/companies.csv`](data/companies.csv) |
| 来源种子池 | 45 条公开来源入口，覆盖 9 个方向 × 每方向至少 5 条 |
| 社群 / 活动入口 | [`data/communities.csv`](data/communities.csv)、[`data/events.csv`](data/events.csv) |
| 政府项目入口 | [`data/gov-projects.csv`](data/gov-projects.csv) |
| 覆盖区域 | 五华区、盘龙区、官渡区、西山区、呈贡区、高新区、安宁 / 其他、待补区域 |
| 覆盖方向 | 软件开发 / 外包、系统集成 / 政企信息化、AI / 大数据、农业数字化、医疗信息化、文旅科技、金融科技、网络安全、通信 / ICT |

说明：`社区待复核` 不等于无效，只表示目前还缺少官网、官方页、业务方向或区域等更强来源。`来源种子池` 只用于发现候选，不代表存在岗位或合作机会。

## 快速浏览入口

- [GitHub Pages 展示页](./index.html)：搜索公司名，按方向、区域、核验状态筛选。
- [公司索引 COMPANIES.md](COMPANIES.md)：适合在 GitHub 内直接阅读和搜索。
- [结构化主数据 data/companies.json](data/companies.json)：维护者优先修改这里。
- [CSV 导出 data/companies.csv](data/companies.csv)：由 JSON 自动导出，方便表格工具打开。
- [数据标准](docs/data-standard.md)：收录边界、字段解释、核验规则。
- [来源补强手册](docs/source-research-playbook.md)：每个方向至少 5 条公开来源入口，以及如何避免编造岗位。
- [传播文案包](docs/share-kit.md)：朋友圈、小红书、X 和 GitHub 发布文案。
- [为什么要做昆明技术机会雷达](docs/why-kunming-tech-radar.md)：项目背景和传播版说明。
- [贡献指南](CONTRIBUTING.md)：如何补充公司、修正过期信息。

## 数据源策略

为避免多份数据互相打架，当前公司数据采用以下策略：

1. `data/companies.json` 是主数据源。
2. `scripts/generate-companies-md.mjs` 从 JSON 生成 `COMPANIES.md`。
3. `scripts/export-companies-csv.mjs` 从 JSON 导出 `data/companies.csv`。
4. 不手工维护 `COMPANIES.md` 和 `companies.csv` 里的公司正文。

常用命令：

```bash
npm run generate:companies
npm run export:csv
npm run validate:data
npm run validate
```

本项目不自动抓取公司信息。新增数据必须来自公开来源，并保留原始链接。

补来源时先看 [`data/source-leads.csv`](data/source-leads.csv)：它是 9 个方向的公开来源种子池。注意：招聘平台入口只证明“可以继续查”，不证明“正在招聘”；没有具体公开招聘主页时，不要把 `opportunities` 写成 `internship` 或 `hiring`。

## GitHub Pages 静态展示页

仓库根目录已经包含一个轻量页面：

- `index.html`
- `styles.css`
- `script.js`
- `data/companies.json`

它使用纯 HTML + CSS + JS，不需要数据库、登录系统或复杂构建工具。

本地预览：

```bash
npm run serve
```

然后打开：

```text
http://127.0.0.1:4178
```

部署到 GitHub Pages：

1. 打开 GitHub 仓库 Settings。
2. 进入 Pages。
3. Source 选择 `Deploy from a branch`。
4. Branch 选择 `main`，目录选择 `/root`。
5. 保存后等待 GitHub Pages 构建完成。

## 如何贡献

### 我只知道一个公司，怎么提交？

最简单方式：打开 Issue，选择 `Add company` 模板，填公司名、城市/区县、官网或公开主页、主要方向、信息来源。

你不需要会写 JSON，也不需要会提交 PR。只要给出公开来源，维护者就可以整理。

### 我发现信息过期，怎么反馈？

打开 Issue，选择 `Report outdated info` 模板，说明哪家公司、哪里过期、你看到的新来源是什么。

### 我是公司负责人，怎么补充官网 / 招聘页？

打开 Issue，选择 `Update company` 模板，补充：

- 官网
- 官方招聘页
- 官方公众号文章
- 技术博客 / 开源主页
- 公司所在区县
- 主要技术方向

为了保护项目可信度，请尽量提供公开页面，不要只留私人微信或私人手机号。

### 我会 GitHub，怎么直接改？

1. 修改 `data/companies.json`。
2. 运行：

```bash
npm run generate:companies
npm run export:csv
npm run validate
```

3. 提交 PR，并在说明里写明来源。

## 不收录什么

- 私人手机号、私人微信、私人聊天记录。
- 未经核实的负面爆料。
- 无法公开验证的薪资、裁员、加班信息。
- “保证就业”“内部机会”“资源保真”等无法验证的承诺。
- 与技术、数字化、软件、数据、系统集成、研发团队无明显关系的普通商贸信息。

## 免责声明

- 本项目只整理公开信息，不保证信息完整、实时或绝对准确。
- 所有公司、岗位、活动、项目状态都可能变化，请以原始来源为准。
- 本项目不提供就业担保、商业背书、投资建议或招聘中介服务。
- `适合学生 / 求职者 / 自由职业者 / 创业者` 只是阅读和检索提示，不代表该公司正在招聘或愿意合作。
- 如果你发现信息错误、过期或不适合公开展示，请提交 Issue 或 PR 修正。

## 社区试运行

已经有读者通过线上入口找到我，目前开始试运行一个昆明技术机会交流群。

这个群不是招聘中介群，也不做公司背书，主要用于：

- 补充昆明/云南技术公司、官网、招聘主页和活动线索。
- 交流本地学生实习、项目展示、开发者合作和数字化服务机会。
- 帮忙复核 `community_pending` 记录，减少过期和错误信息。

为了保护隐私，仓库里不会公开群二维码。想加入可以通过下面联系方式找我，备注：`昆明技术机会雷达`。

## 联系

如果你是昆明或云南的开发者、学生、创业者、企业负责人，欢迎通过微信联系我：

微信号：`beizhushaonlan`

<img src="assets/wechat-qr.jpg" alt="Junius 微信二维码" width="260">

添加时可以备注：`昆明技术机会雷达`。

## License

代码采用 MIT License。数据内容用于公开协作和非商业研究参考；转载或二次整理时请保留来源链接和核验日期。
