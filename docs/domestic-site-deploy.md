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
- 打开 `submit.html`，通过微信、表单占位和复制模板提交公开线索。

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
- `submit.html`
- `styles.css`
- `script.js`
- `submit.js`
- `assets/`
- `data/`
- `docs/`
- `COMPANIES.md`
- `README.md`
- `README.en.md`
- `robots.txt`
- `sitemap.xml`

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
curl -sL https://kunming.tianmind.com/data/companies.json | node -e "let s=''; process.stdin.on('data',d=>s+=d); process.stdin.on('end',()=>console.log(JSON.parse(s).companies.length))"
curl -sI https://kunming.tianmind.com/robots.txt
curl -sL https://kunming.tianmind.com/sitemap.xml | rg "submit.html"
```

同时检查：

- 首页 title / description 是否指向昆明 IT 公司与技术机会地图；
- `submit.html` 是否能复制模板；
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
