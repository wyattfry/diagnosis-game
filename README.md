# Medical Diagnosis Game

A medical diagnosis simulation game where you interview patients, research diseases, and make diagnostic decisions. Players face increasingly complex cases as they improve.

**Play it live**: https://diagnosis-game.wyattfry.workers.dev/

## Game Mechanics

1. **Interview**: Ask the patient questions to discover symptoms
2. **Research**: Search a database of diseases to find matches
3. **Diagnose**: Select the illness you believe the patient has
4. **Progress**: Correctly diagnose cases to unlock harder difficulty tiers

Players balance **anxiety** and **pain** levels—pushing too hard damages the patient relationship and triggers anxiety penalties.

## Features

- ✅ SMS-style interview with typing animations
- ✅ 11 randomized patient cases across 3 difficulty tiers
- ✅ Dynamic question revealing (new questions unlock as you discover symptoms)
- ✅ Progressive difficulty progression (auto-unlocks harder cases after 2+ diagnoses)
- ✅ 18 disease database with symptoms, definitions, and descriptions
- ✅ Metric/Imperial unit toggle
- ✅ Auto-versioning with git integration
- ✅ Runs on Cloudflare Workers (no backend needed)

## Quick Start

### Play Online
Go to: https://diagnosis-game.wyattfry.workers.dev/

### Run Locally
```bash
npm install
npm run dev
```
Open http://localhost:3000

For LAN access:
```bash
ALLOWED_DEV_ORIGINS=192.168.1.20 npm run dev
```

## Documentation

- **[CHANGELOG.md](CHANGELOG.md)** - All changes and features
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deploy setup, GitHub Actions, Cloudflare config
- **[wrangler.toml](wrangler.toml)** - Cloudflare Workers configuration
- **[package.json](package.json)** - Dependencies and scripts

## Project Structure

```
app/                          # Next.js frontend
  page.tsx                   # Main game UI
  components/VersionFooter.tsx
  globals.css

src/lib/
  game-engine/               # Core game logic
    caseFactory.ts          # Case selection & initialization
    interview.ts            # Dialog flow & symptoms
    diagnosis.ts            # Win/loss logic
    research.ts             # Disease filtering
    terminal.ts             # Game-over conditions
  game-data/                 # Content
    cases.ts                # 11 patient cases (tiered by difficulty)
    catalog.ts              # 18 disease definitions
    persona.ts              # Patient names & identities
  types.ts                  # TypeScript types
  
scripts/generate-version.js  # Build-time version generation

.github/workflows/
  version-and-deploy.yml    # GitHub Actions CI/CD
```

## Development Scripts

```bash
npm run dev              # Start dev server (generates version)
npm run build            # Build Next.js
npm run build:cf         # Build for Cloudflare Workers
npm run preview          # Preview Cloudflare build
npm run deploy           # Deploy to Cloudflare (manual)
npm run generate-version # Generate version.ts manually
npm run test             # Run tests (vitest)
```

## Deployment

**Automatic**: Pushes to `main` → GitHub Actions → Cloudflare Workers
**Manual**: Run `npm run deploy` locally

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed setup.

## Case Difficulty Tiers

| Tier | Cases | Intro | After |
|------|-------|-------|-------|
| **0** (Easy) | Cold, Norovirus, UTI | First game | Game 1 |
| **1** (Medium) | Flu, Strep, Migraine, Mono | After 2 games | Game 2-3 |
| **2** (Hard) | Appendix, Pneumonia, Crohn's, Heart Attack | After 4 games | Game 4+ |

## Tech Stack

- **Frontend**: Next.js 15 (React 19)
- **UI**: Vanilla CSS + Lucide React icons
- **Hosting**: Cloudflare Workers (OpenNext adapter)
- **Versioning**: Automated via GitHub Actions
- **Types**: TypeScript
- **Testing**: Vitest

## Known Issues & Improvements

See [CHANGELOG.md](CHANGELOG.md) for "Future Improvements" section.

## License

Private project
4. Make patients persistant, with symptoms and diseases that develop over time in response to the treatment.