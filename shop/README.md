# WSK 对外官网

原生 HTML、CSS、JavaScript，Vite 负责开发代理与多页面构建。此目录已替换旧电商商城，旧代码可从 Git 历史恢复。

```sh
cd shop
npm ci
npm run dev
```

打开 http://localhost:15174 。官网展示不依赖 Go 后端启动。

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

Vite 保留 /api 代理，默认目标 http://127.0.0.1:18090，可用 WSK_API_PROXY_TARGET 覆盖；当前官网不调用电商接口。详见 [接口对应说明](../docs/frontend-api-map.md)。

## 车型图片轮播

车型页下方为六张大图的循环展示：三款原始车型图片与用户提供的赛道、城市、旷野图片。卡片精简为一行标题，支持鼠标悬停、键盘聚焦与触摸时暂停，离开后继续；也可使用左右按钮、方向键或暂停按钮控制。系统开启减少动态效果时默认不自动播放。

筛选仍作用于车型与对应灵感图片；点击原车型卡片继续切换上方展示和预约车型，灵感图片不新增车型或配置。新增原图位于 `public/assets/gallery-track-blue.jpg`、`gallery-city-gold.jpg`、`gallery-desert-green.jpg`。

## 首页品牌影片

首页下方“预览风采”按钮播放 `public/assets/wsk-brand-film.mp4`（用户提供的约 15 秒视频）。介绍文字与按钮淡出后，在原区域显示原生视频播放器；支持播放、暂停、进度、全屏，以及“返回介绍”或 Esc 关闭。默认不自动播放，按需加载；减少动态效果偏好下取消过渡。加载或解码失败时恢复介绍并提供重试提示。

“预览风采”按钮及品牌体验区的小圆点使用蓝色点缀，其他主要行动保留橙色。影片播放结束后会自动淡出并恢复介绍及按钮；所有页面的页头统一采用与 02 设计区一致的 #181B24 深色背景，取消车标独立渐变底板，导航与车标使用银白色；“了解我们”位于“探索车型”左侧，与其他导航项统一间距。
