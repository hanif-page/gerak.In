# gerak.In

gerak.In is an ESP32 Edge AI-Based Smart Wearable Fitness Tracker Integrated with Progressive Web App.

## Frontend development

The React + TypeScript PWA lives in [`apps/pwa`](apps/pwa/README.md). Its static Figma flow includes normal idle/walking states, workout selection, selected-exercise/Auto-Detect tracking, and workout summaries. It displays explicitly labeled sample data, not live wearable telemetry.

Navigation uses hash links: `/#/`, `/#/workout?exercise=push-up`, `/#/active?exercise=auto`, and `/#/summary?exercise=auto`. See the [frontend guide](apps/pwa/README.md#static-navigation) for all preview routes. Start/Stop links only navigate; they do not control hardware or save data.

Requirements: Node.js 20.19+ and npm 10+.

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:5173`. Run commands from the repository root.

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

PWA service-worker behavior is enabled in production builds only. See the [frontend guide](apps/pwa/README.md) for installation, offline behavior, and limitations.

## Project requirements

- [Consolidated agreed brief](project-brief-completed.md)
- [Repository architecture guide](REPOSITORY_GUIDE.md)
- [Latest owner-supplied hardware wiring](hardware/wiring/pin-configuration.md): shared I2C SDA GPIO3 / SCL GPIO4, MPU-6050 and OLED. The new schematic labels an ESP32-C3 SuperMini, unlike the earlier XIAO brief; verify the actual board before firmware target selection.

Backend, ESP32 firmware, authentication, and real device integration are separate milestones; they are not implemented by this frontend setup.

