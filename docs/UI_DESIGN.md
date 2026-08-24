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
- `AppHeader` (client component, `components/AppHeader.tsx`) — used only
  on the un-authenticated flow pages now: login, signup, forgot/reset
  password, verify-email. Logo links to `/`; right side shows Log
  in/Sign up when signed out or Dashboard/Sign out when signed in (a
  signed-in user can land on these pages transiently, e.g. via a stale
  bookmark). Replaced the old page-local `SignOutButton` (deleted).
- `AppSidebar` (client component, `components/AppSidebar.tsx`) — used on
  every genuinely authenticated page (dashboard, profile, resumes,
  resume editor/preview, applications, account), replacing `AppHeader`
  there as of the 2026-08-24 internal-UI redesign. Left sidebar on
  `sm:` and up (logo, 5 nav links with active-state highlighting via
  `usePathname()`, theme toggle + sign out pinned at the bottom); on
  mobile, a top bar (logo, theme toggle, hamburger) that reveals the
  same links as a dropdown. "AI Tools" was deliberately not given its
  own nav entry/route — it only operates on a specific resume (calls
  `/api/resumes/:id/optimize` etc.), so it's folded into "Resumes"
  rather than inventing a destination that would need a resume picked
  first anyway.

Shared editing pattern (profile + every resume, see
[ARCHITECTURE.md](./ARCHITECTURE.md)):
- `components/profile/{ExperienceForm, ExperienceSection, EducationForm,
  EducationSection, SkillsSection, types}.tsx` — one list-and-form
  implementation per entity type, parameterized by an `apiBase` prop so
  it works against both `/api/profile/*` and `/api/resumes/:id/*`
  without duplication. Includes up/down reorder buttons per entry,
  rendered as a card with a colored initial-letter avatar on the left
  (color cycles through the 5 brand hues by list position).

Page-level components: `ProfileEditor` (now a 4-step wizard — see
below), `ResumeEditor` (template picker promoted to its own card at
the top, auto-saves on click), `ResumeList` (+ search), `ResumePreview`
(classic + compact templates), `ResumeImport`, `ResumeAITools` (now 4
clickable tool cards — see below), `ApplicationsList` (now a table — see
below), `AccountSettings` (now grouped into 4 labeled sections — see
below).

## Internal UI redesign (2026-08-24)

A user-provided design brief asked for the authenticated/internal app
(everything behind login) to be simplified into a "premium SaaS
dashboard" feel, explicitly *not* touching the public landing page,
branding, backend, APIs, database, auth, or any existing route/feature.
Implemented without changing any route or business logic:

- **Dashboard** (`app/dashboard/page.tsx`) — greeting header ("Good to
  see you back 👋" + a real, computed subtitle — no fake copy), the
  existing 4 stat cards, a new "Quick actions" grid (Create resume,
  Check ATS, Generate cover letter, Add application — the two AI
  actions link to the most-recently-updated resume if one exists, else
  to the resume list), a "Recent activity" feed built from real
  `Resume.updatedAt`/`Application.updatedAt` rows (empty state, not
  fake data, when there's nothing yet), and an "Application progress"
  mini funnel (Applied/Interviewing/Offers bars) computed from the same
  real status counts already used for the stat cards.
- **Profile** (`ProfileEditor.tsx`) — turned into a 4-step wizard
  (Basic Info → Experience → Education → Skills) with a numbered,
  clickable step pill row at the top; Basic Info's Save button now
  reads "Save & Continue" and advances the step. All existing fields,
  the import link, and every list's add/edit/delete/reorder behavior
  are unchanged — this is a presentation change over the same
  `ProfileEditor` state and API calls.
- **Resume editor** (`ResumeEditor.tsx`) — the template `<select>` was
  pulled out of the Basic Info form into its own card of two large
  clickable options at the top of the page, auto-saving on click (a
  dedicated `PATCH { template }` call) instead of requiring the main
  Save button. The resume edit page (`app/resumes/[id]/page.tsx`) also
  gained an Edit/"Preview & Export" tab control at the top; edit and
  preview remain separate routes (merging them into one live
  split-view page would be an architecture change, not a reskin, and
  risked the PDF export flow), so the tabs just make the existing
  2-page flow read as one obvious workflow.
- **AI Tools** (`ResumeAITools.tsx`) — the four AI features (previously
  four always-expanded stacked sections) are now 4 clickable cards
  under an "AI Assistant" heading (icon, one-line description, active
  state on click); clicking reveals that tool's existing, unmodified
  UI below. "Match Job" and "Cover Letter" open the same panel since
  they share one component and state (a job description input feeding
  both) — kept as-is rather than duplicating that input to force a
  strict 1-card-1-tool mapping.
- **Applications** (`ApplicationsList.tsx`) — the bordered-card list
  became a real `<table>` (Company/Role/Status/Date/Resume/Cover
  Letter/Actions), wrapped in `overflow-x-auto` for narrow screens.
  Status is now a colored pill (mapped from the existing enum, one new
  one-off `bg-red-500/10 text-red-500` pair for Rejected since no
  "icon-red" token existed). "Add application" became a prominent "+
  Add Application" button. The free-text notes field is still fully
  editable via the same form, just not shown in the compact table row.
- **Account settings** (`AccountSettings.tsx`) — regrouped into 4
  labeled sections (Account, Security, Data / Privacy, Danger Zone)
  with a small muted label above each card; Danger Zone's card gets a
  red border. Same forms/handlers as before, just organized.

All of the above reuses the existing color tokens (`bg-icon-*`,
`--accent`, `--brand-*`) introduced for the landing page — no new
colors added for the internal redesign, per the brief's "use the
existing identity subtly" direction. The 360° spinning laptop stays
landing-page-only, as explicitly requested.

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

Tailwind defaults (`sm:` etc.). `AppSidebar` is the first component with
real, verified mobile behavior: a 390×844 (iPhone-sized) Playwright
screenshot of the dashboard and the opened mobile nav dropdown, both
confirmed rendering correctly with zero console errors, as part of the
2026-08-24 internal-UI redesign. The rest of the app (landing page,
auth forms, resume editor, applications table) still only has desktop
verification — the applications table specifically uses
`overflow-x-auto` for narrow screens rather than a verified mobile card
layout, so that one's responsive *in principle* (won't visually break)
but not yet screenshot-verified on a small viewport. This remains a
partial gap, narrower than before but not fully closed.

## Dark mode

Manual toggle (`components/ThemeToggle.tsx`, in both `SiteHeader` and
`AppHeader`) added 2026-08-24, on top of the original system-driven
`prefers-color-scheme: dark` media query. Preference stored in
`localStorage` (`cvrespire-theme`) and applied via a `data-theme`
attribute on `<html>`, which `globals.css` gives priority over the
media query (`:root:not([data-theme="light"])` for system dark,
`:root[data-theme="dark"]` for the explicit override — both win
correctly in either direction). An inline script in the `<head>`
(`app/layout.tsx`) applies the stored theme before first paint to
avoid a flash of the wrong theme; `<html>` carries
`suppressHydrationWarning` since that script intentionally makes the
server-rendered and client-hydrated markup differ on that one
attribute (the standard, expected pattern for this — verified the
alternative, an unsuppressed mismatch warning, actually appears
without it, then confirmed it's gone with it).
Verified via Playwright: toggled light→dark→light on both the
dashboard and profile pages, screenshotted each, zero console errors.

## Accessibility

Not formally audited. Semantic elements used (`header`, `nav`, `main`,
`section`, `footer`, `h1`/`h2`/`h3`, `label` wrapping every form input);
links have visible focus via browser default outline (not customized);
icon-only buttons (reorder up/down arrows) carry `aria-label`. No
screen-reader or automated a11y testing (e.g. axe) has been done. This
remains a real gap, not yet closed.
