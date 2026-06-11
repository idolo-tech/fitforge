# FitForge — « Obsidian Forge »

Production implementation of the FitForge design (exported from Claude Design),
built as a **Vite + React 18 + TypeScript** app. PWA-style dark-mode strength
training companion, simulated at **week 4** of a 12-week program.

## Run

```bash
npm install
npm run dev        # dev server (http://localhost:5173)
npm run build      # type-check (tsc -b) + production build to dist/
npm run preview    # serve the production build
npm run typecheck  # type-check only
```

## What's implemented

The full app from the design, all screens:

- **Splash** — stroke-animated forge logo + iris-wipe transition
- **Onboarding** (3 steps) — name/sex/birth wheel-picker, magnetic sliders for
  body, goal cards, equipment grid, then the "forging" loading animation
- **Dashboard** — header with streak flame, hero "séance du jour" (3 layout
  variants), horizontal week calendar, weekly bars, progression cards
  (volume / PR / bodyweight sparkline / consistency heatmap)
- **Workout Player** — immersive set runner with smart weight/reps steppers,
  RIR selector, swipe-or-button set validation, white flash, mini set log, and
  the **rest timer** (3 designs: Ring / Liquide / Minimal)
- **Summary** — count-up volume, intensity chart, vs-last-session comparison,
  confetti, and a 9:16 shareable story card
- **Programme** — 12-week collapsible timeline + day-detail bottom sheet
- **Journal** — period filter, weekly volume bars, key-lift line chart with
  toggleable series, consistency heatmap, expandable past-session list
- **Profil** — progress photos, measurements with sparklines, bodyweight,
  settings (units, reminders, focus mode, export), replay onboarding

The **Tweaks panel** (floating gear button, bottom-right) exposes the design
explorations the user asked to keep: rest-timer design, dashboard hero layout,
set-validation gesture, and glow intensity / animation speed. Values persist to
`localStorage`.

## Structure

```
src/
  main.tsx                 entry point
  App.tsx                  app shell, navigation, phase routing, tweaks wiring
  styles/tokens.css        "Obsidian Forge" design tokens, keyframes, app shell
  data/
    types.ts               domain types
    program.ts             deterministic 12-week program + simulated history
  components/
    icons.tsx              FFIcon (stroke icon set)
    ui.tsx                 NeonButton, FFBadge, ProgressRing, Sparkline,
                           ConsistencyHeatmap, useCountUp, Confetti, Segmented,
                           Stepper, RIRSelector, ExercisePlaceholder, StatBlock
    TweaksPanel.tsx        self-contained tweaks panel + controls
  screens/
    Onboarding.tsx         Splash + Onboarding + ForgeLoading
    Dashboard.tsx
    WorkoutPlayer.tsx
    WorkoutExtras.tsx      RestTimer, IntensityChart, Summary, ShareCard
    Program.tsx
    Journal.tsx
    Profile.tsx
```

## Notes / deviations from the original brief

The original brief listed an aspirational stack (Tailwind, Framer Motion, GSAP,
Zustand, Dexie, full PWA). The exported **design** landed on a leaner approach,
and this implementation matches the design pixel-for-pixel rather than the wish
list:

- **Styling** is the design's CSS-token system (`tokens.css`) plus inline style
  objects — not Tailwind. This guarantees parity with the exported design; the
  tokens file is the single source for colors/typography/spacing.
- **Animations** use CSS keyframes + React state (as in the design), not Framer
  Motion / GSAP. The `--glow` and `--speed` CSS variables scale every glow and
  duration globally (driven by the Tweaks panel).
- **Data** is a deterministic in-memory mock (`data/program.ts`) seeded from the
  user's 3-month plan — no Dexie/IndexedDB yet. State is local React state;
  profile name + tweaks persist to `localStorage`.
- **Exercise imagery** is intentionally striped placeholders with monospace
  labels (per the design) — drop in real photos/GIFs to replace
  `ExercisePlaceholder`.

### Natural next steps if you want the full production brief

- Swap the mock data layer for Dexie (IndexedDB) + a Zustand store
- Add a service worker + manifest for installable PWA / offline
- Real exercise media, superset mode, smart progression notifications
