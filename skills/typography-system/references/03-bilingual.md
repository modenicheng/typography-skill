# L3 · 两种文字：中英混排的度量与规则

中文和英文不是「同一套样式换一种语言」。汉字是等宽方块字，拉丁字母是比例字；一个撑满字身，一个集中在 x-height；一个可在任意字间断行，一个必须按词断行。把英文的排版参数直接套到中文上，就是「字都对，页面还是乱」的根因。

这一层按「选字体 → 定度量 → 处理标点与断行 → 处理数字与细节」的顺序展开。

## 1. 字体栈：拉丁在前，中文在后

原则：**拉丁字体负责拉丁字符，中文字体负责汉字，回退链按平台补齐。** 把中文字体放前面，会让英文也用到中文字体里附带的比例拉丁字形，通常偏窄、偏旧。

### 系统 UI 栈（推荐默认）

```css
--font-sans:
  -apple-system, BlinkMacSystemFont, "Segoe UI Variable Text", "Segoe UI",
  Roboto, "Helvetica Neue", Arial,
  "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei",
  "Noto Sans CJK SC", "Source Han Sans SC", "WenQuanYi Micro Hei",
  sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
```

- macOS / iOS：拉丁走 SF，汉字走 PingFang SC。
- Windows：拉丁走 Segoe UI，汉字走 Microsoft YaHei。
- Android：拉丁走 Roboto，汉字走 Noto Sans CJK。
- Linux：落到 Noto Sans CJK / 文泉驿。

优点：零加载、各平台原生观感。缺点：**字重与字形跨平台不一致**（见第 2 节），品牌感弱。

### 品牌一致性栈（产品需要跨平台同款）

```css
--font-brand:
  "Inter var", Inter, "Noto Sans SC", "Source Han Sans SC",
  "PingFang SC", "Microsoft YaHei", sans-serif;
```

Web 字体在前，保证所有平台先命中同一套字形；系统字体只做兜底。适合 SaaS、跨平台桌面工具、对外品牌页。

代价：中文字体文件大（见第 12 节），首屏要控制字重数量。

### 阅读衬线栈（长文、报告、品牌叙事）

```css
--font-serif:
  "Source Serif 4", "Noto Serif SC", "Source Han Serif SC",
  "Songti SC", "SimSun", serif;
```

宋体在屏幕小字号下笔画细、易发虚，**正文不小于 16px**，且只在阅读模式下使用。产品 UI 不要用衬线。

### 等宽栈（代码、ID、数值）

```css
--font-mono:
  ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas,
  "Liberation Mono", "Noto Sans Mono CJK SC", monospace;
```

中文注释在等宽字体里占两个字符宽，代码块中出现中文时对齐会偏移，属正常现象；不要为了对齐把中文注释改成全角空格。

## 2. 字重可用性：先查表，再写 600

| 字体 | 可用字重 | 后果 |
|---|---|---|
| PingFang SC（macOS/iOS） | 100/200/300/400/500/600 | 没有 700，700 会映射到 600 |
| Microsoft YaHei（Windows） | 300/400/700 | **500/600 会被映射为 400/700** |
| Noto Sans SC（Web，可变） | 100–900 连续 | 推荐用于跨平台一致 |
| Source Han Sans SC（Web） | 7 档（250–900） | 需按 unicode-range 子集化 |
| HarmonyOS Sans SC | 5 档左右 | 设备相关，不要当作通用 |
| MiSans | 多档 | 小米设备相关 |

因此：

- **中文正文的强调优先用 500**，而不是 600。视觉增量足够，且不会在雅黑上跳到 700。
- 需要 600 的标题，**必须确认目标平台有 600**；否则用 700 并接受更重的观感，或改用 Web 字体。
- 不要用 `font-synthesis: weight` 让浏览器伪造粗体：中文伪粗体会糊成一团。必要时 `font-synthesis-weight: none`，让回退到真实字重。
- 中文没有真正的斜体。`font-style: italic` 会触发伪斜体（机械倾斜），**禁止用于中文**。

## 3. 同字号下，中文看起来更大更重

原因是字面率：汉字占满 em 框，拉丁小写只占约 0.5em 高。16px 的中文和 16px 的英文并排，中文像 17–18px。

两种处理，按场景选：

| 做法 | 适用 | 说明 |
|---|---|---|
| **同字号，挑大 x-height 的拉丁**（推荐） | UI、正文、表格 | Inter、IBM Plex Sans、Source Sans 3、Public Sans 的 x-height 较大，与中文灰度更接近 |
| 拉丁放大 5% | 品牌字标、封面、锁定组合 | 需要单独包 `<span lang="en">`，不要用于正文（i18n 与换行都会变复杂） |

不要给每个英文单词套 span 调字号。**正文字号由中文决定，英文跟随**；显示层的字标可以手工调。

## 4. 行高：中文更松

| 字号 | 中文 | 英文 |
|---|---|---|
| 12 | 1.5（18px） | 1.33（16px） |
| 14 | 1.57（22px） | 1.43（20px） |
| 16 | 1.75（28px） | 1.5（24px） |
| 20 | 1.5（30px） | 1.4（28px） |
| 28 | 1.43（40px） | 1.29（36px） |
| 48 | 1.17（56px） | 1.08（52px） |

同一段落中英混排时，**按该段的主语言取值**；混合段落一律用中文值（更松的那个），英文多一点呼吸不会出错，反过来会挤。

行高用无单位倍数。若必须用 px（例如固定高度的工具条），取偶数，并接受它不随字号缩放。

## 5. 字距：中文归零

- 中文正文、标题：`letter-spacing: 0`。
- 英文正文：`0`；≤12px 可 `+0.01em`；≥28px 用 `-0.01 ~ -0.03em`；全大写标签 `+0.05 ~ +0.08em`。
- 混排容器不要统一设字距。需要时：

```css
.prose { letter-spacing: 0; }
.prose :lang(en) { letter-spacing: -0.01em; } /* 仅大字号场景 */
```

字距为负会让汉字笔画相撞，为正会让方块之间出现缝隙，两者都破坏「字阵」的整齐感。品牌字标可以例外，但要作为图形处理，不进入正文体系。

## 6. 标点：全角、禁则、挤压

### 6.1 用对符号

| 场景 | 正确 | 错误 |
|---|---|---|
| 句号/逗号/顿号 | 。，、 | . , （半角） |
| 分号/冒号 | ；： | ; : |
| 引号（大陆） | “ ” ‘ ’ | " " ' ' |
| 引号（港台/直排） | 「」『』 | “” |
| 省略号 | ……（两个 U+2026） | ... / 。。。 |
| 破折号 | ——（两个 U+2014） | -- / — |
| 间隔号 | ·（U+00B7） | . |
| 书名号 | 《》〈〉 | <> |

### 6.2 禁则（行首行尾）

- **不能出现在行首**：`，。、；：！？）》」』】〕〉` 以及 `%‰℃`。
- **不能出现在行尾**：`（《「『【〔〈`。
- 数字与单位、百分号与数字之间不要断行：用不换行空格（`&nbsp;`）或 `white-space: nowrap` 包住「20 kg」「30%」。
- 破折号与省略号不可拆成两行。

CSS：

```css
.prose {
  line-break: strict;          /* 收紧禁则 */
  word-break: normal;          /* 不要 break-all */
  overflow-wrap: break-word;   /* 长 URL / 长英文词兜底 */
  text-spacing-trim: normal;   /* 折叠相邻标点，渐进增强 */
}
```

`line-break: strict` 在多数浏览器已生效；`text-spacing-trim` 尚未跨浏览器可用（Chromium 支持较好，Safari/Firefox 可能忽略），不影响可读性。需要更紧的版面时再换 `trim-start`（行首开括号压半宽）。

### 6.3 标点挤压

全角标点自带半侧空白。连续出现时（`）。`、`」，`），会多出半字宽的空洞。`text-spacing-trim: trim-start` 会把行首开括号压成半宽，并折叠相邻标点的内部空白；`normal` 也会折叠相邻标点。没有该属性时，不要手工删空格——会破坏复制与检索。

### 6.4 标点与空格

- 全角标点前后**不加空格**。
- 中文与英文/数字之间**需要约 1/4 字宽**（见下节），但标点旁不加。
- 括号内不额外加空格：「（示例）」不是「（ 示例 ）」。

## 7. 中西文间距：交给 CSS，不要手打空格

clreq 建议汉字与西文之间留出约 1/4 个汉字宽的间隙。三种实现：

| 方式 | 做法 | 评价 |
|---|---|---|
| CSS 标准 | `text-autospace: normal` | 首选；不改文案，复制检索不受影响；2025 年底进入 Baseline |
| 手打空格 | 「使用 Figma 设计」 | 可行但不稳定：中英切换、换行、复制都会出问题，UI 文案禁用 |
| 细空格 | `&thinsp;` / `\u2009` | 比普通空格精确，但仍污染文本内容 |

```css
:lang(zh) { text-autospace: normal; }
/* 需要更细的控制时 */
:lang(zh) { text-autospace: ideograph-alpha ideograph-numeric; }
```

注意：

- 支持该属性的浏览器，初始值就是 `normal`；显式声明的作用是表明意图并防止被全局样式关掉。
- 不支持的浏览器不会报错，只是没有这道间隙。若某段文案（如品牌标题）必须要有间隙，用细空格 `&thinsp;` 单独处理，不要全局手打。
- `text-autospace` 与 `word-spacing`、`letter-spacing` 叠加，不要把 word-spacing 设成负值来「抵消」。
- 显式空格存在时，浏览器不会重复插入；所以历史文案里的手打空格不会变成双倍间距。
- 行首行尾不产生间距。

## 8. 断行：中文按字，英文按词

- 中文默认可在任意汉字间断行，这是正确行为；不要为了「按词换行」插入 `<br>` 或零宽空格。
- 英文按词断行；`hyphens: auto` 只在长文且 `lang="en"` 时启用，标题禁用。
- `word-break: break-all` **禁止**用于中英混排：它会把英文单词从中间切断。
- 容器过窄时用 `overflow-wrap: anywhere`（会断长词）或 `text-overflow: ellipsis`（截断）。
- `text-wrap: balance` 用于标题（≤6 行），`text-wrap: pretty` 用于段落，减少孤字与最后一行过短。
- `word-break: auto-phrase` 目前主要支持日文，不要指望它处理中文分词。

孤行控制：Web 上 CSS `orphans`/`widows` 支持有限，主要靠 `text-wrap: pretty` 与手动调整容器宽度。

## 9. 数字、单位、日期

| 类型 | 规则 | 示例 |
|---|---|---|
| 数字 | 一律半角；不要全角数字 | `1,234` 不是 `１２３４` |
| 千分位 | 四位以上加逗号；本地化场景可用万/亿 | `1,234,567.89` / `123.5 万` |
| 小数 | 用 `.`，不用 `，` | `0.05` |
| 百分比 | 数字与 `%` 之间不加空格 | `30%` |
| 单位 | 数字与单位之间加空格（SI） | `20 kg`、`100 km/h` |
| 温度 | 数字与 °C 之间加空格 | `25 °C` |
| 货币 | 符号贴数字，千分位；币种明确 | `¥1,234.00`、`$1,234.00` |
| 日期（UI） | ISO 8601 | `2026-11-20` |
| 日期（正文） | 中文习惯 | `2026 年 11 月 20 日` |
| 时间 | 24 小时制，冒号 | `14:30` |
| 区间 | 连接号，不重复单位 | `2026-11-20—11-30` |
| 负数 | 用减号，不用全角横 | `-0.05%` |

表格中的数字：`font-variant-numeric: tabular-nums lining-nums`，右对齐；小数位数对齐；单位放在表头而不是每个单元格。

## 10. 强调：中文没有斜体

| 手段 | 中文 | 英文 |
|---|---|---|
| 字重 | 400 → 500（首选） | 400 → 600 |
| 颜色 | 主色/强调色 | 同 |
| 着重号 | `text-emphasis: dot` | 不用 |
| 引号 | 「」/“” 标示术语 | “” |
| 下划线 | 仅链接 | 仅链接 |
| 斜体 | **禁止**（伪斜体） | 可用于书名、术语，少量 |

`text-emphasis` 在中文里是正当的强调方式，但 Web 支持一般（Chrome/Safari 可用），且会增加行高；只用于正文中的个别词。

## 11. 截断与省略

- 单行截断：`overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`，浏览器会使用 `…`。
- 多行截断：`-webkit-line-clamp` + `display: -webkit-box`，行数写死，并给 `title` 或 tooltip 展示全文。
- **不要截断**：页面标题、表单标签、错误信息、按钮文案、面包屑当前项。
- 导航项中文 4–6 字、表格单元格 12–16 字开始考虑截断；英文按 2–3 个词。
- 截断会吃掉「…”」这类标点，预留宽度时多给 1em。

## 12. 字体加载与回退

中文字体文件远大于拉丁字体：

- 一个完整字重 3–10 MB；按常用 3500 字子集化后约 1–2 MB（woff2）。
- 产品 UI 优先用系统字体；Web 字体只用于品牌/标题，或确实需要跨平台一致时。
- 必须用 `unicode-range` 分包（常用字、扩展字分开），否则首屏会等一个大文件。
- `font-display: swap` 用于正文，`optional` 用于展示字（避免布局跳动）。
- 用 `size-adjust`、`ascent-override`、`descent-override` 定义 fallback 的 `@font-face`，让回退字体与原字体占位接近。
- 只 preload 首屏用到的那一个字重。

```css
@font-face {
  font-family: "Noto Sans SC";
  src: url("/fonts/noto-sans-sc-400.woff2") format("woff2");
  font-weight: 400;
  font-display: swap;
  unicode-range: U+4E00-9FFF, U+3000-303F, U+FF00-FFEF;
}

@font-face {
  font-family: "Noto Sans SC Fallback";
  src: local("PingFang SC"), local("Microsoft YaHei");
  size-adjust: 100%;
  ascent-override: 88%;
  descent-override: 12%;
}
```

验收时**禁用 Web 字体**再看一遍：布局不应跳动，行高不应塌陷。

## 13. 竖排（仅港台/设计场景）

- `writing-mode: vertical-rl`；行序从右到左。
- 拉丁字母默认旋转 90°（`text-orientation: mixed`）；2–3 位的数字/缩写可用 `text-combine-upright: all` 保持正立。
- 标点位置与横排不同：句读点在字面右上，开括号在右上、闭括号在左下；不要复用横排的 padding。
- 注音用 `<ruby>`，`ruby-position: over`。
- 大多数产品 UI 不需要竖排；需要时单独做一套组件，不要用 transform 硬转。

## 14. 双语与本地化

- `<html lang="zh-CN">`；英文片段加 `lang="en"`，让断词、引号、字体回退正确。
- 不要把句子拆成片段拼接（「共」+ n + 「项」），用 ICU MessageFormat。
- 中文通常比英文短，英文比中文长 20–40%；按钮、标签、导航按英文长度预留。
- 不要在文案里写死换行；让 CSS 处理。
- 不要用图片承载文字；无法缩放、无法翻译、无法检索。
- 双语切换后检查：按钮是否换行、标签是否截断、表格列宽是否跳动。

## 15. 检查表

- [ ] 字体栈拉丁在前、中文在后，且覆盖 macOS / Windows / Android。
- [ ] 中文强调用 500 而非 600；没有伪粗体与伪斜体。
- [ ] 中文正文行高 ≥1.6；英文 ≥1.45；混排段落取中文值。
- [ ] 中文正文 `letter-spacing: 0`。
- [ ] 全角标点正确；无行首标点；省略号与破折号是双字符。
- [ ] 中西文间距由 `text-autospace` 处理，UI 文案里没有手打空格。
- [ ] 没有 `word-break: break-all`；长英文词有兜底。
- [ ] 数字半角、表格等宽、单位有空格、日期 ISO。
- [ ] 截断只发生在允许截断的位置，且有查看全文的方式。
- [ ] 禁用 Web 字体后布局不跳。
