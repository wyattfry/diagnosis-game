# Medical Diagnosis Game

This is a game about diagnosing patients. The main game loop is:

1. You are presented with a patient and their vitals
2. You have a dialog tree with the patient to gather symptoms
3. You search a "database" of illnesses to find one that most closely matches the symptoms
4. You select the illness to make the diagnosis

You play as a junior medical doctor intern student person working at a practice. The senior staff starts out only sending you "easy" cases that they believe are not serious, e.g. flu, cold, norovirus, or other "simple" common diseases. As you gain experience, they send increasingly complex cases your way.

## Interface

You are presented with:

1. patient vitals (name, age, gender, height, weight, complaint, BP, BPM, temperature)
2. a running list of discovered symptoms
3. patient's live stats: pain, anxiety

## Gather Symptoms

The main mechanic here is the dialog tree.

## Research

A search box where user types search terms, diseases are listed below

## Diagnosis

User selects a disease from the database.

## Win and Lose Conditions

Player wins by correctly diagnosing the illness.

Player loses if patient's anxiety or pain hits maximum and patient leaves or passes out (respectively). Player loses if they incorrectly diagnose. The player's choices will affect the patient's anxiety level. The pain level may fluctuate on its own.

## MVP Status

This repository now includes a playable Next.js MVP with an SMS-style interview flow.

Implemented:

1. Next.js app-router project structure
2. SMS interview transcript with doctor/patient/system bubbles
3. Simulated patient typing delay with animated ellipsis before patient responses
4. Interview choices that reveal symptoms and affect anxiety/pain
5. Disease research cards with definition, description, and common symptoms
6. Patient unit toggle (metric or imperial)
7. Diagnosis result modal with next patient flow
8. Randomized patient names and identity labels for more case variety

## Run Locally

```bash
cd /home/wyatt/diagnosis-game
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

For another device on your LAN, open `http://<your-machine-ip>:3000` and set:

```bash
ALLOWED_DEV_ORIGINS=<your-machine-ip> npm run dev
```

For multiple hosts/IPs, separate with commas:

```bash
ALLOWED_DEV_ORIGINS=10.0.0.136,192.168.1.20 npm run dev
```

Notes:

1. `localhost` and `127.0.0.1` are allowed by default for same-machine access.
2. If you hit a runtime error like `Cannot find module './255.js'`, restart dev server to clear stale `.next` artifacts (the `dev` script now auto-clears `.next`).

## Project Layout

- `app/layout.tsx`: root layout
- `app/page.tsx`: main UI and gameplay interactions
- `app/globals.css`: global styles
- `src/lib/game-data/`: diseases, symptoms, persona pools, and case content
- `src/lib/game-engine/`: core game-state logic split by responsibility
- `src/lib/types.ts`: shared TypeScript game-domain types

## Cloudflare Workers Deploy

This repo is configured for OpenNext + Cloudflare Workers.

```bash
npm install
npm run build
npm run preview
```

Deploy:

```bash
npm run deploy
```

Config files:

1. `wrangler.toml`
2. `open-next.config.ts`

## Next MVP Expansions

1. Add more diseases and case tiers for progression
2. Convert interview choices into multi-step dialog trees
3. Add scoring/debrief screen with missed clues and differential ranking
