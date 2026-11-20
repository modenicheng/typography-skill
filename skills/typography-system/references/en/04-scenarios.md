# L4 · Contexts: Decide whether to read or scan, then choose density

The same set of roles should yield different density, measure, and weight in different contexts. **A mode is a property of the surface, not of the company**: one product can run an admin app, a docs site, and a marketing site at the same time, but all three must share one set of role names and one ramp family.

## 1. The five modes

| Mode | Base size | Ramp (px) | Body (CJK/Latin) | Measure | Weight | Typical context |
|---|---|---|---|---|---|---|
| Productive | 14 | 12 · 14 · 16 · 20 · 28 | 14/22 · 14/20 | Set by the container | 400/500/600 | Admin, settings, IDE, desktop tools |
| Reading | 18 | 13 · 15 · 18 · 24 · 32 | 18/32 · 18/28 | 30–34em | 400/600 | Docs, blogs, reports, help centers |
| Expressive | 16–20 | 14 · 16 · 20 · 28 · 48 · 64 | 18/32 · 18/28 | 24–28em | 300–700 | Landing pages, brand pages, release pages |
| Reference | 12–14 | 12 · 13 · 14 · 18 · 24 | 13/20 · 13/18 | Full width | 400/500 | Data tables, logs, code, monitoring |
| Presentation | 24 | 24 · 28 · 32 · 40 · 56 | 24/34 · 24/32 | 18–22em | 400/600 | Slides, big screens, launch events |

> The numbers come from Carbon's dual Productive/Expressive ramp, Fluent's 14/20 baseline, Ant's 14px primary size and 3–5 step recommendation, and USWDS's 16px body floor, then adjusted for CJK line height.

## 2. How to choose

```
What is this screen mainly asking people to…
├─ Read a block of continuous text? → Reading
├─ Find, compare, and click through a lot of data? → Reference (mostly tables/logs) or Productive (mostly forms/actions)
├─ Be persuaded, feel the brand? → Expressive
└─ Look at it projected to a room full of people? → Presentation

One more layer: are platform-native controls in use?
├─ Yes → Native (Fluent / Apple); do not force Web px on it
└─ No → the Web modes above
```

Two common misjudgments:

- **Admin is not automatically Reference.** Settings and form pages are Productive; only data-dense tables and logs are Reference.
- **Docs are not automatically Reading.** API references and parameter tables are Reference; only tutorials and guides are Reading.

## 3. Productive

**Goal**: let users see more actionable information per unit of area without fatiguing them.

- Body 14/22 (CJK) 14/20 (Latin); this is the primary size, not "small text."
- Headings 20/30, page title 28/40; do not use anything above 32 to take up vertical space.
- Table cells 14, row height 40–48, cell padding 8–12.
- Labels at 500, buttons at 500, active states at 500 + color; do not manufacture hierarchy with 600.
- Tight spacing: 16–24 between blocks, 12–16 between fields.
- No more than 5 sizes and 3 weights per screen.

**Do not**: push body text down to 13px for a "premium" feel; stretch line height to 1.9 for "breathing room" (then two lines no longer fit on a screen).

## 4. Reading

**Goal**: long stretches of continuous reading without fatigue.

- Body 18/32 (CJK) 18/28 (Latin); 16/28 minimum.
- Measure 30–34em; past 36em you must add line height.
- Paragraph spacing 1em; no first-line indent (Web convention).
- Serif is allowed — 宋体 (Song) or Noto Serif SC — but only at ≥16px.
- Few heading levels: page 32/44, section 24/36, body 18/32.
- Links use an underline, not color alone.
- Code blocks 13/22 mono at 1.7 line height, horizontal scrolling allowed.

**Do not**: set documentation body text at 14px; set long CJK prose at 1.4 line height; bold whole paragraphs.

## 5. Expressive

**Goal**: create a memory point; allow a larger size contrast and less text.

- Display type 48–64/1.1–1.2; page title 28–40; body 18/32.
- The hierarchy may skip two levels (64 → 20), because a marketing page carries little text.
- Weight may go up to 700, but large CJK at 700 goes mushy, so prefer 600.
- Measure 24–28em; the copy is short, so avoid long paragraphs.
- Generous whitespace: 48–96 between blocks.
- Serif headings + sans body may be mixed, but define it in tokens; do not swap it per page on a whim.

**Do not**: carry the marketing page's size system back into the product UI; let display type reach tables or forms.

## 6. Reference

**Goal**: locate and compare quickly inside dense data.

- Tables 13/18 (CJK) 13/16 (Latin); 12 minimum.
- Table header 12/18 (CJK) 12/16 (Latin) at 500, secondary color allowed; no all-caps (meaningless for Chinese).
- Numeric columns `tabular-nums`, right-aligned; units go in the header.
- Row height 32–40; zebra striping and grid lines, choose one, never both.
- Column width = content + 20% headroom; CJK columns at least 6em.
- Code and logs 12–13/18 mono, horizontal scrolling allowed, no soft wrap (unless it is a narrative log).
- Legends and axis labels 12; anything below 11 is unreadable.

**Do not**: set multi-line CJK cells at 14px with 1.2 line height; make table headers 10px all-caps.

## 7. Presentation

- Body from 24/34; 20 minimum.
- Headings 40–56; never more than 2 levels per slide.
- ≤20 Han characters per line; ≤5 lines per slide.
- Measure 18–22em; do not run edge to edge.
- Contrast beats refinement: light on dark or dark on light, and avoid mid-gray.
- Scale numbers to 32–56 and make them the visual subject.

## 8. Native: do not port CSS px

Web px and native pt/sp/dp are not the same thing, and default sizes differ per platform.

### Windows (Fluent 2 / WinUI)

| Style | Size/Line height | Weight |
|---|---|---|
| Caption | 12/16 | 400 |
| Body | 14/20 | 400 |
| Body Strong | 14/20 | 600 |
| Body Large | 18/24 | 400 |
| Subtitle | 20/28 | 600 |
| Title | 28/36 | 600 |
| Title Large | 40/52 | 600 |
| Display | 68/92 | 600 |

Windows desktop tools use 14/20 as the body baseline; that matches Productive mode, so the role names carry over directly.

### Apple (iOS / iPadOS)

| Style | Size/Line height | Weight |
|---|---|---|
| Large Title | 34/41 | Bold |
| Title 1 | 28/34 | Regular |
| Title 2 | 22/28 | Regular |
| Title 3 | 20/25 | Regular |
| Headline | 17/22 | Semibold |
| Body | 17/22 | Regular |
| Callout | 16/21 | Regular |
| Subheadline | 15/20 | Regular |
| Footnote | 13/18 | Regular |
| Caption 1 | 12/16 | Regular |
| Caption 2 | 11/13 | Regular |

iOS must support Dynamic Type (via `UIFontMetrics` / `.font(.body)`); do not hard-code pt. On the Web, iOS body text starts at 16px and inputs start at 16px (otherwise focusing auto-zooms).

### Android

Use `sp` and the Material Type Scale (Display/Headline/Title/Body/Label), body at 16sp; support system font scaling.

## 9. One product, many surfaces

Recommended approach:

1. One global set of role names: `page / section / body / label / caption`.
2. One ramp family (the same px set); only density and measure switch.
3. Every route declares its mode: `<main data-mode="productive">`.
4. Marketing pages may enable `display`; product pages must not.
5. Docs sites may enable serif; admin surfaces must not.

Counterexample: the admin app uses 14px, the docs site spins up a second 17px ramp, and the marketing page adds 18/24/36 — three sites, three sets of role names, and in the end nobody remembers them.

## 10. Print and PDF

- CJK body text at 五号 (10.5pt), line spacing 1.5; headings in 黑体 (Hei sans), body in 宋体 (Song serif).
- Latin body text 10–12pt, line spacing 1.3–1.45.
- Margins ≥2cm; measure 60–75 characters.
- Do not print the screen's 12px caption as-is; it comes out too small.
- Write print styles separately in `@media print`; do not reuse screen density.

## 11. Context self-check

- [ ] Is this page read or scanned? Does the mode match actual behavior?
- [ ] Does body text hit that mode's floor on the target device?
- [ ] Does the measure land inside that mode's range?
- [ ] Does display type appear only on surfaces that allow it?
- [ ] Do native screens use the platform ramp rather than CSS px?
- [ ] Are role names consistent within the same product?
