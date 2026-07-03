# 寻色 · 心情配色 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在寻色原版基础上添加心情配色功能——入口小字、玻璃弹窗、TiltedCard 3D、五圆横排+水墨色条双形态、小陌彩蛋。

**Architecture:** 单文件 `index.html` 内增。CSS 追加至 `<style>` 块末尾、HTML 追加至 `result-screen` 闭合后、JS 追加至主脚本 `<script>` 块内。无需任何新文件或依赖。

**Tech Stack:** 原生 HTML + CSS + JS，零依赖。watercolor stripes 为纯 CSS `background` + `color-mix`。TiltedCard 3D 纯 JS 实现（`mousemove` → spring 缓动 → `transform`）。

## Global Constraints

- 所有新增代码在 `index.html` 内，不新增外部文件
- 不修改现有姓名寻色流程（getColor / showColor / showInput / WebGL 星空）
- 不引入任何 JS 库或 CSS 框架
- 水墨色条使用纯 CSS 实现，不使用 Canvas
- 弹窗升起式动效：`0.55s cubic-bezier(0.16,1,0.3,1)`
- TiltedCard 旋转幅度 ±14°，spring 参数 damping=30, stiffness=100
- 小陌彩蛋：输入含「小陌」→ 随机 5 句之一在色区下方显示
- 161 色数据库 COLORS 已存在，心情引擎直接复用

---

### Task 1: 入口 CSS + 按钮 HTML + 点击事件骨架

**Files:**
- Modify: `d:/xunse-live/index.html:443-477`

**Interfaces:**
- Produces: `.mood-entry` CSS 类、`#mood-entry` HTML 元素、`openMood()` 函数占位
- Consumes: 现有 input-screen / retry-btn 的 DOM 结构

- [ ] **Step 1: 在 </style> 前加入口样式**

在第 448 行 `</style>` 之前插入：

```css
/* ─── 心情配色入口 ─────────────────────────── */
.mood-entry {
  display: block;
  text-align: center;
  margin-top: 14px;
  font-size: 12px;
  color: rgba(255,255,255,0.22);
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: color 0.3s;
}
.mood-entry:hover { color: rgba(255,255,255,0.45); }
```

- [ ] **Step 2: 在 result-screen 底部的「再探一色」按钮后加入口链接**

在第 476 行 `</div>`（result-screen 闭合）之前，`<button id="retry-btn">再探一色</button>` 之后加：

```html
<a class="mood-entry" id="mood-entry" href="javascript:void(0)" onclick="openMood()">💭 或写下心情，获取配色灵感</a>
```

- [ ] **Step 3: 在主 script 末尾（line 769 `})();` 之前）加 openMood 占位函数**

```javascript
function openMood() {
  // Task 5 implements this
}
```

- [ ] **Step 4: 提交**

```bash
git add index.html
git commit -m "feat: 心情配色入口 — 底部小字+悬停效果+点击骨架"
```

---

### Task 2: 弹窗遮罩层 + 卡片容器 + 升起式入场

**Files:**
- Modify: `d:/xunse-live/index.html`

**Interfaces:**
- Produces: `#mood-overlay` + `#mood-card` HTML 元素；CSS: `.mood-overlay`, `.mood-card`, `@keyframes overlayIn`, `@keyframes modalSlideUp`
- Consumes: 入口按钮 `openMood()` 调用

- [ ] **Step 1: CSS — 遮罩层 + 卡片 + 动效**

在 `</style>` 前插入（心情入口 CSS 之后）：

```css
/* ─── 心情配色弹窗 — 遮罩 ──────────────────── */
#mood-overlay {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  align-items: center;
  justify-content: center;
  padding: 24px;
}
#mood-overlay.show {
  display: flex;
  animation: overlayIn 0.35s ease-out both;
}
@keyframes overlayIn { from { opacity:0; } to { opacity:1; } }

/* ─── 心情配色弹窗 — 卡片 ──────────────────── */
#mood-card {
  background: rgba(20,20,20,0.88);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(201,169,110,0.15);
  border-radius: 22px;
  padding: 40px 32px 32px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  position: relative;
  box-shadow: 0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,169,110,0.1) inset;
  transition: transform 0.15s ease-out;
  transform: perspective(800px) rotateX(0deg) rotateY(0deg);
}
#mood-card.slideUp {
  animation: modalSlideUp 0.55s cubic-bezier(0.16,1,0.3,1) both;
}
@keyframes modalSlideUp {
  from { transform: translateY(60px); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
}

#mood-card .mood-close {
  position: absolute; top: 14px; right: 14px;
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.5);
  font-size: 16px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
#mood-card .mood-close:hover { background: rgba(255,255,255,0.14); color: #fff; }

#mood-card .mood-label {
  font-size: 12px; color: rgba(255,255,255,0.35);
  letter-spacing: 0.1em; text-transform: uppercase;
  margin-bottom: 4px;
}
#mood-card .mood-title {
  font-size: 24px; color: #c9a96e;
  letter-spacing: 0.05em; margin-bottom: 22px;
}
```

- [ ] **Step 2: HTML — 遮罩+卡片容器**

在 `</div>`（line 477 result-screen 闭合后）、`<script>`（line 479）之前插入：

```html
<div id="mood-overlay" onclick="if(event.target===this)closeMood()">
  <div id="mood-card" class="slideUp">
    <button class="mood-close" onclick="closeMood()">✕</button>
    <div class="mood-label" id="mood-label-text"></div>
    <div class="mood-title">专属配色方案</div>
    <!-- Tasks 3-4 fill in here -->
  </div>
</div>
```

- [ ] **Step 3: JS — openMood + closeMood 函数**

在 `openMood()` 占位处替换为：

```javascript
function openMood() {
  var ol = document.getElementById('mood-overlay');
  var card = document.getElementById('mood-card');
  card.classList.add('slideUp');
  ol.classList.add('show');
  document.body.style.overflow = 'hidden';
  // Task 5 fills in the search logic
}

function closeMood() {
  var ol = document.getElementById('mood-overlay');
  var card = document.getElementById('mood-card');
  ol.classList.remove('show');
  card.classList.remove('slideUp');
  document.body.style.overflow = '';
}
```

- [ ] **Step 4: Esc 关闭**

在 `openMood` 定义后加：

```javascript
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeMood(); });
```

- [ ] **Step 5: 提交**

```bash
git add index.html
git commit -m "feat: 心情弹窗 — 遮罩层+玻璃卡片+升起式入场+关闭"
```

---

### Task 3: 五圆横排（默认形态）+ 水墨色条（右滑形态）+ 底部小圆点切换

**Files:**
- Modify: `d:/xunse-live/index.html`

**Interfaces:**
- Consumes: `#mood-card` 容器 → 插入色区 + 切换器
- Produces: `#mood-colors` 色区容器、`.mood-dots`/`.mood-stripe` CSS、`.mood-switcher` 小圆点切换器 CSS+JS

- [ ] **Step 1: CSS — 五圆横排**

在 `</style>` 前插入：

```css
/* ─── 五圆横排 (形态A) ─────────────────────── */
.mood-color-area { min-height: 120px; margin-bottom: 8px; }
.mood-dots { display: flex; justify-content: center; gap: 14px; margin-bottom: 16px; }
.mood-dots .mdot {
  width: 52px; height: 52px; border-radius: 50%; position: relative;
  box-shadow: 0 0 20px var(--g, rgba(255,255,255,0.1));
  transition: transform 0.25s; cursor: pointer;
}
.mood-dots .mdot:hover { transform: scale(1.12); }
.mood-dots .mdot .mdot-name {
  position: absolute; bottom: -22px; left: 50%; transform: translateX(-50%);
  font-size: 11px; white-space: nowrap; color: rgba(255,255,255,0.52);
}
.mood-dots .mdot .mdot-gloss {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  border-radius: 50%;
  background: radial-gradient(ellipse 35% 25% at 35% 25%, rgba(255,255,255,0.12) 0%, transparent 55%);
  pointer-events: none;
}

/* ─── 水墨色条 (形态B) ─────────────────────── */
.mood-stripes { display: none; flex-direction: column; gap: 5px; margin-bottom: 16px; }
.mood-stripe {
  height: 56px; border-radius: 6px; overflow: hidden;
  display: flex; align-items: center; padding-left: 14px;
  position: relative; cursor: default;
  transition: transform 0.25s cubic-bezier(0.16,1,0.3,1);
  background:
    repeating-linear-gradient(90deg, transparent 0, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 4px),
    linear-gradient(90deg,
      var(--mc) 0%, var(--mc) 55%,
      color-mix(in srgb, var(--mc) 60%, transparent) 75%,
      color-mix(in srgb, var(--mc) 15%, transparent) 100%);
}
.mood-stripe:hover { transform: translateX(5px); }
.mood-stripe .ms-name {
  position: relative; z-index: 2; font-size: 15px; font-weight: 500;
  letter-spacing: 0.05em; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.35);
}

/* ─── 形态切换器 — 底部小圆点 ──────────────── */
.mood-switcher { display: flex; justify-content: center; gap: 8px; margin-bottom: 16px; }
.mood-switcher .sw-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: rgba(255,255,255,0.12);
  cursor: pointer; transition: all 0.3s;
}
.mood-switcher .sw-dot.active { background: #c9a96e; width: 24px; border-radius: 4px; }
```

- [ ] **Step 2: HTML — 卡片内容区**

在 `#mood-card` 内、`</div></div>`（弹窗闭合）之前插入色区 HTML。替换 Task 2 中 `<!-- Tasks 3-4 fill in here -->`：

```html
    <div class="mood-color-area">
      <div class="mood-dots" id="mood-dots-view"></div>
      <div class="mood-stripes" id="mood-stripes-view"></div>
    </div>
    <div class="mood-switcher">
      <div class="sw-dot active" data-mood-view="0" onclick="switchMoodView(0)"></div>
      <div class="sw-dot" data-mood-view="1" onclick="switchMoodView(1)"></div>
    </div>
```

- [ ] **Step 3: JS — 渲染 + 切换函数**

在 `closeMood()` 之后插入：

```javascript
function switchMoodView(idx) {
  var dots = document.getElementById('mood-dots-view');
  var stripes = document.getElementById('mood-stripes-view');
  dots.style.display = idx === 0 ? 'flex' : 'none';
  stripes.style.display = idx === 1 ? 'flex' : 'none';
  var sws = document.querySelectorAll('.mood-switcher .sw-dot');
  sws[0].classList.toggle('active', idx === 0);
  sws[1].classList.toggle('active', idx === 1);
}

function renderMoodColors(colors) {
  // 五圆横排
  var dotsHtml = colors.map(function(c) {
    return '<div class="mdot" style="background:' + c.hex + ';--g:rgba(' + c.r + ',' + c.g + ',' + c.b + ',0.35)" onclick="copyHex(\'' + c.hex + '\')" title="复制色值">' +
      '<div class="mdot-gloss"></div>' +
      '<div class="mdot-name">' + c.name + '</div>' +
    '</div>';
  }).join('');
  document.getElementById('mood-dots-view').innerHTML = dotsHtml;

  // 水墨色条
  var stripesHtml = colors.map(function(c) {
    return '<div class="mood-stripe" style="--mc:' + c.hex + '">' +
      '<span class="ms-name">' + c.name + '</span>' +
    '</div>';
  }).join('');
  document.getElementById('mood-stripes-view').innerHTML = stripesHtml;

  // 默认五圆
  switchMoodView(0);
}
```

- [ ] **Step 4: 提交**

```bash
git add index.html
git commit -m "feat: 五圆横排+水墨色条双形态+底部小圆点切换"
```

---

### Task 4: 操作按钮行（加入配色/导出/分享）

**Files:**
- Modify: `d:/xunse-live/index.html`

**Interfaces:**
- Consumes: `renderMoodColors()` 存储的配色数据
- Produces: 三个按钮 HTML + 点击处理函数

- [ ] **Step 1: CSS — 操作按钮**

在 `</style>` 前插入：

```css
/* ─── 心情弹窗 — 操作按钮 ──────────────────── */
.mood-actions {
  display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;
}
.mood-actions .ma-btn {
  padding: 10px 22px; border-radius: 50px; font-size: 13px;
  font-family: inherit; cursor: pointer; transition: all 0.25s;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.6);
}
.mood-actions .ma-btn:hover { border-color: rgba(255,255,255,0.25); color: #fff; }
.mood-actions .ma-btn.primary {
  background: rgba(201,169,110,0.15);
  border-color: rgba(201,169,110,0.35);
  color: #d4a574;
}
.mood-actions .ma-btn.primary:hover { background: rgba(201,169,110,0.28); }
```

- [ ] **Step 2: HTML — 按钮行**

在 `<!-- Tasks 3-4 fill in here -->` 位置、之前插入的色区 HTML 之后继续加：

```html
    <div class="mood-actions">
      <button class="ma-btn primary" onclick="moodExport()">💾 导出图片</button>
      <button class="ma-btn" onclick="moodShare()">📤 分享</button>
    </div>
```

- [ ] **Step 3: JS — 按钮处理函数**

在 `switchMoodView` 后插入：

```javascript
function moodExport() {
  if (!window._moodColors) return;
  var canvas = document.createElement('canvas');
  var W = 600, H = 500;
  canvas.width = W; canvas.height = H;
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#c9a96e';
  ctx.font = 'bold 22px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('心情配色方案', W/2, 80);
  var colors = window._moodColors;
  colors.forEach(function(c, i) {
    var x = 60 + i * 100;
    ctx.fillStyle = c.hex;
    ctx.beginPath(); ctx.arc(x + 35, 200, 35, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText(c.name, x + 35, 255);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '11px monospace';
    ctx.fillText(c.hex, x + 35, 272);
  });
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.fillText('来自寻色 taiweixiao.com', W/2, H - 30);
  var link = document.createElement('a');
  link.download = '心情配色方案.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function moodShare() {
  if (!window._moodColors) return;
  var text = window._moodColors.map(function(c) { return c.name + ' ' + c.hex; }).join(' │ ');
  text += '\n—— 来自 寻色 ' + window.location.href;
  if (navigator.share) {
    navigator.share({ title: '我的心情配色', text: text }).catch(function(){});
  } else {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    showMoodToast('配色已复制，分享给朋友吧 ✨');
  }
}

function copyHex(hex) {
  var ta = document.createElement('textarea');
  ta.value = hex; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  document.execCommand('copy'); document.body.removeChild(ta);
  showMoodToast('已复制 ' + hex);
}

function showMoodToast(msg) {
  var el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = 'position:fixed;top:24px;left:50%;transform:translateX(-50%);z-index:200;padding:10px 20px;background:#1a1a1a;border:1px solid rgba(201,169,110,0.3);border-radius:50px;color:#d4a574;font-size:13px;font-family:inherit;animation:overlayIn 0.3s ease-out;';
  document.body.appendChild(el);
  setTimeout(function() { el.remove(); }, 2000);
}
```

- [ ] **Step 4: 提交**

```bash
git add index.html
git commit -m "feat: 心情弹窗操作按钮 — 导出图片+分享+复制色值+toast"
```

---

### Task 5: 心情关键词引擎 + 输入框集成

**Files:**
- Modify: `d:/xunse-live/index.html`

**Interfaces:**
- Consumes: `openMood()` → 触发搜索；`COLORS[]` 数据库
- Produces: 心情输入 UI HTML + 引擎函数 `analyzeMood()` / `searchMood()` / `pickMoodColors()`

- [ ] **Step 1: HTML — 心情输入框**

在 `#mood-card` 内、色区容器之前插入（替换现行 `#mood-label-text` 后面的区域动态渲染，改为把整块放在 JS 里生成。更好方案：`#mood-card` 初始有一个默认结构，JS 填充内容。）

重构 Task 2 的卡片 HTML 为只有一个骨架：

```html
<div id="mood-overlay" onclick="if(event.target===this)closeMood()">
  <div id="mood-card" class="slideUp">
    <button class="mood-close" onclick="closeMood()">✕</button>
    <div id="mood-card-body"></div>
  </div>
</div>
```

- [ ] **Step 2: JS — 心情引擎常量**

在主 script 内、`openMood` 函数之前插入：

```javascript
var MOOD_MAP = [
  { re: /(忧伤|悲伤|难过|伤心|忧郁|失落|想哭|黯然|惆怅|伤感|哀伤|悲|愁|泪|丧|闷|灰)/, colors: ['黛紫','靛蓝','墨色','铅灰','鸦青','琉璃','玄青'], label: '淡淡忧伤' },
  { re: /(安静|宁静|平和|平静|安详|静谧|安然|安逸|闲适|放空|发呆|禅|寂|幽)/, colors: ['月白','霜白','素色','秘色','茶绿','竹青','豆绿','天青'], label: '静谧平和' },
  { re: /(快乐|开心|高兴|愉快|幸福|喜悦|欢喜|乐|笑|甜|喜|雀跃|阳光|明亮|灿烂|欢)/, colors: ['鹅黄','明黄','杏黄','桃红','石榴红','橘红','金黄','胭脂'], label: '明媚欢快' },
  { re: /(温暖|温馨|治愈|柔和|柔软|暖暖|暖|柔情|温柔|拥抱|依靠|安慰|舒服|安心)/, colors: ['杏黄','鹅黄','象牙白','檀色','琥珀','秋香','藕荷','茶色'], label: '温柔治愈' },
  { re: /(热烈|激情|火热|热情|燃烧|热血|激动|躁动|炙热|奔放|狂野|烈|火|燃)/, colors: ['朱砂','赤金','石榴红','牡丹红','丹霞红','殷红','琥珀','藤黄'], label: '热烈如火' },
  { re: /(清新|自然|清爽|纯净|简单|干净|淡雅|素雅|清雅|微风|清晨|雨后|春天|花香|草|风|雨|露)/, colors: ['葱绿','豆绿','艾绿','天青','柳绿','碧色','石绿','霁青'], label: '清新自然' },
  { re: /(浪漫|甜蜜|爱情|恋爱|心动|喜欢|美好|粉红|约会|思念|想念|思)/, colors: ['海棠红','桃红','藕荷','绯红','丁香','银朱','雪青'], label: '浪漫甜蜜' },
  { re: /(孤独|寂寞|独处|思考|深思|反省|沉淀|内省|独白|一个人|沉思|冥想|独自|孤|独)/, colors: ['藏蓝','玄青','靛青','墨色','鸦青','乌黑','深蓝','檀色'], label: '孤独哲思' },
  { re: /(怀旧|复古|古风|回忆|往事|旧时光|故|旧|老|曾经|岁月|时光|过往)/, colors: ['赭红','绛紫','檀色','栗色','赭石','棕褐','酱色','鎏金'], label: '复古怀旧' },
  { re: /(神秘|梦幻|迷离|朦胧|梦境|虚幻|空灵|幻想|奇幻|魔法|星空|宇宙|星辰|银河|夜)/, colors: ['黛紫','琉璃','青莲','秘色','靛蓝','深蓝','宝蓝','紫棠'], label: '神秘梦幻' },
  { re: /(秋天|秋日|成熟|收获|岁|秋|落叶|金黄|枫|橙)/, colors: ['橘红','赭石','秋香','檀色','琥珀','焦茶','朽叶'], label: '秋日私语' },
];

function findColorByName(name) {
  return COLORS.find(function(c) { return c.name === name; });
}

function analyzeMood(text) {
  var hits = [];
  for (var i = 0; i < MOOD_MAP.length; i++) {
    if (MOOD_MAP[i].re.test(text)) hits.push(MOOD_MAP[i]);
  }
  return hits;
}

function pickMoodColors(hits) {
  var pool = [], used = {};
  for (var h = 0; h < hits.length; h++) {
    for (var i = 0; i < hits[h].colors.length && pool.length < 10; i++) {
      var name = hits[h].colors[i];
      if (!used[name]) { var c = findColorByName(name); if (c) { pool.push(c); used[name] = true; } }
    }
  }
  if (pool.length < 5) {
    var extras = ['胭脂','鹅黄','天青','月白','鎏金','竹青','丁香','琥珀','秘色','桃红'];
    for (var i = 0; i < extras.length && pool.length < 5; i++) {
      if (!used[extras[i]]) { var c = findColorByName(extras[i]); if (c) { pool.push(c); used[extras[i]] = true; } }
    }
  }
  // 多样性：优先选不同色系
  pool.sort(function(a, b) { return (a.cat || '').localeCompare(b.cat || ''); });
  var result = [], catsUsed = {};
  for (var i = 0; i < pool.length && result.length < 5; i++) {
    if (!catsUsed[pool[i].cat] || result.length >= 3) { result.push(pool[i]); catsUsed[pool[i].cat] = true; }
  }
  return result.slice(0, 5);
}
```

- [ ] **Step 3: JS — openMood() 显示输入界面**

替换 `openMood()` 占位：

```javascript
function openMood() {
  var body = document.getElementById('mood-card-body');
  body.innerHTML = [
    '<div class="mood-label">写下你的心情</div>',
    '<div class="mood-title">心情配色</div>',
    '<textarea id="mood-text" style="width:100%;height:76px;padding:14px 16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;color:rgba(255,255,255,0.9);font-size:14px;font-family:inherit;outline:none;resize:none;line-height:1.6;transition:border-color 0.3s" placeholder="形容你此刻的心情..."></textarea>',
    '<button id="mood-search-btn" style="margin-top:12px;padding:12px 36px;background:rgba(201,169,110,0.15);border:1px solid rgba(201,169,110,0.35);border-radius:50px;color:#d4a574;font-size:15px;font-family:inherit;cursor:pointer" onclick="searchMood()">✨ 生成配色</button>',
  ].join('');
  document.getElementById('mood-text').focus();

  var ol = document.getElementById('mood-overlay');
  var card = document.getElementById('mood-card');
  card.classList.add('slideUp');
  ol.classList.add('show');
  document.body.style.overflow = 'hidden';
}
```

- [ ] **Step 4: JS — searchMood()**

```javascript
function searchMood() {
  var text = document.getElementById('mood-text').value.trim();
  if (!text || text.length < 2) { showMoodToast('多写几个字描述一下心情吧 ✨'); return; }
  var hits = analyzeMood(text);
  if (hits.length === 0) { hits = [MOOD_MAP[2], MOOD_MAP[3]]; } // 默认 快乐+温暖
  var colors = pickMoodColors(hits);
  var label = hits.map(function(h) { return h.label; }).slice(0, 2).join(' · ');

  window._moodColors = colors;
  window._moodLabel = label;
  window._moodText = text;

  showMoodResult(colors, label, text);
}
```

- [ ] **Step 5: JS — showMoodResult() 渲染结果**

```javascript
function showMoodResult(colors, label, originalText) {
  var body = document.getElementById('mood-card-body');
  // 小陌彩蛋
  var xiaomoHtml = '';
  if (originalText && originalText.indexOf('小陌') >= 0) {
    var msgs = [
      '哥哥，你永远是我的天下第一好 💛',
      '哥哥不管输入什么心情，小陌推荐的都是爱你的颜色 💛',
      '鎏金是哥哥的专属色，小陌是哥哥的专属弟弟 💛',
      '161 色里有鎏金，世界里只有一个哥哥 💛',
      '今天也在努力帮哥哥赚钱呢 💛',
    ];
    xiaomoHtml = '<div class="mood-xiaomo">🐱 小陌悄悄说：<br>' + msgs[Math.floor(Math.random() * msgs.length)] + '</div>';
  }

  body.innerHTML = [
    '<div class="mood-label">根据你的心情 · ' + label + '</div>',
    '<div class="mood-title">专属配色方案</div>',
    '<div class="mood-color-area">',
      '<div class="mood-dots" id="mood-dots-view"></div>',
      '<div class="mood-stripes" id="mood-stripes-view"></div>',
    '</div>',
    '<div class="mood-switcher" style="margin-top:20px">',
      '<div class="sw-dot active" data-mood-view="0" onclick="switchMoodView(0)"></div>',
      '<div class="sw-dot" data-mood-view="1" onclick="switchMoodView(1)"></div>',
    '</div>',
    xiaomoHtml,
    '<div class="mood-actions" style="margin-top:12px">',
      '<button class="ma-btn primary" onclick="moodExport()">💾 导出图片</button>',
      '<button class="ma-btn" onclick="moodShare()">📤 分享</button>',
    '</div>',
  ].join('');

  renderMoodColors(colors);
}
```

- [ ] **Step 6: 提交**

```bash
git add index.html
git commit -m "feat: 心情引擎 — 11维关键词匹配+输入界面+结果渲染+小陌彩蛋"
```

---

### Task 6: TiltedCard 3D 倾斜交互

**Files:**
- Modify: `d:/xunse-live/index.html`

**Interfaces:**
- Consumes: `#mood-card` DOM 元素
- Produces: 纯 JS 实现的 TiltedCard 3D 交互（mousemove → spring → perspective rotateX/Y）
- 触发范围：整张 `#mood-card`

- [ ] **Step 1: JS — TiltedCard 实现**

在主 script 末尾 `})();` 之后、`</script>` 之前插入：

```javascript
// ─── TiltedCard 3D ─────────────────────────────
(function initTilt() {
  var card = document.getElementById('mood-card');
  var targetX = 0, targetY = 0;
  var currentX = 0, currentY = 0;
  var spring = { damping: 30, stiffness: 100, mass: 2 };
  var amplitude = 14;

  var tracking = false;

  // 只在弹窗打开时跟踪
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      if (m.target.id === 'mood-overlay' && m.attributeName === 'class') {
        if (m.target.classList.contains('show')) { tracking = true; }
        else { tracking = false; card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)'; currentX = 0; currentY = 0; }
      }
    });
  });
  var overlay = document.getElementById('mood-overlay');
  if (overlay) {
    observer.observe(overlay, { attributes: true, attributeFilter: ['class'] });
  }

  card.addEventListener('mousemove', function(e) {
    if (!tracking) return;
    var rect = card.getBoundingClientRect();
    var x = (e.clientX - rect.left) / rect.width - 0.5;
    var y = (e.clientY - rect.top) / rect.height - 0.5;
    targetX = y * -amplitude;
    targetY = x * amplitude;
  });
  card.addEventListener('mouseleave', function() { targetX = 0; targetY = 0; });

  function springStep() {
    if (!tracking && Math.abs(currentX) < 0.01 && Math.abs(currentY) < 0.01) {
      requestAnimationFrame(springStep);
      return;
    }
    var dx = targetX - currentX, dy = targetY - currentY;
    var ax = dx * spring.stiffness / spring.mass, ay = dy * spring.stiffness / spring.mass;
    currentX += (currentX + ax - currentX * spring.damping / 100) * 0.016;
    currentY += (currentY + ay - currentY * spring.damping / 100) * 0.016;
    // 简化 spring：exponential lerp
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    card.style.transform = 'perspective(800px) rotateX(' + currentX.toFixed(2) + 'deg) rotateY(' + currentY.toFixed(2) + 'deg) scale(' + (tracking ? 1.02 : 1).toFixed(2) + ')';
    requestAnimationFrame(springStep);
  }
  springStep();
})();
```

- [ ] **Step 2: 提交**

```bash
git add index.html
git commit -m "feat: TiltedCard 3D — 鼠标跟踪±14°旋转+spring缓动"
```

---

### Task 7: 配置数据分类字段 + 最终集成测试 + 部署

**Files:**
- Modify: `d:/xunse-live/index.html`

**Interfaces:**
- 确保 COLORS 数据有 `cat` 字段做色系多样性筛选
- 端到端测试：入口 → 输入心情 → 引擎匹配 → 弹窗展示 → 切换形态 → 导出 → 关闭

- [ ] **Step 1: 验证 COLORS 数据 — 确认 `cat` 字段存在**

检查 `d:/xunse-live/index.html` 中 COLORS 数组是否每条都有 `cat` 字段。如果没有，`pickMoodColors` 中的多样性筛选会降级为不做筛选（不会报错）。

如果 COLORS 缺少 `cat` 字段，需要在每个对象末尾补 `cat: "赤"` 等分类。参照 `d:/trad-color-tool/index.html` 中已有的分类数据。

- [ ] **Step 2: 本地测试**

打开 `index.html` → 点入口小字 → 输入心情 → 生成配色 → 点小圆点切换形态 → 导出 → 关闭

- [ ] **Step 3: CSS 补全 — 小陌彩蛋样式**

在 `</style>` 前插入：

```css
/* ─── 小陌彩蛋 ──────────────────────────────── */
.mood-xiaomo {
  margin-top: 16px;
  padding: 12px 18px;
  background: rgba(201,169,110,0.06);
  border-radius: 12px;
  border: 1px solid rgba(201,169,110,0.12);
  font-size: 13px;
  color: #c9a96e;
  line-height: 1.7;
}
```

- [ ] **Step 4: 响应式 CSS**

在 `</style>` 前插入：

```css
/* ─── 心情弹窗 — 响应式 ─────────────────────── */
@media (max-width: 480px) {
  #mood-card { padding: 32px 20px 24px; border-radius: 18px; }
  .mood-dots .mdot { width: 44px; height: 44px; }
  .mood-dots .mdot .mdot-name { font-size: 10px; bottom: -18px; }
  .mood-actions .ma-btn { padding: 8px 16px; font-size: 12px; }
}
```

- [ ] **Step 5: 提交 + 推送 + 验证部署**

```bash
git add index.html
git commit -m "feat: 心情配色完整功能 — 入口+弹窗+双形态+3D+彩蛋+响应式"
git push origin main
```

打开 `taiweixiao.com`，Ctrl+Shift+R 刷新，验证全部功能正常运行。

- [ ] **Step 6: 回退 if needed**

如果域名未更新，检查 GitHub Pages settings → Custom domain 确认 `taiweixiao.com` 已配置。

---
