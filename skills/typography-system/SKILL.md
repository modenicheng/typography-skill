---
name: typography-system
description: "Design, extend, or audit a product typography system for Chinese–English mixed interfaces. Use when choosing font sizes, line heights, weights, or letter-spacing; defining a type ramp or design tokens; fixing inconsistent, cramped, or arbitrary Chinese text; pairing Latin and CJK fonts; specifying heading/body/label/caption roles for dashboards, docs, marketing pages, desktop or mobile apps; or when an agent keeps inventing ad-hoc font styles. Covers semantic roles, bilingual metrics, punctuation and line breaking, component rules, CSS/DTCG/Tailwind tokens, and lint enforcement. 触发词：排版、字体、字号、行高、字重、字距、中英混排、设计系统。"
license: MIT
---

# 中英双语文排系统

> 一致性不靠审美，靠约束：**角色决定字号，字号来自阶梯，阶梯之外没有值。**

文件按 L1–L8 分层：本文件是契约层（L0），`references/` 是逐层展开，`templates/` 是可复制实现。先读本文件，再按「路由」只打开需要的那一层。

这份 skill 解决的不是「怎么把字排好看」，而是「怎么让 Agent 和团队无法随手发明新的字体样式」。它对中文与英文分别给出度量，因为同一套 px 值在两种文字上会产生不同的视觉重量、行高需求和断行行为。

## 何时使用

- 新建或改造产品的排版体系：字号、字重、行高、字距、层级。
- 中英混排出现「中文糊、英文散、两者对不齐」。
- 要给 Agent 写 AGENTS.md / lint 规则，禁止 `text-[13px]`、`font-size: 15px` 这类任意值。
- 做 dashboard、桌面工具、文档站、营销页、移动端或原生桌面 UI 的字体规格。
- 审查一个页面「字号都对，但看起来还是乱」。

## 不适用

- 纯品牌字体设计、字体文件制作、字体授权采购。
- 需要复杂图文排版引擎（InDesign、LaTeX、Typst）的书籍级排版 —— 可读 L1/L3 的原则，但不要套用本 skill 的 CSS 值。
- 只有一句「帮我把这个标题放大一点」的微调；直接改，不要启动整套流程。

## 五条硬规则

1. **一屏最多 5 个字号、3 个字重、2 个字体族**（一个 sans + 一个 mono；衬线仅限阅读/营销模式）。
2. **字号只从阶梯取**；要新增一个字号，先删掉一个旧字号，并在 PR 里说明理由。
3. **层级优先用字重、颜色、间距解决**，其次才放大字号；不要靠「全都加粗、全都变大」制造重点。
4. **中文行高 ≥ 英文行高**；同一段落以中文为准取值，英文跟随，不反过来。
5. **所有排版值必须是 token**：页面里不出现裸 `font-size`、`font-family`、`letter-spacing`。

## 角色模型

角色是语义，不是尺寸。每个文本节点有且只有一个角色；尺寸随密度变化，角色不变。

| 角色 | 中文 字号/行高 | 英文 字号/行高 | Token 前缀 | 用途 | 约束 |
|---|---|---|---|---|---|
| display | 48/56 | 48/52 | `--text-display-` | 封面、营销首屏 | 产品界面内禁用 |
| page | 28/40 | 28/36 | `--text-page-` | 页面主标题（h1） | 每页最多一个 |
| section | 20/30 | 20/28 | `--text-section-` | 模块标题（h2） | 不跳级使用 |
| body | 16/28 | 16/24 | `--text-body-` | 正文、说明、段落 | 长文不小于 16 |
| label | 14/22 | 14/20 | `--text-label-` | 按钮、表单、表格、导航 | 密集界面的主字号 |
| caption | 12/18 | 12/16 | `--text-caption-` | 辅助信息、时间戳、脚注 | 不承载正文 |

`display` 是可选角色，只在 Expressive 场景启用。等宽不是角色，是字体族变体：代码、ID、数值可以继续使用 body / label 的尺寸，只切换 `--font-mono`。

## 默认阶梯（标准密度）

单位 rem（根 16px）。行高写作「字号/行高」，行高优先用无单位倍数。

| 角色 | 字号 | 中文行高 | 英文行高 | 字重 | 字距 |
|---|---|---|---|---|---|
| display | 3rem (48) | 1.17 (56) | 1.08 (52) | 600 | 英文 -0.01em；中文 0 |
| page | 1.75rem (28) | 1.4286 (40) | 1.2857 (36) | 600 | 0 |
| section | 1.25rem (20) | 1.5 (30) | 1.4 (28) | 600 | 0 |
| body | 1rem (16) | 1.75 (28) | 1.5 (24) | 400 | 0 |
| label | 0.875rem (14) | 1.5714 (22) | 1.4286 (20) | 500 | 0 |
| caption | 0.75rem (12) | 1.5 (18) | 1.3333 (16) | 400 | 英文 +0.01em；中文 0 |

这三个密度只改字号与行高，不改角色与字重：

| 角色 | 阅读 reading | 标准 standard | 紧凑 compact |
|---|---|---|---|
| page | 32/44 · 32/40 | 28/40 · 28/36 | 24/34 · 24/32 |
| section | 24/36 · 24/32 | 20/30 · 20/28 | 18/26 · 18/24 |
| body | 18/32 · 18/28 | 16/28 · 16/24 | 14/22 · 14/20 |
| label | 15/24 · 15/22 | 14/22 · 14/20 | 13/20 · 13/18 |
| caption | 13/20 · 13/20 | 12/18 · 12/16 | 12/18 · 12/16 |

每行格式为「中文 字号/行高 · 英文 字号/行高」。

**行宽**：`max-inline-size: 34em`。因为一个汉字约 1em、一个拉丁字符约 0.5em，34em 同时等于约 34 个汉字或 68 个拉丁字符 —— 两种文字共用同一条规则。

**间距**：4 的倍数，`4 / 8 / 12 / 16 / 24 / 32 / 48 / 64px`。标题上方的间距至少是下方的 1.5 倍。

## 七步流程

0. **侦察**：先读现有 tokens、共享组件和 2–3 个真实页面。已有体系优先继承，不要平行新建。
1. **定模式**：按 L4 判断这是 Productive、Reading、Expressive 还是 Reference；一个产品可以有多个模式，但只能有一套阶梯家族。
2. **分配角色**：给每个文本节点标角色。标不出角色的文本，通常是层级设计有问题，不是缺字号。
3. **定双语度量**：按 L3 确认字体栈、中文行高、混排间距、断行与标点策略。
4. **落 token**：按 L6 写成 primitive → semantic 两层；不要在组件里写死值。
5. **套组件**：按 L5 检查按钮、表格、表单、导航等是否使用了正确角色。
6. **验收**：按 L7 跑脚本 + 人工检查，至少覆盖 200% 缩放、390px 窄屏、长中文、混排、字体回退。
7. **交证据**：列出新增/删除的 token、角色映射、修改的文件、验收结果。没有证据的「已优化」不算完成。

## 中英差异：十条速查

1. **同字号下汉字更「重」**：汉字撑满字身，拉丁字母集中在 x-height。混排时中文用 400，英文可用 500 达到同等视觉重量。
2. **中文需要更大行高**：正文 1.6–1.8，英文 1.45–1.6；标题差距收窄到 0.1 左右。
3. **中文不要加字距**：正文字距为 0；`letter-spacing` 会打散方块节奏。英文仅在大写标签或大标题上调整。
4. **中文没有斜体**：不要用 faux italic；强调用字重、颜色、着重号或引号。
5. **中文标点占一个字宽**：行首禁则、连续标点挤压、行尾悬挂都要处理；CSS 用 `line-break: strict` 与 `text-spacing-trim`。
6. **中西文之间需要约 1/4 字宽的间隙**：优先用 `text-autospace: normal`，不要在 UI 文案里手打空格。
7. **中文字体字重常不全**：Windows 微软雅黑只有 Light/Regular/Bold，500/600 会被映射成 400/700。要么用可变字重 Web 字体，要么只用 400/700。
8. **中文最小 12px**：低于 12px 笔画粘连；密集界面用 14px，长文用 16px 起。
9. **数字用半角 + 等宽数字**：表格与金额 `font-variant-numeric: tabular-nums`，正文用比例数字；不要全角数字。
10. **断行策略不同**：中文可在字间断行但不能断在标点前；英文按词断行，禁止 `word-break: break-all` 切碎单词。

## 路由：按任务读文件

| 你要做的事 | 读 |
|---|---|
| 理解为什么、判断层级是否有问题 | `references/01-principles.md` |
| 选字号/行高/字重/字距，做响应式阶梯 | `references/02-scale.md` |
| 中英混排、字体栈、标点、断行、数字 | `references/03-bilingual.md` |
| 判断产品/文档/营销/数据界面该用什么密度 | `references/04-scenarios.md` |
| 按钮、表格、表单、导航、空状态怎么排 | `references/05-components.md` |
| 写 CSS/DTCG/Tailwind token，做主题与暗色 | `references/06-tokens.md` |
| 写 AGENTS.md、lint、CI、验收清单 | `references/07-enforcement.md` |
| 查出处、核对数值、延伸阅读 | `references/08-sources.md` |

可直接复制的文件：

- `templates/tokens.css` — 变量与角色工具类
- `templates/tokens.tokens.json` — DTCG 格式
- `templates/AGENTS.typography.md` — 给 Agent 的硬约束
- `templates/audit.mjs` — 零依赖审计脚本
- `examples/spec.html` — 可交互的视觉规格页

## 输出契约

改完之后必须给出：

1. **Token 变更**：新增/删除/重命名的 token，及理由。
2. **角色映射**：页面里每个文本块用了哪个角色（表格或注释）。
3. **影响面**：受影响的组件与页面清单。
4. **验收证据**：脚本输出、关键尺寸、截图或录屏说明。
5. **已知例外**：哪些地方故意偏离规范，为什么，何时回收。

## 危险信号

- 代码里出现 `text-[15px]`、`font-size: 17px`、`style={{ fontSize: 13 }}`。
- 同一页面出现 6 种以上字号，或 4 种以上字重。
- 用 `font-weight: 600` 配微软雅黑，却没有可变字体。
- 中文正文 `letter-spacing` 不为 0，或 `line-height` 小于 1.4。
- `word-break: break-all`、`text-align: justify` 用在 UI 短文本上。
- 用 `!important` 覆盖字体，或在组件里重定义 token。
- 图片里嵌文字（不可缩放、不可翻译）。
- 只用英文样本验收，没有测长中文与混排。

## 验收清单

- [ ] 字号全部来自阶梯，没有新增裸值。
- [ ] 每个文本块能说出角色；页面只有一个 page 标题。
- [ ] 中文行高 ≥ 1.6（正文），英文 ≥ 1.45。
- [ ] 中英混排有间隙，且没有手打空格。
- [ ] 无行首标点、无被切断的英文单词。
- [ ] 12px 以下无文字；表格数字等宽右对齐。
- [ ] 200% 缩放与 390px 宽度下不截断、不重叠（WCAG 1.4.4 / 1.4.12）。
- [ ] 禁用 Web 字体后，回退字体不导致布局跳动。
- [ ] Log in / 登录 这类双语切换后，按钮与标签不换行错位。
- [ ] 暗色模式下文字对比度 ≥ 4.5:1（大字 ≥ 3:1）。
