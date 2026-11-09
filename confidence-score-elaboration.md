# Confidence Score — gerak.In

## Design choice: `confidenceScore: null` (simpler variant)

The PWA and backend use a single field `confidenceScore` with the following semantics:

| State | `confidenceScore` value | Meaning |
|---|---|---|
| Normal Mode (DSP only) | **`null`** | Not applicable — DSP does not produce an AI confidence score. UI shows "N/A" or a separate signal-quality indicator. |
| Workout Mode (TinyML inference) | **0–100** (integer) | Average model confidence across the inference windows in the session. Higher = model is more confident in its classification. |
| Workout Mode, uncertain | **0–100** (integer) | May be low (e.g., 20–40) when the sensor signal is noisy or the movement does not clearly match any trained class. |

**No extra fields are needed**: there is no `confidenceApplicable` flag, no `signalQuality` field, and no separate confidence computation. The single `confidenceScore` field covers all cases.

## Why this design?

1. **Minimal contract**: The device (ESP32) sends one number. The backend stores one number. The PWA displays one value. No schema evolution needed for extra flags.
2. **Backward compatible**: If a future firmware version adds confidence, it can simply populate `confidenceScore` with a number. Old clients that see `null` know it means "not applicable."
3. **Clear separation**: Normal Mode explicitly gets `null` — this prevents any misinterpretation that the DSP result has 100% "AI confidence," which the brief explicitly rejects.
4. **UI simplicity**: The PWA already uses "Average Model Confidence" as the label (per the existing frontend code). A single numeric field maps directly to that label.

## Backend storage format

Each telemetry document in MongoDB stores:
- `confidenceScore`: number | null (0–100, or null for Normal Mode)
- `mode`: string (`"normal"` or `"workout"`)
- `exercise`: string (`"push-up"`, `"jumping-jack"`, `"rest"`, or null if normal mode)
- `timestamp`: ISO date (device occurrence time, stored in UTC)

## PWA display logic (existing, unchanged)

The PWA already renders `Average Model Confidence` from the `confidenceScore` field. When `confidenceScore` is `null`, the UI shows "N/A" or a grayed-out indicator, making it clear that no AI confidence is available in Normal Mode.

## Rate-limiting & defaults

- If the device does not send a `confidenceScore`, the backend defaults to `null` (treats it as Normal Mode or missing data).
- The PWA should not crash if `confidenceScore` is `null`; it should gracefully show "N/A".
- No validation range is enforced server-side beyond "is it null or a number?" — the device is trusted to send 0–100.