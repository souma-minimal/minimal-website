#!/usr/bin/env python3
"""Create low-resolution, watermarked social previews from sale wallpaper files."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "wallpapers"
DESTINATION = ROOT / "assets" / "social-samples"
TARGET = (720, 1280)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    name = "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf"
    return ImageFont.truetype(name, size)


def contrast_color(image: Image.Image) -> tuple[int, int, int, int]:
    crop = image.crop((0, 390, image.width, 890)).convert("RGB")
    pixels = list(crop.resize((40, 40)).getdata())
    luminance = sum(0.2126 * r + 0.7152 * g + 0.0722 * b for r, g, b in pixels) / len(pixels)
    return (15, 15, 15, 168) if luminance > 140 else (255, 255, 255, 182)


def draw_center_watermark(canvas: Image.Image, color: tuple[int, int, int, int]) -> None:
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    title = "SAMPLE"
    subtitle = "minimal.  /  preview only"
    title_font = font(92, bold=True)
    subtitle_font = font(22, bold=True)
    title_box = draw.textbbox((0, 0), title, font=title_font)
    subtitle_box = draw.textbbox((0, 0), subtitle, font=subtitle_font)
    x = (canvas.width - (title_box[2] - title_box[0])) / 2
    y = (canvas.height - (title_box[3] - title_box[1])) / 2 - 42
    draw.text((x, y), title, font=title_font, fill=color, stroke_width=1, stroke_fill=(255, 255, 255, 60))
    sx = (canvas.width - (subtitle_box[2] - subtitle_box[0])) / 2
    draw.text((sx, y + 112), subtitle, font=subtitle_font, fill=color)
    canvas.alpha_composite(layer)


def draw_footer(canvas: Image.Image, color: tuple[int, int, int, int]) -> None:
    draw = ImageDraw.Draw(canvas)
    label = "SAMPLE · FULL-RESOLUTION FILE SOLD SEPARATELY"
    label_font = font(15, bold=True)
    box = draw.textbbox((0, 0), label, font=label_font)
    width = box[2] - box[0]
    x = (canvas.width - width) / 2
    y = canvas.height - 52
    draw.rounded_rectangle((x - 16, y - 10, x + width + 16, y + 28), radius=19, fill=(0, 0, 0, 105))
    draw.text((x, y), label, font=label_font, fill=(255, 255, 255, 220))


def main() -> None:
    DESTINATION.mkdir(parents=True, exist_ok=True)
    for source in sorted(SOURCE.glob("*.png")):
        output = DESTINATION / f"{source.stem}-sample.jpg"
        image = Image.open(source).convert("RGB").resize(TARGET, Image.Resampling.LANCZOS).convert("RGBA")
        color = contrast_color(image)
        draw_center_watermark(image, color)
        draw_footer(image, color)
        image.convert("RGB").save(output, "JPEG", quality=82, optimize=True, progressive=True)
        print(output.relative_to(ROOT))


if __name__ == "__main__":
    main()
