# gerak.In PWA

Frontend built with React 19, TypeScript, Vite 6, and `vite-plugin-pwa`, managed as the `@gerak-in/pwa` npm workspace in this repository.

## Requirements and commands

Use Node.js **>=20.19.0** and npm **>=10**. Run these commands from the repository root, not from `apps/pwa`:

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run build
npm run preview
```

- `npm ci`: install the locked workspace dependencies.
- `npm run dev`: start development at `http://127.0.0.1:5173` by default.
- `npm run typecheck`: check TypeScript types.
- `npm test`: run the frontend tests.
- `npm run build`: create the production build.
- `npm run preview`: serve the production build at `http://127.0.0.1:4173` by default; run the build first.

These are usage instructions, not a report that any checks or tests have been run.

## Design and current scope

The home flow follows [Figma file `KTOlUFV2H3LYTXCw3YbiVi`](https://www.figma.com/design/KTOlUFV2H3LYTXCw3YbiVi/?node-id=13-913), using exported icons and a locally hosted Inter font. Native iOS browser and system chrome is not replicated.

Implemented frame states:

| State | Figma node |
| --- | --- |
| Normal idle | `13:913` |
| Walking sensor card | `13:991` |
| Workout setup / Push-ups selected | `13:1006`, `13:1016` |
| Jumping Jacks selected | `11:18` |
| Auto-Detect selected | `11:76` |
| Selected-exercise tracking, AI off | `13:1053` |
| Auto-Detect tracking | `11:165` |
| Selected-exercise summary | `11:207` |
| Auto-Detect summary | `13:1091` |

### Static navigation

All screen and exercise transitions use real hash links. No router dependency or server rewrite is needed. Refresh, direct links, new tabs, and browser Back/Forward preserve the selected preview state.

| Link suffix | Preview |
| --- | --- |
| `/#/` | Default Normal Mode, sitting |
| `/#/normal?activity=walking` | Normal Mode, walking |
| `/#/workout?exercise=push-up` | Workout setup, Push-ups selected |
| `/#/workout?exercise=jumping-jack` | Workout setup, Jumping Jacks selected |
| `/#/workout?exercise=auto` | Workout setup, Auto-Detect selected |
| `/#/active?exercise=push-up` | Push-ups tracking |
| `/#/active?exercise=jumping-jack` | Jumping Jacks tracking |
| `/#/active?exercise=auto` | Auto-Detect tracking |
| `/#/summary?exercise=push-up` | Push-ups summary |
| `/#/summary?exercise=jumping-jack` | Jumping Jacks summary |
| `/#/summary?exercise=auto` | Auto-Detect summary |

Use these suffixes with the running dev or preview origin. `Normal Mode` returns home; `Workout Mode` opens setup. Clicking an exercise card highlights only that selection. `Start Active Workout` opens its tracking view; `Stop & Save Workout` opens its summary; `Return to Dashboard` goes home. Normal Mode has no Start Active Workout action; switch to Workout Mode to select and start an exercise preview. A small **Preview sensor state** control switches between idle and walking until real telemetry exists.

Unknown routes/exercises fall back to safe preview defaults. The skip link moves keyboard focus without changing the hash route.

### Preview limitations and scope changes

- This is a **static design preview, not live tracking**. The connection remains **Not connected**, or **Offline** when the browser reports offline.
- Steps, repetitions, time, confidence, and calories are fixed illustrative fixtures, not sensor readings or calculations. There are no automatic counter/timer updates.
- Auto-Detect's active frame shows 18 reps, while its summary shows 25, matching separate Figma snapshots—not a saved or accumulated session.
- AI On/Off badges describe the preview variant. No model is loaded or running; no device mode is changed.
- Summaries explicitly state **Not saved to server**. No MongoDB write or local persistence occurs.
- Backend integration, owner authentication, sockets, actual calorie estimates, and device inference remain future milestones.
- This frontend request explicitly uses **Push-ups and Jumping Jacks**, with selected-exercise previews showing **AI off**. This differs from the earlier brief's squat/TinyML requirements. These are frontend-only design fixtures; reconcile the hardware/model requirements before implementing firmware rather than silently assuming the original training scope changed.
- The UI uses **Average Model Confidence**, not the misleading Figma label “Avg AI Accuracy.”

## PWA behavior

`vite-plugin-pwa` generates the web app manifest and production service worker. App assets include 192×192 and 512×512 icons, maskable icons, and an Apple touch icon.

- Updates use a **prompt** strategy: users are prompted to apply an available update rather than having it applied automatically.
- The service worker is enabled **only in production**, not in the Vite development server.
- Caching covers the static application shell. There is **no API runtime caching**.
- API and socket navigation requests are excluded from the app-shell navigation fallback.
- Service workers require a secure context: use **localhost/loopback or HTTPS**.

An offline interface is **not offline tracking**. A cached shell does not collect sensor data, calculate activity, or synchronize workouts while offline.

### Install

- **iOS Safari:** open the app, tap **Share**, then **Add to Home Screen**.
- **Chromium browsers:** use the browser's install option when the app meets installation eligibility requirements. The option may not appear immediately or on every platform.

### Verify production behavior

Run `npm run build`, then `npm run preview`, and open the preview URL to inspect the manifest, service worker, installation behavior, update prompt, and cached shell. Test service-worker behavior against this production build, **not** `npm run dev`.

When returning to development, unregister old service workers and clear their caches/site data in browser developer tools if stale production assets are being served. An existing registration can otherwise interfere with development on the same origin.

## Deployment and configuration

The intended production topology serves the frontend and a future backend through a **same-origin Funnel endpoint**. That backend and its integration are **not implemented here**; deployment must not be interpreted as enabling live data, authentication, or sockets.

Never put secrets in `VITE_*` environment values. Vite exposes these values to client code and bundles them into public frontend assets. Keep credentials, private tokens, and other secrets on the backend.
