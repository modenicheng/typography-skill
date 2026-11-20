# L8 · 来源：读了什么，取哪一段，哪里要打折扣

抓取与核对时间：2026-11-20。以下为改写与提炼，不是原文转载；数值以各系统当前文档为准。

## 1. 设计系统

### Ant Design — Font

- 链接：https://ant.design/docs/spec/font/
- 中文源文：https://github.com/ant-design/ant-design/blob/master/docs/spec/font.zh-CN.md
- 取什么：
  - 字体栈的写法（系统字体优先，Emoji 兜底）。
  - 主字号 14px，行高 22px 的推导（显示器阅读距离 50cm、视角 0.3°）。
  - **字阶控制在 3–5 种**；「少即是多」；「让字体像音符一样跳跃」。
  - 字重只用 400/500，英文加粗用 600。
  - 数字用 `tabular-nums`；正文对比度 7:1（AAA）。
- 打折扣：Ant 的字阶是为中后台调的，营销页需要更激进的跳级；它的 14px 主字号不适合长文阅读。

### IBM Carbon — Typography

- 链接：https://www.carbondesignsystem.com/building-blocks/foundations/typography/overview
- 类型集：https://www.carbondesignsystem.com/building-blocks/foundations/typography/type-sets
- 取什么：
  - **Productive（工作型）与 Expressive（表达型）两套字阶**：前者 14px 基数、紧凑；后者 16px 基数、可用于长文与营销。
  - 单一方程生成的 12–92px 字阶（12/14/16/18/20/24/28/32/36/42/48/54/60/68/76/84/92）。
  - 12px 标签/代码用 +0.32px 字距；14px 用 +0.16px；16px 起归零。
  - 标题 03 级以上用 Regular 而非 Bold（大字号下 IBM Plex 本身够重）。
  - 字重建议：Light / Regular / SemiBold；SemiBold 不用于长文。
- 打折扣：Carbon 的字距是为 IBM Plex 调的，换成 Inter/思源黑体要重调；它的 heading 用 Regular 不符合多数中文产品的习惯（中文大标题通常仍要 500/600）。

### Microsoft Fluent 2 — Typography

- 链接：https://fluent2.microsoft.design/typography/
- 取什么：
  - Windows 桌面以 **14/20** 为正文基线；Caption 12/16；Body Strong 14/20 600；Body Large 18/24；Subtitle 20/28；Title 28/36；Title Large 40/52；Display 68/92。
  - 平台各自的 Type Ramp，不要跨平台搬运 px。
- 说明：该站点是前端渲染，正文难以直接抓取；上述 ramp 与 Fluent UI / WinUI 的公开类型 ramp 交叉核对过。
- 打折扣：Fluent 的 Segoe UI 在中文环境会回退到微软雅黑，字重只有 300/400/700，600 会失真——这正是本 skill 强调「中文强调用 500」的原因。

### Apple — Human Interface Guidelines: Typography

- 链接：https://developer.apple.com/design/human-interface-guidelines/typography
- 取什么：
  - iOS 字阶：Large Title 34/41、Title1 28/34、Title2 22/28、Title3 20/25、Headline 17/22 Semibold、Body 17/22、Callout 16/21、Subheadline 15/20、Footnote 13/18、Caption1 12/16、Caption2 11/13。
  - **层级不只靠字号**：字重、颜色、留白同样有效。
  - Dynamic Type：文字必须跟随系统字号缩放；布局要能容纳更大字号。
  - 文本截断、缩放、多语言的适配建议。
- 打折扣：Apple 的 pt 值不能直接当 Web px；iOS 的 17pt 正文在 Web 上通常对应 16–17px，但桌面 Web 不需要这么大。

## 2. 可读性与无障碍

### USWDS — Typography

- 链接：https://designsystem.digital.gov/components/typography/
- 取什么：
  - 正文有效字号 ≥16px；更小的字号只用于 caption、脚注、表格等。
  - 行宽 45–90 字符，长文目标 66 字符。
  - 长文行高 ≥1.5；标题 1.0–1.35。
  - 标题上方留白 ≥ 下方 1.5 倍。
  - 小字可加字距；大字可负字距；全大写必须加字距。
  - 不要首行缩进，用段间距。
  - 左对齐优先；两端对齐在 Web 上不推荐。
- 打折扣：45–90 字符是拉丁字符的度量；中文用 30–36 字更合适（本 skill 用 34em 统一两者）。

### WCAG 2.2

- 链接：https://www.w3.org/TR/WCAG22/
- 相关条款：
  - **1.4.4 Resize Text**：200% 缩放不丢内容。
  - **1.4.12 Text Spacing**：行高 ≥1.5、段后 ≥2em、字距 ≥0.12em、词距 ≥0.16em 时，内容不丢失、不重叠。
  - **1.4.3 Contrast**：正文 4.5:1，大字 3:1。
  - **1.4.11 Non-text Contrast**：图标、边框 3:1。
  - **1.4.8 Visual Presentation**（AAA）：行宽、对齐、行距的更高要求。
- 取什么：验收协议里的「文本间距覆盖」直接来自 1.4.12；它不是要求你这么排，而是要求用户这么改时不坏。

### Butterick's Practical Typography

- 链接：https://practicaltypography.com/typography-in-ten-minutes.html
- 取什么：
  - 先让正文好看，再管其余。
  - 正文 15–25px（Web）；行距 120–145%；行宽 45–90 字符。
  - 行高用无单位值。
- 打折扣：作者偏爱专业字体、反对系统字体；在产品 UI 里系统字体是合理选择。

### Refactoring UI

- 链接：https://refactoringui.com/
- 取什么：
  - *Hierarchy is Everything*：层级是让不重要的退后，不是让重要的变大。
  - *Layout and Spacing*：用间距分组，少用边框。
  - *Designing Text*：行宽、行高、对齐、字重的实操。
- 说明：付费书，没有免费全文；本 skill 只取观念，未复制内容。

## 3. 中文排版

### W3C clreq — Requirements for Chinese Text Layout

- 链接：https://www.w3.org/TR/clreq/
- 取什么：
  - 汉字与标点原则上都是 1:1 方块，无缝排列——这是「中文不能随便加字距」的根据。
  - 标点占一个字宽；大陆标点靠字面左下（横排），港台居中；直排/横排标点方向不同。
  - 行首行尾禁则；行尾点号悬挂；连续标点的宽度调整。
  - 中西文混排：汉字与西文之间约 1/4 汉字宽的间隙；西文在行首行尾时不加。
  - 行高、基线、孤行孤字、标题处理。
- 打折扣：clreq 以书籍/出版物为主要对象，Web UI 只需要取其原则（方块、禁则、间距），不需要复刻印刷级的纵向对齐。

### GB/T 15834—2011《标点符号用法》

- 标准文本不公开免费；clreq 附录 A 有标点全表与用法对照。
- 取什么：大陆简体中文的标点形式与位置；省略号六点、破折号占两字、引号层级。
- 注意：港台用「」『』，大陆用“”‘’；不要在同一产品里混用。

### 字体厂商实践文章（二级参考）

- 示例：https://www.hellofont.cn/article/chinese-english-font-pairing-2026
- 取什么：同字号下西文视觉偏小、汉字视觉偏重；中英之间加半角空隙；表格数字用等宽。
- 打折扣：商业字体厂商的内容带有产品倾向，且「西文放大 5–10%」的做法不适合正文（需要拆 span，破坏 i18n）。本 skill 只在品牌字标场景允许手动补偿。

## 4. Token 与工程

### W3C DTCG — Design Tokens Format Module

- 链接：https://www.designtokens.org/tr/drafts/format/
- 取什么：
  - `$type` / `$value` / `$description` / `$extensions`；组与别名 `{group.token}`。
  - 复合 `typography` token：fontFamily、fontSize、fontWeight、lineHeight、letterSpacing 绑定为一个整体。
  - 文件扩展名 `.tokens.json`；MIME `application/design-tokens+json`。
- 打折扣：仍是 Community Group Draft（2025.10），工具支持不齐；把它当交换格式，CSS 变量当运行时。

### Tailwind CSS — font-size

- 链接：https://tailwindcss.com/docs/font-size
- 取什么：
  - 字号与行高成对定义；v4 用 `--text-*` 与 `--text-*--line-height`。
  - 默认阶梯可直接复用，也可覆盖为本文的六档。
- 打折扣：默认 `text-sm` 是 14px、`text-base` 是 16px，但项目里仍会出现 `text-[15px]`；必须配 lint 才能封死任意值。

### CSS Text Level 4 / MDN

- `text-autospace`：https://developer.mozilla.org/en-US/docs/Web/CSS/text-autospace
  - 控制 CJK 与西文/数字之间的间距；2025 年底进入 Baseline。
- `text-spacing-trim`：https://developer.mozilla.org/en-US/docs/Web/CSS/text-spacing-trim
  - 控制 CJK 标点的内部挤压与行首处理；目前主要是 Chromium 支持（Limited availability），当渐进增强用。
- `line-break`：`strict` 收紧禁则；`normal` 已包含基本禁则。
- Chrome 118 起取消了中日韩文本 10px 的最小字号限制——也就是说 9px 中文真的会渲染出来，更需要自律。

## 5. 各系统数值对照（便于选主参考）

| 系统 | 正文字号 | 正文字高 | 字阶范围 | 备注 |
|---|---|---|---|---|
| Ant Design | 14 | 22 | 12–68（10 档） | 中后台，3–5 档实用 |
| IBM Carbon | 14（Productive）/16（Expressive） | 20 / 24 | 12–92 | 双字阶，heading 03+ 用 Regular |
| Fluent 2 (Windows) | 14 | 20 | 12–68 | 平台 ramp，Caption 12/16 |
| Apple (iOS) | 17 | 22 | 11–34 | Dynamic Type，pt 非 px |
| USWDS | ≥16（有效） | ≥1.5 | token 化 | 政府站点，可读性优先 |

选一套当主参考。本文的默认值：产品界面取 Carbon Productive 的密度 + Fluent 的 14/20 + Ant 的中文经验，再按中文行高 +0.15–0.25。

## 6. 未采用但值得知道

- **Material Design 3**：以 14sp body 为主，字阶偏大；适合 Android 原生，不适合密集桌面工具。
- **JLReq（日文排版需求）**：与中文高度相似（禁则、ruby、纵中横排），做日文版时可参考。
- **KLReq（韩文）**：韩文有空格分词，断行规则与中文不同，不要混用。
- **Bringhurst《The Elements of Typographic Style》**：印刷排版的经典，比例与节奏的观念仍适用，但具体数值面向书籍。
