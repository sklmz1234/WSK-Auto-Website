// Shared concept information; no production price or performance data is published.
export const catalog = {
  "gt": {
    "name": "WSK GT",
    "category": "ELECTRIC GRAND TOURER",
    "tagline": "锋芒，藏于从容。",
    "description": "舒展的车身比例与流动的线条，为每一段远行，留下从容的姿态。",
    "paint": "珍珠银 · PEARL SILVER",
    "body": "流线轿跑",
    "journey": "长途漫游",
    "design": "优雅 · 从容",
    "detail": "低矮车身 / 舒展比例"
  },
  "x": {
    "name": "WSK X",
    "category": "ELECTRIC FAMILY EXPLORER",
    "tagline": "把日常，开向旷野。",
    "description": "高挑的车身、饱满的肩线与开阔的座舱构想，装下家人的日常，也装下周末的远方。",
    "paint": "松林绿 · FOREST GREEN",
    "body": "家庭 SUV",
    "journey": "家庭与户外",
    "design": "开阔 · 坚定",
    "detail": "高挑座舱 / 饱满轮廓"
  },
  "s": {
    "name": "WSK S",
    "category": "ELECTRIC URBAN HATCHBACK",
    "tagline": "轻盈，自在穿行。",
    "description": "紧凑的掀背轮廓与鲜明的冰川蓝，让灵感穿行于城市之间，为日常带来更多轻盈。",
    "paint": "冰川蓝 · GLACIER BLUE",
    "body": "都市掀背",
    "journey": "城市通勤",
    "design": "灵动 · 鲜明",
    "detail": "紧凑车身 / 短前后悬"
  }
};

// The three supplied photographs are selectable purchase concepts.
// Their descriptive names are provisional; powertrain and numeric specifications are unpublished.
export const purchaseCatalog = {
  ...catalog,
  track: {
    name: 'WSK 跑车',
    category: 'SPORTS COUPE CONCEPT',
    tagline: '让热爱，驶入弯道。',
    description: '蓝色车身、低矮轮廓与鲜明的侧面进气造型，勾勒赛道跑车的运动姿态。',
    paint: '赛道蓝 · TRACK BLUE',
    body: '赛道跑车',
    journey: '赛道与驾趣',
    design: '低矮 · 动感',
    detail: '流线车身 / 侧面进气造型',
    image: 'assets/gallery-track-blue.jpg',
    swatch: '#1385b5',
    powertrain: '待公布',
  },
  city: {
    name: 'WSK 轿车',
    category: 'CITY SEDAN CONCEPT',
    tagline: '在城市，遇见从容。',
    description: '香槟金车身与舒展的轿车比例，在城市夜色中呈现温润而简洁的设计表达。',
    paint: '香槟金 · CHAMPAGNE GOLD',
    body: '都市轿车',
    journey: '城市与日常',
    design: '舒展 · 温润',
    detail: '修长车身 / 贯穿灯带',
    image: 'assets/gallery-city-gold.jpg',
    swatch: '#b99a7d',
    powertrain: '待公布',
  },
  offroad: {
    name: 'WSK 越野',
    category: 'OFF-ROAD SUV CONCEPT',
    tagline: '下一程，不止于公路。',
    description: '深绿车身、方正轮廓与车顶行李架造型，带来面向户外探索的越野设计想象。',
    paint: '荒野绿 · WILDERNESS GREEN',
    body: '越野 SUV',
    journey: '户外与探索',
    design: '方正 · 硬朗',
    detail: '方正车身 / 车顶行李架',
    image: 'assets/gallery-desert-green.jpg',
    swatch: '#45534b',
    powertrain: '待公布',
  },
};
