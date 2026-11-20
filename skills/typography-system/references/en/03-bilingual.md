# L3 · Two Scripts: Metrics and Rules for Mixed Chinese/English Typesetting

Chinese and English are not “the same styles with a different language.” Han characters are fixed-width, with a square character frame; Latin letters are proportional. One fills that frame, the other lives in the x-height band. One may break between any two characters, the other must break at word boundaries. Applying English typographic parameters directly to Chinese is the root cause of “the glyphs are right but the page is still a mess.”

This layer proceeds in the order: choose fonts → set metrics → handle punctuation and line breaking → handle numerals and details.

## 1. Font stacks: Latin first, Chinese second

Principle: **the Latin font covers Latin characters, the Chinese font covers Han characters, and the fallback chain is filled in per platform.** Putting a Chinese font first makes English render in the proportional Latin glyphs bundled inside that Chinese font, which are usually narrower and older.

### System UI stack (recommended default)

```css
--font-sans:
  -apple-system, BlinkMacSystemFont, "Segoe UI Variable Text", "Segoe UI",
  Roboto, "Helvetica Neue", Arial,
  "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei",
  "Noto Sans CJK SC", "Source Han Sans SC", "WenQuanYi Micro Hei",
  sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
```

- macOS / iOS: Latin resolves to SF, Han to PingFang SC.
- Windows: Latin resolves to Segoe UI, Han to Microsoft YaHei.
- Android: Latin resolves to Roboto, Han to Noto Sans CJK.
- Linux: falls through to Noto Sans CJK / 文泉驿 (WenQuanYi).

Pros: no font loading, native look on every platform. Cons: **weights and glyph shapes differ across platforms** (see §2), and the brand feel is weak.

### Brand-consistency stack (when the product needs one face everywhere)

```css
--font-brand:
  "Inter var", Inter, "Noto Sans SC", "Source Han Sans SC",
  "PingFang SC", "Microsoft YaHei", sans-serif;
```

Web fonts come first so every platform hits the same glyph set; system fonts are only a backstop. Suitable for SaaS, cross-platform desktop tools, and public-facing brand pages.

Cost: Chinese font files are large (see §12), so limit the number of weights on the first screen.

### Reading serif stack (long-form text, reports, brand storytelling)

```css
--font-serif:
  "Source Serif 4", "Noto Serif SC", "Source Han Serif SC",
  "Songti SC", "SimSun", serif;
```

Song-style serif (宋体) has thin strokes and goes fuzzy at small screen sizes; **body text must be at least 16px**, and it is only for reading mode. Do not use serif in product UI.

### Monospace stack (code, IDs, numbers)

```css
--font-mono:
  ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas,
  "Liberation Mono", "Noto Sans Mono CJK SC", monospace;
```

A Chinese comment occupies two character widths in a monospace font, so alignment shifts wherever Chinese appears in a code block; that is expected. Do not pad Chinese comments with full-width spaces just to line things up.

## 2. Weight availability: check the table before you write 600

| Typeface | Available weights | Consequence |
|---|---|---|
| PingFang SC (macOS/iOS) | 100/200/300/400/500/600 | No 700; 700 maps to 600 |
| Microsoft YaHei (Windows) | 300/400/700 | **500/600 are mapped to 400/700** |
| Noto Sans SC (Web, variable) | 100–900 continuous | Recommended for cross-platform consistency |
| Source Han Sans SC (Web) | 7 weights (250–900) | Requires `unicode-range` subsetting |
| HarmonyOS Sans SC | About 5 weights | Device-specific; do not treat it as general-purpose |
| MiSans | Multiple weights | Specific to Xiaomi devices |

Therefore:

- **Prefer 500, not 600, for emphasis in Chinese body text.** The visual step is enough, and it does not jump to 700 on YaHei.
- For a heading that needs 600, **you must confirm the target platform has 600**; otherwise use 700 and accept the heavier look, or switch to a web font.
- Do not use `font-synthesis: weight` to let the browser fake bold: synthetic bold on Chinese turns to mush. If you must, set `font-synthesis-weight: none` so rendering falls back to a real weight.
- Chinese has no true italic. `font-style: italic` triggers synthetic oblique (a mechanical slant); **never use it for Chinese**.

## 3. At the same size, Chinese looks bigger and heavier

The cause is the character-face ratio: a Han character fills the em box, while Latin lowercase occupies only about 0.5em in height. Put 16px Chinese next to 16px English and the Chinese reads like 17–18px.

Two approaches; pick by context:

| Approach | Where it applies | Notes |
|---|---|---|
| **Same size; pick a Latin face with a large x-height** (recommended) | UI, body text, tables | Inter, IBM Plex Sans, Source Sans 3, and Public Sans have a larger x-height and sit closer to the Chinese gray value |
| Latin scaled up 5% | Brand wordmarks, covers, fixed lockups | Needs its own `<span lang="en">` wrapper; not for body text (it complicates both i18n and line breaking) |

Do not wrap every English word in a span to adjust its size. **Body size is set by the Chinese, and the English follows**; display-level wordmarks may be adjusted by hand.

## 4. Line height: Chinese is looser

| Font size | CJK leading | Latin leading |
|---|---|---|
| 12 | 1.5 (18px) | 1.33 (16px) |
| 14 | 1.57 (22px) | 1.43 (20px) |
| 16 | 1.75 (28px) | 1.5 (24px) |
| 20 | 1.5 (30px) | 1.4 (28px) |
| 28 | 1.43 (40px) | 1.29 (36px) |
| 48 | 1.17 (56px) | 1.08 (52px) |

When Chinese and English share a paragraph, **take the value for that paragraph’s dominant language**; a mixed paragraph always uses the Chinese value (the looser one). A little extra air under English never hurts; the reverse feels cramped.

Express line height as a unitless multiplier. If you must use px (a fixed-height toolbar, for example), use an even number and accept that it will not scale with font size.

## 5. Tracking: zero for Chinese

- Chinese body text and headings: `letter-spacing: 0`.
- English body text: `0`; at ≤12px you may use `+0.01em`; at ≥28px use `-0.01 ~ -0.03em`; all-caps labels `+0.05 ~ +0.08em`.
- Do not set one tracking value on a mixed container. When you need it:

```css
.prose { letter-spacing: 0; }
.prose :lang(en) { letter-spacing: -0.01em; } /* large sizes only */
```

Negative tracking makes Han strokes collide; positive tracking opens gaps between the squares. Both break the even rhythm of the character grid. Brand wordmarks may be an exception, but treat them as graphics, outside the text system.

## 6. Punctuation: full-width, prohibitions, trimming

### 6.1 Use the right marks

| Context | Correct | Wrong |
|---|---|---|
| Period / comma / enumeration comma | 。，、 | . , (half-width) |
| Semicolon / colon | ；： | ; : |
| Quotation marks (mainland) | “ ” ‘ ’ | " " ' ' |
| Quotation marks (Hong Kong/Taiwan, vertical writing) | 「」『』 | “” |
| Ellipsis | …… (two U+2026) | ... / 。。。 |
| Em dash | —— (two U+2014) | -- / — |
| Interpunct | · (U+00B7) | . |
| Title marks | 《》〈〉 | <> |

### 6.2 Line-breaking prohibitions (line start and line end)

- **Must not appear at the start of a line**: `，。、；：！？）》」』】〕〉` and also `%‰℃`.
- **Must not appear at the end of a line**: `（《「『【〔〈`.
- Do not break between a number and its unit, or between a number and a percent sign: wrap `20 kg` or `30%` in a no-break space (`&nbsp;`) or `white-space: nowrap`.
- Em dashes and ellipses must not be split across two lines.

CSS:

```css
.prose {
  line-break: strict;          /* tighten the prohibitions */
  word-break: normal;          /* do not use break-all */
  overflow-wrap: break-word;   /* backstop for long URLs and long English words */
  text-spacing-trim: normal;   /* collapse adjacent marks; progressive enhancement */
}
```

`line-break: strict` already works in most browsers; `text-spacing-trim` is not yet cross-browser (Chromium supports it fairly well, Safari/Firefox may ignore it) and does not affect readability. Switch to `trim-start` (compress an opening bracket at line start to half width) only when you need a tighter layout.

### 6.3 Punctuation trimming

Full-width punctuation carries a half-em blank on one side. In sequence (`）。`, `」，`) it leaves an extra half-em gap. `text-spacing-trim: trim-start` compresses an opening bracket at line start to half width and collapses the internal blank between adjacent marks; `normal` also collapses adjacent marks. Without the property, do not remove those blanks by hand—it breaks copy and search.

### 6.4 Punctuation and spaces

- **No spaces** before or after full-width punctuation.
- **About 1/4 em is required** between Chinese and English or digits (see next section), but not next to punctuation.
- No extra spaces inside brackets: `（示例）` (“example”), not `（ 示例 ）`.

## 7. CJK–Latin spacing: hand it to CSS, do not type spaces

clreq recommends about 1/4 of a Han character width between Han characters and Latin text. Three implementations:

| Method | Implementation | Assessment |
|---|---|---|
| CSS standard | `text-autospace: normal` | Preferred; no copy changes, so copying and searching still work; reached Baseline in late 2025 |
| Typed spaces | 「使用 Figma 设计」 (“design with Figma”) | Workable but unstable: language switching, line breaking, and copying all break; banned in UI copy |
| Thin space | `&thinsp;` / `\u2009` | More precise than a regular space, but still pollutes the text content |

```css
:lang(zh) { text-autospace: normal; }
/* when you need finer control */
:lang(zh) { text-autospace: ideograph-alpha ideograph-numeric; }
```

Notes:

- In browsers that support the property, `normal` is already the initial value; declaring it explicitly states intent and keeps a global style from switching it off.
- Browsers without support throw no error; the gap simply does not appear. If a particular piece of copy (a brand headline, say) must have the gap, handle it locally with a thin space `&thinsp;`—do not type spaces globally.
- `text-autospace` stacks with `word-spacing` and `letter-spacing`; do not set a negative `word-spacing` to “cancel” it.
- Where an explicit space already exists, the browser does not add another; typed spaces in legacy copy therefore do not become double spacing.
- No gap is produced at line start or line end.

## 8. Line breaking: Chinese by character, English by word

- Chinese may break between any two Han characters by default; that is correct behavior. Do not insert `<br>` or zero-width spaces to get “word-based” breaking.
- English breaks at word boundaries; enable `hyphens: auto` only for long-form text with `lang="en"`, never for headings.
- `word-break: break-all` is **prohibited** in mixed Chinese/English text: it cuts English words in the middle.
- When the container is too narrow, use `overflow-wrap: anywhere` (it breaks long words) or `text-overflow: ellipsis` (truncation).
- Use `text-wrap: balance` for headings (≤6 lines) and `text-wrap: pretty` for paragraphs to reduce orphans and overly short last lines.
- `word-break: auto-phrase` is currently supported mainly for Japanese; do not count on it to segment Chinese.

Widow and orphan control: CSS `orphans`/`widows` has limited support on the web, so rely mainly on `text-wrap: pretty` and manual adjustment of container width.

## 9. Numbers, units, dates

| Type | Rule | Example |
|---|---|---|
| Digits | Always half-width; no full-width digits | `1,234`, not `１２３４` |
| Thousands grouping | Add commas from four digits up; localized contexts may use 万/亿 (ten-thousand/hundred-million) | `1,234,567.89` / `123.5 万` |
| Decimal point | Use `.`, not `，` | `0.05` |
| Percentage | No space between the number and `%` | `30%` |
| Units | Space between number and unit (SI) | `20 kg`, `100 km/h` |
| Temperature | Space between the number and °C | `25 °C` |
| Currency | Symbol flush against the number, thousands grouping; currency explicit | `¥1,234.00`, `$1,234.00` |
| Date (UI) | ISO 8601 | `2026-11-20` |
| Date (running text) | Chinese convention | `2026 年 11 月 20 日` |
| Time | 24-hour clock, colon | `14:30` |
| Range | Connector dash; do not repeat the unit | `2026-11-20—11-30` |
| Negative numbers | Minus sign, not a full-width horizontal bar | `-0.05%` |

Numbers in tables: `font-variant-numeric: tabular-nums lining-nums`, right-aligned; align decimal places; put the unit in the table header, not in every cell.

## 10. Emphasis: Chinese has no italic

| Technique | Chinese | English |
|---|---|---|
| Weight | 400 → 500 (preferred) | 400 → 600 |
| Color | Primary/accent color | Same |
| Emphasis marks | `text-emphasis: dot` | Not used |
| Quotation marks | 「」/“” to flag terms | “” |
| Underline | Links only | Links only |
| Italic | **Prohibited** (synthetic oblique) | For book titles and terms, sparingly |

`text-emphasis` is a legitimate means of emphasis in Chinese, but web support is only fair (works in Chrome/Safari) and it increases the line height; use it only for individual words in body text.

## 11. Truncation and omission

- Single-line truncation: `overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`; the browser uses `…`.
- Multi-line truncation: `-webkit-line-clamp` plus `display: -webkit-box`, with a fixed line count, and a `title` or tooltip that shows the full text.
- **Never truncate**: page titles, form labels, error messages, button labels, the current breadcrumb item.
- For Chinese, start considering truncation at 4–6 characters for navigation items and 12–16 characters for table cells; for English, at 2–3 words.
- Truncation eats punctuation such as `…”`; allow an extra 1em when reserving width.

## 12. Font loading and fallback

Chinese font files are far larger than Latin ones:

- A complete weight is 3–10 MB; subsetted to the 3,500 common characters it is about 1–2 MB (woff2).
- Prefer system fonts for product UI; use web fonts only for brand and headline text, or where cross-platform consistency is genuinely needed.
- You must split with `unicode-range` (common characters separate from extended ones), or the first screen waits on one large file.
- `font-display: swap` for body text, `optional` for display faces (avoids layout shift).
- Define the fallback `@font-face` with `size-adjust`, `ascent-override`, and `descent-override` so the fallback takes up close to the same space as the real font.
- Preload only the one weight used on the first screen.

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

At acceptance testing, **disable web fonts** and look again: the layout should not shift and the line height should not collapse.

## 13. Vertical writing (Hong Kong/Taiwan and design work only)

- `writing-mode: vertical-rl`; lines run right to left.
- Latin letters rotate 90° by default (`text-orientation: mixed`); digits and abbreviations of 2–3 characters can stay upright with `text-combine-upright: all`.
- Punctuation sits differently from horizontal text: the period and comma go at the upper right of the character frame, opening brackets at the upper right and closing brackets at the lower left; do not reuse horizontal padding.
- Ruby annotations use `<ruby>` with `ruby-position: over`.
- Most product UI does not need vertical writing; where it does, build a separate set of components—do not force it with transform.

## 14. Bilingual text and localization

- `<html lang="zh-CN">`; tag English fragments with `lang="en"` so word breaking, quotation marks, and font fallback come out right.
- Do not concatenate a sentence from fragments (「共」 “total” + n + 「项」 “items”); use ICU MessageFormat.
- Chinese is usually shorter than English; English runs 20–40% longer. Reserve space for buttons, labels, and navigation based on the English length.
- Do not hard-code line breaks in copy; let CSS handle them.
- Do not put text in images; it cannot scale, be translated, or be searched.
- After switching languages, check: do buttons wrap, do labels truncate, do table columns jump?

## 15. Checklist

- [ ] Font stack puts Latin first and Chinese second, and covers macOS / Windows / Android.
- [ ] Chinese emphasis uses 500 rather than 600; no synthetic bold and no synthetic oblique.
- [ ] Chinese body line height ≥1.6; English ≥1.45; mixed paragraphs take the Chinese value.
- [ ] Chinese body text has `letter-spacing: 0`.
- [ ] Full-width punctuation is correct; no punctuation at line start; ellipses and em dashes are double characters.
- [ ] CJK–Latin spacing is handled by `text-autospace`; no typed spaces in UI copy.
- [ ] No `word-break: break-all`; long English words have a backstop.
- [ ] Digits are half-width, tables use tabular figures, units have spaces, dates are ISO.
- [ ] Truncation happens only where it is allowed, and there is a way to see the full text.
- [ ] Layout does not shift with web fonts disabled.
