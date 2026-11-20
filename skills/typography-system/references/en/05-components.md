# L5 · Components: Turning roles into concrete controls

The component layer does exactly one thing: **make correct typography the default, and make incorrect typography inexpressible.** If a button component exposes a `fontSize` prop, an agent will pass 15px every single time; if it exposes only `variant="primary|secondary"`, tokens are its only option.

The sizes below assume Productive / standard density; for Reading and Compact, swap sizes per L4 and leave spacing unchanged.

## 0. Component contract

Each component declares at the type level which roles it accepts:

```ts
type TextRole = "page" | "section" | "body" | "label" | "caption";
// Button only accepts label; Card accepts section/body/caption; no fontSize exposed
```

Rules:

- Components do not expose passthrough props such as `fontSize`, `fontWeight`, `lineHeight`.
- When visual variation is needed, expose a semantic variant (`emphasis="strong"`, `tone="muted"`) and map it to tokens internally.
- No raw values inside components; every size comes from `var(--text-*)`.
- At most two roles per component (e.g. Card: title + body).

## 1. Page frame

| Element | Role | Size | Spacing |
|---|---|---|---|
| Breadcrumb | caption | 12/18 | 8 to the title |
| Page title | page | 28/40 (CJK) 28/36 (Latin) | 8 below |
| Page subtitle | body / label | 14/22, secondary color | 16–24 below |
| Page actions | label | 14/20 | On the title's baseline, right-aligned |
| Start of content | — | — | 24–32 from the header |

Rules: one `page` per page; the title never shares the breadcrumb's size; action buttons do not compete with the title's weight.

## 2. Heading hierarchy

| Level | Role | CJK | Latin | Weight |
|---|---|---|---|---|
| h1 | page | 28/40 | 28/36 | 600 |
| h2 | section | 20/30 | 20/28 | 600 |
| h3 | body + 600 (subheading) | 16/26 | 16/24 | 600 |
| h4 | label | 14/22 | 14/20 | 600 |

h3 adds no new size: take body's 16px at 600, with a line height of 1.5–1.6 (26 CJK / 24 Latin). It is "a bold variant of body," not a seventh role.

Rules:

- No skipped levels (no h4 directly after h2); visual hierarchy matches DOM hierarchy.
- Space above a heading ≥1.5× the space below it (USWDS).
- A heading never runs past 2 lines; if it does, the copy is too long or the container too narrow.
- No tracking on CJK headings; large Latin headings may take negative tracking (L2).
- No `text-transform: uppercase` on headings (meaningless for Chinese, hard to read on long English headings).

## 3. Body and prose

- Body 16/28 (CJK) 16/24 (Latin), max-width 34em.
- Paragraph spacing 1em; no first-line indent.
- In-paragraph emphasis uses 500 or color only, not italics (CJK).
- Blockquote: 2px left border + 16 left padding, inherited size, secondary color; no full-paragraph italics.
- Divider: 1px, at 60% of the border color; do not add one after every paragraph.

```css
.prose { font-size: var(--text-body-size); line-height: var(--text-body-leading); max-inline-size: 34em; }
.prose > * + * { margin-block-start: 1em; }
.prose :lang(zh) { text-autospace: normal; }
```

## 4. Lists

- Same size and line height as body.
- Item spacing 8; nested lists indent 1.5em without changing size.
- Chinese separates inline enumerations with 、 (the ideographic comma) and uses bullets at block level; do not mix the two.
- Ordered lists use tabular figures with right-aligned markers.
- When a list item runs past 4 lines, consider a subheading + paragraph instead.

## 5. Buttons

| Size | Height | Horizontal padding | Font size | Use |
|---|---|---|---|---|
| sm | 28 | 10 | 14/20 | In-table, compact toolbars |
| md | 32 | 12 | 14/20 | Default |
| lg | 40 | 16 | 14/20 | Primary form actions, mobile |

Rules:

- Text uses the label role at weight 500; 2–4 characters in Chinese, 1–3 words in English, sentence case.
- No `letter-spacing` (it scatters CJK); all-caps English buttons only in the rarest brand context.
- Icon-to-text gap 6–8; icon-only buttons must be at least 32×32 and carry an `aria-label`.
- One primary button per screen; secondary buttons are outline or text buttons.
- No wrapping inside a button: `white-space: nowrap`; shorten long CJK copy, do not shrink the type.
- Minimum width 64; icon-only buttons 32.
- Touch targets ≥44×44 (mobile may extend invisibly).

Counterexamples: a button at `font-size: 15px`, a CJK button with `letter-spacing: 1px`, three primary buttons of equal weight.

## 6. Links

- Size inherits from body; color contrast ≥4.5:1.
- Underlined by default (`text-underline-offset: 2–3px`); never distinguish by color alone.
- Inline links carry no extra weight; navigation links may use 500.
- External-link icon 12–14, with a 4 gap to the text.
- CJK link text 2–8 characters, English 1–4 words; never 「点击这里」 (click here).

## 7. Forms

| Element | Role | Size | Spacing |
|---|---|---|---|
| Field label | label | 14/22, 500 | 8 to the input |
| Required marker | caption | 12/18, accent color | 4 to the label |
| Input text | body / label | 14/22 (desktop) 16/24 (mobile) | — |
| Placeholder | same | same size, secondary color | — |
| Help text | caption | 12/18 | 4 to the input |
| Error text | caption | 12/18, error color | 4 to the input |

Rules:

- Input height 36–40; padding 8–12; text vertically centered.
- **Mobile input text ≥16px**, otherwise iOS Safari zooms the page on focus.
- Labels sit above the field; do not use the placeholder as the label (it disappears the moment the user types).
- Error messages go below the field, not in a tooltip, and pair with `aria-describedby`.
- Character counts use caption, right-aligned; they change color near the limit, not size.
- Select options match the input size; option height ≥32.
- Checkbox and radio labels match body size, and the click target includes the label.
- Multi-column forms align labels consistently: all top-aligned or all right-aligned, never mixed.

Counterexamples: a 12px form label, a 14px mobile input, error text set as red 10px.

## 8. Tables

| Element | Role | Size | Notes |
|---|---|---|---|
| Table header | caption | 12/18 (CJK) 12/16 (Latin), 500, secondary color | No all-caps |
| Cell | body (compact) | 14/22 (CJK) 14/20 (Latin) | 12 minimum |
| Numbers | same + tabular | Right-aligned | Align on the decimal |
| Row height | — | 40–48 | 32–36 compact |
| Cell padding | — | 8–12 vertical, 12–16 horizontal | Wider for CJK columns |

Rules:

- Headers and content left-aligned; numbers right-aligned; status columns centered or left-aligned, the same way throughout the table.
- Zebra striping or grid lines, one of the two; having both looks noisy.
- Truncate long CJK with an ellipsis + tooltip; do not shrink the type to force a fit.
- Column width = content +20%; CJK columns at least 6em, Latin columns at least 8em.
- Sort and filter controls use caption or an icon; do not enlarge the header size for them.
- An empty table gets an empty state; do not leave a shell with only a header row.

## 9. Cards

- Padding 16 (compact) or 24 (spacious).
- Title 16/24 600 (or 14/22 600); body 14/22; metadata 12/18.
- 8 between title and body; 16 between body and actions.
- Do not nest cards inside cards; group with dividers or a background tint instead.
- When the whole card is clickable, either style the title as a link or hover the whole card; do not ship two interaction models.

## 10. Navigation

| Element | Role | Size | Notes |
|---|---|---|---|
| Sidebar item | label | 14/20, 500 | Height 36–40, padding 8–12 |
| Group heading | caption | 12/18, 500, secondary color | No all-caps |
| Top-bar tabs | label | 14/20, 500 | Height 40, gap 24 |
| Breadcrumb | caption | 12/18 | Separator `/` or `›` |
| Pagination | label | 14/20 | 32×32 buttons |

Rules:

- The active state uses two of the three — weight 500, color, background; never color alone.
- CJK nav items 4–6 characters; past that, truncate + tooltip, or shorten the copy.
- Navigation must not change size as the page scrolls; no "shrink on scroll."
- Bottom nav labels at 10–11px are a common mobile exception, but 10px CJK is already hard to read; use 11–12 and keep only 4–5 items.

## 11. Badges, tags, status

- Badge 12/18, height 20–24, padding 0 6–8; 1–4 characters in Chinese.
- Status dot + text: dot 6–8px, gap 6.
- Color is not the only information: pair status with text or an icon (accessibility).
- No 10px badges; no tracking on CJK badges.
- Count badges use tabular figures and show `99+` past 99.

## 12. Tooltips and feedback

| Component | Title | Body | Width |
|---|---|---|---|
| Tooltip | — | 12/18 (CJK) 12/16 (Latin) | ≤240 |
| Popover | 14/22 600 | 14/22 | 240–360 |
| Toast | 14/22 600 | 14/22 | 320–400 |
| Alert | 14/22 600 | 14/22 | Container width |
| Inline error | — | 12/18 | Field width |

Rules:

- A tooltip holds a short phrase only, never a paragraph; touch devices need another trigger.
- Toasts auto-dismiss in 3–5 seconds and can be closed manually; do not put anything the user must decide in a toast.
- Alert icons align to the text baseline; 4 between title and body.
- Error messages say how to fix it, not 「出错了」 ("something went wrong").

## 13. Dialogs and drawers

- Title 20/28 600 (16/24 600 compact); body 14/22; buttons use label.
- Max width 480 (forms) / 640 (content); on mobile, full width minus 32.
- 12 between title and body; 24 between body and actions.
- Long content scrolls inside; do not stretch the whole dialog taller.
- CJK titles ≤12 characters; past that use a subtitle or body copy.

## 14. Empty states and loading

- Title 16/24 600; description 14/22, max 40em, centered, ≤2 lines.
- One primary action; do not put three buttons there.
- Illustration height ≤160; do not let a big image squeeze the copy.
- Skeleton rows match the real content's line height, so nothing jumps when loading finishes.
- Empty-state copy is specific: 「还没有项目，创建一个开始」 (No projects yet — create one to start) beats 「暂无数据」 (No data).

## 15. Code, logs, JSON

- 13/20 mono, line height 1.6–1.7; container padding 12–16.
- Long lines scroll horizontally, no soft wrap; narrative logs may wrap.
- Line numbers use caption, right-aligned, tabular figures, not selectable.
- CJK comments take two cells in mono, which is normal; do not align with full-width spaces.
- JSON keys and values use different colors at the same size.

## 16. Charts

| Element | Role | Size |
|---|---|---|
| Chart title | label | 14/22 600 |
| Axis label | caption | 12/18 (CJK) 12/16 (Latin) |
| Legend | caption | 12/18 |
| Data label | caption | 12/18 (CJK) 12/16 (Latin) |
| Annotation | caption | 12/18 |

Rules:

- Axis labels never below 11px; CJK axis labels start at 12px.
- Numeric axes use tabular figures and thousands separators; units go in the axis title.
- No more than 5 legend items; beyond that, interactive filtering.
- No 3D, shadows, or gradient fills; data-ink ratio comes first.
- Distinguish series by shape or line style in addition to color (colorblind-friendly).

## 17. Dates, times, numbers

- Times in lists use relative time (3 分钟前, three minutes ago); the tooltip gives the absolute time.
- Dates in tables use ISO (2026-11-20), never `11/20/26`.
- Amounts right-aligned, two decimals, tabular figures; no space between the currency symbol and the number.
- Large numbers use thousands separators or 万/亿; pick one site-wide.
- No space between a number and its percent sign (30%).

## 18. Search and highlighting

- Highlighting changes the background color only, never size, weight, or line height.
- Highlight contrast ≥4.5:1; do not use low-contrast pairings other than black on pure yellow.
- Keep 20–30 characters of context on each side of a match so the paragraph does not reflow.
- CJK search does no stemming; for English, keep matching case-insensitive.

## 19. Component acceptance

- [ ] Components expose no arbitrary size or weight props.
- [ ] Every component uses at most two roles.
- [ ] Buttons, tags, and table cells are never pushed below 12px.
- [ ] Mobile inputs are ≥16px.
- [ ] Long CJK copy neither breaks the layout nor shrinks into small type.
- [ ] Empty, error, and loading states all have typography defined.
- [ ] Icons align to the text baseline.
- [ ] Roles stay the same in dark mode; only colors change.
