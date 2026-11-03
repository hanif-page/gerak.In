"""Regenerate the temporary gerak.In install artwork (requires Pillow).

Run from any directory: python3 apps/pwa/scripts/generate-icons.py
Replace this artwork when final brand assets are supplied.
"""

from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parents[1] / "public" / "icons"


def generate(size: int, filename: str) -> None:
    scale = 4
    canvas = Image.new("RGB", (size * scale, size * scale), "#D45113")
    draw = ImageDraw.Draw(canvas)
    # Keep the entire mark inside the central maskable safe area.
    points = [(0.24, 0.53), (0.36, 0.53), (0.43, 0.33),
              (0.54, 0.68), (0.62, 0.53), (0.76, 0.53)]
    coords = [(int(x * size * scale), int(y * size * scale)) for x, y in points]
    width = round(size * scale * 0.055)
    draw.line(coords, fill="white", width=width, joint="curve")
    radius = width / 2
    for x, y in coords:
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill="white")
    canvas.resize((size, size), Image.Resampling.LANCZOS).save(OUT / filename)


if __name__ == "__main__":
    for size, filename in [(192, "icon-192.png"), (512, "icon-512.png"),
                           (512, "icon-maskable-512.png"), (180, "apple-touch-icon.png")]:
        generate(size, filename)
        print(f"Generated {filename} ({size}x{size})")
