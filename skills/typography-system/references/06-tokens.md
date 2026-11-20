# L6 · Token：把决定变成代码

Token 不是「把 CSS 变量换个名字」，而是**把设计决定变成唯一事实来源**。分三层：

1. **Primitive（原始值）**：字号、字重、行高、间距的原子值。只被语义层引用，页面不直接用。
2. **Semantic（语义）**：角色级 token，如 `--text-body-size`。页面与组件只用这一层。
3. **Component（组件级，可选）**：如 `--button-height-md`。只有在组件需要独立于角色的尺寸时才建。

过度建第三层会得到几百个变量和一张无人维护的表。**默认只做到第二层。**

## 1. 命名

```
--{类别}-{角色}-{属性}
--text-body-size
--text-body-leading
--text-body-weight
--text-page-size
--space-4
--font-sans
--weight-medium
--tracking-display
```

规则：

- 类别在前，角色在中，属性在后；不要 `--body-text-font-size`。
- 角色名与 SKILL.md、Figma 文本样式、组件 API 完全一致。
- 不用缩写（`--txt-bd-sz`），除非团队已有强约定。
- 状态用后缀（`--color-text-muted`），不要塞进角色名（`--text-body-disabled`）。

## 2. CSS 实现

完整文件见 `templates/tokens.css`，核心结构：

```css
:root {
  /* 族 */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI Variable Text",
    "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC",
    "Source Han Sans SC", sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas,
    "Noto Sans Mono CJK SC", monospace;

  /* 字重 */
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;

  /* 字号 */
  --text-display-size: 3rem;
  --text-page-size: 1.75rem;
  --text-section-size: 1.25rem;
  --text-body-size: 1rem;
  --text-label-size: 0.875rem;
  --text-caption-size: 0.75rem;

  /* 行高（默认中文） */
  --text-display-leading: 1.1667;
  --text-page-leading: 1.4286;
  --text-section-leading: 1.5;
  --text-body-leading: 1.75;
  --text-label-leading: 1.5714;
  --text-caption-leading: 1.5;

  /* 间距 */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;
}
```

### 语言覆盖

行高随语言变，字号不变。英文为主语言的页面在根元素切换：

```css
:root:lang(en) {
  --text-page-leading: 1.2857;
  --text-section-leading: 1.4;
  --text-body-leading: 1.5;
  --text-label-leading: 1.4286;
  --text-caption-leading: 1.3333;
}
```

密度与语言叠加时，用祖先选择器保证英文密度值不被覆盖：

```css
:root:lang(en) [data-density="reading"] {
  --text-page-leading: 1.25;
  --text-section-leading: 1.3333;
  --text-body-leading: 1.5556;
  --text-label-leading: 1.4667;
}
```

中文页面里的英文段落、英文产品名**继承页面的中文行高**，不做局部覆盖。这是有意的：更松的行高对英文无害，反过来会挤。

### 密度覆盖

```css
[data-density="reading"] {
  --text-page-size: 2rem;         --text-page-leading: 1.375;
  --text-section-size: 1.5rem;    --text-section-leading: 1.5;
  --text-body-size: 1.125rem;     --text-body-leading: 1.7778;
  --text-label-size: 0.9375rem;   --text-label-leading: 1.6;
  --text-caption-size: 0.8125rem; --text-caption-leading: 1.5385;
}

[data-density="compact"] {
  --text-page-size: 1.5rem;       --text-page-leading: 1.4167;
  --text-section-size: 1.125rem;  --text-section-leading: 1.4444;
  --text-body-size: 0.875rem;     --text-body-leading: 1.5714;
  --text-label-size: 0.8125rem;   --text-label-leading: 1.5385;
  --text-caption-size: 0.75rem;   --text-caption-leading: 1.5;
}
```

密度写在容器上（`<main data-density="compact">`），不要写在每个组件上。

### 角色工具类

```css
.text-page {
  font-size: var(--text-page-size);
  line-height: var(--text-page-leading);
  font-weight: var(--weight-semibold);
  letter-spacing: 0;
}
.text-body {
  font-size: var(--text-body-size);
  line-height: var(--text-body-leading);
  font-weight: var(--weight-regular);
}
```

不要提供 `.text-15`、`.fs-17` 这类原子字号类——它们就是新的任意值。

## 3. DTCG 格式

W3C Design Tokens Community Group 的格式用 `$type` / `$value`，支持复合 `typography` token（把字体、字号、字重、行高、字距绑成一个整体）。这正好解决「Agent 只改对了字号、却随手改行高」的问题。

```json
{
  "text": {
    "body": {
      "$type": "typography",
      "$description": "正文；中文行高 1.75，英文由 lang 覆盖为 1.5",
      "$value": {
        "fontFamily": "{font.family.sans}",
        "fontSize": { "value": 1, "unit": "rem" },
        "fontWeight": "{font.weight.regular}",
        "lineHeight": 1.75,
        "letterSpacing": { "value": 0, "unit": "rem" }
      }
    }
  }
}
```

完整示例见 `templates/tokens.tokens.json`。注意：

- 复合 token 是「全有或全无」：引用它就应该同时得到字号、行高、字重、字距。
- 需要按密度切换时，建 `text.body` 与 `text.body.compact` 两个复合 token，而不是拆开覆盖。
- 别名用 `{group.token}`；文件名用 `.tokens.json`，MIME 用 `application/design-tokens+json`。
- 该规范仍是 Community Group Draft，工具支持参差；把 DTCG 当交换格式，CSS 变量当运行时。

## 4. Tailwind v4

```css
@theme {
  --font-sans: "Inter var", Inter, "Noto Sans SC", "PingFang SC",
    "Microsoft YaHei", sans-serif;

  --text-page: 1.75rem;
  --text-page--line-height: 1.4286;
  --text-page--font-weight: 600;

  --text-section: 1.25rem;
  --text-section--line-height: 1.5;
  --text-section--font-weight: 600;

  --text-body: 1rem;
  --text-body--line-height: 1.75;

  --text-label: 0.875rem;
  --text-label--line-height: 1.5714;
  --text-label--font-weight: 500;

  --text-caption: 0.75rem;
  --text-caption--line-height: 1.5;
}
```

这样 `text-body` 自带行高与字重，Agent 不需要（也无法轻易）单独改行高。再加一条 ESLint 规则禁止 `text-[13px]`（见 L7），任意值就基本被封死。

## 5. Figma 与设计侧

- 文本样式命名与 token 一致：`text/page`、`text/section`、`text/body`、`text/label`、`text/caption`。
- 每个样式绑定字号、行高、字重、字距四项；不要只绑字号。
- 中文与英文各一套样式（`text/body/zh`、`text/body/en`），或在同一套里用行高覆盖。
- 变量（Variables）只暴露语义层，不把 primitive 暴露给设计师，避免直接选 15px。
- 组件库的文本层用样式，不用手动改字号。

## 6. 原生端映射

| 角色 | SwiftUI | Compose | WinUI |
|---|---|---|---|
| page | `.largeTitle` 或 `.title` | `headlineLarge` | `TitleTextBlockStyle` |
| section | `.title2` | `titleLarge` | `SubtitleTextBlockStyle` |
| body | `.body` | `bodyLarge` | `BodyTextBlockStyle` |
| label | `.callout` / `.subheadline` | `labelLarge` | `BodyStrongTextBlockStyle` |
| caption | `.caption` | `bodySmall` | `CaptionTextBlockStyle` |

原生端用平台文本样式，才能跟随 Dynamic Type、系统字号与无障碍设置。不要把 Web 的 28px 直接写成 `.system(size: 28)`。

## 7. 暗色模式

**排版不变，只换颜色。** 暗色下不要减小字重或字号；细字在深底上会发虚，必要时把 300 提到 400。

- 正文对比度 ≥4.5:1，大字 ≥3:1。
- 次要文字不要用 40% 透明度，直接给一个满足对比度的色值。
- 纯黑底（#000）+ 纯白字会产生光晕，用 #121212 / #E6E6E6 一类。
- 暗色下 `-webkit-font-smoothing: antialiased` 会让字变细，谨慎使用；不要在亮色下开。

## 8. 迁移

1. 建新 token，保留旧 token 作为别名（`--old-body-size: var(--text-body-size)`）。
2. 用 codemod 批量替换组件。
3. 跑视觉回归，确认无差异。
4. 删除旧 token；在 CHANGELOG 标注 breaking change。

不要长期维护两套并行 token；那会变成两个事实来源。

## 9. 验证

- 变量快照：`tokens.css` 变更必须出现在 PR diff 里。
- 视觉回归：至少覆盖 default / reading / compact / dark 四种组合。
- 对比度：用 axe 或 Lighthouse 跑一遍文字对比。
- 密度切换：同一页面切三种密度，不允许溢出或重叠。
- 语言切换：`lang="zh-CN"` 与 `lang="en"` 下，行高与断行都正确。
