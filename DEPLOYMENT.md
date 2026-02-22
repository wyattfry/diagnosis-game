# Deployment Pipeline Setup

## Current Configuration

The game uses **GitHub Actions for automated deployment** to Cloudflare Workers.

### GitHub Actions Workflow
- **Trigger**: Push to `main` branch
- **Process**:
  1. Bumps patch version (0.1.0 → 0.1.1)
  2. Generates `src/lib/version.ts` with git metadata
  3. Commits and pushes version changes
  4. Builds project (`npm run build:cf`)
  5. Deploys to Cloudflare Workers
- **Timing**: ~2 minutes total
- **Live URL**: https://diagnosis-game.wyattfry.workers.dev/

### Required GitHub Secrets
```
CLOUDFLARE_API_TOKEN      Set via: gh secret set CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID     Set via: gh secret set CLOUDFLARE_ACCOUNT_ID
```

## ⚠️ Disable Cloudflare Auto-Deploy

If you have GitHub integration enabled in Cloudflare, it will auto-deploy on every commit, **conflicting** with the GitHub Actions workflow.

### To Disable Cloudflare GitHub Integration:
1. Go to https://dash.cloudflare.com
2. Navigate to **Workers & Pages** → **diagnosis-game**
3. Go to **Settings** → **Git**
4. Click **Disconnect** to remove GitHub integration
5. Confirmation: You should see "No GitHub repository connected"

### Why?
- Cloudflare auto-deploy: Deploys immediately on commit (no version bump)
- GitHub Actions: Waits for version bump → commit → then deploys
- Both running = Two deployments, conflicting version numbers

## Manual Deployment (if needed)

If GitHub Actions fails or you need to deploy manually:

```bash
# Build for Cloudflare
npm run build:cf

# Deploy directly (uses CLOUDFLARE_API_TOKEN in ~/.wrangler/config/default.toml)
npm run deploy

# Or with explicit token
CLOUDFLARE_API_TOKEN=<token> npm run deploy
```

## Verify Deployment

Check the latest deployment:
```bash
npx wrangler deployments list --limit 1
```

View live logs:
```bash
npx wrangler tail
```

## Troubleshooting

### "Deploying to network" hangs
- Check GitHub Actions log for full error
- Verify secrets are set: `gh secret list`
- Test local deploy: `npm run build:cf && npm run deploy`

### Version not bumping
- Check GitHub Actions run in: https://github.com/wyattfry/diagnosis-game/actions
- Verify `package.json` is committed after version bump
- Check `git log` for version bump commits

### Two deployments for one push
- Cloudflare GitHub integration is still enabled
- Follow steps above to disconnect it

## Local Development

```bash
npm run dev                    # Generates version, starts dev server
npm run build                  # Builds Next.js
npm run build:cf              # Builds for Cloudflare Workers
npm run preview               # Preview Cloudflare build locally
npm run generate-version      # Manual version generation
```

## Deployment History

View all deployments on Cloudflare:
```bash
npx wrangler deployments list
```

Output shows:
- Created timestamp
- Author (email)
- Source (Upload, GitHub, etc.)
- Deployment ID
- Version ID

---

## Files Involved

| File | Purpose |
|------|---------|
| `.github/workflows/version-and-deploy.yml` | GitHub Actions workflow definition |
| `wrangler.toml` | Cloudflare Workers config (account_id, assets, etc.) |
| `package.json` | Scripts: `deploy`, `build:cf`, `generate-version` |
| `scripts/generate-version.js` | Generates version.ts with git info |
| `src/lib/version.ts` | Generated at build time (in .gitignore) |

---

## Security

- **API Token**: Stored as GitHub Secret, never committed
- **Account ID**: In `wrangler.toml` (safe to commit, not sensitive)
- **Version File**: Generated at build time, not committed
- **GitHub Secrets**: Encrypted by GitHub, only available to Actions

All credentials are properly secured and never exposed in logs.
