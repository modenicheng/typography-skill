# L7 · 约束：让 Agent 无法随手发明字体样式

规范只有变成**失败**才有约束力。这一层给四道闸：写给 Agent 的规则、lint 规则、审计脚本、人工验收。

原则：**限制决策，不是限制代码。** 不要写「请注意美观」，要写「font-size 只允许 var(--text-*)」。

## 1. AGENTS.md 片段

把 `templates/AGENTS.typography.md` 的内容并入项目根目录的 `AGENTS.md`（或 `CLAUDE.md` / `.cursor/rules`）。核心是让 Agent 在动手前先侦察、动手后自证。

```markdown
## UI Typography and Visual Consistency

Before implementing or modifying any UI:
- Inspect existing design tokens (`tokens.css`, theme config) and shared components.
- Preserve the existing visual language; do not introduce a parallel one.
- Prefer reuse over new styles.

### Typography

Use only these semantic roles. Never invent a size, weight, or role.

| Role | Size | CJK line-height | Latin line-height | Weight |
|---|---|---|---|---|
| page | 28px | 40px | 36px | 600 |
| section | 20px | 30px | 28px | 600 |
| body | 16px | 28px | 24px | 400 |
| label | 14px | 22px | 20px | 500 |
| caption | 12px | 18px | 16px | 400 |

Rules:
- Never write a raw `font-size`, `font-family`, `line-height`, or
  `letter-spacing`. Use `var(--text-*)` / `var(--font-*)`.
- No arbitrary Tailwind values: `text-[13px]`, `leading-[1.2]`,
  `tracking-[.1em]` are errors.
- One UI family; monospace only for code, IDs, and tabular data.
- Chinese body line-height ≥ 1.6; never add letter-spacing to Chinese.
- Chinese emphasis uses weight 500, not 600 (Microsoft YaHei has no 500/600).
- Never use italic for Chinese; never use `word-break: break-all`.
- Do not use caption styles for substantial content; do not go below 12px.
- Prefer weight, color, and spacing over size when adjusting hierarchy.

### Spacing

Use 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64px only.
Heading space above must be ≥1.5× the space below.

### Verification

Before finishing, check:
- every text block maps to exactly one role;
- no new font sizes or weights were introduced;
- the UI holds at 200% zoom and 390px width;
- long Chinese labels (8–12 chars) and CN/EN mixed strings do not overflow;
- with web fonts disabled, layout does not shift;
- dark mode contrast ≥ 4.5:1.

If a new token is truly necessary, explain why in the PR and delete an
existing one first.
```

## 2. Stylelint

只允许 token 值，从源头封死裸值：

```json
{
  "rules": {
    "declaration-property-value-allowed-list": {
      "font-size": [
        "/^var\\(--text-/",
        "0", "inherit", "initial", "unset", "revert"
      ],
      "font-family": [
        "/^var\\(--font-/",
        "inherit", "initial", "unset", "revert"
      ],
      "letter-spacing": [
        "0", "normal", "inherit", "initial", "unset",
        "/^var\\(--tracking-/"
      ]
    },
    "declaration-property-value-disallowed-list": {
      "word-break": ["break-all"],
      "text-transform": ["uppercase"]
    },
    "declaration-no-important": true
  }
}
```

说明：

- `allowed-list` 是「所有值都必须匹配」，比 `disallowed-list` 更严。
- `clamp()` 里如果含裸 px 会被拦；需要流体字时用 `clamp(var(--text-page), ...)`。
- `text-transform: uppercase` 对中文无意义；英文标签若确实需要，用行内注释豁免并说明。
- `declaration-no-important` 会误伤第三方覆盖；可对 `vendor/` 目录关闭。

SCSS/Less 项目把规则放到 `overrides` 里，或只对编译后的 CSS 跑一遍。

## 3. ESLint

拦住 JSX 行内样式与 Tailwind 任意值：

```js
// eslint.config.js（节选）
export default [
  {
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "JSXAttribute[name.name='style'] ObjectExpression Property[key.name='fontSize']",
          message: "不要用行内 fontSize；使用 text-body 等角色类或 var(--text-*)。",
        },
        {
          selector:
            "JSXAttribute[name.name='className'] Literal[value=/(text|leading|tracking)-\\[[^\\]]+\\]/]",
          message: "不要用 Tailwind 任意值；使用角色类（text-body / text-caption）。",
        },
      ],
    },
  },
];
```

如果项目用 `eslint-plugin-tailwindcss`，再加：

```js
"tailwindcss/no-arbitrary-value": "error",
"tailwindcss/no-custom-classname": "warn"
```

Vue / Svelte 用各自的模板规则；没有 lint 插件时，靠下一节的脚本兜底。

## 4. 审计脚本

`templates/audit.mjs` 是零依赖的 Node 脚本，扫描 CSS/SCSS/HTML/Vue/Svelte/JSX/TSX：

```bash
node tools/audit.mjs src
node tools/audit.mjs src --json > typography-audit.json
node tools/audit.mjs src --max-warnings 0
```

它检查：

- 裸 `font-size` / `font-family` / `letter-spacing`，以及 `font` 简写里的裸字号；
- 非阶梯字重（如 550）、`word-break: break-all`、`text-transform: uppercase`；
- 行内 `fontSize`、Tailwind 任意值；
- 正文行高过紧（即使字号继承自上层也报）、`!important`、异常 px 行高。

误报用行内注释抑制：

```css
/* typography-audit-disable-next-line raw-font-size */
.legacy-chart-label { font-size: 11px; }
```

整文件豁免（规格页、历史遗留目录）用文件级注释，必须写在前 3KB 内：

```css
/* typography-audit-disable-file — 规格标本页，故意展示反例 */
```

豁免是显式债务：文件级豁免要配一个回收日期。`examples/spec.html` 就带了这个标记，所以对仓库根目录跑审计仍然是 0 error。

放进 CI（GitHub Actions 示例）：

```yaml
- name: Typography audit
  run: node tools/audit.mjs src --max-warnings 0 --no-color
```

新项目从第一天就开启；老项目先只报 error，逐步清 warning。

## 5. 代码评审要问的五个问题

1. 这个文本块是什么角色？说不出来就是层级没想清楚。
2. 有没有新增字号/字重？新增的话，删掉了哪个？
3. 中文长标签（8–12 字）会不会撑破？
4. 中英混排、双语切换后还对得齐吗？
5. 禁用 Web 字体后，布局还稳吗？

## 6. 视觉验收协议

在真实页面（不是设计稿）上做：

### 6.1 缩放

- 浏览器 200% 缩放：无横向滚动、无截断、无重叠。
- 仅放大文字（Firefox：缩放→仅缩放文本；或系统字号调到 125%）：
  行高不塌、按钮不裁字。

### 6.2 WCAG 1.4.12 文本间距覆盖

在 DevTools 里临时注入：

```css
* {
  line-height: 1.5 !important;
  letter-spacing: 0.12em !important;
  word-spacing: 0.16em !important;
}
p { margin-bottom: 2em !important; }
```

内容不能丢失或重叠。中文加 0.12em 字距会很丑，但**不能坏**。

### 6.3 窄屏

- 390px：表单单列、表格横向滚动、按钮不换行错位。
- 320px：作为极限检查，不要求完美。

### 6.4 文本夹具

准备一组固定字符串，每次改版都测：

```
中文长标签：企业级多云资源编排与合规审计
中英混排：在 Figma 中打开 v2.3.1 设计稿，共 128 个组件
极端数字：-1,234,567.89 / 99.99% / 0.00
双语按钮：保存更改 / Save changes
长英文：Internationalization & Localization Settings
```

### 6.5 字体回退

- DevTools → Network → 阻止 `*.woff2`，刷新。
- 检查：行高是否跳、按钮是否换行、标题是否溢出。
- 若跳动明显，给 fallback 加 `size-adjust` / `ascent-override`（L3 第 12 节）。

### 6.6 暗色与输入法

- 暗色下正文对比 ≥4.5:1；细字不发虚。
- 中文输入法组合态（拼音未上屏）不撑破输入框；`textarea` 至少 3 行高。

## 7. 指标

| 指标 | 目标 |
|---|---|
| 每路由不同字号数 | ≤5（营销 ≤7） |
| 每路由字重数 | ≤3 |
| 字体族 | ≤2 |
| 裸 `font-size` 声明 | 0 |
| 12px 以下文本 | 0（除极少数图例并说明） |
| 中文正文行高 | ≥1.6 |
| `break-all` / 中文斜体 | 0 |
| 文本间距覆盖失败 | 0 |

## 8. 例外流程

允许例外，但不允许静默例外：

1. 在代码里写注释：原因、负责人、回收日期。
2. 在 PR 描述里列出例外。
3. 例外超过 3 个月，要么转正为 token，要么修掉。

```css
/* 例外：品牌字标固定 13px，2027-03 品牌改版时回收。@typography-owner */
.brand-wordmark { font-size: 13px; }
```

## 9. 给 Agent 的最小上下文

不必把整个 skill 塞进 prompt。按任务给三样：

1. `SKILL.md`（角色表 + 五条硬规则 + 路由）。
2. `tokens.css`（唯一事实来源）。
3. 一个最相关的 reference：改中文文案给 L3，改组件给 L5，写 lint 给 L7。

并要求 Agent **先输出角色映射表，再写代码**。角色映射错了，代码写得再干净也是错的。
