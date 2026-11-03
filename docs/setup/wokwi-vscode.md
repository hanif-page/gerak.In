# gerak.In — VS Code + PlatformIO + Wokwi Setup

## 1. Scope

Prepare and run a simulated ESP32-C3 with MPU-6050 and a 128×64 I2C OLED. The owner creates the PlatformIO project manually; this repository supplies Wokwi circuit/configuration templates and instructions.

This step does **not** implement the backend, real-device firmware, workout recognition, TinyML, or a live PWA connection. Existing frontend/backend requirements are unchanged.

Wokwi executes compiled firmware. It does not compile PlatformIO projects, run Node.js/MongoDB, or automatically produce sensor/fitness telemetry from a circuit drawing.

## 2. Project location

Create the PlatformIO project at exactly:

```text
/home/hanif/Documents/git-github/gerak.In/firmware/simulation/gerak-in-wokwi/
```

Repository-relative location: `firmware/simulation/gerak-in-wokwi/`.

The parent `firmware/simulation/` and its `templates/` directory are prepared. The named PlatformIO child project is intentionally left for you to create. Do not put it under `apps/pwa`, `node_modules`, or a future actual-device firmware folder.

## 3. Install extensions and activate Wokwi

In VS Code, install:

1. **PlatformIO IDE**, extension ID `platformio.platformio-ide`.
2. **Wokwi Simulator**, extension ID `wokwi.wokwi-vscode`.

Allow PlatformIO to finish installing its dependencies; reload VS Code if requested.

For Wokwi:

1. Open the Command Palette with `F1` or `Ctrl+Shift+P`.
2. Run **Wokwi: Request a new License**.
3. Follow the browser account/sign-in and license activation steps.
4. Confirm that VS Code reports license activation.

Account creation does not guarantee that every extension feature is free. Follow Wokwi's current license/trial/plan terms and verify entitlement before relying on it for the demonstration. No license or account secret belongs in the repository.

Installing the extensions, activating a license, downloading PlatformIO packages, and simulator execution have **not** been performed on your behalf.

## 4. Manually create the PlatformIO project

Open PlatformIO Home → **New Project** and select:

| Field | Value |
| --- | --- |
| Name | `gerak-in-wokwi` |
| Board | Espressif ESP32-C3-DevKitM-1 |
| Board ID | `esp32-c3-devkitm-1` |
| Framework | Arduino |
| Parent location | `/home/hanif/Documents/git-github/gerak.In/firmware/simulation` |

Disable the default location when selecting the parent. After creation, check that `platformio.ini` is inside `firmware/simulation/gerak-in-wokwi/`, with no duplicated project-name folder.

The generated configuration should contain the equivalent of:

```ini
[env:esp32-c3-devkitm-1]
platform = espressif32
board = esp32-c3-devkitm-1
framework = arduino
monitor_speed = 115200
```

This is a reference for the configuration you create, not an already-created `platformio.ini`. Keep any appropriate wizard-generated settings. Record/pin a tested platform version after the first successful setup rather than inventing an untested toolchain pin here.

### Why this board?

Wokwi documents support for ESP32-C3-DevKitM-1 and maps PlatformIO's `esp32-c3-devkitm-1` to its `board-esp32-c3-devkitm-1` circuit part.

It is a simulation stand-in for the SuperMini in the owner's latest schematic. It retains the C3 architecture and GPIO3/GPIO4 mapping without pretending that its physical board layout or upload settings match the SuperMini.

## 5. Copy the prepared Wokwi files

Copy, using your file manager or VS Code:

| Source | Destination after project creation |
| --- | --- |
| `firmware/simulation/templates/diagram.json` | `firmware/simulation/gerak-in-wokwi/diagram.json` |
| `firmware/simulation/templates/wokwi.toml` | `firmware/simulation/gerak-in-wokwi/wokwi.toml` |
| `firmware/simulation/templates/extensions.json` | `firmware/simulation/gerak-in-wokwi/.vscode/extensions.json` (optional) |

Create the child `.vscode/` directory if needed. If PlatformIO already generated an `extensions.json`, merge the two recommendation IDs into its existing recommendations rather than overwriting other entries.

For the simplest workflow, use **File → Open Folder** in VS Code and open:

```text
/home/hanif/Documents/git-github/gerak.In/firmware/simulation/gerak-in-wokwi/
```

Open the project folder itself, not `templates/`. If using the whole repository as a workspace, use **Wokwi: Select Config File** to choose the copied project `wokwi.toml` explicitly.

### Firmware paths

The template assumes environment `[env:esp32-c3-devkitm-1]` and points to:

```text
.pio/build/esp32-c3-devkitm-1/firmware.bin
.pio/build/esp32-c3-devkitm-1/firmware.elf
```

These are relative to the copied `wokwi.toml`. The build-directory name comes from the **environment name**, not the project name. If you rename the environment to `[env:simulation]`, change both template paths to `.pio/build/simulation/...`.

The simple application-only binary is suitable for the initial Arduino smoke test. Custom partitions, filesystems, OTA, or different flash layouts may require a merged/full flash image; follow the official PlatformIO simulation guide before introducing those features.

## 6. Circuit and serial connections

The prepared diagram contains:

- `esp`: `board-esp32-c3-devkitm-1`, 4 MB simulated flash.
- `imu`: `wokwi-mpu6050`.
- `oled`: `board-ssd1306`, simulated 128×64 I2C display at **0x3C**.

| Device connection | ESP32 connection |
| --- | --- |
| MPU SDA and OLED SDA | GPIO3 |
| MPU SCL and OLED SCL | GPIO4 |
| MPU VCC and OLED VCC | 3V3 |
| MPU GND, AD0, and OLED GND | Common GND |

MPU XDA, XCL, and INT remain unconnected. AD0 grounded gives the expected address **0x68**.

Serial monitor wiring:

- `esp:TX` → `$serialMonitor:RX`.
- `esp:RX` → `$serialMonitor:TX`.

Use the default Arduino UART serial path for this template and `Serial.begin(115200)`. No USB CDC build flags are required for this UART-wired simulation. If you deliberately switch to USB Serial/JTAG later, update both firmware settings and the Wokwi serial interface as documented; do not mix the two configurations accidentally.

The physical OLED's schematic uses `SCK`; the simulated part calls the same I2C clock signal `SCL`. SSD1306 and 0x3C are **simulation choices only**. The actual OLED controller/address is still unverified.

Authoritative owner-supplied wiring: [pin configuration](../../hardware/wiring/pin-configuration.md).

## 7. Optional first smoke test: I2C scan

If your wizard-generated `src/main.cpp` is empty, it will not initialize the sensor/display or print meaningful output. You can manually replace that initial placeholder with this minimal scan sketch. Preserve any existing code you want to keep.

```cpp
#include <Arduino.h>
#include <Wire.h>

void scanI2c() {
  unsigned int found = 0;
  for (uint8_t address = 1; address < 127; ++address) {
    Wire.beginTransmission(address);
    if (Wire.endTransmission() == 0) {
      Serial.printf("I2C device: 0x%02X\n", address);
      ++found;
    }
  }
  Serial.printf("Found %u device(s)\n", found);
}

void setup() {
  Serial.begin(115200);
  delay(250);
  Wire.begin(3, 4);
  Wire.setClock(100000);
  Serial.println("gerak.In Wokwi: SDA=3, SCL=4");
  scanI2c();
}

void loop() {
  delay(5000);
  scanI2c();
}
```

This uses Arduino's built-in Wire library; no third-party sensor/display library is needed for the scan itself. It is not workout firmware.

Expected result after you build and start the simulator:

```text
gerak.In Wokwi: SDA=3, SCL=4
I2C device: 0x3C
I2C device: 0x68
Found 2 device(s)
```

These are expected outputs, **not results already observed**.

The OLED will remain blank with a scanner: an address acknowledgement does not initialize or render the display. Actual MPU readings and display output require firmware and appropriate drivers in a later step. For PlatformIO, dependencies go in `platformio.ini` under `lib_deps`; a Wokwi-web `libraries.txt` is not a replacement for PlatformIO dependency configuration.

## 8. Build and start simulation

1. Open the created project root in VS Code.
2. Use PlatformIO's **Build** action, not **Upload**. Alternatively, in a PlatformIO terminal opened in that project root, run:

   ```sh
   pio run -e esp32-c3-devkitm-1
   ```

3. Wait for the build to finish successfully. First-time platform/toolchain installation may need internet access and time.
4. Confirm the `.bin` and `.elf` exist at the paths in `wokwi.toml`.
5. Press `F1` → **Wokwi: Start Simulator**.
6. Check the circuit and Wokwi serial output. The simulation tab should remain visible when observing output; simulation may pause when hidden.
7. Stop/rebuild/restart as needed after code changes. Wokwi can reload rebuilt firmware, but verify that you are looking at the current build.

No USB-connected board, upload port, real battery, Tailscale, backend, or frontend server is required for this first I2C test. Do not expect PlatformIO's physical-port Serial Monitor to attach to the simulated device automatically.

### Optional future serial-to-Python connection

The template includes a commented `rfc2217ServerPort = 4000` setting inside `[wokwi]`. Enable it only when needed and connect a compatible recorder to `rfc2217://localhost:4000`. This opens a local TCP serial endpoint; do not expose it publicly. The recorder is not implemented by this setup.

## 9. Sensor controls and limits

The IMU starts at X=0 g, Y=0 g, Z=1 g and zero rotation. These are synthetic stationary values, not a real left-forearm recording.

Click the simulated sensor and adjust its exposed controls where available, or edit its initial attributes and restart. Its attributes are `accelX`, `accelY`, `accelZ`, `rotationX`, `rotationY`, and `rotationZ`.

- Wokwi acceleration controls use **g**, where 1 g = 9.80665 m/s².
- Rotation controls use **degrees/second**.
- A firmware library may convert readings to different units; do not feed raw control values into a model without an explicit unit conversion.
- Changing a static acceleration value does not automatically generate a realistic walking or repetition waveform.
- With the scanner alone, changed motion values will not print; acquisition firmware must actually read sensor registers first.

Real exercise accuracy, count reliability, battery life, electrical behavior, and actual-device performance cannot be established here. Model inference must not be fabricated from slider changes.

## 10. Wi-Fi and future backend integration

Networking is optional for the initial circuit smoke test. When networking firmware is added, simulated Wi-Fi uses:

```cpp
WiFi.begin("Wokwi-GUEST", "", 6);
```

`Wokwi-GUEST` is the simulator's open network, not the laptop's SSID. Use your real Wi-Fi credentials only in separate actual-device local configuration.

Current Wokwi VS Code documentation states that it bundles the Private IoT Gateway. Verify your activated extension/license/network behavior before planning the demo; do not assume the web simulator and VS Code use identical gateway arrangements.

For a future backend:

- Public Funnel HTTPS origin: use the actual configured hostname once a backend exists; retain certificate verification and proper device authentication.
- Laptop-local service through an available Private Gateway: use `host.wokwi.internal` with the backend's actual configured port, not `localhost` inside the simulated firmware.
- `[net.forward]` rules are for incoming host-to-simulated-device services. They are not required merely for ESP32 → backend telemetry requests.
- Public Gateway traffic is documented as monitored; do not send private data or real credentials through it. Prefer the correctly configured VS Code/private gateway and disposable demo credentials.
- TCP/UDP requests can verify connectivity; Wokwi's gateway does not support ICMP ping.

No backend URL/port/token is invented or configured by these templates. No HTTPS bypass, API implementation, sensor-to-workout logic, or live PWA integration is included.

## 11. Troubleshooting

| Symptom | Check |
| --- | --- |
| `wokwi.toml` not found | Open the actual project root or run Wokwi: Select Config File; do not select the template copy. |
| Firmware binary not found | Build first; compare `.pio/build/<env>/` with both paths in the copied TOML. |
| Unknown board/circuit component | Use the documented part IDs in the template; update/verify Wokwi extension support. |
| Simulator does not start | Check Wokwi activation/license, extension output, firmware target, and build errors. |
| No serial text | Confirm a sketch prints output, UART wiring, `Serial.begin(115200)`, visible simulator tab, and no incompatible USB CDC configuration. |
| No I2C devices | Use `Wire.begin(3, 4)`; check shared power/ground and copied wiring; rebuild. |
| Only 0x68 | Check OLED bus connections and simulated address. |
| Only 0x3C | Check IMU power/bus connections and AD0. |
| OLED is blank | Scanner-only code does not draw anything; a display driver/render loop is required. |
| Wi-Fi connects but HTTP fails | Check gateway/network access, actual server availability, URL/DNS/port, TLS trust, and authentication; no backend exists from this step. |
| Localhost URL fails in device code | Under a Private Gateway, use `host.wokwi.internal` for a laptop service. |
| Custom partitions/filesystem fail | Application-only `firmware.bin` may be insufficient; follow the full-image documentation. |

## 12. Completion checklist

- [ ] Created `firmware/simulation/gerak-in-wokwi/` manually through PlatformIO.
- [ ] Selected ESP32-C3-DevKitM-1 and Arduino.
- [ ] Installed/activated Wokwi in VS Code.
- [ ] Copied diagram and TOML beside `platformio.ini`.
- [ ] Matched the environment name and both binary/ELF paths.
- [ ] Added a meaningful initial sketch, such as the optional I2C scanner.
- [ ] Built successfully without uploading to hardware.
- [ ] Started Wokwi and checked serial output.
- [ ] Observed expected 0x3C and 0x68 acknowledgements.
- [ ] Kept actual hardware assumptions, credentials, and generated build outputs separate.

## Official references

Consulted for this setup; no account/installation/runtime validation was performed:

- [Wokwi VS Code getting started](https://docs.wokwi.com/vscode/getting-started)
- [Simulating PlatformIO projects](https://docs.wokwi.com/vscode/platformio)
- [wokwi.toml and project configuration](https://docs.wokwi.com/vscode/project-config)
- [Supported ESP32 boards and serial modes](https://docs.wokwi.com/guides/esp32)
- [ESP32 Wi-Fi and gateways](https://docs.wokwi.com/guides/esp32-wifi)
- [MPU-6050 part and units](https://docs.wokwi.com/parts/wokwi-mpu6050)
- [SSD1306 part and address](https://docs.wokwi.com/parts/board-ssd1306)
- [Wokwi C3 board pin names](https://github.com/wokwi/wokwi-boards/blob/main/boards/esp32-c3-devkitm-1/board.json)
- [PlatformIO ESP32-C3-DevKitM-1 board](https://docs.platformio.org/en/latest/boards/espressif32/esp32-c3-devkitm-1.html)
