# Figma UI Prompt V2: Minimalist Dual-Mode Edge AI Smart Fitness Tracker PWA

**Global Design System**
*   **Target Device:** iPhone 11 (414 x 896 px).
*   **Typography:** Inter or SF Pro Display. Use heavy weights (Bold/Black) for numerical metrics and Medium/Regular for labels.
*   **Color Palette:** 
    *   Base Background: Pure White (#FFFFFF) - Minimalist Design
    *   Primary Text & Headers: Dark Brown (#813405)
    *   Primary Action Buttons & Active Accents: Dark Orange (#D45113)
    *   Secondary Icons & Active Elements: Light Orange (#F9A03F)
    *   Data Card Backgrounds: Light Yellow (#F8DDA4)
    *   Success/Connection Status Badges: Light Green (#DDF9C1)
*   **Aesthetic:** Minimalist, high contrast, ample whitespace, border radius of 16px to 24px for cards and buttons. 

---

## SCREEN OVERVIEW & INTERACTION FLOW

### Screen 1A: Home / Dashboard (Normal Mode - Default Idle)
*   **Top Nav:** 
    *   Left: App Title "Tracker" (24pt, #813405, Bold).
    *   Right: Pill Badge (Background: #DDF9C1, Text: "Connected", 12pt, #813405) representing WebSocket/Tailscale status.
*   **Mode Selector Switch (New):** A segmented pill control directly below the header:
    *   Selected Option: `[ Normal Mode ]` (Background: #D45113, Text: White, Bold).
    *   Unselected Option: `[ Workout Mode ]` (Background: #F8DDA4, Text: #813405).
*   **Hero Card (Daily Overview):** 
    *   Card (Background: #F8DDA4, Radius: 20px).
    *   Title: "Today's Passive Activity" (14pt, #813405).
    *   Large metric display: Step Count (e.g., "4,120 Steps") and Total Daily Calories ("185 kcal").
*   **Live Sensor Status Card:** 
    *   Card (Background: White, Border: 1px solid #F8DDA4, Radius: 16px).
    *   Status Indicator: Green dot + "Current Status: Sitting" (Low IMU variance calculated by C++ DSP on ESP32).
*   **Primary Action Button:** 
    *   Bottom floating pill button (Background: #D45113, Text: White, "Start Active Workout").
*   **Figma Prototype Interactions:**
    *   `On Click` on `[ Workout Mode ]` tab -> `Navigate To: Screen 2A (Workout Setup)` -> `Animation: Dissolve`.
    *   `On Click` on `Start Active Workout` button -> `Navigate To: Screen 2B (Workout Active)` -> `Animation: Slide In (Right)`.

---

### Screen 1B: Dashboard (Normal Mode - Active Movement State)
*   *Same as Screen 1A, but simulates live data incoming via WebSocket when the user is walking.*
*   **Live Sensor Status Card:** 
    *   Status Indicator: Orange pulsing dot + "Current Status: Walking (Moderate Pace)".
    *   Live Step Counter: Increments dynamically (e.g., "4,125 Steps").
*   **Figma Prototype Interactions:**
    *   `On Click` on background card -> `Navigate To: Screen 1A` (Toggles state for testing).

---

### Screen 2A: Workout Setup / Mode Selection
*   **Top Nav:** 
    *   Left: App Title "Tracker" (24pt, #813405, Bold).
    *   Right: Pill Badge ("Connected", #DDF9C1).
*   **Mode Selector Switch:**
    *   Selected Option: `[ Workout Mode ]` (Background: #D45113, Text: White, Bold).
    *   Unselected Option: `[ Normal Mode ]` (Background: #F8DDA4, Text: #813405).
*   **Edge AI Info Box:** 
    *   Card (Background: White, Border: 2px solid #F9A03F, Radius: 16px).
    *   Text: "Edge AI Ready. Put on your armband and select target exercise or let TinyML auto-detect."
*   **Exercise Selection Grid:** 
    *   Card 1: "Push-ups" (Selected state: #F9A03F background, #813405 text).
    *   Card 2: "Jumping Jacks" (Unselected: #F8DDA4 background).
    *   Card 3: "Auto-Detect (TinyML)" (Unselected: #F8DDA4 background).
*   **Primary Action Button:** 
    *   Bottom pill button (Background: #D45113, Text: White, "Begin AI Tracking").
*   **Figma Prototype Interactions:**
    *   `On Click` on `[ Normal Mode ]` tab -> `Navigate To: Screen 1A` -> `Animation: Dissolve`.
    *   `On Click` on `Begin AI Tracking` button -> `Navigate To: Screen 2B (Workout Active)` -> `Animation: Slide In (Right)`.

---

### Screen 2B: Active Workout State (Edge AI Running)
*   **Top Nav:** 
    *   Left: Pulse Icon + "Workout Session Active" (16pt, #D45113, Bold).
    *   Right: Pill Badge ("AI Inference On", Background: #F9A03F, Text: #813405).
*   **AI Classification Banner:** 
    *   Centered upper area (32pt, #D45113, Extra Bold): "JUMPING JACKS".
    *   Sub-badge: "AI Confidence: 94%" (14pt, #813405, Background: #DDF9C1, Radius: 12px).
*   **Real-Time Rep Counter (Centerpiece):** 
    *   Massive counter: "18" (120pt, #813405, Black Weight).
    *   Label: "REPETITIONS" (14pt, #F9A03F, Tracking: Wide).
*   **Real-Time Stats Card:** 
    *   2-Column Grid (Background: #F8DDA4, Radius: 16px).
    *   Left: "Calories Burned: 14.2 kcal".
    *   Right: "Session Time: 02:45".
*   **Primary Action Button:** 
    *   Bottom pill button (Background: White, Border: 2px solid #813405, Text: #813405, "Stop & Save Workout").
*   **Figma Prototype Interactions:**
    *   `On Click` on `Stop & Save Workout` -> `Navigate To: Screen 3 (Post-Workout Summary)` -> `Animation: Slide Up`.

---

### Screen 3: Post-Workout Summary & DB Sync
*   **Top Nav:** Centered title "Workout Summary" (24pt, #813405, Bold).
*   **Success Header:** 
    *   Green Checkmark Icon inside circular badge (#DDF9C1).
    *   Subtext: "Saved to Laptop Server (MongoDB)" (12pt, #813405).
*   **Session Stats Overview:**
    *   Hero Card (Background: #F8DDA4, Radius: 20px).
    *   Title: "Session Completed" (16pt, #813405, Bold).
    *   Stat 1: "Total Reps: 25 Jumping Jacks" (20pt, #D45113, Bold).
    *   Stat 2: "Calories Burned: 18.5 kcal" (20pt, #D45113, Bold).
    *   Stat 3: "Avg AI Accuracy: 92%" (16pt, #813405).
*   **Primary Action Button:** 
    *   Bottom pill button (Background: #D45113, Text: White, "Return to Dashboard").
*   **Figma Prototype Interactions:**
    *   `On Click` on `Return to Dashboard` -> `Navigate To: Screen 1A` -> `Animation: Slide Out (Right)`.

---

## FIGMA PROTOTYPE LINKING MAP SUMMARY
1. Screen 1A [Mode Toggle -> Workout] -> Screen 2A
2. Screen 1A [Start Active Workout] -> Screen 2B
3. Screen 1A [Sensor Card Tap] -> Screen 1B (Simulate Walking)
4. Screen 2A [Mode Toggle -> Normal] -> Screen 1A
5. Screen 2A [Begin AI Tracking] -> Screen 2B
6. Screen 2B [Stop & Save Workout] -> Screen 3
7. Screen 3 [Return to Dashboard] -> Screen 1A