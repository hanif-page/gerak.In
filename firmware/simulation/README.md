# Wokwi setup area

This folder contains **Wokwi configuration templates only**. The owner will create the PlatformIO project manually. No actual-device project, backend, or application firmware has been generated here.

## Create your PlatformIO project here

Final project directory:

```text
/home/hanif/Documents/git-github/gerak.In/firmware/simulation/gerak-in-wokwi/
```

In PlatformIO Home → New Project:

- **Name:** `gerak-in-wokwi`
- **Board:** Espressif ESP32-C3-DevKitM-1 (`esp32-c3-devkitm-1`)
- **Framework:** Arduino
- **Location:** disable the default location and select `/home/hanif/Documents/git-github/gerak.In/firmware/simulation`

The wizard should create the named project beneath that location. Verify the final folder before continuing; do not accidentally create an additional nested `gerak-in-wokwi/gerak-in-wokwi/` directory.

The future project directory is intentionally not pre-created so it remains available to the wizard.

## Prepared files

```text
firmware/simulation/
├── README.md
├── templates/
│   ├── diagram.json            # C3 + MPU-6050 + I2C OLED circuit
│   ├── wokwi.toml              # PlatformIO binary/ELF locations
│   └── extensions.json        # Optional VS Code recommendations
└── gerak-in-wokwi/             # YOU create this PlatformIO project
    ├── platformio.ini         # Generated/managed by you
    ├── src/main.cpp           # Generated/managed by you
    ├── diagram.json           # Copy from templates after creation
    ├── wokwi.toml             # Copy from templates after creation
    └── .vscode/extensions.json # Optional copy from templates
```

Copy `templates/diagram.json` and `templates/wokwi.toml` into your new project root. They must sit beside `platformio.ini`, not inside `src/` or `.pio/`.

Open **the new project folder itself** in VS Code, build it with PlatformIO, then run **Wokwi: Start Simulator**.

Read the [complete VS Code + PlatformIO + Wokwi guide](../../docs/setup/wokwi-vscode.md) before starting. It covers license activation, exact file placement, an optional I2C scan sketch, serial output, networking, limitations, and troubleshooting.

## Wiring preserved

- SDA: **GPIO3**, shared by IMU and OLED.
- SCL: **GPIO4**, shared by IMU and OLED.
- Both modules: **3V3** and common **GND**.
- MPU-6050 AD0: **GND**, expected address **0x68**.
- Simulation OLED: **SSD1306 128×64, address 0x3C**.

The DevKitM-1 is a supported **simulation stand-in**, not a change to the owner's ESP32-C3 SuperMini schematic. SSD1306/0x3C is an explicit simulation choice, not confirmation of the actual OLED controller/address. See [the owner's wiring record](../../hardware/wiring/pin-configuration.md).

These files have not been run in the VS Code simulator. A firmware build and active Wokwi extension/license are still required.
