# WSK · World Super Kinetic

汽车品牌概念官网，基于原 gosk 项目逐步迭代。新官网已替换原对外商城，原 Go 电商后端与商品管理台暂时保留。

## 项目结构

| 目录 | 用途 |
| --- | --- |
| `shop/` | WSK 官网：首页、品牌故事、车型筛选、两车对比和预约演示 |
| `frontend/` | 原商品管理台，独立运行，与现有商品接口配套 |
| `cmd/`、`internal/`、`pkg/`、`proto/` | 原 Go API 网关、用户/商品/订单服务与基础库 |
| `deploy/`、`docker-compose.yml` | 原基础设施与可观测性配置 |
| `docs/frontend-api-map.md` | 已有接口与汽车官网需求的对应、缺口和后续建议 |
| `docs/legacy-project.md` | 原项目说明与架构记录，保留供迁移参考 |

## 先运行官网

需要 Node.js 20.19+ 或 22.12+（Vite 7 要求；可使用更新的受支持版本）。

```sh
git clone https://github.com/sklmz1234/WSK-Auto-Website.git
cd WSK-Auto-Website/shop
npm ci
npm run dev
```

打开 http://localhost:5174 。官网展示不需要先启动数据库或 Go 服务。

```sh
npm run build
npm run preview
```

构建输出 `shop/dist/`，可部署至静态托管服务。首页 `index.html`，品牌页 `about.html`，车型页 `models.html`。完整说明见 [shop/README.md](shop/README.md)。

## 原后端和管理台

后端保持原有启动方式：复制 `.env.example` 为 `.env`，运行 `docker compose up -d --build`；网关地址 http://localhost:8080 ，健康接口 `/healthz`。

管理台可单独运行：

```sh
cd frontend
npm ci
npm run dev
```

管理台默认 http://localhost:5173 ，仍用于旧商品业务。官网开发和预览保留 `/api` 到网关的代理，可通过 `API_PROXY_TARGET` 指定其他后端。

## 当前集成范围

已有接口覆盖账户、商品、购物车与订单；尚无车型、门店、试驾预约和品牌内容接口。官网目前使用本地概念资料，预约不上传或保存个人信息。没有将试驾预约接到电商下单接口。

后续接口改造以 [接口对应说明](docs/frontend-api-map.md) 为起点。车型与品牌历史为创意展示，图片使用用户车标和 AI 概念视觉；图片提示词记录在 `docs/image-prompts.json` 与 `docs/design-notes.md`。
