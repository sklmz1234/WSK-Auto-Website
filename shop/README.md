# WSK 对外官网

原生 HTML、CSS、JavaScript，Vite 负责开发代理与多页面构建。此目录已替换旧电商商城，旧代码可从 Git 历史恢复。

```sh
cd shop
npm ci
npm run dev
```

打开 http://localhost:5174 。官网展示不依赖 Go 后端启动。

```sh
npm run build
npm run preview
```

构建输出 `shop/dist/`，包含 index.html、about.html、models.html 与图片，可部署到静态站点。站内链接使用 .html；如需 /about、/models，请由托管服务配置无扩展名路由。

- index.html / app.js / styles.css：首页与预约演示。
- about.html / about.js / about.css：品牌故事。
- models.html / models.js / models.css：车型筛选、选择、两车对比。
- public/assets/：原始车标与概念图片。设计区完整显示银色车标。

车型与品牌历程为概念展示。预约表单不发送、不保存数据。字体外链不可用时使用本地回退字体。

Vite 保留 /api 代理，默认目标 http://127.0.0.1:8080，可用 API_PROXY_TARGET 覆盖；当前官网不调用电商接口。详见 [接口对应说明](../docs/frontend-api-map.md)。
