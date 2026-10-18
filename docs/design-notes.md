# WSK 汽车概念官网

以用户提供的银色 W 车标与 Agentic skill 为基础的展示首页。

- `dist/index.html` 可直接打开，所有主要交互均为浏览器本地逻辑。
- `dist/styles.css` 包含桌面与手机布局、键盘焦点和减少动态效果支持。
- `dist/app.js` 包含车型标签页、品牌故事和预约演示。
- 页面没有后端；预约信息不会上传或保存。
- WSK 汽车、WSK GT、WSK X、WSK S 为概念车型命名，非量产产品声明。三种车型使用同一概念意向图，并在页面说明。

## 视觉资源

`dist/assets/brand.jpg`：用户提供的原始车标图。

`dist/assets/hero.png`：使用内置 imagegen 生成的品牌概念汽车视觉。

最终生成提示词：Use case: ads-marketing. Asset type: automotive website hero photographic background, ultra wide 16:9. A beautifully crafted concept luxury electric grand touring sedan in pearl silver, low elegant aerodynamic silhouette, distinctive thin double LED headlights, large graphite aerodynamic wheels, subtle flowing W chrome emblem (reference image is brand logo only) on hood. Parked on a vast pale concrete plaza on a salt lake, distant rugged gray mountains, cool blue-gray sky, morning haze. Frontal three-quarter view, nose towards left, car in center-right occupying lower 55% of composition, realistic expensive automotive campaign photograph, cinematic natural soft light, meticulously realistic metal reflections, airy minimalist refined premium styling. Leave upper left sky uncluttered for website text overlay. No text, no other brand logos, no watermark. Landscape 1792x1024.

## 设计依据

采用 #FF5701 主色、#F6F6F1 辅色、8px 间距基线、小圆角，以及 Playfair Display / JetBrains Mono 英文字体；中文使用宋体回退，导航与表单使用系统字体提高可读性。字体外链不可用时会自动回退。

交互采用语义化导航、原生 dialog、原生表单校验。车型标签页支持方向键、Home、End；提供可见键盘焦点、至少 44px 的主要操作目标，并响应减少动态效果与强制色彩设置。


## WSK 品牌历史页

品牌全称：World Super Kinetic。首页车标旁的“了解我们”链接跳转至 `dist/about.html`，附有返回首页和探索车型链接。页内历程使用概念叙事，没有虚构具体成立年份或真实经营事件。

两张新增图片使用内置 imagegen 生成，保存于 `dist/assets/history-atelier.png` 和 `dist/assets/history-road.png`。

最终提示词 1：Automotive luxury brand editorial photography for WSK World Super Kinetic brand history webpage. Wide landscape 16:9 photograph: quiet minimalist automotive design atelier, large physical scale model of an elegant silver electric grand touring sedan on a pale concrete worktable, pencil car sketches and clay sculpting tools in foreground, floor to ceiling windows, warm morning sun, tactile clay prototype at far side, refined thoughtful industrial craftsmanship, cinematic architectural photography, no people, no text, no visible logos, no watermark. Muted warm ivory and graphite palette, realistic materials and believable proportions. This is a concept brand origin visual.

最终提示词 2：Luxury automotive brand WSK World Super Kinetic concept brand history editorial image. Wide landscape 16:9 photograph: elegant pearl silver low electric grand touring sedan with thin double LED headlamps, smooth flowing body, graphite aerodynamic wheels, subtle abstract W chrome hood emblem; front three quarter view facing left, driving on a sweeping coastal road in the Scottish highlands, ocean left, distant mountains, soft dawn sunlight, silver car takes right lower half of frame, spacious atmospheric composition, cinematic expensive campaign photography, authentic restrained natural color, no text no watermark no other brand logos. Story theme: from an idea to open roads and new horizons.

## 车头车标修订

品牌历程页的公路图片已更新为 `dist/assets/history-road-wsk.png`，使用内置 imagegen 按用户提供的原始银色 W 车标进行局部替换。原图保留。

最终提示词：Use case: precise-object-edit. Image 1 is the edit target. Image 2 is the exact replacement brand emblem reference. Modify ONLY the small chrome badge on the front hood of the silver car in Image 1, centered between the headlamps just above the front hood seam (approximately x810,y545 in the 1672x941 image). Completely remove the existing angular V/wing badge and replace it with the EXACT flowing cursive W-shaped chrome emblem from Image 2, faithfully retaining its long tapering rightward stroke and rounded flowing loops. Extract only the silver shape, do not include its dark square background. Fit the replacement naturally at the original badge location, roughly 55 pixels wide, with hood perspective, subtle contact shadow and realistic chrome reflections. Keep the original image framing, dimensions, car body, headlights, wheels, reflections, coastal road, mountains, ocean and sunset unchanged. Do not redesign or redraw other parts. No text, no watermark.

## 独立车型页与品牌设计区

`dist/models.html` 提供 WSK GT 纯电轿跑、WSK X 家庭 SUV 和 WSK S 都市掀背车三款概念车型，可筛选、切换、两车对比并演示预约。所有“探索车型”导航及首页车型详情入口均指向独立车型页。首页车型缩略图亦使用各自独立图片。

新增图片以原始车标与既有 GT 设计为参考，使用内置 imagegen 生成，最终提示词见 `image-prompts.json`。设计分类调研来源：https://www.nio.com/et5 、https://www.zeekrlife.com/global/vehicles/7x 。借鉴车型类别与展示逻辑，未冒用真实品牌产品、价格与性能数据。

首页设计区背景色 #181B24 来自用户原车标图片底部取色；图片以 contain 完整显示，以 lighten 混合背景，避免左侧标志裁切。白色及浅灰文字用于保持深色背景上的可读性。
