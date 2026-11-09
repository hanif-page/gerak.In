# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Commands

Run these from the repository root (`/`):

| Command | What it does |
|---|---|
| `npm ci` | Install locked workspace dependencies |
| `npm run dev` | Start PWA dev server at `http://127.0.0.1:5173` |
| `npm run typecheck` | Check PWA TypeScript types |
| `npm test` | Run PWA vitest suite |
| `npm run build` | Build PWA production bundle |
| `npm run preview` | Serve PWA production build at `http://127.0.0.1:4173` |
| `npx wokwi` | (See firmware/simulation/README.md for Wokwi/PlatformIO setup) |

Backend, firmware, and ML tooling each have their own scripts — check their individual READMEs.

---

## High-level architecture

This is a **monorepo** designed as a single Git repository with independently buildable components:

- **`firmware/`** — ESP32 C++ firmware (PlatformIO). Two modes: Normal (lightweight DSP) and Workout (TinyML inference + rep counting). *Note:* Board identity varies — the brief specifies Seeed Studio XIAO ESP32C3, but the owner's latest schematic uses **ESP32-C3 SuperMini**. Do not treat them as interchangeable; resolve board selection before firmware implementation.
- **`model-training/`** — ML data preparation and utilities. Contains the **mm-fit** dataset (21 workout sessions `w00`–`w20`, each with `.npy` sensor modalities [accel/gyr/pose] + `labels.csv`). No ML framework is pinned yet; requirements are numpy/matplotlib/jupyter only.
- **`apps/pwa/`** — React 19 + Vite 6 + `vite-plugin-pwa` Progressive Web App. Provides static hash-routed preview screens (home, normal walking, workout setup, active tracking, summaries). Displays fixed fixture data — **not live telemetry**. Uses npm workspace `@gerak-in/pwa`.
- **`hardware/wiring/pin-configuration.md`** — Owner schematic: shared I2C SDA=GPIO3 / SCL=GPIO4, MPU-6050 @0x68, OLED (controller unverified; 0x3C/0x3D common possibilities).
- **`REPOSITORY_GUIDE.md`** — Recommended architecture and implementation guidelines. Defines component boundaries, communication flow, and protocol decisions.

**Communication flow** (from REPOSITORY_GUIDE.md):
1. ESP32 senses → Normal DSP or TinyML inference → counts/state
2. ESP32 POSTs telemetry to Express backend (via Tailscale Funnel HTTPS)
3. Backend persists to MongoDB, then publishes via Socket.IO
4. React PWA subscribes to Socket.IO events for live updates
5. PWA → backend → ESP32 for mode switching (polling/HTTP)

---

## Key decisions / cautions

- **Board mismatch**: The project brief says Seeed XIAO ESP32C3; the owner's schematic says **ESP32-C3 SuperMini**. Verify the actual board before selecting firmware board definitions, flash settings, and upload configuration. GPIO mapping below uses SDA=GPIO3 / SCL=GPIO4.
- **Scope drift**: The brief's TinyML scope was squats; the PWA UI fixtures use **push-ups and jumping jacks**. The mm-fit dataset covers squats/push-ups/jumping-jacks/lunges — reconcile before committing to training data.
- **Secrets**: Never commit real `.env` files or device credentials. The root `.gitignore` already ignores `.env`, `.venv/`, and `*.local`. Vite `VITE_*` values are exposed to client code — keep secrets on the backend only.
- **I2C safety**: Both MPU-6050 and OLED share SDA=GPIO3 / SCL=GPIO4. Explicitly initialize `Wire.begin(3, 4)` in firmware. Do not let a library reinitialize to unrelated default pins. Verify pull-ups and I2C addresses during bring-up.
- **OLED address**: Unverified — 0x3C/0x3D are common possibilities, not confirmed. Do not hardcode.
- **Model confidence vs. accuracy**: The PWA uses "Average Model Confidence" — do not label results as "AI Accuracy" or present DSP results as 100% AI confidence.
- **Calories**: Document as estimates with calculation assumptions. Fixed calories-per-rep multipliers are demonstration approximations.

---

## Development notes

- PWA commands run from the repo root via npm workspaces (`apps/pwa/`). The root `package.json` only defines workspace-scoped scripts.
- The `model-training/` dataset (`mm-fit/`) is not tracked by Git — it is `.gitignored`. To use it, ensure it's accessible at the expected path or adjust data loading accordingly.
- Wokwi simulation: see `firmware/simulation/README.md` for creating the PlatformIO project. Templates exist in `firmware/simulation/templates/` (diagram.json, wokwi.toml, extensions.json).
- When writing firmware, always check `hardware/wiring/pin-configuration.md` first for the latest I2C and pin mappings.
- The PWA scope is strictly static preview — it does not control hardware, save data, or handle live telemetry. Those are future milestones.