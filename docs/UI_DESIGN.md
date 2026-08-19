# UI Design System

Established on the landing page (`app/page.tsx` + `components/`). Applies
to new UI going forward; not yet applied retroactively to anything since
the landing page is the first real page built.

## Colors

Defined as CSS variables in `app/globals.css`, exposed to Tailwind via
`@theme inline`:

| Token | Light | Dark |
|---|---|---|
| `background` | `#ffffff` | `#0a0a0a` |
| `foreground` | `#171717` | `#ededed` |
| `muted` | `#6b7280` | `#9ca3af` |
| `border` | `#e5e7eb` | `#27272a` |
| `surface` | `#f9fafb` | `#131316` |
| `accent` | `#4f46e5` (indigo-600) | `#818cf8` (indigo-400) |
| `accent-foreground` | `#ffffff` | `#0a0a0a` |

Used as Tailwind utilities: `bg-background`, `text-foreground`,
`text-muted`, `border-border`, `bg-surface`, `bg-accent`,
`text-accent-foreground`.

## Typography

Geist Sans (body/UI) and Geist Mono (code), loaded via `next/font/google`
in `app/layout.tsx`. No custom type scale beyond Tailwind's default text
sizes (`text-sm`, `text-lg`, `text-2xl`, `text-4xl`/`text-5xl` for hero).

## Spacing

Tailwind defaults; page sections use a `max-w-5xl`/`max-w-3xl` container
with `px-6` horizontal padding.

## Components

- `SiteHeader` — top nav with logo text + links (`components/SiteHeader.tsx`)
- `Hero` — headline, subheadline, two CTAs (`components/Hero.tsx`)
- `Roadmap` — grid of feature cards with a status badge (`components/Roadmap.tsx`)
- `SiteFooter` — bottom bar (`components/SiteFooter.tsx`)

## Buttons

Two variants used so far: solid (`bg-accent text-accent-foreground`) for
the primary action, and outlined (`border border-border`) for secondary.
No disabled/loading states designed yet since no buttons trigger async
actions yet.

## Cards

`Roadmap` items: `rounded-xl border border-border bg-surface p-6`.

## Forms

Not designed yet — no form exists in the codebase.

## Animations

None implemented.

## Responsive breakpoints

Tailwind defaults (`sm:` etc.). Landing page tested by resizing the
browser locally; no dedicated mobile-device testing done yet.

## Dark mode

Implemented via `prefers-color-scheme: dark` media query in
`app/globals.css` (system-driven, no manual toggle). Verified visually in
the browser dev server.

## Accessibility

Not formally audited. Semantic elements used (`header`, `nav`, `main`,
`section`, `footer`, `h1`/`h2`/`h3`); links have visible focus via browser
default outline (not customized). No screen-reader or automated a11y
testing has been done.
