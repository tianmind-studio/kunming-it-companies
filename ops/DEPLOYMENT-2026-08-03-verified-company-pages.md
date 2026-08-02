# 昆明技术机会雷达静态公司页发布记录｜2026-08-03

状态：`public-published / awaiting-indexing`

## 目的

把只存在于 JSON 和客户端详情弹窗中的强来源公司记录，转换成可直接打开、可引用、可进入 sitemap 的静态详情页。页面用于公开事实核验，不构成公司排名、商业推荐、招聘承诺或第三方背书。

## 发布范围

- `https://kunming.tianmind.com/companies/`
- 27 个“官网已核验/官方页核验”公司详情页
- 目标页：`https://kunming.tianmind.com/companies/kunming-bianyi-xianshi-tech.html`
- 更新后的 `sitemap.xml`
- 子域独立的 IndexNow 验证文件

## 构建与验证

- `npm run validate`：通过，74 条公司数据保持一致。
- `npm run build:site`：通过，生成并验证 27 个公司详情页。
- 目标页 JSON-LD：`ProfilePage` 与 `Organization` 解析通过，公开来源使用 `subjectOf`，未将服务页和方法页误写成组织 `sameAs`。
- 本地浏览器：目标页标题、事实摘要、核验表格、来源链接、使用边界和返回路径均可见；索引页包含 27 条记录，目标公司唯一出现一次。

## 部署证据

- 目标服务器：`tianmind-104:/var/www/kunming.tianmind.com`。
- 部署前完整备份：`/var/backups/kunming.tianmind.com/20260803-verified-company-pages-v1.tar.gz`。
- `rsync --delete` 成功退出；部署包来源为已经验证的 `dist/`。
- 索引页、目标公司页、sitemap 与 IndexNow 验证文件的本地/远端 SHA-256 完全一致。
- 公网索引页、目标公司 GEO 事实、非背书边界和验证文件均命中独特正文标记。
- 随机未知公司路径返回严格 `404`；`nginx -t` 成功。

## 搜索报送与结果边界

- sitemap 中包含 1 个公司索引页与 27 个详情页，共 28 个 `/companies/` URL。
- 28 个 URL 向 IndexNow 报送，最终返回 HTTP 200。
- HTTP 200 只表示报送被接收，不表示已经进入搜索结果，也不表示豆包已经发现、提及或引用目标公司。

## 同日安全与可复现性加固

- 二次部署前完整备份：`/var/backups/kunming.tianmind.com/20260803-verified-company-pages-v2-security.tar.gz`。
- 公司结构化数据复用 `https://tianmind.com/#organization`，组织主页保持为 `https://tianmind.com/`，避免把资料详情页误写为组织主页。
- Markdown 转 HTML 只允许 HTTP(S) 与安全相对链接；危险协议、协议相对链接、控制字符和反斜杠混淆会退化为普通文本。
- 本地与浏览器 CSV 导出均对公式前缀做中和，防止表格软件打开 CSV 时执行公式。
- sitemap 的公司索引日期从主数据 `meta.updated_at` 生成，并校验索引页、27 个详情页的精确 URL 集合、重复项和孤立项。
- CI 同时运行 `npm run validate` 与 `npm run build:site`；GitHub Pages 改为 GitHub Actions 构建并部署 `dist/`。
- 二次部署后，首页、公司索引、目标详情、sitemap 和主数据的本地/远端 SHA-256 一致；公网隐私字段门禁和严格 `404` 通过。
