# Scripts

当前脚本围绕一个原则：`data/companies.json` 是公司主数据源，其他可读文件由脚本生成。

## 当前脚本

- `companies-lib.mjs`：公司数据规范化、统计、CSV 导出、分类映射等共享逻辑。
- `generate-companies-md.mjs`：从 `data/companies.json` 生成 `COMPANIES.md`。
- `export-companies-csv.mjs`：从 `data/companies.json` 生成 `data/companies.csv`。
- `validate-data.mjs`：校验公司 JSON 的必填字段、来源、日期、核验状态和可信度评分。
- `validate-csv.mjs`：检查 CSV 表头、列数、URL/日期格式，并要求 `data/source-leads.csv` 每个方向至少 5 条来源入口。

## 常用命令

```bash
npm run generate:companies
npm run export:csv
npm run validate:data
npm run validate
```

## 自动化边界

当前阶段以人工整理和人工核验为主，不做自动抓取。后续可以逐步接入半自动候选发现脚本，但必须遵守来源网站规则，并保留原始链接和核验日期。

任何自动化脚本都应该服务于复核，而不是绕过复核。不要把未经核验的抓取结果直接当成事实数据。
