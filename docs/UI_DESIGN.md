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
| `accent` | `#7c3aed` (violet-600) | `#a78bfa` (violet-400) |
| `accent-foreground` | `#ffffff` | `#0a0a0a` |

Used as Tailwind utilities: `bg-background`, `text-foreground`,
`text-muted`, `border-border`, `bg-surface`, `bg-accent`,
`text-accent-foreground`, everywhere in the app (forms, buttons, links,
focus rings). `accent` changed from indigo to violet on 2026-08-24 to
match the new landing-page brand gradient (see below) — deliberately
kept as a single token app-wide rather than going multi-color
everywhere, since a full-rainbow reskin of every form/button across
profile, resumes, and applications would hurt readability on those
dense, data-entry-heavy pages.

Landing-page-only additional tokens (not used elsewhere in the app):

| Token | Light | Dark |
|---|---|---|
| `--brand-from` / `--brand-via` / `--brand-to` | `#7c3aed` / `#ec4899` / `#f97316` | same (no dark override) |
| `icon-purple-bg` / `icon-purple-text` | `#ede9fe` / `#7c3aed` | `rgba(124,58,237,.2)` / `#c4b5fd` |
| `icon-green-bg` / `icon-green-text` | `#dcfce7` / `#16a34a` | `rgba(22,163,74,.2)` / `#4ade80` |
| `icon-orange-bg` / `icon-orange-text` | `#ffedd5` / `#ea580c` | `rgba(234,88,12,.2)` / `#fdba74` |
| `icon-pink-bg` / `icon-pink-text` | `#fce7f3` / `#db2777` | `rgba(219,39,119,.2)` / `#f9a8d4` |
| `icon-blue-bg` / `icon-blue-text` | `#dbeafe` / `#2563eb` | `rgba(37,99,235,.2)` / `#93c5fd` |

Used via Tailwind utilities (`bg-icon-purple-bg`, `text-icon-purple-text`,
etc., generated through `@theme inline` in `globals.css`) for the
Hero's 5 feature icons, and the brand gradient via arbitrary-value
utilities (`from-[var(--brand-from)]` etc.) for the headline and
primary CTA button.

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

Landing page:
- `SiteHeader` — top nav; logo links to `/`, plus Features/GitHub/Log
  in/Sign up
- `Hero` — status badge, headline (with a gradient accent on the last
  line), subheadline, two CTAs, and a row of 5 feature icons (inline
  SVGs, single-color using the existing `accent` token — no new color
  hues were introduced)
- `HeroLaptop` — a real 3D CSS laptop (dark bezel with camera dot,
  aluminum-shaded keyboard deck, screen + hinge + base built from plain
  positioned divs with `rotateX`/`rotateY` and `preserve-3d`, no image
  assets or 3D library) that continuously spins a full 360°
  (`@keyframes hero-laptop-spin` in `globals.css`, 18s linear loop).
  Respects `prefers-reduced-motion: reduce` (animation disabled).
  Screen shows a sidebar nav (mirrors the app's real pages), a resume
  skeleton panel, and a small circular ATS-score gauge; a matching
  floating card sits beside the laptop. Both show `94` — the actual
  result of running our real ATS-check feature (Gemini) once against
  one fixed, generic sample resume, not an invented statistic; labeled
  "example result". See `CHANGELOG.md` for how that number was
  produced. Verified at multiple fixed rotation angles via Playwright
  (0/45/90/180/270/315°) to confirm the geometry reads correctly all
  the way around, plus a live-animation check and a dark-mode check.
- `Roadmap` — grid of feature cards, each with a "Live" badge (every
  item is live now; the type only allows that one status)
- `SiteFooter` — bottom bar

App-wide navigation:
- `AppHeader` (client component, `components/AppHeader.tsx`) — used on
  every page that isn't the landing page (auth pages: login, signup,
  forgot/reset password, verify-email; authenticated pages: dashboard,
  profile, resumes, resume editor/preview, applications, account).
  Logo links to `/`; right side shows Log in/Sign up when signed out or
  Dashboard/Sign out (via `useSession()`) when signed in. Added to close
  a real gap — several pages previously had no way back to the site's
  home page at all. Each page still keeps its own more-specific
  secondary link too (e.g. "Back to profile") where one makes sense.
  Replaced the old page-local `SignOutButton` (deleted, now unused).

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
