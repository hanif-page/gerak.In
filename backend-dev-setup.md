# Backend Development Setup — gerak.In

## Overview

This document sets up the **backend** for the gerak.In monorepo. It covers the Express server, MongoDB, API contracts, authentication, device simulator, and development workflow.

All commands are run from the repository root (`/`).

---

## 1. Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | >=20.19.0 | From `package.json` engines field |
| npm | >=10 | From `package.json` engines field |
| Docker | (for MongoDB) | Optional: can run MongoDB locally without Docker |
| PlatformIO | (for firmware) | Separate from this backend setup |

---

## 2. Project structure (confirmed)

```
gerak.In/
├── packages/contracts/         # Shared TypeScript types & validators (npm workspace)
├── apps/backend/               # Express + Mongoose backend
│   ├── src/
│   │   ├── config/           # Environment configuration (validated)
│   │   ├── db/               # MongoDB connection and lifecycle
│   │   ├── middleware/       # Auth, validation, error handlers
│   │   ├── modules/          # Feature modules (telemetry, devices, workouts)
│   │   ├── app.ts           # Express app (independently testable)
│   │   └── server.ts        # HTTP server and startup/shutdown
│   ├── .env.example          # Template (not committed; user fills values)
│   └── package.json
├── infra/
│   └── compose.yaml           # Docker Compose for MongoDB + backend
└── .gitignore                # Already ignores .env, .venv/, coverage, .pio/, etc.
```

---

## 3. API Contracts — `packages/contracts`

This is a **real npm workspace package** shared by backend and PWA.

### Structure

```
packages/contracts/
├── schemas/                    # JSON schemas for telemetry, commands, responses
├── src/                        # Shared TypeScript types and runtime validators
│   ├── telemetry.ts           # Telemetry payload type/validator
│   ├── commands.ts            # Command payload type/validator
│   ├── sessions.ts            # Session / workout state types
│   └── index.ts               # Re-exports for easy importing
├── examples/                   # Valid sample JSON payloads
└── package.json                # npm workspace package (dependencies: none beyond types)
```

### Key types (defined once, used everywhere)

| Type | Description |
|---|---|
| `TelemetryPayload` | `{ deviceId: string; mode: "normal" | "workout"; exercise: string; confidenceScore: number | null; timestamp: string; eventId: string; }` |
| `CommandPayload` | `{ commandId: string; targetMode: "normal" | "workout"; targetExercise: string; timestamp: string; }` |
| `WorkoutSummary` | `{ exercise: string; repetitions: number; duration: string; calories: string; confidenceScore: number | null; startTime: string; endTime: string; }` |

### Usage

- **Backend**: imports from `packages/contracts` to validate incoming telemetry/commands
- **PWA**: imports from `packages/contracts` (compiled JS or TS) to type-check outgoing data

---

## 4. Authentication — session cookies (single user)

**Confirmed design**: session cookies, not JWT. Single-origin Funnel deployment with `HttpOnly`, `SameSite=Lax`.

### How it works

1. **POST `/api/auth/login`** — `{ username, password }` → `200` + `Set-Cookie` header with session `sid`
2. **All other API routes** — read `sid` from request cookies; if missing/session expired → `401`
3. **Session store**: in-memory for dev; `connect-mongo` for production (MongoDB-backed sessions)

### `.env` values (not committed)

```
# Owner credentials — fill these in; never commit real values
OWNER_USERNAME=hanif
OWNER_PASSWORD=dev-change-me

# Session config
SESSION_SECRET=change-this-to-a-long-random-string
```

### Login flow (pseudo-code)

```js
// POST /api/auth/login
const { username, password } = req.body;
const user = await User.findOne({ username });
if (!user || user.password !== password) {
  return res.status(401).json({ error: 'Invalid credentials' });
}
const sid = jwt.sign({ username: user.username }, process.env.SESSION_SECRET);
res.cookie('sid', sid, {
  httpOnly: true,
  secure: true,       // HTTPS only (Funnel provides this)
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000, // 1 day
});
res.json({ success: true });
```

**Note**: For this dummy prototype, credentials are simple. In a real deployment, use proper password hashing (bcrypt) and consider OAuth or device provisioning.

---

## 5. MongoDB — Docker Compose (dev)

### `infra/compose.yaml`

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:8.0-ubuntu
    container_name: gerak-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INIT_DB_NAME: gerak_in
      MONGO_ROOT_USERNAME: gerak_user
      MONGO_ROOT_PASSWORD: gerak_pass
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./apps/backend
    container_name: gerak-backend
    restart: unless-stopped
    depends_on:
      - mongodb
    environment:
      NODE_ENV: development
      MONGODB_URI: mongodb://gerak_user:gerak_pass@mongodb:27017/gerak_in?authSource=admin
      SESSION_SECRET: change-this-to-a-long-random-string
      OWNER_USERNAME: hanif
      OWNER_PASSWORD: dev-change-me
    ports:
      - "3000:3000"
    volumes:
      - ./apps/backend/src:/app/src:ro

volumes:
  mongodb_data:
```

### DB name & collection conventions

| Database | Collection | Purpose |
|---|---|---|
| `gerak_in` | `device_states` | Current desired/reported device mode per device |
| `gerak_in` | `workout_sessions` | Durable workout summaries (start/stop, calories, duration, exercise, confidenceScore) |
| `gerak_in` | `telemetry` | Raw incoming telemetry events (deduplicated by `eventId`) |
| `gerak_in` | `users` | Single owner document (`username`, `password_hash`) |

**Note**: `gerak_in` is the **same DB name** for dev and demo. No separate databases.

### Mongoose models (key schemas)

```js
// models/Telemetry.js
const telemetrySchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  mode: { type: String, enum: ['normal', 'workout'], required: true },
  exercise: { type: String, enum: ['push-up', 'jumping-jack', 'rest', null] },
  confidenceScore: { type: Number, min: 0, max: 100, default: null },
  timestamp: { type: Date, required: true },        // device occurrence time (UTC)
  eventId: { type: String, required: true, unique: true }, // dedup key
  receivedAt: { type: Date, default: Date.now },   // server receipt time
});

// Index for dedup by eventId
telemetrySchema.index({ eventId: 1 }, { unique: true });

// models/WorkoutSession.js
const workoutSessionSchema = new mongoose.Schema({
  exercise: { type: String, enum: ['push-up', 'jumping-jack', 'rest'], required: true },
  repetitions: { type: Number, required: true },
  durationMinutes: { type: Number, required: true },
  calories: { type: String, required: true },        // stored as string e.g. "20.1"
  confidenceScore: { type: Number, min: 0, max: 100, default: null },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  deviceId: { type: String, required: true },
}, { timestamps: true });
```

---

## 6. Device simulator — standalone Node script

**Confirmed design**: standalone script, not part of backend test suite. Uses **distinct credentials** (not an auth bypass).

### Purpose

- Simulates an ESP32 device sending telemetry to the backend
- Enables deterministic API/control testing without actual hardware
- Can switch modes, send workout start/stop, emit telemetry with various `confidenceScore` values

### Usage

```bash
# From repo root
node model-training/utils/utils.js --simulate \
  --device-id esp32-demo-001 \
  --mode workout \
  --exercise push-up \
  --duration 120 \
  --confidence 75
```

### Simulator script location (planned)

```
model-training/device-simulator/
├── index.js                   # Main simulator entry point
├── package.json               # Minimal deps (axios,dotenv)
└── README.md                  # Usage instructions
```

### Simulator command reference

```
--device-id       : string — identifies the simulated device (matches backend)
--mode            : "normal" | "workout"
--exercise        : "push-up" | "jumping-jack" | "rest" (only in workout mode)
--duration        : minutes (workout duration)
--confidence      : 0–100 (confidenceScore; null for normal mode)
--interval        : ms between telemetry pings (default 2000, matches poll interval)
--reset-db        : clear the telemetry collection before starting
```

### Simulator logic (pseudo-code)

```js
const axios = require('axios');
const deviceId = process.argv.deviceId;
const mode = process.argv.mode;
const exercise = process.argv.exercise;
const duration = parseInt(process.argv.duration);
const confidence = parseInt(process.argv.confidence);
const interval = parseInt(process.argv.interval) || 2000;

// Compute start/end times
const endTime = new Date();
const startTime = new Date(endTime.getTime() - duration * 60 * 1000);

let eventId = 0;
setInterval(async () => {
  eventId++;
  const payload = {
    deviceId,
    mode,
    exercise,
    confidenceScore: mode === 'workout' ? confidence : null,
    timestamp: new Date().toISOString(),
    eventId: `${deviceId}-${eventId}`,
  };

  try {
    await axios.post('http://localhost:3000/api/telemetry', payload, {
      headers: {
        // session cookie obtained from /api/auth/login
        cookie: `sid=${process.env.SIMULATOR_SESSION}`,
      },
    });
  } catch (e) {
    console.error('Failed to send telemetry', e.message);
  }
}, interval);
```

---

## 7. Backend API routes (confirmed design)

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | none | Owner login; sets `sid` cookie |
| `POST` | `/api/auth/logout` | session | Clear `sid` cookie |
| `GET` | `/api/telemetry` | session | Get recent telemetry (last N events, queryable by mode/exercise) |
| `POST` | `/api/telemetry` | session | Submit new telemetry event (deduplicates by `eventId`) |
| `GET` | `/api/workouts` | session | List workout summaries |
| `POST` | `/api/workouts` | session | Create new workout session (start) |
| `POST` | `/api/workouts/:id/stop` | session | Stop workout session (compute calories, duration, summary) |
| `GET` | `/api/device-status` | session | Get current device state (mode, exercise, confidence) |

### Rate limiting (per confirmed spec)

- **Global**: 100 requests / 15 min per IP (express-rate-limit default)
- **Telemetry endpoint**: 1 event / 2 seconds per device (enforced server-side; matches poll interval)
- **Deduplication**: `eventId` uniqueness — if a duplicate `eventId` is submitted, the backend responds `200 OK` but does not insert the duplicate row

### Poll interval & ack timeout (from point 11)

| Parameter | Value | Notes |
|---|---|---|
| Protocol version | `v1` | String sent in every telemetry payload: `protocolVersion: "v1"` |
| Command poll interval | **~2 seconds** | How often the device checks for new commands |
| Command ack timeout | **5 seconds** | If device doesn't ACK within 5s, backend marks command as failed |
| Telemetry rate-limit | **1 event / 2 s** per device | Server-side enforcement; overrides any device-side pacing |
| Dedup/event-ID format | `${deviceId}-${counter}` | Monotonically incrementing counter per device |

---

## 8. Calorie calculation (from `calorie-calculation.md`)

The backend uses the fixed MET formula:

```js
const MET_VALUES = {
  rest: 1.0,
  walking: 3.5,
  push-up: 3.8,
  jumping-jack: 5.0,
};

function calculateCalories(exercise, durationMinutes, weightKg) {
  const met = MET_VALUES[exercise] || MET_VALUES.rest;
  const calories = Math.round(met * weightKg * durationMinutes / 200 * 10) / 10; // one decimal
  return calories; // returned as number, stored as string e.g. "20.1"
}
```

**Weight source**: `DEMO_WEIGHT_KG` from `.env` (e.g., `DEMO_WEIGHT_KG=70`). Not committed.

---

## 9. Confidence score (from `confidence-score-elaboration.md`)

The backend stores a single `confidenceScore` field:

| Scenario | `confidenceScore` value |
|---|---|
| Normal Mode (DSP) | **`null`** — explicitly means "not applicable" |
| Workout Mode, inference | **0–100** integer — average model confidence across windows |
| Workout Mode, uncertain | **0–100** integer — may be low (20–40) for noisy signal |

### Backend schema (Mongoose)

```js
confidenceScore: {
  type: Number,
  min: 0,
  max: 100,
  default: null,
},
```

### PWA display

- When `confidenceScore` is `null`: UI shows "N/A" or grayed-out indicator
- When `confidenceScore` is a number: UI shows the value as "Average Model Confidence"

---

## 10. Development workflow

### Start everything (Docker Compose)

```bash
docker compose up -d        # starts mongodb + backend
# Wait for backend to be ready: http://127.0.0.1:3000
```

### Start backend only (local Node)

```bash
cd apps/backend && npm install && npm run dev
# (ensure MongoDB is running separately or via Docker)
```

### Test the full flow (manual steps)

1. **Login**: `POST http://127.0.0.1:3000/api/auth/login` with `{ username: "hanif", password: "dev-change-me" }`
2. **Observe**: `Set-Cookie: sid=...` set in response
3. **Simulate device**: run the device simulator with the `sid` cookie
4. **Watch**: telemetry appears in MongoDB `telemetry` collection; workout summary appears after stop
5. **Check PWA**: visit `http://127.0.0.1:5173` — the PWA should connect to the backend via the same origin (or via Tailscale Funnel URL)

### Typecheck

```bash
npm run typecheck  # from repo root — checks PWA TS; backend has its own tsconfig
```

### Tests

```bash
npm test  # runs PWA vitest suite from repo root
# Backend tests (to be added): see apps/backend/tests/ if/when added
```

---

## 11. Environment template — `apps/backend/.env.example`

```
# MongoDB
MONGODB_URI=mongodb://gerak_user:gerak_pass@localhost:27017/gerak_in?authSource=admin

# Session
SESSION_SECRET=this-is-a-very-long-and-random-secret-string-min-32-chars

# Owner credentials (simple prototype)
OWNER_USERNAME=hanif
OWNER_PASSWORD=dev-change-me

# Demo profile weight (kg) — not committed, filled by operator
DEMO_WEIGHT_KG=70

# Protocol
PROTOCOL_VERSION=v1

# Rate limits (events per 2 seconds per device)
TELEMETRY_RATE_LIMIT=1

# Device simulator
SIMULATOR_SESSION=dev-session-id-must-match-login
```

**`.env.example` is committed to Git**; real values are filled by the operator in `.env` (which is in `.gitignore`).

---

## 12. Next steps after this setup

1. Verify the backend builds and MongoDB is accessible
2. Test login + session cookie flow
3. Run the device simulator and confirm telemetry persists to MongoDB
4. Create a workout session and confirm summary (calories, duration, confidenceScore) is correct
5. Wire the existing PWA (`apps/pwa`) to the backend (the PWA currently uses static fixtures; update API calls to point at the backend)
6. Add any missing contract validations or edge cases