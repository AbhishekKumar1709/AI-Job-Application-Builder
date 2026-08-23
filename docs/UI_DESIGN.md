# UI Design System

Established on the landing page (`app/page.tsx` + `components/`), then
applied consistently to every page built since — auth, profile, resumes,
applications, account settings all reuse the same tokens and shared
input/button classes rather than inventing new styling per page.

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
`text-accent-foreground`. Unchanged since the landing page was built —
every page since reuses this same palette, no new tokens added.

## Typography

Geist Sans (body/UI) and Geist Mono (code), loaded via `next/font/google`
in `app/layout.tsx`. No custom type scale beyond Tailwind's default text
sizes (`text-sm`/`text-lg`/`text-2xl`/`text-4xl`-`text-5xl` for the hero).
The compact resume template additionally uses `text-[10px]`/`text-[11px]`
one-off sizes for dense print layout — the only place custom pixel sizes
appear outside the default scale.

## Spacing

Tailwind defaults; page sections use a `max-w-5xl`/`max-w-3xl`/`max-w-2xl`
container with `px-6` horizontal padding depending on content width
(narrower for single-column forms, wider for the landing page).

## Forms

Implemented and used throughout — every data-entry page (profile,
resumes, applications, account settings, auth) shares the same three
class constants, defined once in `components/profile/types.ts` and
imported everywhere rather than redefined per component:

```ts
inputClass = "rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
buttonClass = "rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
secondaryButtonClass = "rounded-lg border border-border px-3 py-1.5 text-sm hover:border-accent disabled:opacity-50"
```

Text inputs, textareas, `<select>`s, and date/month/url/tel inputs all
use `inputClass` — no visual distinction by input type. Every async
form button shows a loading label (e.g. `"Saving…"`) and is `disabled`
during the request, using `buttonClass`'s built-in `disabled:opacity-50`.

## Buttons

Two variants, used consistently: solid (`buttonClass`) for the primary
action per section, outlined (`secondaryButtonClass`) for secondary
actions (Edit, Delete, Cancel, reorder arrows). Both have disabled/loading
states, exercised on every async action in the app (save, delete,
generate, etc.) — no longer a gap, as it was when only the landing page
existed.

## Cards

`rounded-lg border border-border p-4` (list items — experience entries,
applications, cover letters) or `rounded-xl border border-border
bg-surface p-6` (landing page roadmap cards, the original pattern).

## Components

Landing page (unchanged since first built):
- `SiteHeader` — top nav with logo text + links
- `Hero` — headline, subheadline, two CTAs, a status badge (kept in
  sync with actual feature status — see `components/Roadmap.tsx`)
- `Roadmap` — grid of feature cards, each with a "Live" badge (every
  item is live now; the type only allows that one status)
- `SiteFooter` — bottom bar

Shared editing pattern (profile + every resume, see
[ARCHITECTURE.md](./ARCHITECTURE.md)):
- `components/profile/{ExperienceForm, ExperienceSection, EducationForm,
  EducationSection, SkillsSection, types}.tsx` — one list-and-form
  implementation per entity type, parameterized by an `apiBase` prop so
  it works against both `/api/profile/*` and `/api/resumes/:id/*`
  without duplication. Includes up/down reorder buttons per entry.

Page-level components: `ProfileEditor`, `ResumeEditor` (+ template
selector), `ResumeList` (+ search), `ResumePreview` (classic + compact
templates), `ResumeImport`, `ResumeAITools`, `ApplicationsList` (+
search/status filter), `AccountSettings`.

## Resume templates

Two visually distinct print/PDF layouts, selectable per resume
(`components/ResumePreview.tsx`):
- **Classic** — spaced, single-column, traditional resume layout.
- **Compact** — dense, two-column header (name/headline left, contact
  block right-aligned), accent-colored uppercase section headers with a
  bottom border, skill pills instead of a plain line.

## Print styles

`app/globals.css` `@media print` block: `.no-print` hides UI chrome
(back links, the download button) from print output; forces a white
background and dark text regardless of the viewer's dark-mode setting
(printing in dark mode would waste ink and look wrong on paper); strips
the border/padding from `.resume-doc` so the printed page is just the
document. Used by `/resumes/:id/preview`'s "Download / print PDF" button
(`window.print()` — no PDF-generation library or dependency added; the
browser's native print-to-PDF is the export mechanism).

## Animations

None implemented.

## Responsive breakpoints

Tailwind defaults (`sm:` etc.), used sparingly (e.g. two-column grids on
the landing page roadmap and some forms collapse to one column below
`sm`). No dedicated mobile-device testing has been done — every visual
verification in this project (Playwright screenshots) has used a desktop
viewport. This remains a real gap, not yet closed.

## Dark mode

Implemented via `prefers-color-scheme: dark` media query in
`app/globals.css` (system-driven, no manual toggle) — unchanged since
first built. Verified visually across the landing page originally; not
re-verified in dark mode specifically for every page added since (Playwright
testing used the default light-appearing screenshot rendering throughout
this project's build-out), though all later pages use the same CSS
variables so should inherit the same behavior.

## Accessibility

Not formally audited. Semantic elements used (`header`, `nav`, `main`,
`section`, `footer`, `h1`/`h2`/`h3`, `label` wrapping every form input);
links have visible focus via browser default outline (not customized);
icon-only buttons (reorder up/down arrows) carry `aria-label`. No
screen-reader or automated a11y testing (e.g. axe) has been done. This
remains a real gap, not yet closed.
