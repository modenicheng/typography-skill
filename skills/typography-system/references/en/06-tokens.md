# L6 · Tokens: Turning Decisions into Code

Tokens are not about "renaming CSS variables"; they are about **turning design decisions into a single source of truth**. There are three layers:

1. **Primitive**: the atomic values for font size, weight, line height, and spacing. Referenced only by the semantic layer; pages never use them directly.
2. **Semantic**: role-level tokens such as `--text-body-size`. Pages and components use this layer only.
3. **Component-level** (optional): such as `--button-height-md`. Build one only when a component needs a size independent of its role.

Overbuilding the third layer leaves you with hundreds of variables and a table nobody maintains. **Default to stopping at the second layer.**

## 1. Naming

```
--{category}-{role}-{property}
--text-body-size
--text-body-leading
--text-body-weight
--text-page-size
--space-4
--font-sans
--weight-medium
--tracking-display
```

Rules:

- Category first, role in the middle, property last; do not write `--body-text-font-size`.
- Role names must match SKILL.md, the Figma text styles, and the component API exactly.
- No abbreviations (`--txt-bd-sz`) unless the team already has a hard convention.
- States go in a suffix (`--color-text-muted`), never inside the role name (`--text-body-disabled`).

## 2. CSS Implementation

The full file is in `templates/tokens.css`; the core structure:

```css
:root {
  /* Families */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI Variable Text",
    "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC",
    "Source Han Sans SC", sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas,
    "Noto Sans Mono CJK SC", monospace;

  /* Weights */
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;

  /* Sizes */
  --text-display-size: 3rem;
  --text-page-size: 1.75rem;
  --text-section-size: 1.25rem;
  --text-body-size: 1rem;
  --text-label-size: 0.875rem;
  --text-caption-size: 0.75rem;

  /* Line heights (Chinese by default) */
  --text-display-leading: 1.1667;
  --text-page-leading: 1.4286;
  --text-section-leading: 1.5;
  --text-body-leading: 1.75;
  --text-label-leading: 1.5714;
  --text-caption-leading: 1.5;

  /* Spacing */
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

### Language Overrides

Line heights change with language; sizes do not. Pages whose primary language is English switch at the root element:

```css
:root:lang(en) {
  --text-page-leading: 1.2857;
  --text-section-leading: 1.4;
  --text-body-leading: 1.5;
  --text-label-leading: 1.4286;
  --text-caption-leading: 1.3333;
}
```

When density and language stack, use an ancestor selector so the English density values are not overwritten:

```css
:root:lang(en) [data-density="reading"] {
  --text-page-leading: 1.25;
  --text-section-leading: 1.3333;
  --text-body-leading: 1.5556;
  --text-label-leading: 1.4667;
}
```

English paragraphs and English product names inside a Chinese page **inherit the page's Chinese line height**, with no local override. This is intentional: a looser line height does no harm to English, whereas the reverse crowds it.

### Density Overrides

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

Set density on the container (`<main data-density="compact">`), not on every component.

### Role Utility Classes

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

Do not ship atomic size classes such as `.text-15` or `.fs-17` — they are just arbitrary values under a new name.

## 3. DTCG Format

The W3C Design Tokens Community Group format uses `$type` / `$value` and supports composite `typography` tokens (binding family, size, weight, line height, and letter spacing into a single unit). This solves exactly the problem of "the agent gets the font size right, then casually changes the line height."

```json
{
  "text": {
    "body": {
      "$type": "typography",
      "$description": "Body; CJK leading 1.75, overridden to 1.5 for English via lang",
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

See `templates/tokens.tokens.json` for the full example. Note:

- A composite token is all-or-nothing: referencing it should give you size, line height, weight, and letter spacing together.
- When you need to switch by density, create two composite tokens, `text.body` and `text.body.compact`, rather than overriding the parts separately.
- Aliases use `{group.token}`; filenames use `.tokens.json`, and the MIME type is `application/design-tokens+json`.
- The spec is still a Community Group Draft with uneven tool support; treat DTCG as the exchange format and CSS variables as the runtime.

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

Now `text-body` carries its own line height and weight, so an agent does not need to (and cannot easily) change the line height on its own. Add an ESLint rule banning `text-[13px]` (see L7) and arbitrary values are essentially sealed off.

## 5. Figma and the Design Side

- Name text styles the same as tokens: `text/page`, `text/section`, `text/body`, `text/label`, `text/caption`.
- Bind all four properties in every style — size, line height, weight, letter spacing; do not bind the size alone.
- Keep one style set per language (`text/body/zh`, `text/body/en`), or use a line-height override inside a single set.
- Expose only the semantic layer in Variables; do not expose primitives to designers, so nobody picks 15px directly.
- Text layers in the component library use styles, never hand-set sizes.

## 6. Native Mapping

| Role | SwiftUI | Compose | WinUI |
|---|---|---|---|
| page | `.largeTitle` or `.title` | `headlineLarge` | `TitleTextBlockStyle` |
| section | `.title2` | `titleLarge` | `SubtitleTextBlockStyle` |
| body | `.body` | `bodyLarge` | `BodyTextBlockStyle` |
| label | `.callout` / `.subheadline` | `labelLarge` | `BodyStrongTextBlockStyle` |
| caption | `.caption` | `bodySmall` | `CaptionTextBlockStyle` |

Use the platform text styles on native platforms, so type follows Dynamic Type, the system font size, and accessibility settings. Do not transcribe the web's 28px into `.system(size: 28)`.

## 7. Dark Mode

**Typography does not change; only colors do.** Do not reduce weight or size in dark mode; light weights look blurry on a dark background, so raise 300 to 400 when necessary.

- Body contrast ≥4.5:1, large text ≥3:1.
- Do not give secondary text 40% opacity; supply a color value that meets contrast instead.
- Pure black (#000) behind pure white text produces halation; use something like #121212 / #E6E6E6.
- In dark mode `-webkit-font-smoothing: antialiased` thins the strokes, so use it with care; never enable it in light mode.

## 8. Migration

1. Create the new token and keep the old one as an alias (`--old-body-size: var(--text-body-size)`).
2. Replace components in bulk with a codemod.
3. Run visual regression and confirm there is no difference.
4. Delete the old token; flag the breaking change in the CHANGELOG.

Do not maintain two parallel token sets long-term; that becomes two sources of truth.

## 9. Verification

- Variable snapshot: any change to `tokens.css` must appear in the PR diff.
- Visual regression: cover at least the four combinations default / reading / compact / dark.
- Contrast: run text contrast once with axe or Lighthouse.
- Density switching: switch one page through all three densities; overflow and overlap are not allowed.
- Language switching: under `lang="zh-CN"` and `lang="en"`, both the line heights and the line breaks are correct.
