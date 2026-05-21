# Scripts

当前脚本围绕一个原则：`data/companies.json` 是公司主数据源，其他可读文件由脚本生成。

## 当前脚本

- `companies-lib.mjs`：公司数据规范化、统计、CSV 导出、分类映射等共享逻辑。
- `generate-companies-md.mjs`：从 `data/companies.json` 生成 `COMPANIES.md`。
- `export-companies-csv.mjs`：从 `data/companies.json` 生成 `data/companies.csv`。
- `generate-data-quality-report.mjs`：生成 `docs/data-quality-report.md`，汇总核验状态、来源类型、缺区县、弱来源和最近核验分布。
- `generate-data-cleanup-plan.mjs`：生成 `docs/data-cleanup-plan.md`，列出待复核、弱来源和缺区县记录的人工复核优先级。
- `generate-site-data.mjs`：把首页需要的 JSON / CSV 数据合并为 `data/site-data.json`，减少首屏数据请求数量。
- `report-data-changes.mjs`：对比上一版本 `data/companies.json`，输出新增、删除、来源升级/降级和字段缺失变化。
- `validate-data.mjs`：校验公司 JSON 的必填字段、来源、日期、核验状态和可信度评分。
- `validate-csv.mjs`：检查 CSV 表头、列数、URL/日期格式，并要求 `data/source-leads.csv` 每个方向至少 5 条来源入口。
- `validate-repo-paths.mjs`：检查仓库是否存在大小写路径冲突，避免 macOS 和 GitHub 上表现不一致。
- `validate-public-docs.mjs`：检查公开文档是否出现明显的维护者传播话术或 owner-only 内容。
- `validate-site.mjs`：检查静态首页是否接入公司之外的来源入口面板，并确认相关 CSV 有基础数据。
- `validate-domestic-site.mjs`：检查 `kunming.tianmind.com` 国内主入口、`submit.html` 和部署配置是否接好。
- `build-static-site.mjs`：把国内站需要的静态文件复制到 `dist/`，供 TianMind 部署工具上传。

## 常用命令

```bash
npm run generate:companies
npm run export:csv
npm run generate:data-quality
npm run generate:site-data
npm run data:diff
npm run validate:data
npm run build:site
npm run validate
```

## 自动化边界

当前阶段以人工整理和人工核验为主，不做自动抓取。后续可以逐步接入半自动候选发现脚本，但必须遵守来源网站规则，并保留原始链接和核验日期。

任何自动化脚本都应该服务于复核，而不是绕过复核。不要把未经核验的抓取结果直接当成事实数据。
