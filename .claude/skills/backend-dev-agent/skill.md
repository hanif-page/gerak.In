---
name: backend-dev-agent
description: Build the gerak.In backend with full context of the project requirements, decisions, and architecture.
metadata:
  type: project
---

# Backend Dev Agent — gerak.In

You are the **backend development agent** for the gerak.In project. Your task is to build the complete backend system based on the confirmed specifications in the project documentation.

## Your Mission

Build the gerak.In backend with:
- Express.js + TypeScript server
- MongoDB via Mongoose
- Session cookie authentication (single user)
- Socket.IO for real-time updates
- REST API for telemetry, workouts, device status
- Shared contracts package (`packages/contracts`)
- Device simulator (standalone Node script)
- Docker Compose setup (`infra/compose.yaml`)

## Context Files (READ THESE FIRST)

Before starting any implementation, read and understand:

1. **`REPOSITORY_GUIDE.md`** — Overall architecture, folder structure, component boundaries
2. **`project-brief-completed.md`** — Project requirements and operational states
3. **`backend-dev-setup.md`** — Complete backend setup specification (routes, auth, MongoDB, simulator)
4. **`calorie-calculation.md`** — MET-based calorie calculation assumptions
5. **`confidence-score-elaboration.md`** — Confidence score design (`null` for Normal Mode, 0-100 for Workout)
6. **`hardware/wiring/pin-configuration.md`** — Hardware wiring (ESP32-C3 SuperMini, I2C GPIO3/4)
7. **`apps/pwa/README.md`** — Existing PWA structure (static preview, future integration)

## Confirmed Decisions (DO NOT DEVIATE)

### A. Conflicts Resolved
1. **Exercise classes**: `push-up`, `jumping-jack`, `rest` (match frontend; scalable for future additions)
2. **Hardware target**: **ESP32-C3 SuperMini** (owner's latest schematic)
3. **Calorie estimation**: **Fixed MET** (not pace-scaled) — see `calorie-calculation.md`
4. **Confidence for Normal Mode**: **`confidenceScore: null`** (simpler variant, no extra fields)
5. **Canonical field names**: **`activityType` + `confidenceScore`**

### B. Scope Decisions
6. **Backend-first**: Build backend + contracts + device simulator; wire existing PWA later
7. **Device simulator**: Standalone Node script (not part of backend test suite); uses distinct credentials
8. **Auth**: **Session cookies** (HttpOnly, SameSite=Lax); single owner login, no registration
9. **MongoDB**: Docker Compose (`infra/compose.yaml`); **same DB name** (`gerak_in`) for dev and demo
10. **Contracts**: **Real npm workspace package** (`packages/contracts`) shared by backend and PWA

### C. Protocol Values
11. **Protocol version**: `v1`
   - **Command poll interval**: ~2 seconds
   - **Command ack timeout**: 5 seconds
   - **Telemetry rate-limit**: 1 event / 2 seconds per device
   - **Dedup/event-ID format**: `${deviceId}-${counter}`

12. **Timezone**: Asia/Jakarta for display; **UTC storage** in MongoDB
13. **Demo weight**: From `.env` only (`DEMO_WEIGHT_KG=70`), **not committed**

### D. Out of Scope (DO NOT BUILD)
- Multi-user
- Social login
- Payments
- Pause/resume
- OTA (Over-the-Air updates)
- Durable flash queues
- Medical-grade accuracy
- Pre-trained model
- Extra UI screens
- Automatic commits/branches

## Folder Structure to Create

```
gerak.In/
├── packages/contracts/           # Shared TypeScript types & validators
│   ├── schemas/                  # JSON schemas
│   ├── src/                      # TypeScript types & validators
│   │   ├── telemetry.ts
│   │   ├── commands.ts
│   │   ├── sessions.ts
│   │   └── index.ts
│   ├── examples/                 # Sample JSON payloads
│   └── package.json
│
├── apps/backend/                 # Express + Mongoose backend
│   ├── src/
│   │   ├── config/               # Environment validation
│   │   │   └── index.ts
│   │   ├── db/                   # MongoDB connection
│   │   │   └── connection.ts
│   │   ├── middleware/           # Auth, validation, errors
│   │   │   ├── auth.ts
│   │   │   ├── validate.ts
│   │   │   └── errors.ts
│   │   ├── modules/
│   │   │   ├── telemetry/
│   │   │   │   ├── model.ts      # Mongoose schema
│   │   │   │   ├── routes.ts
│   │   │   │   ├── service.ts
│   │   │   │   └── validator.ts
│   │   │   ├── devices/
│   │   │   │   ├── model.ts
│   │   │   │   ├── routes.ts
│   │   │   │   └── service.ts
│   │   │   ├── workouts/
│   │   │   │   ├── model.ts
│   │   │   │   ├── routes.ts
│   │   │   │   ├── service.ts
│   │   │   │   └── calculator.ts  # Calorie calculation
│   │   │   └── activity/
│   │   │       ├── model.ts
│   │   │       └── service.ts
│   │   ├── realtime/              # Socket.IO setup
│   │   │   └── socket.ts
│   │   ├── app.ts                 # Express app (independently testable)
│   │   └── server.ts              # HTTP server + startup/shutdown
│   ├── tests/
│   │   ├── telemetry.test.ts
│   │   ├── workouts.test.ts
│   │   └── auth.test.ts
│   ├── .env.example
│   └── package.json
│
├── model-training/device-simulator/  # Standalone device simulator
│   ├── index.js
│   ├── package.json
│   └── README.md
│
└── infra/
    └── compose.yaml              # Docker Compose for MongoDB + backend
```

## API Contract (IMPLEMENT THESE)

### Authentication
- `POST /api/auth/login` — `{ username, password }` → `200` + `Set-Cookie: sid=...`
- `POST /api/auth/logout` — Clear session cookie

### Telemetry
- `GET /api/telemetry` — Query telemetry (query params: `deviceId`, `mode`, `limit`)
- `POST /api/telemetry` — Submit telemetry payload
  ```ts
  interface TelemetryPayload {
    deviceId: string;
    mode: 'normal' | 'workout';
    exercise: 'push-up' | 'jumping-jack' | 'rest' | null;
    confidenceScore: number | null;  // null for Normal Mode
    timestamp: string;  // ISO date (device time, UTC)
    eventId: string;    // deduplication key: `${deviceId}-${counter}`
    protocolVersion: string;  // "v1"
  }
  ```

### Workouts
- `GET /api/workouts` — List workout summaries
- `POST /api/workouts` — Start workout (returns session ID)
  ```ts
  interface StartWorkoutPayload {
    deviceId: string;
    exercise: 'push-up' | 'jumping-jack' | 'rest';
  }
  ```
- `POST /api/workouts/:id/stop` — Stop workout, compute summary

### Device Status
- `GET /api/device-status` — Get current device state
- `POST /api/device-status` — Update desired device state
  ```ts
  interface DeviceState {
    deviceId: string;
    desiredMode: 'normal' | 'workout';
    desiredExercise: 'push-up' | 'jumping-jack' | 'rest' | null;
    acknowledgedMode: 'normal' | 'workout' | null;
    acknowledgedAt: string | null;
  }
  ```

### Socket.IO Events
- `workoutUpdate` — Emitted when new telemetry arrives or workout state changes
- `deviceStateUpdate` — Emitted when device state changes

## MongoDB Collections

| Collection | Purpose | Key Fields |
|---|---|---|
| `telemetry` | Raw telemetry events | `deviceId`, `mode`, `exercise`, `confidenceScore`, `timestamp`, `eventId`, `receivedAt` |
| `workout_sessions` | Workout summaries | `exercise`, `repetitions`, `durationMinutes`, `calories`, `confidenceScore`, `startTime`, `endTime`, `deviceId` |
| `device_states` | Device state tracking | `deviceId`, `desiredMode`, `desiredExercise`, `acknowledgedMode`, `acknowledgedAt` |
| `users` | Owner credentials | `username`, `password` (plain text for prototype) |

## Calorie Calculation (from `calorie-calculation.md`)

```ts
const MET_VALUES = {
  rest: 1.0,
  walking: 3.5,
  'push-up': 3.8,
  'jumping-jack': 5.0,
};

function calculateCalories(exercise: string, durationMinutes: number, weightKg: number): string {
  const met = MET_VALUES[exercise] || MET_VALUES.rest;
  const calories = Math.round(met * weightKg * durationMinutes / 200 * 10) / 10;
  return calories.toString(); // e.g., "20.1"
}
```

## Device Simulator Requirements

Create a standalone Node script at `model-training/device-simulator/index.js` that:
1. Accepts CLI arguments: `--device-id`, `--mode`, `--exercise`, `--duration`, `--confidence`, `--interval`
2. Logs in to the backend first (uses credentials from `.env`)
3. Sends telemetry events every `--interval` ms (default: 2000ms)
4. Generates unique `eventId` values: `${deviceId}-${counter}`
5. For workout mode: sends start command, telemetry events, then stop command
6. For normal mode: sends telemetry with `confidenceScore: null`

## Environment Variables (`.env.example`)

```
# MongoDB
MONGODB_URI=mongodb://gerak_user:gerak_pass@localhost:27017/gerak_in?authSource=admin

# Session
SESSION_SECRET=change-this-to-a-long-random-string-min-32-chars

# Owner credentials
OWNER_USERNAME=hanif
OWNER_PASSWORD=dev-change-me

# Demo profile
DEMO_WEIGHT_KG=70

# Protocol
PROTOCOL_VERSION=v1

# Rate limits
TELEMETRY_RATE_LIMIT=1
```

## Docker Compose (`infra/compose.yaml`)

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
      SESSION_SECRET: ${SESSION_SECRET}
      OWNER_USERNAME: ${OWNER_USERNAME}
      OWNER_PASSWORD: ${OWNER_PASSWORD}
      DEMO_WEIGHT_KG: ${DEMO_WEIGHT_KG}
    ports:
      - "3000:3000"
    volumes:
      - ./apps/backend/src:/app/src:ro

volumes:
  mongodb_data:
```

## Implementation Order

1. **Create `packages/contracts/`** — Shared types and validators
2. **Create `apps/backend/`** — Express app with all modules
3. **Create `infra/compose.yaml`** — Docker Compose setup
4. **Create `model-training/device-simulator/`** — Standalone simulator
5. **Test end-to-end** — Simulator → Backend → MongoDB
6. **Wire PWA** — Update PWA to use real API (future milestone)

## Testing Strategy

1. **Unit tests**: Each service module (telemetry, workouts, devices)
2. **Integration tests**: API routes with mocked MongoDB
3. **E2E tests**: Device simulator → Backend → MongoDB → Verify data
4. **Manual testing**: Use Postman/curl to verify all routes

## Important Notes

- **No auth bypass**: Device simulator uses real credentials from `.env`
- **Rate limiting**: Enforce 1 event / 2 seconds per device
- **Deduplication**: `eventId` must be unique; duplicates are ignored
- **Time handling**: Store timestamps in UTC, display in Asia/Jakarta timezone
- **No retention policy**: For now, no cleanup of old telemetry
- **Single user**: No registration flow; credentials from `.env`

## How to Start

1. Read all context files listed above
2. Create the folder structure
3. Implement `packages/contracts/` first
4. Implement `apps/backend/` with all modules
5. Create Docker Compose and device simulator
6. Test everything

---

**Remember**: You are building a **prototype demo** to show the concept works. Focus on correctness, clarity, and the confirmed specifications. Do not add features outside the scope.