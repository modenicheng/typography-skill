# AGENTS.md 排版片段

把下面这段并入项目根目录的 `AGENTS.md`（Claude Code 用 `CLAUDE.md`，Cursor 用 `.cursor/rules/typography.mdc`，Codex 用 `AGENTS.md`）。它假设项目里已有 `tokens.css`，并把示例数值换成你的实际值。

---

## UI Typography and Visual Consistency

Before implementing or modifying any UI:

- Inspect existing design tokens (`tokens.css`, theme config) and shared components.
- Preserve the existing visual language; do not introduce a parallel one.
- Prefer reuse over new visual styles.
- If no token exists for what you need, stop and ask — do not add one silently.

### Roles

Use only these semantic roles. Every text block must map to exactly one.

| Role | Size | CJK line-height | Latin line-height | Weight | Use |
|---|---|---|---|---|---|
| page | 28px | 40px | 36px | 600 | one per page |
| section | 20px | 30px | 28px | 600 | module heading |
| body | 16px | 28px | 24px | 400 | prose, descriptions |
| label | 14px | 22px | 20px | 500 | buttons, fields, tables |
| caption | 12px | 18px | 16px | 400 | helper, meta, timestamps |

`display` is allowed only on marketing/brand surfaces, never in product UI.
`code` is not a role: use the monospace family at body/label size.

### Hard rules

- Never write a raw `font-size`, `font-family`, `line-height`, or
  `letter-spacing` in a component or page. Use `var(--text-*)`,
  `var(--font-*)`, `var(--tracking-*)`.
- No arbitrary values: `text-[13px]`, `leading-[1.2]`,
  `tracking-[.1em]`, `style={{ fontSize: 15 }}` are errors.
- Never introduce a new size or weight without deleting an existing one
  and explaining why in the PR.
- One UI family; monospace only for code, IDs, and tabular data.
- Chinese body line-height ≥ 1.6. Never add letter-spacing to Chinese.
- Chinese emphasis uses weight 500, not 600 — Microsoft YaHei has no
  500/600 and will snap to 400/700.
- Never italicize Chinese. Never use `word-break: break-all`.
- Do not use caption for substantial content. Never go below 12px.
- Prefer weight, color, and spacing over size when adjusting hierarchy.
- Buttons: use the label role, never shrink text to fit; shorten the copy.
- Mobile inputs: 16px minimum (iOS auto-zooms below 16px).
- Numbers in tables: `font-variant-numeric: tabular-nums`, right-aligned.

### Spacing

Use 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64px only.
Space above a heading must be at least 1.5× the space below it.

### Bilingual

- Wrap the page language in `<html lang="zh-CN">` or `<html lang="en">`.
- Do not insert spaces by hand between Chinese and Latin; rely on
  `text-autospace` (already set on `.prose`).
- Use full-width Chinese punctuation (，。、；：！？) inside Chinese text.
- Ellipsis is `……`; dash is `——`; never `...` or `--`.
- Do not truncate: page titles, form labels, error messages, buttons.

### Verification (run before finishing)

- [ ] Every text block maps to one role.
- [ ] No new font sizes or weights; `grep` for `font-size:` returns only tokens.
- [ ] Holds at 200% zoom and 390px width.
- [ ] Long Chinese labels (8–12 chars) and CN/EN mixed strings do not overflow.
- [ ] With web fonts blocked, layout does not shift.
- [ ] Dark mode contrast ≥ 4.5:1.
- [ ] `node tools/audit.mjs src` passes.

If a new token is truly necessary, explain why in the PR and delete an
existing one first.

---

## 给 Agent 的额外提示（可选）

- 先输出「角色映射表」再写代码。映射错了，代码再干净也是错的。
- 不确定用哪个角色时，选 `body`；不确定字号时，不要新建，问人。
- 不要用 `font-size: 0.9em` 做「稍微小一点」；那会破坏阶梯。
- 看到旧代码里的裸值，不要照抄；顺手替换成 token 是加分项。
