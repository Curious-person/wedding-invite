# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run lint     # ESLint
```

## Stack

- **Next.js 16** (App Router) — see `node_modules/next/dist/docs/` for this version's APIs before writing code
- **React 19**
- **Tailwind CSS v4** — configured via `@theme inline` in `globals.css`, not `tailwind.config.*`
- **TypeScript**

## Architecture

Single-page wedding invitation. All UI lives in `src/app/page.tsx`; no routing or API routes.

The page scrolls vertically: a full-viewport hero (`<header>`, the Figma frame) is followed by in-flow detail sections (Wedding Timeline, Dresscode, Direction, Entourage, Gift Registry) inside a centered `1440*var(--px)` column. Section content is driven by data arrays at the top of `page.tsx`.

### Layout scaling

The design is a fixed **1440 × 1024 px Figma frame** that scales proportionally to fit any viewport using a CSS custom property:

```css
--px: min(calc(100vw / 1440), calc(100dvh / 1024));
```

All pixel values in the JSX use `calc(N*var(--px))` — never raw `px` values. This is the core layout invariant; preserve it on every edit.

### Mobile (`max-md:`, < 48rem)

Below Tailwind's `md` breakpoint `--px` becomes `calc(100vw / 540)` (width-only, a 540-unit canvas) and the page reflows via `max-md:` overrides in `page.tsx`: the hero's absolutely-positioned Figma layers become a centered flex column (`max-md:static`, names stacked monogram-style, portraits side by side inside a `contents` wrapper), and two-column grids collapse to one column. Desktop classes are untouched — add mobile tweaks as `max-md:` variants alongside them.

### Design tokens (`globals.css`)

| Token | Value | Usage |
|---|---|---|
| `--color-gold` | `#d4af37` | Script name text |
| `--color-ink` | `#525252` | Label text |
| `--font-script` | Parisienne (Google Font) | Names — loaded via `next/font/google` in `layout.tsx` |
| `--font-narrow` | Arial Narrow stack | Labels |

### Reusable style constants (`page.tsx`)

- `label` — small uppercase Arial Narrow labels (24 px equivalent, `text-ink`)
- `script` — absolute-positioned Parisienne script text (`text-gold`)
- `heading` / `subheading` — in-flow Parisienne gold section titles (112 / 72 px)
- `title` — bold uppercase label (same style as the hero venue line)
- `body` / `bodyCaps` — wrapping Arial Narrow copy (20 px)
- `button` — ink-filled CTA, gold on hover

Both are plain string constants used as Tailwind class lists; extend them in the same file, not as separate components.

### Images

Stored in `public/images/`. Used via Next.js `<Image>` with `fill` + a `sizes` hint. The wallpaper (`damask-wallpaper.png`) is rendered twice: once as a full-viewport bleed layer and once clipped inside the 1440 × 1024 frame.
