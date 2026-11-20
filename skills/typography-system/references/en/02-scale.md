# L2 · Scale: Roles, font sizes, line height, weight, tracking

This layer provides numbers. The numbers are not the single correct answer, but **there must be only one set**. Pick one primary reference (Carbon, Fluent, Ant, or this document) and use the other systems only to fill gaps; mixing them yields intermediate values like 15px, 17px, and 22px that nobody recognizes.

## 1. How the scale is built

A usable ramp must satisfy three things at once:

1. **Distinguishable neighbors**: adjacent levels differ by ≥15% (nameable by eye).
2. **Restrained count**: 5 levels for product UI, at most 7 for marketing pages.
3. **Clean landings**: sizes land on whole px; standard and compact ramps prefer even numbers (12/14/16/18/20/24/28/32/40/48), reading density may use odd values like 13/15, but within a single density they must be systematic. Line height lands on a 2px or 4px grid.

Do not mechanically generate every size from a single ratio (say 1.25): at small sizes it produces values like 12.5 and 15.6, and at large sizes the jump is not big enough. **Dense at the bottom, sparse at the top** — a non-geometric ramp works better.

Three ready-made ramps (mapping one-to-one to the densities in SKILL.md):

| Use | Ramp (px) | Ratio |
|---|---|---|
| Product / standard | 12 · 14 · 16 · 20 · 28 · 48 | 1.17 / 1.14 / 1.25 / 1.4 / 1.71 |
| Reading / documents | 13 · 15 · 18 · 24 · 32 | 1.15 / 1.2 / 1.33 / 1.33 |
| Compact / data | 12 · 13 · 14 · 18 · 24 | 1.08 / 1.08 / 1.29 / 1.33 |

In the compact ramp, 12 and 13 are only 1px apart; separate them with **color and weight** (caption in the secondary color at 400, label in the primary color at 500) — do not rely on the size itself.

## 2. Line height

Line height is not "a percentage of the font size"; it is **the breathing room needed beyond the glyph box itself**. Han characters fill the em box, Latin letters occupy only x-height to cap-height, so:

> **CJK line height ≈ Latin line height + 0.2** (at the same size and the same measure)

Ranges by size band:

| Font size | CJK line height | Latin line height | Notes |
|---|---|---|---|
| 12–13 | 1.5–1.6 | 1.33–1.4 | Supplementary information; no lower |
| 14–16 | 1.6–1.75 | 1.43–1.5 | Body and primary UI size |
| 18–24 | 1.5–1.6 | 1.33–1.4 | Lead-ins, second-level headings |
| 28–40 | 1.35–1.45 | 1.2–1.3 | Page titles |
| 48+ | 1.15–1.3 | 1.05–1.15 | Display type; tight is allowed |

Two additional rules:

- **The wider the measure, the taller the line height**: a long 34em line needs 1.7–1.8; a 20em column is fine at 1.5.
- **The larger the size, the smaller the ratio**: 28px at 1.43 (40px line height), 48px at 1.17 (56px).

Always write line height as a **unitless multiplier**, not in px. That way it follows size changes, and enlarging the font does not squeeze it.

## 3. Weight

Use only four steps: 400 / 500 / 600 / 700. Product UI in practice only uses the first three.

| Weight | Use | CJK caveat |
|---|---|---|
| 400 Regular | Body, tables, descriptions | Default |
| 500 Medium | Labels, buttons, emphasis, active state | First choice for CJK emphasis; the visual increment is gentle |
| 600 Semibold | Headings, key figures | CJK fonts often lack this step; may be substituted with 700 |
| 700 Bold | Display type, the rare strong emphasis | CJK goes mushy at large sizes; avoid at ≥28px |

Rules:

- No more than 3 steps per screen.
- **Do not pair 600 with Microsoft YaHei (微软雅黑)**: it only ships Light/Regular/Bold, so 500/600 are mapped to 400/700 and you get "either nothing changed or it is too heavy." Either use 400/700, or switch to a variable font.
- 300 Light only for display type at ≥32px, and it is only safe on dark backgrounds.
- Variable fonts can be tuned continuously, but tokens still expose discrete steps only, to avoid values like 437.

## 4. Tracking (letter-spacing)

Tracking is an **optical correction**, not decoration. Latin needs tightening at large sizes and loosening at small sizes; CJK is the opposite — any non-zero tracking breaks the square rhythm.

| Context | Latin | CJK |
|---|---|---|
| Body 13–16px | 0 | 0 |
| Small text ≤12px | +0.01em | 0 |
| Large headings 28–40px | -0.01 ~ -0.02em | 0 |
| Display 48px+ | -0.02 ~ -0.03em | 0 |
| All-caps labels | +0.05 ~ +0.08em | Not applicable |
| Brand wordmark | Adjust per typeface | +0.02 ~ +0.05em allowed, wordmark only |

**Do not use negative tracking on CJK body text.** The sidebearing of a Han character is part of its design; tightening makes strokes collide. Nor should you set `letter-spacing` on a mixed typesetting container as a whole, or the Latin gets tightened while the CJK gets squeezed. When needed, target it with `:lang(en)`.

## 5. Responsive

- Keep the root font size at `100%`; do not set px on `html`. Use rem throughout, so that the whole page scales when the user changes the browser default size.
- **Do not make body text fluid**: `clamp()` turns 16px into values like 15.2px and breaks the ramp. Body text switches density only at breakpoints (standard → compact).
- **Display type may be fluid**: `clamp(2.5rem, 4vw + 1rem, 4rem)`, but both bounds must land on the ramp.
- Use only two breakpoints: `≤640px` (compact/mobile) and `>640px` (standard). Do not write a separate size set for every device.
- At 200% zoom, horizontal scrolling, clipping, and overlap are not allowed (WCAG 1.4.4).

## 6. Measure and alignment

- `max-inline-size: 34em` (about 34 Han characters / 68 Latin characters).
- Acceptable range 30–36em; narrow columns 24–28em; a wide-screen reading area should not exceed 40em.
- Left-align; justify only for long CJK text, and together with `text-spacing-trim` and `line-break: strict`.
- `text-wrap: balance` for headings, `text-wrap: pretty` for paragraphs (progressive enhancement; browsers that do not support it ignore it).

## 7. Numerals

- Tables, amounts, stat cards: `font-variant-numeric: tabular-nums lining-nums` to keep digits aligned.
- Body text: proportional figures (the default); smoother to read.
- Do not use full-width digits (１２３), and do not replace numeric values in UI with Chinese numerals ("三" vs "3").
- Decimal alignment, thousands separators, percentages, and unit spacing follow the rules in L3.

## 8. Common size decisions

| Need | Choose | Avoid |
|---|---|---|
| Dense admin body | 14/22 (CJK) 14/20 (Latin) | 13/18 |
| Long-form body | 16–18 / 1.7 | 14/1.4 |
| Table cell | Same size as body, 1.5 line height | A separate 13px |
| Button | label 14/20, height 32–40 | 16px button text |
| Form label | label 14/22 | caption 12 |
| Helper text | caption 12/18 | Same size as body |
| Page title | page 28/40 | A 32/36 mix |
| Card title | 16/24 600 or 14/20 600 | 18/22 |
| Chart axis label | caption 12/16 | 10px |

## 9. Self-audit metrics

Run this once in DevTools, or use `templates/audit.mjs`:

```js
// Count the font sizes, weights, and families actually used on the current page
const sizes = new Set(), weights = new Set(), families = new Set();
for (const el of document.querySelectorAll('body *')) {
  const s = getComputedStyle(el);
  if (!el.textContent.trim()) continue;
  sizes.add(s.fontSize); weights.add(s.fontWeight); families.add(s.fontFamily);
}
console.log({ sizes: [...sizes].sort(), weights: [...weights], families: [...families] });
```

Targets: font sizes ≤5 (≤7 on marketing pages), weights ≤3, font families ≤2.

## 10. Do not mix design systems

Ant's 12/14/16/20/24/30/38, Carbon's 12/14/16/20/28/32/42, and Fluent's 12/14/18/20/28/40 each have their own logic. Pick one as the primary reference; use the other two only to answer "how did someone else handle this situation." Do not take one number from each and splice them together. The resulting ramp has no ratios, no names, and no explanation.
