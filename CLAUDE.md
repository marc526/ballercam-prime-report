# BallerCam Prime Shipping Report — CLAUDE.md

## What This Is
A Next.js app that tracks Amazon Prime shipping availability for 19 iPhone ASINs (iPhone 13 Pro through 17 Pro Max) across 10 US ZIP codes. Hosted publicly on Vercel. Data is collected weekly via a bookmarklet that runs on amazon.com.

## URLs
- Public report: https://ballercam-prime-report.vercel.app
- Runner page: https://ballercam-prime-report.vercel.app/run
- GitHub: https://github.com/marc526/ballercam-prime-report

## Stack
- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Deployed on Vercel (auto-deploys on every push to main)
- Storage: GitHub API commits `public/report-data.json` directly to the repo, which triggers Vercel redeploy

## Key Files
- `lib/constants.ts` — ASINS (19 iPhones) and LOCATIONS (10 ZIP codes with SVG map x/y coords)
- `app/page.tsx` — Public report page, fetches /report-data.json at runtime
- `app/run/page.tsx` — Runner page: bookmarklet installer + auto-save flow from URL hash
- `app/api/save-results/route.ts` — Verifies SAVE_SECRET header, commits report-data.json via GitHub API
- `components/SummaryCards.tsx` — 4 stat cards
- `components/USMap.tsx` — SVG map with colored circles (red→yellow→green by Prime count)
- `components/PrimeGrid.tsx` — Full grid table (rows=iPhone models, cols=ZIP codes, cells=✅/❌)
- `public/report-data.json` — Static file updated weekly via GitHub API

## Environment Variables (Vercel production)
- `SAVE_SECRET` — must match the secret stored in the user's browser localStorage
- `GITHUB_TOKEN` — fine-grained PAT with Contents read/write on this repo only

**Important:** Add env vars with `--value` flag, NOT heredoc — heredoc adds a trailing newline that causes secret mismatch.
```
npx vercel env add SAVE_SECRET production --value your-secret --yes
```

## Weekly Workflow
1. Go to amazon.com (logged in as Prime member)
2. Click the "🏀 BallerCam Prime" bookmarklet
3. Sidebar panel runs ~2 min, checks 19 ASINs × 10 ZIP codes
4. Click "→ Save Report" in the sidebar when done
5. Redirects to /run, auto-saves using secret from localStorage
6. Vercel deploys in ~1 min — public report updates

## Bookmarklet Gotchas
- **Must install manually**: copy code → right-click bookmarks bar → Add page → paste as URL
- **Chrome drag is broken**: Chrome sanitizes `javascript:` hrefs on drag — dragging the button saves a React error URL instead of the bookmarklet code
- **Single line only**: Chrome's bookmark URL field truncates on newlines — the entire bookmarklet must be one line
- **No React href**: React 17+ rejects `javascript:` in anchor `href` — use `useRef` + `setAttribute` to set the href after mount

## Prime Detection
```js
h.includes('Prime members')
```
This is the exact string the original Chrome Extension used. It appears in Amazon's HTML when Prime shipping is available for the product.

## Map Sizing
SVG viewBox is `900×396`. The wrapper uses `padding-bottom: 30.8%` (= 44% aspect ratio × 0.7 scale factor) to fill the full card width without letterboxing.

## Map Colors (USMap.tsx)
- 0 Prime SKUs → red (`#ef4444`)
- 1–2 → light red (`#f87171`)
- 3–4 → yellow (`#fbbf24`)
- 5–9 → amber (`#f59e0b`)
- 10+ → green (`#22c55e`)

## git push pattern
Remote gets updated by the save flow (report-data.json commits). Always pull --rebase before pushing:
```
git pull --rebase && git push
```
