# MongoDB Schema Design: Dual-Mode Edge AI Smart Fitness Tracker

## The Mongoose Schema (`ActivityLog.js`)

Since you are using Node.js and Express, you will define this schema using Mongoose. Here is the recommended structure:

```javascript
const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  mode: {
    type: String,
    enum: ['normal', 'workout'],
    required: true,
    index: true // Indexed for faster querying
  },
  activityType: {
    type: String,
    required: true,
    // Examples: 'sit', 'walk', 'run', 'push_up', 'jumping_jack'
  },
  count: {
    type: Number,
    required: true,
    default: 0
    // Represents 'steps' in normal mode, or 'reps' in workout mode
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
    // Edge AI confidence percentage (e.g., 92 for 92%). 
    // Defaults to 100 for normal mode since it relies on algorithmic thresholding, not AI.
  },
  estimatedCalories: {
    type: Number,
    default: 0
    // Computed by the Express.js backend before saving to MongoDB
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true // Crucial for time-based dashboard queries
  }
}, { 
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Compound index for querying specific activities on specific days
activityLogSchema.index({ timestamp: -1, mode: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
```

---

## Justification: Why Design It This Way?

### 1. Unified Collection vs. Separate Collections
Instead of creating two different tables/collections (e.g., `NormalLogs` and `WorkoutLogs`), this uses a single `ActivityLog` collection distinguished by the `mode` field. 
*   **Why?** The PWA dashboard needs to display **"Today's Volume"** (total calories and overall movement). A single collection allows your Express backend to perform a single aggregation query to sum up all calories and activities for the day without having to join or query multiple collections.

### 2. The Polymorphic `count` Field
Notice that the field is named `count` rather than `reps` or `steps`.
*   **Why?** In "Normal Mode," this number represents the number of *steps* walked or run. In "Workout Mode," it represents the number of *repetitions* of an exercise. By making it a generic `count` field, the schema remains incredibly flexible. Your React frontend simply reads the `mode` to decide whether to render the word "Steps" or "Reps".

### 3. Backend Calorie Calculation (`estimatedCalories`)
The ESP32 does not calculate calories; it only sends the exercise type and the rep/step count. The schema includes an `estimatedCalories` field.
*   **Why?** This keeps the ESP32 code lightweight (the "industrial way"). When the Node.js backend receives the HTTP POST request, it should multiply the `count` by a predefined multiplier (e.g., 1 push-up = 0.3 calories) *before* saving it to MongoDB. This ensures your database acts as the single source of truth.

### 4. Performance Indexing (`index: true`)
The schema adds MongoDB indexes to the `mode` and `timestamp` fields.
*   **Why?** Because this is IoT telemetry data, this collection will grow very fast (thousands of rows per week). Without indexing, fetching "Yesterday's Workout Data" would require MongoDB to scan every single row. By indexing `timestamp`, date-based queries will execute in milliseconds.

---

## Example: How the ESP32 Payload Maps to MongoDB

When your ESP32 sends this JSON via HTTP POST to your Express route:
```json
{
  "mode": "workout",
  "activity": "push_up",
  "count": 15,
  "confidence": 88
}
```

Your Express.js controller will intercept it, calculate the calories (e.g., `15 * 0.3 = 4.5`), attach the current server time, save it perfectly into this Mongoose schema, and then immediately broadcast it to the React PWA via `socket.io`.