---
name: typography-system
description: "Design, extend, or audit a product typography system for Chinese–English mixed interfaces. Use when choosing font sizes, line heights, weights, or letter-spacing; defining a type ramp or design tokens; fixing inconsistent, cramped, or arbitrary Chinese text; pairing Latin and CJK fonts; specifying heading/body/label/caption roles for dashboards, docs, marketing pages, desktop or mobile apps; or when an agent keeps inventing ad-hoc font styles. Covers semantic roles, bilingual metrics, punctuation and line breaking, component rules, CSS/DTCG/Tailwind tokens, and lint enforcement. 触发词：排版、字体、字号、行高、字重、字距、中英混排、设计系统。"
license: MIT
---

# Bilingual Typography System

English · [中文](SKILL.zh-CN.md)

> Consistency is not a matter of taste; it is a matter of constraint: **the role decides the size, the size comes from the ramp, and nothing outside the ramp exists.**

The docs are layered L1–L8: this file is the contract (L0), `references/en/` expands each layer in English, and `templates/` holds copy-ready implementations. Read this file first, then open only the layer you need. The Chinese originals live in `references/`.

This skill is not about "making type look nice". It is about making it impossible for an agent or a team to invent a new font style on the fly. It gives Chinese and Latin separate metrics because the same pixel values produce different visual weight, leading needs, and line-breaking behavior in the two scripts.

## When to use

- Building or overhauling a product's type system: sizes, weights, leading, tracking, hierarchy.
- Mixed Chinese–Latin text looks muddy, scattered, or misaligned.
- Writing AGENTS.md or lint rules that ban arbitrary values such as `text-[13px]` and `font-size: 15px`.
- Specifying type for dashboards, desktop tools, docs, marketing pages, mobile, or native desktop UI.
- Reviewing a page where "the sizes are all correct, but it still looks messy".

## When not to use

- Typeface design, font production, or font licensing.
- Book-level typesetting that needs a real layout engine (InDesign, LaTeX, Typst). Read L1/L3 for principles, but do not apply this skill's CSS values there.
- A one-line request such as "make this heading a bit bigger". Just do it; do not start the full workflow.

## Five hard rules

1. **One screen: at most 5 sizes, 3 weights, 2 families** (one sans + one mono; serif only in reading or marketing contexts).
2. **Sizes come only from the ramp.** To add one, delete an existing one and justify it in the PR.
3. **Build hierarchy with weight, color, and space first**, size last. Do not bold and enlarge everything.
4. **CJK leading ≥ Latin leading.** A mixed paragraph takes the CJK value; Latin follows.
5. **Every typographic value is a token.** No raw `font-size`, `font-family`, or `letter-spacing` in pages.

## Role model

A role is semantic, not a size. Every text node has exactly one role; the size changes with density, the role does not.

| Role | CJK size/leading | Latin size/leading | Token prefix | Use | Constraint |
|---|---|---|---|---|---|
| display | 48/56 | 48/52 | `--text-display-` | covers, marketing heroes | never in product UI |
| page | 28/40 | 28/36 | `--text-page-` | page title (h1) | at most one per page |
| section | 20/30 | 20/28 | `--text-section-` | module heading (h2) | do not skip levels |
| body | 16/28 | 16/24 | `--text-body-` | prose, descriptions | ≥16 for long-form |
| label | 14/22 | 14/20 | `--text-label-` | buttons, forms, tables, nav | primary size in dense UI |
| caption | 12/18 | 12/16 | `--text-caption-` | helper text, timestamps, footnotes | never for body copy |

`display` is optional and only enabled in Expressive contexts. Monospace is not a role but a family variant: code, IDs, and numbers keep body/label sizes and switch only `--font-mono`.

## Default ramp (standard density)

Units are rem (16px root). Leading is shown as a ratio with the pixel value in parentheses; prefer unitless values.

| Role | Size | CJK leading | Latin leading | Weight | Tracking |
|---|---|---|---|---|---|
| display | 3rem (48) | 1.17 (56) | 1.08 (52) | 600 | Latin −0.02em; CJK 0 |
| page | 1.75rem (28) | 1.4286 (40) | 1.2857 (36) | 600 | 0 |
| section | 1.25rem (20) | 1.5 (30) | 1.4 (28) | 600 | 0 |
| body | 1rem (16) | 1.75 (28) | 1.5 (24) | 400 | 0 |
| label | 0.875rem (14) | 1.5714 (22) | 1.4286 (20) | 500 | 0 |
| caption | 0.75rem (12) | 1.5 (18) | 1.3333 (16) | 400 | Latin +0.01em; CJK 0 |

The three densities change only size and leading, never roles or weights:

| Role | Reading | Standard | Compact |
|---|---|---|---|
| page | 32/44 · 32/40 | 28/40 · 28/36 | 24/34 · 24/32 |
| section | 24/36 · 24/32 | 20/30 · 20/28 | 18/26 · 18/24 |
| body | 18/32 · 18/28 | 16/28 · 16/24 | 14/22 · 14/20 |
| label | 15/24 · 15/22 | 14/22 · 14/20 | 13/20 · 13/18 |
| caption | 13/20 · 13/20 | 12/18 · 12/16 | 12/18 · 12/16 |

Each cell is "CJK size/leading · Latin size/leading".

**Measure**: `max-inline-size: 34em`. One Han character is about 1em and one Latin character about 0.5em, so 34em is roughly 34 Chinese characters or 68 Latin characters — one rule for both scripts.

**Spacing**: multiples of 4 — `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64px`. Space above a heading must be at least 1.5× the space below it.

## Seven-step workflow

0. **Recon**: read the existing tokens, shared components, and 2–3 real pages. Inherit the existing system before creating a parallel one.
1. **Choose the mode**: use L4 to decide between Productive, Reading, Expressive, and Reference. A product may have several modes but only one ramp family.
2. **Assign roles**: label every text node. If a block has no role, the hierarchy is usually wrong — it is not a missing size.
3. **Set bilingual metrics**: confirm the font stack, CJK leading, mixed-script spacing, line breaking, and punctuation strategy against L3.
4. **Encode tokens**: write primitive → semantic layers per L6. Never hard-code values in components.
5. **Apply components**: check buttons, tables, forms, and navigation against L5.
6. **Verify**: run the script and the manual checks in L7. Cover 200% zoom, 390px width, long Chinese strings, mixed text, and font fallback.
7. **Show evidence**: list added/removed tokens, the role mapping, changed files, and verification results. "Optimized" without evidence does not count.

## Ten bilingual checks

1. **Han characters read heavier at the same size.** Hanzi fill the em box while Latin letters sit around the x-height. Use 400 for Chinese and 500 for Latin to get similar visual weight.
2. **Chinese needs more leading.** Body copy: 1.6–1.8 for Chinese, 1.45–1.6 for Latin; the gap narrows to about 0.1 at heading sizes.
3. **Never add tracking to Chinese.** Body tracking is 0; `letter-spacing` breaks the square rhythm. Adjust Latin only for uppercase labels or large headings.
4. **Chinese has no italic.** Do not use faux italic; emphasize with weight, color, emphasis dots, or quotation marks.
5. **Chinese punctuation occupies one em.** Handle line-start prohibitions, adjacent-punctuation trimming, and hanging punctuation. In CSS: `line-break: strict` and `text-spacing-trim`.
6. **Leave about a quarter-em between Han and Latin.** Prefer `text-autospace: normal`; never hand-type spaces in UI strings.
7. **CJK weights are often incomplete.** Windows Microsoft YaHei has only Light/Regular/Bold, so 500/600 snap to 400/700. Use a variable web font, or use only 400/700.
8. **12px is the Chinese floor.** Below 12px, strokes merge. Use 14px in dense UI and 16px and up for long-form text.
9. **Half-width digits, tabular figures.** Use `font-variant-numeric: tabular-nums` for tables and money, proportional figures in prose; never full-width digits.
10. **Different line-breaking.** Chinese may break between characters but not before punctuation; Latin breaks at word boundaries. Never use `word-break: break-all`.

## Routing: read the right file

| What you need | Read |
|---|---|
| Understand why, or diagnose hierarchy | `references/en/01-principles.md` |
| Choose sizes/leading/weights/tracking, build a responsive ramp | `references/en/02-scale.md` |
| Mixed text, font stacks, punctuation, line breaking, numbers | `references/en/03-bilingual.md` |
| Decide density for product/docs/marketing/data surfaces | `references/en/04-scenarios.md` |
| Lay out buttons, tables, forms, navigation, empty states | `references/en/05-components.md` |
| Write CSS/DTCG/Tailwind tokens, themes, dark mode | `references/en/06-tokens.md` |
| Write AGENTS.md, lint rules, CI, acceptance checks | `references/en/07-enforcement.md` |
| Trace a source, verify a number, read further | `references/en/08-sources.md` |

Copy-ready files:

- `templates/tokens.css` — variables and role utilities
- `templates/tokens.tokens.json` — DTCG format
- `templates/AGENTS.typography.md` — hard rules for agents
- `templates/audit.mjs` — zero-dependency audit script
- `examples/spec.html` — interactive visual spec sheet

## Output contract

When you change typography, report:

1. **Token changes**: added/removed/renamed tokens, and why.
2. **Role mapping**: which role each text block uses (table or comments).
3. **Blast radius**: affected components and pages.
4. **Evidence**: script output, key measurements, screenshots or recordings.
5. **Known exceptions**: where you deliberately deviated, why, and when it will be removed.

## Red flags

- `text-[15px]`, `font-size: 17px`, `style={{ fontSize: 13 }}` in the code.
- More than 6 sizes or 4 weights on one page.
- `font-weight: 600` with Microsoft YaHei and no variable font.
- Chinese body copy with non-zero `letter-spacing`, or `line-height` below 1.4.
- `word-break: break-all` or `text-align: justify` on short UI text.
- `!important` on type, or tokens redefined inside components.
- Text embedded in images (cannot scale, cannot translate).
- Acceptance done only with English samples, never with long Chinese or mixed text.

## Acceptance checklist

- [ ] Every size comes from the ramp; no new raw values.
- [ ] Every text block has a role; the page has exactly one page title.
- [ ] CJK body leading ≥ 1.6, Latin ≥ 1.45.
- [ ] Mixed text has spacing, and no hand-typed spaces.
- [ ] No punctuation at line start; no split English words.
- [ ] No text below 12px; table figures are tabular and right-aligned.
- [ ] Holds at 200% zoom and 390px width without clipping or overlap (WCAG 1.4.4 / 1.4.12).
- [ ] With web fonts blocked, fallback does not shift the layout.
- [ ] Bilingual switches such as Log in / 登录 do not wrap or misalign buttons and labels.
- [ ] Dark mode contrast ≥ 4.5:1 (≥ 3:1 for large text).
