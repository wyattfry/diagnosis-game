# Changelog

All notable changes to the Diagnosis Game will be documented in this file.

## [Unreleased]

### Added
- Progressive difficulty system: Game automatically unlocks harder case tiers based on games played (0+ = Tier 0, 2+ = Tier 1, 4+ = Tier 2)
- Case tier system: Cases tagged with difficulty levels (Easy, Medium, Hard)
- Progress tracking UI: Settings modal now shows games completed and which tiers are unlocked
- New questions revealed dynamically: When a player selects a dialog option, at least one new question is added to the pool while keeping previous options
- Version footer: Displays app version, git hash, and build date at bottom of page
- Automated version bumping: GitHub Actions bumps patch version on every push to main

### Changed
- Case selection now filters by maximum available tier based on player progress
- `createInitialState()` accepts `maxCaseTier` parameter to limit case difficulty
- Game stats now tracked in browser cookie for progression across sessions

### Technical Details
- Added `caseTier` field to all 11 cases (0=Easy, 1=Medium, 2=Hard)
- Added `GameStats` type for player progression tracking
- New function: `getMaxCaseTierFromGamesCompleted()` calculates unlocked tier
- New field: `newlyRevealedChoices` in GameState to track dynamically revealed questions
- Version generation script runs at build time, captures git info
- GitHub Actions secrets configured (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)

### Deployment
- Fixed corrupted npm lock file
- Added wrangler@^4.59.2 to dependencies (required by OpenNext)
- Updated wrangler.toml with account_id
- GitHub Actions workflow: Version Bump and Deploy
  - Automatically bumps patch version
  - Generates version.ts metadata
  - Commits changes and pushes
  - Deploys to Cloudflare Workers
- Cloudflare auto-deploy disabled to prevent conflicts with GitHub Actions

---

## Known Issues / Future Improvements

### Dialog Non-Sequiturs
Red herring questions sometimes don't match the patient's complaint. Example: "Did weather changes cause this?" for acute sore throat + fever.
- **Planned fix**: Add `relevantComplaintCategories` to red herring questions, filter by complaint type

### Disease Research Pool
All 18 diseases shown by default, which can be overwhelming.
- **Planned fix**: Tier disease visibility by difficulty (Easy: 5-6 diseases, Medium: 10-12, Hard: all)

### Win/Loss Feedback
No feedback on missed symptoms or diagnostic reasoning.
- **Planned fix**: Show symptom match percentage and what was missed
---

## Build & Deployment

### Local Development
```bash
npm run dev        # Starts dev server, generates version
npm run build      # Generates .next and version.ts
npm run build:cf   # Builds for Cloudflare Workers
npm run generate-version  # Manual version generation
```

### GitHub Actions Workflow
Triggered on: Push to `main` branch
1. Bumps patch version (0.1.0 → 0.1.1)
2. Generates version.ts with git metadata
3. Commits and pushes version changes
4. Builds project (npm run build)
5. Deploys to Cloudflare Workers (npm run deploy)

### Required GitHub Secrets
- `CLOUDFLARE_API_TOKEN`: API token from Cloudflare
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID

### Cloudflare Configuration
- Workers project: diagnosis-game
- Account ID: 2a43e2ee303071d40042af44b085e454
- Auto-deploy: Disabled (use GitHub Actions instead)
- Compatibility flags: nodejs_compat

---

## Project Structure

```
/src/lib/
  game-engine/
    caseFactory.ts        # Case selection, game initialization
    interview.ts          # Dialog flow, symptom revealing
    diagnosis.ts          # Win/loss logic
    research.ts           # Disease filtering
    terminal.ts           # Anxiety/pain thresholds
    utils.ts             # Helpers
  game-data/
    cases.ts             # All 11 starter cases with tiers
    catalog.ts           # Disease definitions
    persona.ts           # Patient names, identities
  types.ts               # TypeScript interfaces (including GameStats, caseTier)
  gameEngine.ts          # Public API exports

/app/
  page.tsx              # Main game UI
  components/VersionFooter.tsx  # Version display
  globals.css          # Styling

/scripts/
  generate-version.js   # Version generation script

/.github/workflows/
  version-and-deploy.yml  # CI/CD pipeline
```

---

## Version History

### v0.1.1+ (2026-02-22)
- Progressive difficulty system
- Dynamic question revealing
- Version footer and automated versioning
- Deployment pipeline setup

### v0.1.0 (2026-02-16)
- Initial MVP: SMS-style interview, disease research, diagnosis flow
- 11 disease cases
- Patient unit preferences (metric/imperial)

