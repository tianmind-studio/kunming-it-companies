# Source Research Playbook / 来源补强手册

这个项目优先补“可复核来源”，而不是为了数量扩表。`data/source-leads.csv` 是来源种子池：它记录每个方向至少 5 个公开入口，帮助维护者继续发现公司、招聘主页、活动和项目线索。

## 当前来源补强状态

- `data/source-leads.csv` 已覆盖 9 个方向。
- 每个方向至少 5 条公开招聘平台关键词入口。
- 这些入口只用于发现候选，不直接证明某家公司正在招聘。
- 发现具体公司后，仍需补到 `data/companies.json`，并保留公司官网、官方页、招聘主页或政府公告等 item-level 来源。

## 9 个方向

1. 软件开发 / 外包
2. 系统集成 / 政企信息化
3. AI / 大数据
4. 农业数字化
5. 医疗信息化
6. 文旅科技
7. 金融科技
8. 网络安全
9. 通信 / ICT

## 如何使用 `data/source-leads.csv`

1. 打开某个方向下的公开入口。
2. 只记录能打开的公司主页、官方招聘主页、官网、政府公告或活动详情页。
3. 不要把平台搜索结果直接当作公司已核验信息。
4. 不要把“看到招聘平台页面”直接写成 `internship` 或 `hiring`。
5. 如果只有招聘平台公司主页，保守写：

```text
source_type: recruiting_platform
verification_status: community_pending
opportunities: ["unknown"]
confidence_score: 3
```

6. 如果进一步找到官网或官方页，再升级为：

```text
source_type: official_site / official_profile
verification_status: verified / official_page
confidence_score: 4-5
```

## 招聘来源边界

可以收录：

- 公司在招聘平台上的公开公司主页。
- 平台搜索入口，作为来源种子。
- 公司官网上的“加入我们 / 招贤纳士 / 社会招聘 / 校园招聘”页面。

不要收录：

- 截图里的岗位。
- 无法公开打开的岗位链接。
- 私人内推二维码、私人微信、私人手机号。
- 无法确认发布时间的“正在招聘”判断。

## 社群和活动来源边界

`data/communities.csv` 与 `data/events.csv` 目前收录的是公开入口和搜索入口，不代表已经确认某个社群长期活跃，也不代表当前有具体活动。

后续把具体活动入库时，至少需要：

- 活动名称
- 主办方
- 活动城市或线上/线下说明
- 活动详情页
- 发布日期或活动日期
- `status` 标记为 `upcoming` / `past` / `source_search_page`

## 7 天补来源优先级

### Day 1：先补官网

从 `COMPANIES.md` 的优先核验清单开始，把 `community_pending` 记录逐条查官网或官方主页。

### Day 2：补公开招聘主页

使用 `data/source-leads.csv`，只补公司主页或招聘主页，不补岗位承诺。

### Day 3：补高校和学生入口

从高校学院、就业网、创新创业学院、实验室、学生技术社团公开页开始。

### Day 4：补活动入口

从活动行、百格活动、科技厅通知、园区活动页里找技术、AI、数据、创业活动。

### Day 5：补政府项目来源

从公共资源交易、政府采购、科技项目通知中找信息化、软件、数据平台、智慧城市项目。

### Day 6：补行业缺口

优先补农业数字化、医疗信息化、文旅科技、网络安全这些信息更分散的方向。

### Day 7：清理和生成

运行：

```bash
npm run generate:companies
npm run export:csv
npm run validate
```

然后把新增来源和仍待复核项写进 Issue 或更新日志。

## 不要为了看起来完整而牺牲可信度

这个项目的价值不是“公司越多越好”，而是让每条线索都能回到公开来源。不能确认就标 `community_pending`；来源弱就写 `confidence_score: 2-3`；没有招聘证据就保留 `opportunities: ["unknown"]`。
