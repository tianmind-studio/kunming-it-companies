# 国内静态站部署说明

目标：把 GitHub 仓库作为开源数据源和维护记录，把国内可访问网页作为普通用户主入口。

建议主域名：

```text
kunming.tianmind.com
```

备用域名可以考虑：

```text
km.tianmind.com
```

## 当前静态站能力

`index.html` 在国内站点上应直接完成这些核心动作：

- 搜索公司、团队、方向、标签和备注；
- 按方向、区域、核验状态筛选；
- 查看公司卡片、来源链接、可信度和核验日期；
- 查看来源种子、活动/社群、政府数字化项目入口；
- 下载 `data/companies.csv`、`data/companies.json` 和其他 CSV；
- 打开 `submit.html`，通过同域在线表单、微信和复制模板提交公开线索。

GitHub 链接只保留为开源协作入口，不作为普通用户完成核心动作的前提。

## 本地构建

```bash
npm run validate
npm run build:site
```

构建输出：

```text
dist/
```

`dist/` 会包含：

- `index.html`
- `guides.html`
- `submit.html`
- `styles.css`
- `script.js`
- `submit.js`
- `assets/`
- `data/`
- `docs/`
- `docs/*.html`（由 Markdown 自动生成的网页版说明）
- `COMPANIES.md`
- `README.md`
- `README.en.md`
- `robots.txt`
- `sitemap.xml`

## 线索表单后端

`submit.html` 在国内主站会把表单提交到同域接口；GitHub Pages 备用页会通过受限 CORS 提交到同一个国内接口：

```text
POST https://kunming.tianmind.com/api/leads
```

后端代码在：

```text
server/lead_api.py
server/kunming-leads-api.service
```

设计边界：

- 只保存待复核线索，不自动发布；
- 必填字段包括线索类型、名称、城市、公开来源链接和收录/修正理由；
- 公开来源链接必须是 `http` 或 `https`；
- 提交内容存到服务器私有 JSONL 文件，不放在 Web 根目录；
- 不要求用户会使用 GitHub，也不把 GitHub Issue 作为唯一提交路径。

服务器默认路径：

```text
/opt/kunming-tech-radar/api/lead_api.py
/opt/kunming-tech-radar/leads/leads.jsonl
```

服务端口：

```text
127.0.0.1:3924
```

nginx 需要把 `/api/` 反代到本机服务，例如：

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:3924/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    client_max_body_size 64k;
}
```

查看待复核线索：

```bash
ssh tianmind-104 "tail -n 20 /opt/kunming-tech-radar/leads/leads.jsonl"
```

导入正式数据前必须人工复核公开来源。不要把表单里的联系方式、私人说明或无法核验内容直接写入公开数据。

## 部署配置

仓库根目录已准备 `deploy.json`：

```json
{
  "name": "kunming-tech-radar",
  "domain": "kunming.tianmind.com",
  "server": "tianmind-104",
  "type": "static",
  "build": "npm run build:site",
  "output": "dist",
  "ssl": true
}
```

正式上线前需要确认：

1. 使用 `kunming.tianmind.com` 还是 `km.tianmind.com`。
2. 是否用 `tianmind-104` 作为静态站服务器。
3. 是否立即创建 Cloudflare DNS、nginx 配置和证书。

确认后可在本机执行 TianMind 部署工具：

```bash
/Volumes/三星T7/Dev/site-tools/deploy.sh
```

也可以用 webhook 全站部署，但正式上线前仍应先确认域名。

## 上线后核验

不要只看 HTTP 200。需要检查内容标记：

```bash
curl -sL https://kunming.tianmind.com/ | rg "国内可访问入口"
curl -sL https://kunming.tianmind.com/submit.html | rg "不会 GitHub"
curl -sL https://kunming.tianmind.com/submit.html | rg "leadForm|/api/leads"
curl -sL https://kunming.tianmind.com/api/health
curl -sL https://kunming.tianmind.com/data/companies.json | node -e "let s=''; process.stdin.on('data',d=>s+=d); process.stdin.on('end',()=>console.log(JSON.parse(s).companies.length))"
curl -sI https://kunming.tianmind.com/robots.txt
curl -sL https://kunming.tianmind.com/sitemap.xml | rg "submit.html"
```

同时检查：

- 首页 title / description 是否指向昆明 IT 公司与技术机会地图；
- `submit.html` 是否能提交表单、复制模板；
- `/api/leads` 是否只保存待复核线索，不直接公开；
- CSV/JSON 是否能直接下载；
- 微信二维码是否能正常显示；
- GitHub Pages 是否仍可作为备用入口。

## 后续成功指标

国内站点上线后，成功指标不应只看 GitHub star。更重要的是：

- 国内站访问量；
- 微信添加与有效线索；
- 表单线索数量；
- 本地同学、求职者、老师或社群转发；
- `community_pending` 记录被补官网、区县和第二来源的数量。
