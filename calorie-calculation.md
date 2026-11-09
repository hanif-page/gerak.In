# Calorie Calculation — gerak.In

## MET (Metabolic Equivalent of Task) — fixed values

Calories are estimated using **fixed MET values** per activity, multiplied by body weight (kg) and duration (minutes). No pace-scaling is applied.

| Activity | MET value | Formula |
|---|---|---|
| Rest / idle | 1.0 | `calories = MET × weight_kg × duration_min / 200` |
| Walking | 3.5 | `calories = MET × weight_kg × duration_min / 200` |
| Push-ups | 3.8 | `calories = MET × weight_kg × duration_min / 200` |
| Jumping jacks | 5.0 | `calories = MET × weight_kg × duration_min / 200` |

**Note:** Duration is the **active session duration** (time from Start to Stop workout command), not per-rep time. Rest/transition periods within a workout are included in the total duration.

## Assumptions

1. **Body weight** is provided by the user via `.env` (e.g., `DEMO_WEIGHT_KG=70`). This value is **not committed** to Git; it is the demo profile weight filled in by the operator at startup.
2. **MET values** are fixed constants as listed above. They are demonstration approximations, not individualized physiological measurements.
3. **Duration** is computed on the server from the workout start/stop timestamps. If the device sends telemetry that overlaps or overcounts, the backend deduplicates by `event_id` before computing the final duration.
4. **Rest/transition/uncertain periods** are included in the total workout duration. The classification of each 3-second window (idle/walking/push-up/jumping-jack/rest) is used for the UI confidence display but does not separately affect the calorie formula — the formula uses total duration only.
5. **Calorie output** is rounded to one decimal place (e.g., `20.1`, `14.2`) and stored as a string in the telemetry payload.
6. **No activity-specific adjustment** is made for overlapping windows, partial completions, or classification uncertainty. The calorie estimate is strictly `MET × weight × duration / 200`.

## Backend calculation (pseudo-code)

```js
function calculateCalories(exercise, durationMinutes, weightKg) {
  const met = MET_VALUES[exercise] || 1.0; // default to rest MET if unknown
  const calories = Math.round(met * weightKg * durationMinutes / 200 * 10) / 10; // one decimal
  return calories;
}
```

## Stored fields

Each workout summary document in MongoDB stores:
- `calories`: string (e.g. `"20.1"`)
- `duration`: string (e.g. `"02:00"` — formatted from total minutes)
- `exercise`: string (canonical label: `push-up`, `jumping-jack`, `rest`)
- `repetitions`: number (from the classification logic, not directly used in calorie formula)