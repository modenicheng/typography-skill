# L8 · Sources: what we read, what we took, and where to discount it

Sources checked: 2026-11-20. What follows is paraphrase and distillation, not reproduction of the original text; for numbers, each system's current documentation governs.

## 1. Design systems

### Ant Design — Font

- Links: https://ant.design/docs/spec/font/
- Chinese original: https://github.com/ant-design/ant-design/blob/master/docs/spec/font.zh-CN.md
- What we took:
  - How the font stack is written (system fonts first, Emoji as fallback).
  - The derivation of a 14px base size with 22px leading (50cm monitor viewing distance, 0.3° visual angle).
  - **Keep the ramp to 3–5 steps**; "less is more"; "let the type jump like musical notes".
  - Use only 400/500 weights; 600 for Latin bold.
  - `tabular-nums` for numerals; 7:1 body contrast (AAA).
- Caveats: Ant's ramp is tuned for back-office UI; marketing pages need more aggressive jumps, and its 14px base size is unsuited to long-form reading.

### IBM Carbon — Typography

- Links: https://www.carbondesignsystem.com/building-blocks/foundations/typography/overview
- Type sets: https://www.carbondesignsystem.com/building-blocks/foundations/typography/type-sets
- What we took:
  - **Two ramps, Productive and Expressive**: the former has a 14px base and runs compact; the latter has a 16px base and works for long-form and marketing.
  - A 12–92px ramp generated from a single equation (12/14/16/18/20/24/28/32/36/42/48/54/60/68/76/84/92).
  - +0.32px tracking for 12px labels/code; +0.16px at 14px; zero from 16px up.
  - Headings at level 03 and above use Regular rather than Bold (at large sizes IBM Plex is already heavy enough).
  - Weight guidance: Light / Regular / SemiBold; SemiBold is not for long-form text.
- Caveats: Carbon's tracking is tuned for IBM Plex; swapping in Inter or Source Han Sans means retuning. Its Regular-weight headings also go against what most Chinese products do (Chinese display headings usually still want 500/600).

### Microsoft Fluent 2 — Typography

- Links: https://fluent2.microsoft.design/typography/
- What we took:
  - On Windows desktop the body baseline is **14/20**; Caption 12/16; Body Strong 14/20 600; Body Large 18/24; Subtitle 20/28; Title 28/36; Title Large 40/52; Display 68/92.
  - Each platform has its own Type Ramp; do not carry px values across platforms.
- Note: the site renders client-side, so the body text is hard to scrape directly; the ramp above was cross-checked against the public type ramps in Fluent UI / WinUI.
- Caveats: in a Chinese-language environment, Fluent's Segoe UI falls back to Microsoft YaHei, which has only 300/400/700 — 600 gets distorted. That is exactly why this skill insists on 500 for Chinese emphasis.

### Apple — Human Interface Guidelines: Typography

- Links: https://developer.apple.com/design/human-interface-guidelines/typography
- What we took:
  - iOS ramp: Large Title 34/41, Title1 28/34, Title2 22/28, Title3 20/25, Headline 17/22 Semibold, Body 17/22, Callout 16/21, Subheadline 15/20, Footnote 13/18, Caption1 12/16, Caption2 11/13.
  - **Hierarchy is not size alone**: weight, color, and whitespace work just as well.
  - Dynamic Type: text must scale with the system size setting, and layouts must accommodate larger sizes.
  - Guidance on truncation, scaling, and multiple languages.
- Caveats: Apple's pt values are not Web px; iOS's 17pt body usually maps to 16–17px on the Web, but desktop Web does not need to be that large.

## 2. Readability and accessibility

### USWDS — Typography

- Links: https://designsystem.digital.gov/components/typography/
- What we took:
  - Effective body size ≥16px; smaller sizes only for captions, footnotes, tables, and the like.
  - Measure of 45–90 characters, with a 66-character target for long-form text.
  - Long-form leading ≥1.5; headings 1.0–1.35.
  - Space above a heading ≥1.5× the space below it.
  - Small sizes may take added tracking; large sizes may take negative tracking; all-caps must take added tracking.
  - No first-line indents; use paragraph spacing.
  - Left-align by default; justified text is not recommended on the Web.
- Caveats: 45–90 characters is a Latin-script measure; 30–36 Chinese characters suits Chinese better (this skill unifies the two at 34em).

### WCAG 2.2

- Links: https://www.w3.org/TR/WCAG22/
- Relevant criteria:
  - **1.4.4 Resize Text**: content is not lost at 200% zoom.
  - **1.4.12 Text Spacing**: with leading ≥1.5, paragraph spacing ≥2em, letter spacing ≥0.12em, and word spacing ≥0.16em, content is neither lost nor overlapping.
  - **1.4.3 Contrast**: 4.5:1 for body text, 3:1 for large text.
  - **1.4.11 Non-text Contrast**: 3:1 for icons and borders.
  - **1.4.8 Visual Presentation** (AAA): stricter requirements on measure, alignment, and line spacing.
- What we took: the "text spacing override" in the acceptance protocol comes straight from 1.4.12; it does not ask you to typeset this way, it asks that nothing break when the user does.

### Butterick's Practical Typography

- Links: https://practicaltypography.com/typography-in-ten-minutes.html
- What we took:
  - Make the body text look good first; everything else comes after.
  - Body 15–25px (Web); line spacing 120–145%; measure 45–90 characters.
  - Use unitless leading values.
- Caveats: the author favors professional typefaces and argues against system fonts; in product UI, system fonts are a reasonable choice.

### Refactoring UI

- Links: https://refactoringui.com/
- What we took:
  - *Hierarchy is Everything*: hierarchy works by pushing the unimportant back, not by making the important bigger.
  - *Layout and Spacing*: group with spacing; use borders sparingly.
  - *Designing Text*: hands-on notes on measure, leading, alignment, and weight.
- Note: paid book, no free full text; this skill takes only the ideas and copies nothing.

## 3. Chinese typesetting

### W3C clreq — Requirements for Chinese Text Layout

- Links: https://www.w3.org/TR/clreq/
- What we took:
  - Han characters and punctuation are both 1:1 squares in principle, set seamlessly — this is the basis for "you cannot casually add tracking to Chinese".
  - Punctuation occupies one character width; mainland punctuation sits toward the lower left of the square character frame (horizontal setting), while Hong Kong and Taiwan center it; vertical and horizontal settings place punctuation differently.
  - Line-breaking prohibitions at line start and line end; hanging punctuation at line end; width adjustment for consecutive punctuation.
  - Mixed Chinese–Latin typesetting: about a 1/4-character gap between Han and Latin; the gap is omitted when the Latin sits at line start or line end.
  - Leading, baseline, widows and orphans, heading treatment.
- Caveats: clreq mainly addresses books and publications; Web UI only needs its principles (square character frame, line-breaking prohibitions, spacing) and does not need to replicate print-grade vertical alignment.

### General Rules for Punctuation (GB/T 15834—2011) 《标点符号用法》

- The standard text is not freely available; clreq Appendix A has a complete punctuation table with usage comparisons.
- What we took: the form and position of punctuation in mainland Simplified Chinese; the six-dot ellipsis, the two-character em dash, and quotation mark nesting levels.
- Note: Hong Kong and Taiwan use 「」『』, the mainland uses “”‘’; do not mix them within one product.

### Type-foundry practice articles (secondary reference)

- Example: https://www.hellofont.cn/article/chinese-english-font-pairing-2026
- What we took: at the same size, Latin looks optically smaller and Han characters look optically heavier; add a half-width gap between Chinese and English; use tabular figures in tables.
- Caveats: commercial foundry content carries a product bias, and the practice of "scaling Latin up 5–10%" does not suit body text (it requires splitting spans, which breaks i18n). This skill allows manual compensation only in brand wordmark scenarios.

## 4. Tokens and engineering

### W3C DTCG — Design Tokens Format Module

- Links: https://www.designtokens.org/tr/drafts/format/
- What we took:
  - `$type` / `$value` / `$description` / `$extensions`; groups and aliases `{group.token}`.
  - A composite `typography` token: fontFamily, fontSize, fontWeight, lineHeight, and letterSpacing bound into a single unit.
  - File extension `.tokens.json`; MIME type `application/design-tokens+json`.
- Caveats: still a Community Group Draft (2025.10) with uneven tooling support; treat it as an interchange format and CSS variables as the runtime.

### Tailwind CSS — font-size

- Links: https://tailwindcss.com/docs/font-size
- What we took:
  - Size and leading are defined as pairs; v4 uses `--text-*` and `--text-*--line-height`.
  - The default ladder can be reused as-is, or overridden with this document's six steps.
- Caveats: the default `text-sm` is 14px and `text-base` is 16px, yet `text-[15px]` still turns up in real projects; you need lint to seal off arbitrary values.

### CSS Text Level 4 / MDN

- `text-autospace`: https://developer.mozilla.org/en-US/docs/Web/CSS/text-autospace
  - Controls spacing between CJK and Latin/numerals; reached Baseline in late 2025.
- `text-spacing-trim`: https://developer.mozilla.org/en-US/docs/Web/CSS/text-spacing-trim
  - Controls internal punctuation trimming for CJK and handling at line start; currently mainly Chromium support (Limited availability), so use it as progressive enhancement.
- `line-break`: `strict` tightens line-breaking prohibitions; `normal` already includes the basic ones.
- Starting with Chrome 118, the 10px minimum font size for Chinese, Japanese, and Korean text was removed — meaning 9px Chinese really will render, which makes discipline matter more.

## 5. Number comparison across systems (to help pick a primary reference)

| System | Body size | Body leading | Ramp range | Notes |
|---|---|---|---|---|
| Ant Design | 14 | 22 | 12–68 (10 steps) | Back-office UI; 3–5 steps in practice |
| IBM Carbon | 14 (Productive) / 16 (Expressive) | 20 / 24 | 12–92 | Dual ramp; heading 03+ uses Regular |
| Fluent 2 (Windows) | 14 | 20 | 12–68 | Per-platform ramp; Caption 12/16 |
| Apple (iOS) | 17 | 22 | 11–34 | Dynamic Type; pt, not px |
| USWDS | ≥16 (effective) | ≥1.5 | Tokenized | Government sites; readability first |

Pick one system as the primary reference. This document's defaults: for product UI, take the density of Carbon Productive + Fluent's 14/20 + Ant's Chinese-language experience, then add +0.15–0.25 to Chinese leading.

## 6. Considered but not adopted

- **Material Design 3**: body is mostly 14sp and the ramp runs large; good for native Android, not for dense desktop tools.
- **JLReq (Requirements for Japanese Text Layout)**: highly similar to Chinese (line-breaking prohibitions, ruby, horizontal-in-vertical setting); worth consulting if you do a Japanese edition.
- **KLReq (Korean)**: Korean uses spaces to delimit words, so its line-breaking rules differ from Chinese — do not mix them.
- **Bringhurst, *The Elements of Typographic Style***: a classic of print typography; its ideas about proportion and rhythm still apply, but the specific values are aimed at books.
