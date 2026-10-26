# Detailed Project Brief: Dual-Mode Edge AI Smart Fitness Tracker

**Project Overview:** 
A wearable IoT fitness device built on the ESP32 that features two operational modes: an energy-efficient "Normal Mode" for daily activity tracking, and a high-performance "Workout Mode" using Edge AI (TinyML) for specific exercise recognition. 

This project utilizes a modern IoT web stack: ESP32 Edge Device, Node.js/Express Backend (hosted via Tailscale), MongoDB database, and a React PWA Frontend.

---

## 1. Hardware Setup (The Wearable Node)
The hardware is designed to be worn consistently as an **armband**.
*   **Microcontroller:** Seeed Studio XIAO ESP32C3 (Compact, RISC-V, Wi-Fi capable).
*   **Motion Sensor:** MPU-6050 (or similar 6-axis IMU) connected via I2C.
*   **Power Supply:** 3.7V Li-Po Battery (~400mAh) + TP4056 Charging Module + 3.3V LDO Regulator.
*   **Enclosure:** Custom 3D-printed armband case to securely hold the electronics against the user's arm.

---

## 2. Server & Software Stack
*   **The Server (Laptop):** Runs Ubuntu 24.04. 
*   **Network Tunneling:** Uses **Tailscale Funnel** to expose the local Node.js server to the public internet securely, providing an essential HTTPS URL for the PWA and the ESP32.
*   **Backend:** Node.js with Express.js. Handles API routing and WebSocket connections.
*   **Database:** **MongoDB** (using Mongoose). Stores historical JSON logs of daily activity, reps, and exercise types without a rigid table schema.
*   **Frontend Client:** A Progressive Web App (PWA) built with **React** (via Vite).

---

## 3. Operational States & Edge AI
### A. Normal Mode (Default)
*   **Concept:** Battery-saving mode using local Digital Signal Processing (DSP) algorithms in C++, not heavy AI.
*   **Logic:** Calculates the variance and amplitude of accelerometer axes over a 3-second window.
    *   *Low Variance* = Sitting/Idle
    *   *Medium Variance* = Walking
    *   *High Variance* = Running

### B. Workout Mode (Edge AI / TinyML)
*   **Concept:** High-performance classification triggered by the user via the app.
*   **AI Pipeline:**
    *   Trained using **Edge Impulse** (Spectral Analysis feature extraction + Neural Network classification).
    *   Deployed locally to the ESP32 using TensorFlow Lite for Microcontrollers (TFLM).
    *   Recognizes specific patterns: `Push-up`, `Jumping Jack`, and `Rest`.

---

## 4. Communication Architecture (The "Golden Route")
The system uses a hybrid communication approach to maximize efficiency and real-time responsiveness.

### A. ESP32 to Laptop (HTTP POST API)
*   **Protocol:** Standard HTTP POST requests over Wi-Fi.
*   **Flow:** When the ESP32 calculates a new state (e.g., a completed rep or a transition from walking to sitting), it sends a lightweight JSON payload to the Express.js API endpoint (e.g., `https://your-machine.tailscale.net/api/telemetry`).
*   **Advantage:** Extremely easy to implement and debug. Relies directly on the Tailscale Funnel HTTPS URL.

### B. Laptop to React PWA (WebSockets via Socket.io)
*   **Protocol:** Persistent WebSocket connection.
*   **Flow:** 
    1. The Express.js backend receives the HTTP POST from the ESP32.
    2. Express uses Mongoose to save this data into MongoDB.
    3. In the exact same function block, Express triggers `io.emit('workoutUpdate', data)`.
    4. The React PWA instantly receives this event and updates the rep counter on the screen with zero lag.

### C. Mode Switching (React PWA -> Laptop -> ESP32)
*   **Flow:** 
    1. User clicks "Start Workout" on the React PWA.
    2. PWA sends a Socket.io event or an HTTP POST command to the Laptop backend.
    3. The Laptop updates the current active state in MongoDB.
    4. *How ESP32 gets it:* The next time the ESP32 pings the Laptop (or via a specific HTTP GET polling mechanism every few seconds), it reads the new state requirement (`{"target_mode": "workout"}`) and switches its internal C++ logic to launch the TFLM model.

---

## 5. Deployment & Presentation Setup
To demonstrate this successfully with three different network points (ESP32 on Wi-Fi A, Laptop on Wi-Fi B, Phone on Wi-Fi C):
1.  **Laptop (Wi-Fi B):** Start MongoDB, run the Express backend, and ensure Tailscale Funnel is active and routing traffic to the Express port.
2.  **Phone (Wi-Fi C):** Open the React PWA (hosted on Vercel or accessed via the Tailscale URL). Ensure it connects to the Socket.io server.
3.  **ESP32 (Wi-Fi A):** Power on. It uses hardcoded Wi-Fi A credentials and points its HTTP POST requests to the Tailscale URL.
4.  **The Demo:** Show the real-time synchronization between physical arm movement, the database logging on the Ubuntu screen, and the instant UI updates on the React PWA.