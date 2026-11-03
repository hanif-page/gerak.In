# Owner-supplied hardware pin configuration

Source: the owner-provided schematic showing ESP32C3-SuperMini, GY-521-R_MPU6050, and a 0.96-inch 128×64 I2C OLED.

This document preserves that schematic's pin data. It is a wiring requirement, not a claim that the circuit or a firmware build has been physically verified.

## Board identity

The new schematic explicitly labels the MCU board **ESP32C3-SuperMini**. Earlier project briefs specify **Seeed Studio XIAO ESP32C3**. Do not silently treat these boards as interchangeable or reuse XIAO board aliases/build settings for the SuperMini.

For future actual-device implementation, verify the exact physical board and select a compatible PlatformIO/Arduino board definition, flash settings, and upload configuration. The GPIO mapping below is the owner's latest supplied mapping; schematic symbol terminal numbers are not GPIO numbers.

## Shared I2C bus

| Signal | ESP32-C3 GPIO | Connected modules |
| --- | --- | --- |
| SDA | **GPIO3** | MPU-6050 SDA and OLED SDA |
| SCL | **GPIO4** | MPU-6050 SCL and OLED SCK/SCL |
| Power | **3V3** | MPU-6050 VCC and OLED VCC |
| Ground | **GND** | MPU-6050 GND, MPU-6050 AD0, and OLED GND |

For an Arduino `Wire` implementation, explicitly initialize the shared bus with **SDA = 3, SCL = 4**, e.g. `Wire.begin(3, 4)`. Both drivers must use that same configured bus; do not let a library reinitialize it to unrelated default pins. Bus speed must be selected and verified during hardware bring-up.

## MPU-6050 / GY-521 module

| Module pin | Connection |
| --- | --- |
| VCC | ESP32 3V3 |
| GND | Common GND |
| SCL | GPIO4 |
| SDA | GPIO3 |
| XDA | Unconnected in supplied schematic |
| XCL | Unconnected in supplied schematic |
| AD0 | GND |
| INT | Unconnected in supplied schematic |

With AD0 grounded, the expected 7-bit MPU-6050 I2C address is **0x68**. Confirm it with an I2C scan. The unconnected INT pin means initial firmware should not assume that a data-ready interrupt is wired; a polling-based sampling implementation is appropriate unless the wiring is explicitly changed.

## OLED

Schematic label: **0.96in_128x64_I2C_OLED**.

| OLED terminal | Schematic pin label | Connection |
| --- | --- | --- |
| 1 | GND | Common GND |
| 2 | VCC | ESP32 3V3 |
| 3 | SCK | GPIO4 / I2C SCL |
| 4 | SDA | GPIO3 / I2C SDA |

The schematic's OLED `SCK` terminal is the I2C clock in this configuration, not a separate SPI connection.

The OLED controller, I2C address, and any reset requirements are **not established by the schematic**. Do not assume SSD1306 versus SH1106 or hardcode an unverified address. Verify the actual module and scan the bus; 0x3C/0x3D are common possibilities, not confirmed values.

## Electrical and firmware checks before use

- Verify actual module power specifications and pin order; follow the supplied 3V3 wiring only with compatible hardware.
- Maintain a common ground and check I2C pull-ups. Pull-ups must not drive ESP32 signal pins to 5 V.
- Multiple breakout boards may already have pull-ups; verify the combined bus rather than adding resistors blindly.
- Confirm both devices respond on different I2C addresses.
- Avoid unsynchronized access to the shared `Wire` bus if tasks run concurrently.
- OLED updates must not disrupt the sampling cadence required by DSP/TinyML; throttle display refresh and serialize bus access as needed.
- OLED screen content and refresh behavior have not yet been specified by the owner.

## Wokwi mapping

Use the same logical SDA GPIO3 / SCL GPIO4 mapping where supported by the selected simulation board. If Wokwi requires a different ESP32 target, document any mapping differences explicitly and keep the actual-device configuration separate.

A simulated sensor/display can validate driver/protocol integration, but cannot establish real sensor noise, bus electrical reliability, battery use, or real exercise recognition quality.
