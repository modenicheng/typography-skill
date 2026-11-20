# L7 · Enforcement: Making It Impossible for an Agent to Invent Font Styles on a Whim

A spec only has teeth once it becomes a **failure**. This layer provides four gates: rules written for the agent, lint rules, an audit script, and human acceptance.

Principle: **constrain decisions, not code.** Do not write "please keep it visually pleasing"; write "font-size may only use var(--text-*)".

## 1. AGENTS.md Snippet

Merge the contents of `templates/AGENTS.typography.md` into `AGENTS.md` at the project root (or `CLAUDE.md` / `.cursor/rules`). The point is to make the agent scout before it touches anything and prove its work afterward.

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

Allow token values only, sealing off raw values at the source:

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

Notes:

- `allowed-list` means "every value must match", which is stricter than `disallowed-list`.
- A bare px inside `clamp()` is caught; for fluid type use `clamp(var(--text-page), ...)`.
- `text-transform: uppercase` is meaningless for Chinese; if an English label genuinely needs it, exempt it with an inline comment and a rationale.
- `declaration-no-important` produces false positives on third-party overrides; turn it off for the `vendor/` directory.

For SCSS/Less projects, put the rules under `overrides`, or run against the compiled CSS only.

## 3. ESLint

Block inline JSX styles and Tailwind arbitrary values:

```js
// eslint.config.js (excerpt)
export default [
  {
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "JSXAttribute[name.name='style'] ObjectExpression Property[key.name='fontSize']",
          message: "Do not use inline fontSize; use a role class such as text-body or var(--text-*).",
        },
        {
          selector:
            "JSXAttribute[name.name='className'] Literal[value=/(text|leading|tracking)-\\[[^\\]]+\\]/]",
          message: "Do not use Tailwind arbitrary values; use role classes (text-body / text-caption).",
        },
      ],
    },
  },
];
```

If the project uses `eslint-plugin-tailwindcss`, add:

```js
"tailwindcss/no-arbitrary-value": "error",
"tailwindcss/no-custom-classname": "warn"
```

Vue / Svelte use their own template rules; with no lint plugin, the script in the next section is the backstop.

## 4. Audit Script

`templates/audit.mjs` is a zero-dependency Node script that scans CSS/SCSS/HTML/Vue/Svelte/JSX/TSX:

```bash
node tools/audit.mjs src
node tools/audit.mjs src --json > typography-audit.json
node tools/audit.mjs src --max-warnings 0
```

It checks:

- bare `font-size` / `font-family` / `letter-spacing`, plus bare sizes inside the `font` shorthand;
- off-scale weights (such as 550), `word-break: break-all`, `text-transform: uppercase`;
- inline `fontSize`, Tailwind arbitrary values;
- body line height that is too tight (reported even when the size is inherited), `!important`, anomalous px line heights.

Suppress false positives with an inline comment:

```css
/* typography-audit-disable-next-line raw-font-size */
.legacy-chart-label { font-size: 11px; }
```

File-level exemptions (spec pages, legacy directories) use a file-level comment, which must sit within the first 3KB:

```css
/* typography-audit-disable-file — spec specimen page, counterexamples on purpose */
```

An exemption is explicit debt: a file-level exemption must come with a removal date. `examples/spec.html` carries this marker, so auditing the repository root still reports 0 errors.

Wire it into CI (GitHub Actions example):

```yaml
- name: Typography audit
  run: node tools/audit.mjs src --max-warnings 0 --no-color
```

Turn it on from day one for new projects; on legacy projects, report errors only at first, then clear warnings gradually.

## 5. Five Questions for Code Review

1. What role is this text block? If you cannot say it, the hierarchy was not thought through.
2. Did you add a size or weight? If so, which one did you delete?
3. Will a long Chinese label (8–12 characters) break the layout?
4. Does it still align with mixed CN/EN text and after switching languages?
5. Is the layout still stable with web fonts disabled?

## 6. Visual QA Protocol

Do this on a real page, not on a design mockup:

### 6.1 Zoom

- Browser zoom at 200%: no horizontal scroll, no clipping, no overlap.
- Text-only enlargement (Firefox: Zoom → Zoom Text Only; or system font size at 125%):
  line heights do not collapse, buttons do not clip text.

### 6.2 WCAG 1.4.12 Text Spacing Override

Inject this temporarily in DevTools:

```css
* {
  line-height: 1.5 !important;
  letter-spacing: 0.12em !important;
  word-spacing: 0.16em !important;
}
p { margin-bottom: 2em !important; }
```

Content must not be lost or overlap. Adding 0.12em letter spacing to Chinese looks ugly, but it **must not break**.

### 6.3 Narrow Viewport

- 390px: forms in a single column, tables scroll horizontally, buttons do not wrap out of place.
- 320px: an extreme-case check; perfection is not required.

### 6.4 Text Fixtures

Keep a fixed set of strings and test them on every revision:

```
Chinese long label: 企业级多云资源编排与合规审计 (enterprise multi-cloud resource orchestration and compliance audit)
CN/EN mixed: 在 Figma 中打开 v2.3.1 设计稿，共 128 个组件 (open the v2.3.1 design file in Figma, 128 components)
Extreme numbers: -1,234,567.89 / 99.99% / 0.00
Bilingual button: 保存更改 / Save changes
Long English: Internationalization & Localization Settings
```

### 6.5 Font Fallback

- DevTools → Network → block `*.woff2`, then reload.
- Check: whether line heights jump, whether buttons wrap, whether headings overflow.
- If the shift is obvious, add `size-adjust` / `ascent-override` to the fallback (L3, section 12).

### 6.6 Dark Mode and IME

- Body contrast in dark mode ≥4.5:1; light weights do not look blurry.
- The Chinese IME composition state (pinyin not yet committed) does not break the input box; `textarea` is at least 3 rows tall.

## 7. Metrics

| Metric | Target |
|---|---|
| Distinct font sizes per route | ≤5 (≤7 for marketing) |
| Distinct weights per route | ≤3 |
| Font families | ≤2 |
| Bare `font-size` declarations | 0 |
| Text below 12px | 0 (except a rare legend, documented) |
| Chinese body line height | ≥1.6 |
| `break-all` / italic Chinese | 0 |
| Text spacing override failures | 0 |

## 8. Exception Process

Exceptions are allowed; silent exceptions are not:

1. Write a comment in the code: reason, owner, removal date.
2. List the exception in the PR description.
3. If an exception lives beyond 3 months, either promote it to a token or fix it.

```css
/* Exception: brand wordmark fixed at 13px, to be removed at the 2027-03 brand refresh. @typography-owner */
.brand-wordmark { font-size: 13px; }
```

## 9. Minimal Context for an Agent

You do not need to stuff the entire skill into the prompt. Give three things, depending on the task:

1. `SKILL.md` (role table + the five hard rules + routing).
2. `tokens.css` (the single source of truth).
3. Exactly one most relevant reference: L3 for Chinese copy changes, L5 for component changes, L7 for writing lint rules.

And require the agent to **output the role mapping table before writing code**. If the role mapping is wrong, even the cleanest code is wrong.
