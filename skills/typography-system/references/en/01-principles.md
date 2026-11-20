# L1 · Principles: Typographic order comes from comparison, not decoration

This layer provides no numbers. It answers one prior question: **why does this page look messy?** Numbers live in L2, language differences in L3. If the hierarchy itself is wrong, no font size will save it.

## 1. Three variables, not ten

The visual "loudness" of a block of text is determined by four things, in order of influence:

1. **Font size** (size) — determines the area it occupies.
2. **Weight** (weight) — determines stroke density.
3. **Color/contrast** (color) — determines how much it jumps out.
4. **Whitespace** (space) — determines what it groups with.

Beginners only adjust item 1, and end up with "everything is emphasized = nothing is." The mature approach: **fix the font size first and build hierarchy with 2, 3, and 4; only when the difference is still not enough do you touch font size — and then jump a whole step, never nudge it by 1px.**

> Refactoring UI puts this in chapter one, *Hierarchy is Everything*: hierarchy is not "make the important things bigger" but "make the unimportant things less noticeable." The difference: the former keeps adding, the latter keeps subtracting.

## 2. Why 3–5 steps

Ant Design's type guidelines explicitly recommend keeping the ramp to 3–5 sizes within a system (presentation pages excepted). The reason is not aesthetics but the **recognition threshold**:

- When adjacent sizes differ by less than about 15%, readers cannot perceive "these are two levels"; they only feel "this is misaligned."
- When the difference exceeds about 15%, every level can be named.
- The more steps there are, the harder naming becomes, and the more an agent will dither between 15/16/17.

So the ramp should "jump": 12 → 14 → 16 → 20 → 28 → 48. Adjacent ratios are 1.17 / 1.14 / 1.25 / 1.4 / 1.71 — the jumps get bigger as you go up. Ant describes this as "letting type jump like musical notes" — **either the same level or clearly a different level, never a half level.**

## 3. Consistent ≠ uniform

The classic design-system mistake is reading "consistent" as "every page looks the same." The real constraints are:

- **Same role, same set of values** (consistency).
- **Different context, different density allowed** (adaptability).
- **Exceptions must be explicit** (auditable).

So this skill uses "role × density" rather than "one fixed set of px": roles are stable, density is variable, and exceptions go into the PR.

## 4. Typographic color

A page of text looks like a gray block from a distance. The depth of that gray is typographic color, determined jointly by font size, weight, line height, tracking, and measure.

- Smaller line height → darker gray → denser, more productive.
- Heavier weight → darker gray → reads more like a heading.
- Wider tracking → lighter gray → more presentation-like, but past 0.05em it falls apart.

CJK gray is naturally darker than Latin gray: Han characters carry more strokes and fill their em box. **At the same size and weight, a CJK block looks blacker.** That is why CJK body text often needs a larger line height to breathe, and why adding tracking to CJK is a bad idea.

## 5. Reading vs scanning

Two behaviors, two sets of measurements. Do not mix them:

| | Reading | Scanning |
|---|---|---|
| Context | Documents, reports, long-form, help centers | Admin consoles, tables, settings, dashboards |
| Behavior | Continuous line-by-line reading | Finding targets, comparing, tapping |
| Font size | Starts at 16–18px | Starts at 13–14px |
| Line height | 1.6–1.8 | 1.4–1.6 |
| Measure | 30–36em | Set by the container; wider is allowed |
| Hierarchy | Few and stable | Many and shallow |
| Decoration | Some room for it | As little as possible |

An 18px body on an admin page feels loose; a 14px body on a docs site feels cheap. **First decide whether the user is reading or scanning this page, then pick the density.**

## 6. Spacing is part of typography

Between letters it is tracking, between lines it is line height, between blocks it is spacing. The three together set the rhythm.

- Use multiples of 4: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64.
- **Proximity**: related things close together, unrelated things apart. The space between a heading and the body beneath it should be smaller than the space between that heading and the preceding paragraph (USWDS recommends at least 1.5× as much above as below).
- Do not process every block with evenly distributed margins; that makes every relationship look equally distant.
- Paragraph spacing over first-line indent: on the web and in UI, use paragraph spacing, not a 2em indent (CJK print tradition uses indentation, but on-screen reading and responsive layout suit paragraph spacing better).

## 7. Alignment and measure

- **Left alignment is the default.** Centering is only for short headings, covers, and empty states, and never more than 2 lines.
- **Justify only for long CJK text**, and only together with punctuation trimming; justified short UI text produces ugly inter-character gaps.
- **Measure 34em**: about 34 Han characters or 68 Latin characters. Past 40em the eye loses the line on the return sweep; under 25em lines break too often.
- Right-align numeric columns, left-align text columns; do not center text just to look tidy.

## 8. Optical corrections

Spacing that is mathematically even does not look even. Places that need manual correction:

- Punctuation: the glyph of a full-width mark sits to one side, so at line start and line end it must be trimmed or hung.
- Quotes and brackets: they need a smaller margin on the outside.
- Large sizes: tighten tracking for Latin, keep it at 0 for CJK.
- Icons and text: the visual center is not the geometric center; they need 1px-level nudging.
- Figures: tabular figures in tables, proportional figures in body text.

## 9. Sign off with real content

Lorem ipsum hides every problem. You must use:

- The longest CJK label (8–12 characters).
- One sentence of mixed typesetting (product name, numbers, units included).
- Extreme numbers (1,234,567.89 / -0.05% / 99.99%).
- Empty, error, and loading states.
- The same button after a language switch (登录 / Log in).

## 10. Anti-pattern quick reference

| Anti-pattern | Why it is wrong | Instead |
|---|---|---|
| 8 font sizes on one page | No hierarchy, only noise | Cap at 5 roles |
| Bolding everything to signal importance | Bold stops working; the page gets loud | De-emphasize secondary content with color; use 500/600 for emphasis |
| 1.2 line height on CJK body text | Han characters collide vertically | 1.6–1.8 |
| 0.1em tracking on CJK | Breaks up the square rhythm | 0 |
| Italics for CJK emphasis | Synthetic oblique, distorted glyphs | Weight/color/emphasis marks |
| Centered long text | Every line starts somewhere else; hard to find the next line | Left-align |
| Body text below 12px | CJK strokes merge | 12px only for supplementary information |
| Borders and shadows on every card | Boundary noise | Group with whitespace |

## Decision checklist

Once a page is done, ask in order:

1. How many font sizes are on the page? More than 5, consolidate.
2. How many weights? More than 3, consolidate.
3. Cover the color and look only at grayscale: does the hierarchy still hold?
4. Swap the Chinese for English (or the reverse): does the layout still hold?
5. Remove every border and shadow: is the grouping still clear?
6. Is the user reading or scanning this screen? Does the current density match?
